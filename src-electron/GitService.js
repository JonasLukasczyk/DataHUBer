import { app, dialog, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';
import InternetService from './InternetService.js';
import querystring from 'query-string';
import { spawn } from 'child_process';

const GitService = {
  hello: async (e, a, b) => {
    return [a, b];
  },

  selectDirectory: async (e, title) => {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    const result = await dialog.showOpenDialog(window, {
      title: title,
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  },

  readConfig: async () => {
    try {
      return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'DataHUBer.json'), 'utf8'));
    } catch {
      return {};
    }
  },
  writeConfig: async (e, config) => {
    fs.writeFileSync(path.join(app.getPath('userData'), 'DataHUBer.json'), config);
  },

  run: async options => {
    console.log(options);
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

      send(`git ${args.join(' ')}`);

      let output = '';

      let child;
      try {
        child = spawn('git', args, o);
      } catch (err) {
        return resolve([false, err.toString()]);
      }

      const onData = data => {
        if (!data) return;
        const text = data.toString().replace(/\r?\n/g, '\n');
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

  getStatus: async (e, location) =>
    await GitService.run({
      args: ['status'],
      cwd: location,
    }),

  getRemotes: async (e, location) =>
    await GitService.run({
      args: ['remote', '-v'],
      cwd: location,
    }),

  getUserData: async (e, token) => {
    return await InternetService.getWebPageAsJson(null, {
      host: 'datahub.rz.rptu.de',
      path: `/api/v4/user/?${querystring.stringify({
        access_token: token,
      })}`,
      port: 443,
      method: 'GET',
    });
  },

  getUserProjects: async (e, token) => {
    return await InternetService.getWebPageAsJson(null, {
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
};

export default GitService;
