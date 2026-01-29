<script setup>
import { useDialogPluginComponent } from 'quasar';
import App from '../App.js';
import { reactive, onMounted } from 'vue';

const _ = reactive({
  projects: [],
});

// const props = defineProps({
// });

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const init = async () => {
  const [code, projects] = await window.GitService.getUserProjects(App.config.token);
  if (code !== 200) {
    return;
  }
  _.projects = projects;
};
onMounted(init);
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" style="max-width: 100%">
    <q-card class="q-dialog-plugin" style="width: 100%; max-width: 100%">
      <transition name='expand-fade'>
      <q-list v-if="_.projects.length>0" dense>
        <q-item v-for="p of _.projects" :key="p.id" clickable @click="() => onDialogOK(p)">
          <q-item-section>
            {{ p.path_with_namespace }}
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else style='text-align:center;'>
        <q-spinner-grid color="primary" size="8em" style='margin:2em;'/>
      </div>

      </transition>

      <q-card-actions align="right">
        <q-btn color="primary" label="Cancel" @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
