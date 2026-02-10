<script setup>
import App from '../App.js';
import GitLog from '../components/GitLog.vue';

const push = async () => {
  App._.git_log.push('[PUSH] [START] ============================================================');
  const remote = App._.project.http_url_to_repo;
  const patched_remote = App.toHttpsWithToken(remote);
  await window.GitService.setRemoteUrl(App._.location, 'origin', patched_remote);
  await window.GitService.push(App._.location, 'origin', 'main');
  await window.GitService.setRemoteUrl(App._.location, 'origin', App.urlWithoutCredentials(patched_remote));
  App._.git_log.push('[PUSH] [END] ==============================================================');
};
</script>

<template>
  <q-step v-bind="$attrs">
    <div class="q-gutter-md row" style="margin-bottom: 1.5em">
      <q-select
        label="Project"
        hide-dropdown-icon
        outlined
        v-model="App._.project"
        :options="App._.projects"
        option-value="id"
        option-label="name_with_namespace"
        options-dense
        @filter="App.getProjects"
        style="min-width: 40em"
        dense
      >
        <template v-slot:prepend>
          <q-icon name="cloud" />
        </template>

        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="sym_o_captive_portal"
            @click.stop.prevent="() =>App.visit(App._.project.http_url_to_repo)"
            v-if="App._.project"
          >
            <q-tooltip> Show in Browser </q-tooltip>
          </q-btn>

          <q-btn
            round
            dense
            flat
            icon="add"
            @click.stop.prevent="() => visit('https://datahub.rz.rptu.de/projects/new?namespace_id=225#blank_project')"
          >
            <q-tooltip> New Project </q-tooltip>
          </q-btn>
        </template>
      </q-select>
      <q-btn label="Upload" color="primary" icon="upload" @click="push" :disabled="!App._.project" desne />
    </div>

    <div class="q-gutter-md row">
      <GitLog />
    </div>

    <div>
      <h5 style="margin-bottom: 1em">Instructions</h5>
      <ul>
        <li>To upload the chosen directory you have to specify the target DataHUB project.</li>
        <li>You can choose among the DataHUB projects you have access to as determined by your token.</li>
        <li>
          If you have not created a target project yet, follow these steps:

          <ol>
            <li>
              Click the <i>+</i> button in the project selection box. This will open the corresponding DataHUB page in
              your browser.
            </li>
            <li>Enter a name for the project.</li>
            <li>By default, the project will be assigned to the <b>Gulliver</b> group. Keep this setting unchanged.</li>
            <li>Select the desired visibility for the project.</li>
            <li>
              <b>Important:</b> Make sure the <i>"Initialize repository with a README"</i> option is <b>unchecked</b>.
            </li>
            <li>Click the <i>"Create Project"</i> button.</li>
            <li>After the project is created, return to DataHUBer and select your new project from the list.</li>
          </ol>
        </li>
      </ul>
    </div>
  </q-step>
</template>

<style></style>
