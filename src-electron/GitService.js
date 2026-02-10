import { app, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import PATH from 'path';
import InternetService from './InternetService.js';
import querystring from 'query-string';
import { spawn } from 'child_process';

const GitService = {
  selectDirectory: async title => {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    const result = await dialog.showOpenDialog(window, {
      title: title,
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  },

  readConfig: async () => {
    try {
      return JSON.parse(fs.readFileSync(PATH.join(app.getPath('userData'), 'DataHUBer.json'), 'utf8'));
    } catch {
      return {};
    }
  },
  writeConfig: async config => {
    fs.writeFileSync(PATH.join(app.getPath('userData'), 'DataHUBer.json'), config);
  },

  run: async options => {
    return new Promise(resolve => {
      const args = typeof options === 'string' ? [options] : options.args;

      const o = typeof options === 'string' ? {} : { ...options };

      // ----- env hardening -----
      o.env = {
        ...process.env,
        ...(o.env || {}),
        GIT_TERMINAL_PROMPT: 0,
        GIT_ASKPASS: 'true',
        GIT_LFS_FORCE_PROGRESS: 1,
      };

      if (o.debug) {
        o.env.GIT_TRACE = 1;
        o.env.GIT_CURL_VERBOSE = 1;
      }

      o.detached = false;
      o.shell = true;
      o.cwd = (o.cwd || '').split('/').join('/');

      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

      const send = msg => {
        if (!o.silent && window) {
          window.webContents.send('GitService', msg);
        }
      };

      send(`$ git ${args.join(' ')}\n`);

      let output = '';

      let child;
      try {
        child = spawn('git', args, o);
      } catch (err) {
        return resolve([false, err.toString()]);
      }

      const onData = data => {
        if (!data) return;
        const text = data.toString();
        output += text;
        send(text);
      };

      child.stdout.on('data', onData);
      child.stderr.on('data', onData);

      // ----- lifecycle -----
      child.on('error', err => {
        console.error('[Git spawn error]', err);
        resolve([false, err.toString()]);
      });

      child.on('exit', code => {
        resolve([code === 0, output]);
      });
    });
  },

  getStatus: async (path, verbose) =>
    await GitService.run({
      args: ['status', '-u', verbose ? '-z' : ''],
      cwd: path,
    }),

  getRemotes: async path =>
    await GitService.run({
      args: ['remote', '-v'],
      cwd: path,
    }),

  createRemote: async (path, name, url) =>
    await GitService.run({
      args: ['remote', 'add', name, url],
      cwd: path,
    }),

  addAll: async path =>
    await GitService.run({
      args: ['add', '.'],
      cwd: path,
    }),

  commit: async (path, message) =>
    await GitService.run({
      args: ['commit', '-m', '"' + message + '"'],
      cwd: path,
    }),

  setGitUser: async (path, name, email) => {
    await GitService.run({
      args: ['config', '--local', 'user.name', '"' + name + '"'],
      cwd: path,
    });
    await GitService.run({
      args: ['config', '--local', 'user.email', '"' + email + '"'],
      cwd: path,
    });
  },

  getUserData: async token =>
    await InternetService.getWebPageAsJson({
      host: 'datahub.rz.rptu.de',
      path: `/api/v4/user/?${querystring.stringify({
        access_token: token,
      })}`,
      port: 443,
      method: 'GET',
    }),

  getUserProjects: async token => {
    return await InternetService.getWebPageAsJson({
      host: 'datahub.rz.rptu.de',
      path: `/api/v4/projects?${querystring.stringify({
        membership: true,
        min_access_level: 30,
        simple: true,
        access_token: token,
        per_page: 200,
      })}`,
      port: 443,
      method: 'GET',
    });
  },

  getGitVersion: async path =>
    await GitService.run({
      args: ['--version'],
      cwd: path,
    }),

  getGitLfsVersion: async path =>
    await GitService.run({
      args: ['lfs', '--version'],
      cwd: path,
    }),

  initializeGit: async path =>
    await GitService.run({
      args: ['init', '--initial-branch=main'],
      cwd: path,
    }),

  initializeLFS: async path => {
    await GitService.run({
      args: ['lfs', 'install'],
      cwd: path,
    });
    const attr = PATH.join(path, '.gitattributes');
    fs.writeFileSync(
      attr,
      `
*.tif* filter=lfs diff=lfs merge=lfs -text
*preview*.tif* -filter -diff -merge text
    `
    );
    await GitService.run({
      args: ['add', attr],
      cwd: path,
    });
  },

  setRemoteUrl: async (path, remote, url) => {
    const [code, res] = await GitService.run({
      args: ['remote'],
      cwd: path,
      silent: true,
    });
    if (!code) return [false, res];
    return res.indexOf(remote) < 0
      ? await GitService.run({
          args: ['remote', 'add', remote, url],
          cwd: path,
        })
      : await GitService.run({
          args: ['remote', 'set-url', remote, url],
          cwd: path,
        });
  },

  push: async (path, remote, branch) =>
    await GitService.run({
      args: ['push', '-v', remote, branch],
      cwd: path,
      debug: true,
    }),

  check: async (path, isFile) => {
    return fs.existsSync(path) && (isFile ? fs.lstatSync(path).isFile() : fs.lstatSync(path).isDirectory());
  },

  getProjectPath(url) {
    url = url.trim();

    const sshMatch = url.match(/^[^@]+@[^:]+:(.+?)(?:\.git)?$/);
    if (sshMatch) {
      return sshMatch[1];
    }

    const httpsMatch = url.match(/^https?:\/\/[^/]+\/(.+?)(?:\.git)?$/);
    if (httpsMatch) {
      return httpsMatch[1];
    }

    return null;
  },

  getProject: async (url, token) => {
    console.log(url);
    // const projectPath = url.split('datahub.rz.rptu.de')[1];
    // const encodedPath = encodeURIComponent(projectPath);
    const encodedPath = encodeURIComponent(GitService.getProjectPath(url));

    return await InternetService.getWebPageAsJson({
      host: 'datahub.rz.rptu.de',
      path: `/api/v4/projects/${encodedPath}?${querystring.stringify({
        access_token: token,
      })}`,
      port: 443,
      method: 'GET',
    });
  },
};

export default GitService;
