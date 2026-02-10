<script setup>
import App from '../App.js';
import { ref, nextTick, watch, onMounted } from 'vue';

const pre = ref(null);

const update = async () => {
  await nextTick();
  pre.value.scrollTop = pre.value.scrollHeight;
};
const init = async () => {
  watch(() => App._.git_log, update, { deep: true });
};

const clear = () => {
  App._.git_log = [];
};

onMounted(init);
</script>

<template>
  <q-list bordered class="rounded-borders col">
    <q-item-label header
      >Log
      <q-btn @click="clear" style="float: right; margin: -0.2em 0 0 0; font-size: 0.85em" icon="delete" flat round dense
    /></q-item-label>
    <q-item>
      <pre
        ref="pre"
        style="width: 100%; height: 27em; overflow: scroll; background-color: #eee; padding: 1em; border-radius: 1em; margin:0"
        >{{ App._.git_log.join('\n') }}</pre
      >
    </q-item>
  </q-list>
</template>

<style scoped></style>
