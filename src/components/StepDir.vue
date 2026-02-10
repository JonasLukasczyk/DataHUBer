<script setup>
import App from '../App.js';
const openDirectory = async () => {
  App._.location = (await window.GitService.selectDirectory('Select Data Folder')) || '';
};
</script>

<template>
  <q-step v-bind="$attrs">
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
        @click="() => (App._.step = 2)"
        :disabled="!App._.location"
      />
    </div>
  </q-step>
</template>

<style></style>
