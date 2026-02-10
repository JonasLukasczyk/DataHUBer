<script setup>
import App from '../App.js';
import pat1 from '../assets/pat_1.jpg';
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

      <q-btn
        label="New Token"
        icon="add"
        color="primary"
        @click="
          () =>
            App.visit(
              'https://datahub.rz.rptu.de/-/user_settings/personal_access_tokens?page=1&state=active&sort=expires_asc'
            )
        "
      />
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
          Click the <strong>"New Token"</strong> button above. This will open the DataHUB page in your browser, where
          you can create a personal access token. You will first need to log in via <em>Shibboleth</em>.
        </li>

        <li>
          On the DataHUB page, navigate to <strong>"Personal access tokens"</strong> and click
          <strong>"Add new token"</strong>.
        </li>

        <li>Enter a name for the token (for example, <em>"MyToken"</em> or <em>"LabDesktop"</em>).</li>

        <li>Leave the <strong>Description</strong> field empty.</li>

        <li>Under <strong>Scopes</strong>, select <strong>all</strong> available checkboxes.</li>

        <li>Click the <strong>"Create Token"</strong> button in the bottom left corner.</li>

        <li>
          On the newly opened page, click the <strong>eye icon</strong> in the green box to reveal your token. Copy the
          token and paste it into the <strong>"Token"</strong> input field in DataHUBer. <br />
          <div style="color: #cc0000">
            <strong>Important:</strong> This is the <em>only</em> time the token will be visible. If you do not copy it
            now, you will need to create a new token.
          </div>
          <img
            :src="pat1"
            style="width: 90%; border: 0.1em solid black; border-radius: 0.5em; padding: 1em; margin: 1em"
          />
        </li>

        <li>
          DataHUBer will automatically verify the token by fetching your user data. If your name and email address are
          displayed, the token is valid and you can proceed to the next step. The DataHUBer will also remember the
          entered Token for future sessions.
        </li>
      </ol>
    </div>
  </q-step>
</template>

<style></style>
