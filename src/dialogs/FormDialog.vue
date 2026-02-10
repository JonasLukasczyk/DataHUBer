<script setup>
import { useDialogPluginComponent } from 'quasar';
import { reactive, onMounted } from 'vue';

const props = defineProps({
  elements: Object,
  title: String,
  btn_ok: String,
});

const _ = reactive({
  elements: null,
});

defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

onMounted(async () => {
  _.elements = props.elements;
});

const onSubmit = () => {
  onDialogOK(_.elements);
};
const onReset = () => {};
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" style="max-width: 100%">
    <q-card class="q-dialog-plugin" style="width: 100%; max-width: 100%; padding: 0 2em">
      <q-form @submit="onSubmit" @reset="onReset">
        <h5 style="margin: 1em 0 1em 0">{{ props.title }}</h5>

        <q-input
          v-for="k in Object.keys(_.elements)"
          :key="k"
          v-model="_.elements[k].v"
          :label="_.elements[k].l"
          outlined
          style="margin: 0.5em 0"
        />

        <q-card-actions align="right" style="padding: 2em 0 1.5em 0">
          <q-btn color="primary" :label="props.btn_ok" type="submit" />
          <q-btn color="grey-7" label="Cancel" @click="onDialogCancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
