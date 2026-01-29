<script setup>
// import { reactive } from 'vue';

// const _ = reactive({
//   menu: [
//     {
//       title: 'DataHUB',
//       icon: 'sym_o_database',
//     },
//     {
//       title: 'Tokens',
//       icon: 'key',
//       to: 'tokens'
//     },
//   ],
// });

// const leftDrawerOpen = ref(false);
</script>

<template>
  <q-layout view="hHh lpR lFf">
    <!-- <q-header bordered class="bg-primary text-white"> -->
    <!--   <q-toolbar> -->
    <!--     <q-toolbar-title> -->
    <!-- <q-avatar> -->
    <!--   <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" /> -->
    <!-- </q-avatar> -->
    <!--       <b>DataHUBer</b> -->
    <!--     </q-toolbar-title> -->
    <!--   </q-toolbar> -->
    <!-- </q-header> -->

    <!-- <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="bg-grey-4" :width='150'> -->
    <!--   <q-list> -->
    <!--     <q-item v-for="l in _.menu" :key="l.title" clickable v-ripple :to='l.to ? "tokens" : "/"'> -->
    <!--       <q-item-section avatar style='min-width:0'> -->
    <!--         <q-icon color="primary" :name="l.icon" /> -->
    <!--       </q-item-section> -->
    <!---->
    <!--       <q-item-section class='text-black'>{{ l.title }}</q-item-section> -->
    <!--     </q-item> -->
    <!--   </q-list> -->
    <!-- </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
