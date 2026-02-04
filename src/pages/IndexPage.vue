<script setup>
import { watch, reactive } from 'vue';
import App from '../App.js';
// import GitDialog from '../dialogs/GitDialog.vue';
import SelectProjectDialog from '../dialogs/SelectProjectDialog.vue';
import pat1 from '../assets/pat_1.jpg';
import CheckIcon from '../components/CheckIcon.vue';
import GitLog from '../components/GitLog.vue';
import CommitDialog from '../dialogs/CommitDialog.vue';

import { Dialog } from 'quasar';

const _ = reactive({
  step: -1,
});

const openDirectory = async () => {
  App._.location = (await window.GitService.selectDirectory('Select Data Folder')) || '';
  // await App.wait(500);
  // _.step = 3;
};

const visit = url => {
  window.InternetService.openExternal(url);
};

const verifyGit = async () => {
  App._.git_log.push('[VERIFICATION] [START] ============================================================');
  App._.ready_for_upload = false;
  App._.git_version = [2];
  App._.git_lfs_version = [2];
  App._.location_has_git = [2];
  App._.location_has_lfs = [2];
  App._.repo_status = [2];

  const cancel = props => props.forEach(p => (p[0] = 3));

  for (let i = 0; i < 1; i++) {
    await App.wait(300);

    App._.git_version = await window.GitService.getGitVersion(App._.location);
    if (!App._.git_version[0]) {
      cancel([App._.git_lfs_version, App._.location_has_git, App._.location_has_lfs, App._.repo_status]);
      continue;
    }
    await App.wait(300);

    App._.git_lfs_version = await window.GitService.getGitLfsVersion(App._.location);
    if (!App._.git_lfs_version[0]) {
      cancel([App._.location_has_git, App._.location_has_lfs, App._.repo_status]);
      continue;
    }
    await App.wait(300);

    App._.location_has_git = [await window.GitService.check(App._.location + '/.git', false)];
    if (!App._.location_has_git[0]) {
      cancel([App._.location_has_lfs, App._.repo_status]);
      continue;
    }
    await App.wait(300);

    App._.location_has_lfs = [await window.GitService.check(App._.location + '/.gitattributes', true)];
    if (!App._.location_has_lfs[0]) {
      cancel([App._.repo_status]);
      continue;
    }

    await App.wait(300);
    App._.repo_status = await window.GitService.getStatus(App._.location);
    App._.repo_status[0] = await isReadyForPush(App._.repo_status[1]);
  }

  App._.ready_for_upload =
    App._.repo_status[0] === true && App._.location_has_git[0] === true && App._.location_has_lfs[0] === true;

  App._.git_log.push('[VERIFICATION] [END] ==============================================================');

  // if(App._.ready_for_upload){
  //   await App.wait(500);
  //   _.step=4;
  // }
};

const initializeGit = async () => {
  await window.GitService.initializeGit(App._.location);
  await window.GitService.initializeLFS(App._.location);
  await verifyGit();
};

const initializeLFS = async () => {
  await window.GitService.initializeLFS(App._.location);
  await verifyGit();
};

const isReadyForPush = async () => {
  const status = await window.GitService.getStatus(App._.location, true);
  return status[1].length < 1;
};

const commit = async () => {
  Dialog.create({
    component: CommitDialog,
  }).onOk(async msg => {
    App._.git_log.push('[COMMIT] [START] ============================================================');
    await window.GitService.setGitUser(App._.location, App._.user.name, App._.user.email);
    await window.GitService.addAll(App._.location);
    await window.GitService.commit(App._.location, msg);
    App._.git_log.push('[COMMIT] [END]   ============================================================');
    await verifyGit();
  });
};

const selectProject = async () => {
  Dialog.create({
    component: SelectProjectDialog,

    // props forwarded to your custom component
    componentProps: {
      text: 'something',
      persistent: true,
      // ...more..props...
    },
  }).onOk(async p => {
    if (App._.active_remote) {
      await window.GitService.setRemoteUrl(App._.location, App._.active_remote.split('$$$')[0], p.http_url_to_repo);
    } else {
      await window.GitService.createRemote(App._.location, 'origin', p.http_url_to_repo);
    }
    await App.updateRemotes();
  });
};

