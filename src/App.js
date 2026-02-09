import { reactive, watch } from 'vue';

const App = {
  _: reactive({
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
      if(project)
        App._.project = project;
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
    // let test = chunk;
    // test = chunk.replaceAll('\n','$N\n');
    // test = test.replaceAll('\r','$R\n');
    // console.log(test);
  });
};
init();
console.log(App);

export default App;
