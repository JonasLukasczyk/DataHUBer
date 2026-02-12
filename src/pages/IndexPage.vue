<script setup>
import App from '../App.js';
import StepToken from '../components/StepToken.vue';
import StepDir from '../components/StepDir.vue';
import StepMeta from '../components/StepMeta.vue';
import StepGit from '../components/StepGit.vue';
import StepPush from '../components/StepPush.vue';
</script>

<template>
  <q-page class="flex">
    <q-stepper
      style="width: 100%"
      active-icon="none"
      v-model="App._.step"
      ref="_.stepper"
      color="primary"
      animated
      header-nav
      flat
    >
      <q-step :name="-1" title="" icon="home" color="grey">
        <div>
          <h4>Welcome to DataHUBer</h4>
          <ul>
            <li>
              <b>Overview - </b>This tools helps you to upload step by step a local directory to the RPTU DataHUB.
            </li>
            <li>
              <b>Navigation - </b>
              You can always navigate to a specific step by clicking on the menu at the top.
            </li>
            <li>
              <b>Help - </b>
              Data you need to enter and actions you need to take are always displayed at the top of each step, and
              detailed instructions are located below.
            </li>
          </ul>
        </div>
        <div style="text-align: center">
          <q-btn label="Continue" icon="arrow_circle_right" color="primary" @click="() => (App._.step = 0)" />
        </div>
      </q-step>

      <StepToken :name="0" title="Token" icon="key" :color="App._.user ? 'green-7' : 'grey'" />

      <StepDir
        :name="1"
        title="Directory"
        icon="folder"
        :disable="!App._.user"
        :color="App._.location ? 'green-7' : 'grey'"
      />
      <StepMeta
        :name="2"
        title="Meta Data"
        icon="sym_o_add_notes"
        :disable="App._.location === ''"
        :color="App.minimal_meta() ? 'green-7' : 'grey'"
      />
      <StepGit
        :name="3"
        title="Git Status"
        icon="sym_o_commit"
        :disable="App._.location === ''"
        :color="App._.ready_for_upload ? 'green-7' : 'grey'"
      />

      <StepPush :name="4" title="Upload" icon="upload" :disable="!App._.ready_for_upload" color='grey' />
    </q-stepper>
  </q-page>
</template>

<style>
.body--light {
  --q-grey-line: #f00; /* Light grey for light mode */
  --q-grey-line-active: #f00; /* Light grey for light mode */
}

.body--dark {
  --q-grey-bg: none;
  --q-grey-line: #444;
  --q-grey-line-active: #999;
}

.q-stepper__tab {
  border-bottom: 0.4em solid var(--q-grey-line);
  padding-bottom: 0;
}

.q-stepper__tab--active {
  border-bottom-color: var(--q-grey-line-active) !important;
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
