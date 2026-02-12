<script setup>
import App from '../App.js';
import { ref, nextTick, watch, onMounted } from 'vue';

const scrollAreaRef = ref(null);

const update = async () => {
  await nextTick();
  scrollAreaRef.value.setScrollPercentage('vertical', 1, 100);
  // pre.value.scrollTop = pre.value.scrollHeight;
};
const init = async () => {
  watch(() => App._.git_log, update, { deep: true });
  update();
};

const clear = () => {
  App._.git_log = [''];
};

onMounted(init);
</script>

<template>
  <q-list bordered class="rounded-borders col">
    <q-item-label header
      >Log
      <q-btn
        @click="clear"
        style="float: right; margin: -0.2em 0 0 0; font-size: 0.85em"
        icon="delete"
        flat
        round
        dense
      />
      <q-checkbox v-model="App._.git_debug" label="Debug" dense style="float: right; margin: 0.15em 1em 0 0">
        <q-tooltip> Display verbose git output </q-tooltip>
      </q-checkbox>
    </q-item-label>
    <q-item>
      <q-scroll-area ref="scrollAreaRef" style="height: 20.5em; width: 100%" :visible="true">
        <pre
          ref="pre"
          style="
            width: 100%;
            background-color: var(--q-grey-bg);
            padding: 1em;
            border-radius: 1em;
            margin: 0;
            overflow: visible;
          "
        >
      {{ App._.git_log.join('\n') }}
          </pre
        >
      </q-scroll-area>
    </q-item>

    <q-linear-progress size="10px" :value="100" :indeterminate="App._.git_busy" />
  </q-list>
</template>

<style scoped></style>
