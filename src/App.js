import { reactive, watch } from 'vue';
import CommitDialog from './dialogs/CommitDialog.vue';
import { Dialog } from 'quasar';

const App = {
  _: reactive({
    step: -1,
    location: '',
    user: null,
    error: null,
    git_log: [''],
    project: null,
    projects: [],
    git_version: null,
    git_lfs_version: null,
    location_has_git: null,
    location_has_lfs: null,
    repo_status: null,
    ready_for_upload: false,
  }),
  config: reactive({
    token: '',
  }),

  visit: url => window.InternetService.openExternal(url),

  wait: time => new Promise(resolve => setTimeout(resolve, time)),

  debounce: (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback(...args);
      }, wait);
    };
  },

  urlWithoutCredentials: url => {
    return url.replace(/^https:\/\/[^@]+@/, 'https://');
  },

  toHttpsWithToken: gitUrl => {
    let httpsUrl;

    if (gitUrl.startsWith('https://')) {
      httpsUrl = gitUrl;
      httpsUrl = httpsUrl.replace(/^https:\/\/[^@]+@/, 'https://');
    } else {
      const sshRegex = /^git@([^:]+):(.+\.git)$/;
      const match = gitUrl.match(sshRegex);

      if (!match) {
        throw new Error(`Invalid Git URL: ${gitUrl}`);
      }

      const host = match[1]; // github.com
      const path = match[2]; // owner/repo.git
      httpsUrl = `https://${host}/${path}`;
    }

    // Insert token
    const urlWithoutProtocol = httpsUrl.replace(/^https:\/\//, '');
    return `https://${App._.user.username}:${encodeURIComponent(App.config.token)}@${urlWithoutProtocol}`;
  },

  getProjects: async (val, update) => {
    App._.projects = [];
    const [code, projects] = await window.GitService.getUserProjects(App.config.token);
    if (code === 200) App._.projects = projects;
    update && update();
  },

  initializeGit: async () => {
    await window.GitService.initializeGit(App._.location);
    await window.GitService.initializeLFS(App._.location);
    await App.verifyGit();
  },

  initializeLFS: async () => {
    await window.GitService.initializeLFS(App._.location);
    await App.verifyGit();
  },

  commit: async () => {
    Dialog.create({
      component: CommitDialog,
    }).onOk(async msg => {
      App._.git_log.push('[COMMIT] [START] ============================================================');
      await window.GitService.setGitUser(App._.location, App._.user.name, App._.user.email);
      await window.GitService.addAll(App._.location);
      await window.GitService.commit(App._.location, msg);
      App._.git_log.push('[COMMIT] [END]   ============================================================');
      await App.verifyGit();
    });
  },

  isReadyForPush: async () => {
    const status = await window.GitService.getStatus(App._.location, true);
    return status[1].length < 1;
  },

  verifyGit: async () => {
    App._.git_log.push('[VERIFICATION] [START] ============================================================');
    App._.ready_for_upload = false;
    App._.git_version = [2];
    App._.git_lfs_version = [2];
    App._.location_has_git = [2];
    App._.location_has_lfs = [2];
    App._.repo_status = [2];

    const cancel = props => props.forEach(p => (p[0] = 3));

    const delay = 200;

    for (let i = 0; i < 1; i++) {
      await App.wait(delay);

      App._.git_version = await window.GitService.getGitVersion(App._.location);
      if (!App._.git_version[0]) {
        cancel([App._.git_lfs_version, App._.location_has_git, App._.location_has_lfs, App._.repo_status]);
        continue;
      }
      await App.wait(delay);

      App._.git_lfs_version = await window.GitService.getGitLfsVersion(App._.location);
      if (!App._.git_lfs_version[0]) {
        cancel([App._.location_has_git, App._.location_has_lfs, App._.repo_status]);
        continue;
      }
      await App.wait(delay);

      App._.location_has_git = [await window.GitService.check(App._.location + '/.git', false)];
      if (!App._.location_has_git[0]) {
        cancel([App._.location_has_lfs, App._.repo_status]);
        continue;
      }
      await App.wait(delay);

      App._.location_has_lfs = [await window.GitService.check(App._.location + '/.gitattributes', true)];
      if (!App._.location_has_lfs[0]) {
        cancel([App._.repo_status]);
        continue;
      }

      await App.wait(delay);
      App._.repo_status = await window.GitService.getStatus(App._.location);
      App._.repo_status[0] = await App.isReadyForPush(App._.repo_status[1]);
    }

    App._.ready_for_upload =
      App._.repo_status[0] === true && App._.location_has_git[0] === true && App._.location_has_lfs[0] === true;

    App._.git_log.push('[VERIFICATION] [END] ==============================================================');
  },
};

const getUser = async () => {
  App._.user = null;
  if (!App.config.token) return;

  const [code, user] = await window.GitService.getUserData(App.config.token);
  if (code !== 200) {
    App._.error = `Unable to verify token (StatusCode ${code})`;
    return;
  }

  App._.error = null;
  App._.user = user;

  App.getProjects();
};

const init = async () => {
  const config = await window.GitService.readConfig();
  for (let [k, v] of Object.entries(config)) App.config[k] = v;

  watch(
    App.config,
    App.debounce(() => {
      window.GitService.writeConfig(JSON.stringify(App.config));
    }, 1000)
  );

  watch(() => App.config.token, App.debounce(getUser, 100));
  watch(
    () => App._.location,
    async () => {
      const remotes_raw = await window.GitService.getRemotes(App._.location);
      if (!remotes_raw[0]) return;
      const remotes = remotes_raw[1]
        .split('\n')
        .filter(l => l)
        .map(l => l.split('\t'));
      let project = null;
      for (let r of remotes) {
        const url = r[1].split(' ')[0];
        project = App._.projects.find(p => p.ssh_url_to_repo === url || p.http_url_to_repo === url);
        if (project) break;
      }
      if (project) App._.project = project;
    }
  );
  watch(
    () => App._.step,
    async () => {
      if (App._.step === 3) {
        await App.verifyGit();
      }
    }
  );

  getUser();

  window.GitService.onMessage(chunk => {
    let idx = App._.git_log.length;
    let currentLine = '';
    for (let c of chunk) {
      if (c === '\n') {
        App._.git_log.push(currentLine);
        idx++;
        currentLine = '';
      } else if (c === '\r') {
        App._.git_log[idx - 1] = currentLine;
        currentLine = '';
      } else {
        currentLine += c;
      }
    }
  });
};
init();
console.log(App);

export default App;
