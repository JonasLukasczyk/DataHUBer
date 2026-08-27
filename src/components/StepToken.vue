<script setup>
import App from '../App.js';

const URL = `https://datahub.rz.rptu.de/-/user_settings/personal_access_tokens/legacy/new?name=DataHUBer&description=Token+used+to+authenticate+DataHUBer+actions&scopes=api`;
</script>

<template>
  <q-step v-bind="$attrs">
    <div class="q-gutter-md row">
      <q-input
        v-model="App.config.token"
        outlined
        class="col"
        placeholder="Please create a personal access token"
        dense
      >
        <template v-slot:prepend>
          <q-spinner-grid v-if="App.config.token && !App._.user && !App._.error" color="primary" size="1em" />
          <q-icon v-else-if="App._.user" name="verified" color="green-7" />
          <q-icon v-else name="key" />
        </template>
      </q-input>

      <q-btn label="New Token" icon="add" color="primary" @click="() => App.visit(URL)" />
    </div>

    <div v-if="App._.user && !App._.error" class="q-gutter-md row" style="margin: 1em">
      <q-input v-model="App._.user.username" label="Account" readonly outlined dense>
        <template v-slot:prepend>
          <q-icon name="account_circle" />
        </template>
      </q-input>

      <q-input v-model="App._.user.name" label="Name" readonly outlined dense>
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>
      <q-input v-model="App._.user.commit_email" label="eMail" readonly outlined dense>
        <template v-slot:prepend>
          <q-icon name="mail" />
        </template>
      </q-input>

      <q-btn label="Continue" icon="arrow_circle_right" color="primary" @click="() => (App._.step = 1)" />
    </div>
    <div v-else-if="App._.error" style="margin: 1em">
      <q-banner>
        <template v-slot:avatar>
          <q-icon name="warning" color="red-7" />
        </template>
        {{ App._.error }}
      </q-banner>
    </div>

    <div>
      <h5 style="margin-bottom: 1em">Instructions</h5>
      <ol>
        <li>
          You can use a previously created <strong>token</strong> or create a new one by following the instructions
          below.
        </li>

        <li>
          To create a new token, click the <strong>"New Token"</strong> button above. This will open the DataHUB page in
          your browser, where you can create a personal access token. You may first need to sign in via
          <em>Shibboleth</em>.
        </li>

        <li>
          The token creation form is already prefilled with the required settings. Simply click the
          <strong>"Generate token"</strong> button at the bottom of the page.
        </li>

        <li>
          On the next page, click the <strong>eye icon</strong> in the green box to reveal your token. Copy the token
          and paste it into the <strong>"Token"</strong> input field in DataHUBer.<br />

          <q-banner class="rounded-borders q-ma-sm" style='background-color:#880000;max-width:32em;'>
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            <b>
              This is the only time the token will be visible. Make sure to copy it now. If you lose it, you will need
              to create a new token.
            </b>
          </q-banner>
        </li>

        <li>
          DataHUBer will automatically verify the token by retrieving your user information. If your name and email
          address are displayed, the token is valid and you can proceed to the next step. DataHUBer will also remember
          the token for future sessions.
        </li>
      </ol>
    </div>
  </q-step>
</template>

<style></style>
