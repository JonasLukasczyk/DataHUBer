<script setup>
import { reactive } from 'vue';
import App from '../App.js';
import GitDialog from '../dialogs/GitDialog.vue';
import SelectProjectDialog from '../dialogs/SelectProjectDialog.vue';
import pat0 from '../assets/pat_0.jpg';
import pat1 from '../assets/pat_1.jpg';

import { Dialog } from 'quasar';

const _ = reactive({
  step: 0,
});

const openDirectory = async () => {
  App._.location = (await window.GitService.selectDirectory('Select Data Folder')) || '';
};

const visit = url => {
  window.InternetService.openExternal(url);
};

const verifyGit = async () => {
  App._.git_log = '';
  Dialog.create({
    component: GitDialog,
    componentProps: {
      persistent: false,
    },
  });
  await App.wait(1000);
  await window.GitService.getStatus(App._.location);
  await window.GitService.getStatus(App._.location);
  await window.GitService.getStatus(App._.location);
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
  }).onOk(p => {
    console.log(p);
    App._.uplink = p.http_url_to_repo;
  });
};

// glpat-AOiEcEGw0QkATuU8R0hsXm86MQp1OmEH.01.0w1hrd8u8
</script>

<template>
  <q-page class="flex">
    <q-stepper
      style="width: 100%;"
      active-icon="none"
      v-model="_.step"
      ref="_.stepper"
      color="primary"
      animated
      header-nav
    >
      <q-step :name="0" title="Token" icon="key" :color="App._.user ? 'green-7' : 'grey'">
        <q-input v-model="App.config.token" label="Token" outlined>
          <template v-slot:prepend>
            <q-spinner-grid v-if="App.config.token && !App._.user && !App._.error" color="primary" size="1em" />
            <q-icon v-else-if="App._.user" name="verified" color="green-7" />
            <q-icon v-else name="key" />
          </template>
        </q-input>
        <transition name="expand-fade">
          <div v-if="App._.user && !App._.error" class="q-gutter-md row" style="margin: 1em">
            <q-input v-model="App._.user.username" label="Account" readonly outlined>
              <template v-slot:prepend>
                <q-icon name="account_circle" />
              </template>
            </q-input>

            <q-input v-model="App._.user.name" label="Name" readonly outlined>
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
            <q-input v-model="App._.user.commit_email" label="eMail" readonly outlined>
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
          </div>
          <div v-else-if="App._.error" style="margin: 1em">
            <q-banner>
              <template v-slot:avatar>
                <q-icon name="warning" color="red-7" />
              </template>
              {{ App._.error }}
            </q-banner>
          </div>
        </transition>

        <div>
          <h4>Welcome to DataHUBer.</h4>

          <p>
            To get started you need to create a <b>personal access token</b> on the <b>RPTU DataHUB</b>. See
            instructions below for details.
          </p>

          <q-btn
            label="Get Token"
            color="primary"
            @click="
              () =>
                visit(
                  'https://datahub.rz.rptu.de/-/user_settings/personal_access_tokens?page=1&state=active&sort=expires_asc'
                )
            "
          />

          <h5 style="margin-bottom: 1em">Instructions</h5>
          <ol>
            <li>
              Click the <strong>"Get Token"</strong> button above. This will open the DataHUB page in your browser,
              where you can create a personal access token. You will first need to log in via <em>Shibboleth</em>.
            </li>

            <li>
              On the DataHUB page, navigate to <strong>"Personal access tokens"</strong> and click
              <strong>"Add new token"</strong>.
            </li>

            <li>Enter a name for the token (for example, <em>"MyToken"</em>).</li>

            <li>Leave the <strong>Description</strong> field empty.</li>

            <li>Under <strong>Scopes</strong>, select <strong>all</strong> available checkboxes.</li>

            <li>
              When the page looks similar to the image below, click the <strong>"Create Token"</strong> button.
              <img
                :src="pat0"
                style="width: 90%; border: 0.1em solid black; border-radius: 0.5em; padding: 1em; margin: 1em"
              />
            </li>

            <li>
              On the newly opened page, click the <strong>eye icon</strong> in the green box to reveal your token. Copy
              the token and paste it into the <strong>"Token"</strong> input field in DataHUBer. <br /><br />
              <strong>Important:</strong> This is the <em>only</em> time the token will be visible. If you do not copy
              it now, you will need to create a new token.
              <img
                :src="pat1"
                style="width: 90%; border: 0.1em solid black; border-radius: 0.5em; padding: 1em; margin: 1em"
              />
            </li>

            <li>
              DataHUBer will automatically verify the token by fetching your user data. If your name and email address
              are displayed, the token is valid and you can proceed to the next step.
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
          <q-btn label="Select Directory" icon="folder" color="primary" @click="openDirectory" />
          <q-input outlined v-model="App._.location" class="col" readonly>
            <template v-slot:append>
              <q-btn icon="clear" round @click="() => (App._.location = '')" flat />
            </template>
          </q-input>
        </div>
      </q-step>
      <q-step :name="2" title="Meta Data" icon="sym_o_add_notes" :disable="App._.location === ''">
        <p style="margin-top: 2em">In the future it will be possible to edit meta data here.</p>
      </q-step>
      <q-step :name="3" title="Git Status" icon="sym_o_commit" :disable="App._.location === ''">
        <q-btn label="Verify Git Status" icon="verified" color="primary" @click="verifyGit" />
      </q-step>

      <q-step :name="4" title="Upload" icon="upload">
        <q-list>
          <q-item tag="label" v-ripple v-for="r in App._.remotes" :key="r">
            <q-item-section avatar>
              <q-radio v-model="App._.active_remote" :val="r" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ r.split('$$$')[0] }}</q-item-label>
              <q-item-label caption>{{ r.split('$$$')[1] }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn label="Upload" color="primary" icon="upload" @click="selectProject" />

        <p>
          To upload the directory to the DataHUB you have to specify a target project URL. If you do not already have a
          project, you can create one following the instructions below.
        </p>

        <div class="q-gutter-sm row" style="margin: 1em">
          <q-btn label="Find Existing Project" color="primary" icon="search" @click="selectProject" />

          <q-btn
            label="Create New Project"
            color="primary"
            icon="add"
            @click="
              () =>
                visit(
                  'https://datahub.rz.rptu.de/-/user_settings/personal_access_tokens?page=1&state=active&sort=expires_asc'
                )
            "
          />
        </div>

        <ol>
          <li>
            Click the <strong>"Create Project"</strong> button above. This will open GitLab in your browser. If
            prompted, log in using your institutional credentials.
          </li>

          <li>On the GitLab dashboard, click <strong>"New project"</strong>.</li>

          <li>Select <strong>"Create blank project"</strong>.</li>

          <li>Enter a <strong>Project name</strong> (for example, <em>"my-datahub-project"</em>).</li>

          <li>(Optional) Add a <strong>Description</strong> for the project.</li>

          <li>
            Set the <strong>Visibility Level</strong> according to your needs. In most cases,
            <strong>Private</strong> is recommended.
          </li>

          <li>Leave all other settings at their default values.</li>

          <li>
            When the page looks similar to the image below, click the <strong>"Create project"</strong> button.
            <img
              :src="pat0"
              style="width: 90%; border: 0.1em solid black; border-radius: 0.5em; padding: 1em; margin: 1em"
            />
          </li>

          <li>
            After the project is created, you will be redirected to the project overview page. If you can see the
            project name and an empty repository, the project is ready to be used as a DataHUB upload target.
          </li>
        </ol>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<style scoped>
p {
  font-size: 1.5em;
}
</style>
