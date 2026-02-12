<script setup>
import { useDialogPluginComponent } from 'quasar';
import { reactive, onMounted, onUnmounted } from 'vue';
import App from '../App.js';

const _ = reactive({
  message: '',
  name: '',
  email: '',
  modified: [],
  deleted: [],
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

onMounted(async () => {
  _.name = App._.user.name;
  _.email = App._.user.email;

  const status = await window.GitService.getStatus(App._.location, true);
  const entries = status[1].split(`\u0000`);

  for (const entry of entries) {
    if (entry.length < 2) continue;
    const status = entry.slice(0, 2);
    const path = entry.slice(3);

    if (status.includes('D')) {
      _.deleted.push(path);
    } else {
      _.modified.push(path);
    }
  }
});
onUnmounted(() => {});

const onSubmit = () => {
  onDialogOK(_.message);
};
const onReset = () => {};
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" style="max-width: 100%">
    <q-card class="q-dialog-plugin" style="width: 100%; max-width: 100%">
      <q-form @submit="onSubmit" @reset="onReset">
        <q-card-section>
          <div class="q-gutter-md row" style="margin-bottom: 1em">
            <q-input v-model="_.name" label="Name" outlined class="col" readonly />
            <q-input v-model="_.email" label="email" outlined class="col" readonly />
          </div>
          <div class="q-gutter-md row">
            <q-input
              v-model="_.message"
              type="textarea"
              outlined
              autogrow
              label="Commit Message (Required)"
              class="col"
              placeholder="e.g. Init, New LFS Files, Meta-Data Update"
              lazy-rules
              :rules="[val => (val && val.length > 0) || 'Please enter a commit message']"
            />
          </div>
        </q-card-section>

        <div v-for="(i, idx) in ['modified', 'deleted']" :key='idx'>
          <q-card-section v-if="_[i].length">
            <q-list dense>
              <q-item-label header>{{ idx === 0 ? 'Adding' : 'Removing' }} {{ _[i].length }} File(s)</q-item-label>
            </q-list>
            <q-scroll-area style="font-size: 1em; height: 200px" class="rounded-borders" :visible="true">
              <q-list dense>
                <q-item v-for="p in _[i]" :key="p">
                  <q-item-section avatar>
                    <q-icon color="primary" :name="idx === 0 ? 'add' : 'remove'" />
                  </q-item-section>
                  <q-item-section>{{ p }}</q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>
        </div>

        <q-card-actions align="right" style="padding: 0 1.2em 1.5em 0">
          <q-btn color="primary" label="Commit" type="submit" />
          <q-btn color="grey-7" label="Cancel" @click="onDialogCancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
