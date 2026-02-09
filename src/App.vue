<script setup>
// window.addEventListener('keyup', e => {
//   if (e.ctrlKey && (e.keyCode === 107 || e.keyCode === 187)) {
//     console.log('zoom');
//     window.MainService.zoom(2);
//   }
// });
</script>

<template>
  <router-view />
</template>

<style>
/* html { */
/*   zoom:1.25; */
/* } */

.material-symbols-outlined {
  font-variation-settings:
    'FILL' 1,
    /* <— makes it filled */ 'wght' 400,
    'GRAD' 0,
    'opsz' 48;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.expand-fade-enter-active,
.expand-fade-leave-active {
  transition:
    max-height 0.35s ease,
    opacity 0.25s ease;
  overflow: hidden;
}

.expand-fade-enter-from,
.expand-fade-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-fade-enter-to,
.expand-fade-leave-from {
  max-height: 200px; /* must be >= content height */
  opacity: 1;
}
</style>
