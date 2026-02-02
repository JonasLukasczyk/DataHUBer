import { reactive, watch } from 'vue';

const App = {
  _: reactive({
    location: '',
    user: null,
    error: null,
    git_log: [''],
    remotes: [],
    active_remote: null,
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

  updateRemotes: async () => {
    if (!App._.location) return (App._.remotes = []);
    const [code, remotes_raw] = await window.GitService.getRemotes(App._.location);
    if (!code) return (App._.remotes = []);
    const remotes = new Set();
    remotes_raw.split('\n').map(line => {
      const elements = line.split('\t');
      if (elements.length !== 2) return;
      elements[1] = elements[1].split(' ')[0];
      remotes.add(elements.slice(0, 2).join('$$$'));
    });
    App._.remotes = [...remotes];
    App._.active_remote = App._.remotes[0];
  },
};

const getUser = async () => {
  if (!App.config.token) {
    App._.user = null;
    return;
  }
  const [code, user] = await window.GitService.getUserData(App.config.token);
  if (code !== 200) {
    App._.error = `Unable to verify token (StatusCode ${code})`;
    return (App._.user = null);
  } else {
    App._.error = null;
  }
  App._.user = user;
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
  getUser();

  watch(() => App._.location, App.updateRemotes);

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

export default App;
