<script setup>
import { reactive } from 'vue';
import AppProperties from '../AppProperties.js';
const _ = reactive({
  step: 0,
});

const openDirectory = async () => {
  AppProperties._.location = (await window.GitService.selectDirectory('Select Data Folder')) || '';
};
</script>

<template>
  <q-page class="flex">
    <q-stepper
      style="width: 100%"
      active-icon="none"
      v-model="_.step"
      ref="_.stepper"
      color="primary"
      animated
      header-nav
    >
      <q-step :name="1" title="Settings" icon="settings">
        <q-input v-model="AppProperties._.token" label="Username">
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input v-model="AppProperties._.token" label="eMail">
          <template v-slot:prepend>
            <q-icon name="mail" />
          </template>
        </q-input>
        <q-input v-model="AppProperties._.token" label="Token">
          <template v-slot:prepend>
            <q-icon name="key" />
          </template>
        </q-input>
        <q-input v-model="AppProperties._.location" label="Directory">
          <template v-slot:prepend>
            <q-icon name="folder" @click="openDirectory" style="cursor: pointer" />
          </template>
        </q-input>
        <!-- <q-list padding bordered class="rounded-borders"> -->
        <!-- <q-expansion-item dense dense-toggle expand-separator icon="sym_o_rebase" label="Git" default-opened> -->
        <!--   <div style="padding: 1em 4em"> -->
        <!--     <q-list dense style="max-width: 20em"> -->
        <!--       <q-item> -->
        <!--         <q-item-section avatar><q-icon name="verified" color="green-7" /></q-item-section> -->
        <!--         <q-item-section>Git</q-item-section> -->
        <!--         <q-item-section side>v1.5.6 </q-item-section> -->
        <!--       </q-item> -->
        <!--       <q-item> -->
        <!--         <q-item-section avatar><q-icon name="verified" color="green-7" /></q-item-section> -->
        <!--         <q-item-section>Git LFS</q-item-section> -->
        <!--         <q-item-section side>v1.5.6 </q-item-section> -->
        <!--       </q-item> -->
        <!--     </q-list> -->
        <!--   </div> -->
        <!-- </q-expansion-item> -->

        <!-- <q-expansion-item dense dense-toggle expand-separator icon="key" label="Tokens" default-opened> -->
        <!--   <div style="padding: 1em 4em"> -->
        <!--     <q-list> -->
        <!--       <q-item tag="label" v-ripple> -->
        <!--         <q-item-section avatar> -->
        <!--           <q-radio v-model="AppProperties._.active_token" val="0" color="teal" /> -->
        <!--         </q-item-section> -->
        <!--         <q-item-section> -->
        <!--           <q-item-label>Teal</q-item-label> -->
        <!--         </q-item-section> -->
        <!--       </q-item> -->
        <!---->
        <!--       <q-item tag="label" v-ripple> -->
        <!--         <q-item-section avatar> -->
        <!--           <q-radio v-model="AppProperties._.active_token" val="1" color="teal" /> -->
        <!--         </q-item-section> -->
        <!--         <q-item-section> -->
        <!--           <q-item-label>Orange</q-item-label> -->
        <!--           <q-item-label caption>With description </q-item-label> -->
        <!--         </q-item-section> -->
        <!--       </q-item> -->
        <!---->
        <!--       <q-item tag="label" v-ripple> -->
        <!--         <q-item-section avatar top> -->
        <!--           <q-radio v-model="AppProperties._.active_token" val="2" color="teal" /> -->
        <!--         </q-item-section> -->
        <!--         <q-item-section> -->
        <!--           <q-item-label>Cyan</q-item-label> -->
        <!--           <q-item-label caption -->
        <!--             >Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut -->
        <!--             labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris -->
        <!--             nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit -->
        <!--             esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt -->
        <!--             in culpa qui officia deserunt mollit anim id est laborum.</q-item-label -->
        <!--           > -->
        <!--         </q-item-section> -->
        <!--       </q-item> -->
        <!--     </q-list> -->
        <!--   </div> -->
        <!-- </q-expansion-item> -->
        <!-- </q-list> -->
      </q-step>

      <q-step :name="2" title="Git" icon="sym_o_rebase"> </q-step>
      <q-step :name="3" title="Meta Data" icon="sym_o_add_notes">
        TODO
      </q-step>

      <q-step :name="4" title="Upload" icon="upload">

      </q-step>
    </q-stepper>
  </q-page>
</template>
