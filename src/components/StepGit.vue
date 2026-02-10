<script setup>
import App from '../App.js';
import GitLog from '../components/GitLog.vue';
import CheckIcon from '../components/CheckIcon.vue';

const checkLabel = (property, y, n, l) => (property[0] === true ? y : property[0] === false ? n : l);
</script>

<template>
  <q-step v-bind="$attrs">
    <div class="row q-gutter-md">
      <q-list bordered class="rounded-borders col" style="max-width: 430px" separator>
        <q-item-label header>
          Status
          <q-btn style="float: right; margin-top: -0.3em" icon="refresh" rounded flat dense @click="App.verifyGit" />
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

        <q-item clickable @click="App.initializeGit">
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

        <q-item clickable @click="App.initializeLFS">
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
        <q-item clickable @click="App.commit">
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
              @click="() => (App._.step = 4)"
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
          Are <b>git</b> and <b>git lfs</b> installed on the system? If not please do so and it might be neccessary to
          restart DataHUBer.
        </li>
        <li>
          Are <b>git</b> and <b>git lfs</b> initialized in the current directory? if not datahuber can initialize these
          by clicking on the corresponding buttons. Please click afterwards on the refresh button in the top right
          corner to restart the checking procedure.
        </li>
        <li>
          Are there any uncommited changes or untracked files? In this case, DataHUBer can commit <b>all</b> these
          changes and untracked files inside the directory via a click on the "Directory Status" button. You will be
          shown a detailed commit dialog with an option to abort the commit. <br />
          <i>
            Note: If you do not want to commit certain untracked files or changes right now, you can still proceed to
            the uploading step and leave these files and changes behind (at least for now).
          </i>
        </li>
      </ol>
    </div>
  </q-step>
</template>

<style></style>
