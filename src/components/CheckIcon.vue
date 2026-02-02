<script setup>
const _ = defineProps({
  property: { required: true },
});
</script>

<template>
  <div>
    <q-icon v-if="_.property[0] === true" name="verified" color="green-7" size="2em" />
    <q-icon v-else-if="_.property[0] === false" name="warning" color="red-7" size="2em" />
    <q-icon v-else-if="_.property[0] === 3" name="sym_o_verified_off" color="grey-7" size="2em" />
    <q-spinner-grid v-else color="primary" size="2em" />
  </div>
</template>

<style scoped></style>
