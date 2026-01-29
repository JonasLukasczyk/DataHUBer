<script setup>
import { useDialogPluginComponent } from 'quasar';
import App from '../App.js';
import { nextTick, watch, ref, onMounted, onUnmounted } from 'vue';

const pre = ref(null);

// const _ = reactive({
// });

// const props = defineProps({
// });

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

onMounted(() => {
  watch(
    () => App._.git_log,
    async () => {
      await nextTick();
      pre.value.scrollTop = pre.value.scrollHeight;
    }
  );
});
onUnmounted(() => {});
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" style="max-width: 100%">
    <q-card class="q-dialog-plugin" style="width: 100%; max-width: 100%">
      <q-card-section>
        <pre ref="pre" style='overflow-y: auto; max-height:20em;border-radius:0.5em; background-color:#eee'
          >{{ App._.git_log }}
        </pre>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