watch(
  () => _.step,
  async () => {
    if (_.step === 3) {
      await verifyGit();
    }
  }
);

const checkLabel = (property, y, n, l) => (property[0] === true ? y : property[0] === false ? n : l);

const push = async () => {
  App._.git_log.push('[PUSH] [START] ============================================================');
  const remote = App._.active_remote.split('$$$');
  const patched_remote = App.toHttpsWithToken(remote[1]);
  await window.GitService.setRemoteUrl(App._.location, remote[0], patched_remote);
  await window.GitService.push(App._.location, remote[0], 'main');
  await window.GitService.setRemoteUrl(App._.location, remote[0], App.urlWithoutCredentials(patched_remote));
  App._.git_log.push('[PUSH] [END] ==============================================================');
};

</script>

<template>
  <q-page class="flex">
    <q-stepper
      style="width: 100%"
      active-icon="none"
      v-model="_.step"
      ref="_.stepper"
      color="primary"
      animated
      header-nav
      header-class="step_header"
    >
      <q-step :name="-1" title="" icon="home">
        <div>
          <h4>Welcome to DataHUBer.</h4>
          <ul>
            <li>
              <b>Overview - </b>This tools helps you to step by step upload a local directory to the RPTU DataHUB.
            </li>
            <li>
              <b>Navigation - </b>
              You can always navigate to a specific step by clicking on the menu at the top.
            </li>
            <li>
              <b>Steps - </b>
              Data you need to enter and actions you need to take are always displayed at the top of each step, and
              detailed instructions are located below.
            </li>
          </ul>
        </div>
        <div style="text-align: center">
          <q-btn label="Continue" icon="arrow_circle_right" color="primary" @click="() => (_.step = 0)" />
        </div>
      </q-step>
      <q-step :name="0" title="Token" icon="key" :color="App._.user ? 'green-7' : 'grey'">
        <div class="q-gutter-md row">
          <q-input
            v-model="App.config.token"
            outlined
            class="col"
            placeholder="Please create a personal access token"
            dense
          >
            <template v-slot:prepend>
              <q-spinner-grid v-if="App.config.token && !App._.user && !App._.error" color="primary" size="1em" />
              <q-icon v-else-if="App._.user" name="verified" color="green-7" />
              <q-icon v-else name="key" />
            </template>
          </q-input>

          <q-btn
            label="New Token"
            icon="add"
            color="primary"
            @click="
              () =>
                visit(
                  'https://datahub.rz.rptu.de/-/user_settings/personal_access_tokens?page=1&state=active&sort=expires_asc'
                )
            "
          />
        </div>

        <div v-if="App._.user && !App._.error" class="q-gutter-md row" style="margin: 1em">
          <q-input v-model="App._.user.username" label="Account" readonly outlined dense>
            <template v-slot:prepend>
              <q-icon name="account_circle" />
            </template>
          </q-input>

          <q-input v-model="App._.user.name" label="Name" readonly outlined dense>
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input v-model="App._.user.commit_email" label="eMail" readonly outlined dense>
            <template v-slot:prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-btn label="Continue" icon="arrow_circle_right" color="primary" @click="() => (_.step = 1)" />
        </div>
        <div v-else-if="App._.error" style="margin: 1em">
          <q-banner>
            <template v-slot:avatar>
              <q-icon name="warning" color="red-7" />
            </template>
            {{ App._.error }}
          </q-banner>
        </div>

        <div>
          <h5 style="margin-bottom: 1em">Instructions</h5>
          <ol>
            <li>
              Click the <strong>"New Token"</strong> button above. This will open the DataHUB page in your browser,
              where you can create a personal access token. You will first need to log in via <em>Shibboleth</em>.
            </li>

            <li>
              On the DataHUB page, navigate to <strong>"Personal access tokens"</strong> and click
              <strong>"Add new token"</strong>.
            </li>

            <li>Enter a name for the token (for example, <em>"MyToken"</em> or <em>"LabDesktop"</em>).</li>

            <li>Leave the <strong>Description</strong> field empty.</li>

            <li>Under <strong>Scopes</strong>, select <strong>all</strong> available checkboxes.</li>

            <li>
              Click the <strong>"Create Token"</strong> button in the
              bottom left corner.
            </li>

            <li>
              On the newly opened page, click the <strong>eye icon</strong> in the green box to reveal your token. Copy
              the token and paste it into the <strong>"Token"</strong> input field in DataHUBer. <br />
              <div style='color:#cc0000'><strong>Important:</strong> This is the <em>only</em> time the token will be visible. If you do not copy
                it now, you will need to create a new token.</div>
              <img
                :src="pat1"
                style="width: 90%; border: 0.1em solid black; border-radius: 0.5em; padding: 1em; margin: 1em"
              />
            </li>

            <li>
              DataHUBer will automatically verify the token by fetching your user data.
              If your name and email address are displayed, the token is valid and you can proceed to the next step.
              The DataHUBer will also remember the entered Token for future sessions.
            </li>
          </ol>
        </div>
      </q-step>

      <q-step
        :name="1"
        title="Directory"
        icon="folder"
        :disable="!App._.user"
        :color="App._.location ? 'green-7' : 'grey'"
      >
        <p style="margin-top: 2em">Please select the directory you wish to upload.</p>

        <div class="q-gutter-sm row" style="margin: 1em">
          <q-input
            outlined
            v-model="App._.location"
            class="col"
            readonly
            placeholder="Please select the directory you wish to upload"
            dense
          >
            <template v-slot:append>
              <q-btn icon="clear" round @click="() => (App._.location = '')" flat />
            </template>
          </q-input>
          <q-btn label="Select Directory" icon="folder" color="primary" @click="openDirectory" />
        </div>

        <div style="text-align: center">
          <q-btn
            label="Continue"
            icon="arrow_circle_right"
            color="primary"
            @click="() => (_.step = 3)"
            :disabled="!App._.location"
          />
        </div>
      </q-step>
      <!-- <q-step :name="2" title="Meta Data" icon="sym_o_add_notes" :disable="App._.location === ''"> -->
      <!--   <p style="margin-top: 2em">In the future it will be possible to edit meta data here.</p> -->
      <!-- </q-step> -->
      <q-step
        :name="3"
        title="Git Status"
        icon="sym_o_commit"
        :disable="App._.location === ''"
        :color="App._.ready_for_upload ? 'green-7' : 'grey'"
      >
        <div class="row q-gutter-md">
          <q-list bordered class="rounded-borders col" style="max-width: 430px" separator>
            <q-item-label header>
              Status
              <q-btn style="float: right; margin-top: -0.3em" icon="refresh" rounded flat dense @click="verifyGit" />
            </q-item-label>

            <q-separator />

            <q-item>
              <q-item-section avatar>
                <CheckIcon :property="App._.git_version" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">Git</q-item-label>
                <q-item-label caption lines="2">{{
                  checkLabel(App._.git_version, App._.git_version[1], 'Please install git', 'checking')
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar>
                <CheckIcon :property="App._.git_lfs_version" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">Git LFS</q-item-label>
                <q-item-label caption lines="2">{{
                  checkLabel(App._.git_lfs_version, App._.git_lfs_version[1], 'Please install git lfs', 'checking')
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="initializeGit">
              <q-item-section avatar>
                <CheckIcon :property="App._.location_has_git" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1"
                  >Git {{ App._.location_has_git[0] === false ? ' not ' : '' }} Initialized</q-item-label
                >
                <q-item-label caption lines="2">{{
                  checkLabel(App._.location_has_git, 'Yes', 'Click to initialize git', 'checking')
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable @click="initializeLFS">
              <q-item-section avatar>
                <CheckIcon :property="App._.location_has_lfs" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1"
                  >LFS {{ App._.location_has_lfs[0] === false ? ' not ' : '' }}Initialized</q-item-label
                >
                <q-item-label caption lines="2">{{
                  checkLabel(App._.location_has_lfs, 'Yes', 'Click to initialize lfs', 'checking')
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="commit">
              <q-item-section avatar>
                <CheckIcon :property="App._.repo_status" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1">Directory Status</q-item-label>
                <q-item-label caption lines="2">{{
                  checkLabel(App._.repo_status, 'Ready for Upload', 'Changes Present. Click to Commit', 'checking')
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-btn
                  label="Continue"
                  icon="arrow_circle_right"
                  color="primary"
                  @click="() => (_.step = 4)"
                  :disabled="!App._.ready_for_upload"
                />
              </q-item-section>
            </q-item>

            <q-separator />
          </q-list>

          <GitLog />
        </div>

        <div>
          <h5 style="margin-bottom: 1em">Instructions</h5>
          <p>This step runs the follwing checks:</p>
          <ol>
            <li>
              Are <b>git</b> and <b>git lfs</b> installed on the system? If not please do so and it might be neccessary
              to restart DataHUBer.
            </li>
            <li>
              Are <b>git</b> and <b>git lfs</b> initialized in the current directory? if not datahuber can initialize
              these by clicking on the corresponding buttons. please click afterwards on the refresh button in the top
              right corner to restart the checking procedure.
            </li>
            <li>
              Are there any uncommited changes or untracked files? In this case, DataHUBer can commit <b>all</b> these
              changes and untracked files inside the directory via a click on the "Directory Status" button. You will be
              shown a detailed commit dialog with an option to abort the commit. <br /><i
                >Note: If you do not want to commit certain untracked files or changes right now, you can still proceed
                to the uploading step and leave these files and changes behind (at least for now).</i
              >
            </li>
          </ol>
        </div>
        <!-- <q-btn label="Verify Git Status" icon="verified" color="primary" @click="verifyGit" /> -->
      </q-step>

      <q-step :name="4" title="Upload" icon="upload" :disable="!App._.ready_for_upload">
        <div class="q-gutter-md row">
          <q-list bordered class="rounded-borders col" dense>
            <q-item-label header>Projects</q-item-label>
            <q-item v-if='App._.remotes.length<1'>
              <q-item-section avatar>
                <q-icon name='filter_list_off' color='grey-7'/>
              </q-item-section>
              <q-item-section>
                <q-item-label>No linked projects found</q-item-label>
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple v-for="r in App._.remotes" :key="r">
              <q-item-section avatar>
                <q-radio v-model="App._.active_remote" :val="r" color="primary" />
              </q-item-section>
              <q-item-section>
                <!-- <q-item-label>{{ r.split('$$$')[0] }}</q-item-label> -->
                <q-item-label caption>{{ App.urlWithoutCredentials(r.split('$$$')[1]) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

        </div>

        <div class="q-gutter-sm row" style="margin: 0em 0 2em 0">
          <q-btn label="Find Existing Project" color="primary" icon="search" @click="selectProject" />

          <q-btn
            label="Create New Project"
            icon="add"
            color='primary'
            @click="() => visit('https://datahub.rz.rptu.de/projects/new?namespace_id=225#blank_project')"
          />
        </div>

        <div class="q-gutter-md row">
          <GitLog />
        </div>
        <div class="q-gutter-sm row" style="margin: 1em">
          <q-btn label="Upload" color="primary" icon="upload" @click="push" :disabled="!App._.active_remote" />
        </div>

        <div>
          <h5 style="margin-bottom: 1em">Instructions</h5>
          <ul>
            <li>To upload the chosen directory you have to specify the target DataHUB project.</li>
            <li>
              You can either choose one of the automatically detected projects from the list above, or from a list of
              all available projects on the DataHUB via the <i>"Find Existing Project"</i> button.
            </li>
            <li>
              If you did not create a target project yet, you can do so by following these instructions:
              <ol>
                <li>
                  Push the <i>"Create New Project"</i> button to open the corresponding DataHUB page in your browser.
                </li>
                <li>Specify the project name.</li>
                <li>Per default the project will be added to the Gulliver group.</li>
                <li>Specify the visibility.</li>
                <li>IMPORTANT: Uncheck the <i>"Initialize repository with a README"</i> option.</li>
                <li>Push the <i>"Create Project"</i> button.</li>
                <li>
                  Once created, return to DataHUBer and select your new project from the list shown under
                  <i>"Find Existing Project"</i>.
                </li>
              </ol>
            </li>
          </ul>
        </div>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<style>
.q-stepper__tab {
  border-bottom: 0.4em solid #ccc;
  padding-bottom: 0;
}

.q-stepper__tab--active {
  border-bottom-color: var(--primary);
}

p,
li {
  font-size: 1.25em;
}
li li {
  font-size: 1em;
}
pre {
  font-size: 0.75em;
}
</style>
