<script setup>
import App from '../App.js';
import { onMounted, reactive, watch } from 'vue';

import FormDialog from '../dialogs/FormDialog.vue';
import { Dialog } from 'quasar';

const _ = reactive({
  roc: null,
  licenses: [
    'https://creativecommons.org/licenses/by/4.0/',
    'https://opensource.org/licenses/MIT',
    'https://www.apache.org/licenses/LICENSE-2.0',
    'https://www.gnu.org/licenses/gpl-3.0.en.html',
    'https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html',
    'https://www.gnu.org/licenses/lgpl-3.0.en.html',
    'https://opensource.org/licenses/BSD-2-Clause',
    'https://opensource.org/licenses/BSD-3-Clause',
    'https://www.mozilla.org/en-US/MPL/2.0/',
    'https://www.eclipse.org/legal/epl-2.0/',
    'https://unlicense.org/',
    'https://opensource.org/licenses/ISC',
    'https://creativecommons.org/publicdomain/zero/1.0/',
  ],
});

// const addNode = node => {
//   node.id = crypto.randomUUID();
//   _.roc['@graph'].push(node);
// };
//
// const addPerson = () => {};

const deleteAuthor = id => {
  const i = _.roc['@graph'].findIndex(n => n['@id'] === id);
  if (i >= 0) _.roc['@graph'].splice(i, 1);
};

const editAuthor = id => {
  const found = _.roc['@graph'].find(n => n['@id'] === id);
  const node = found || {
    '@id': crypto.randomUUID(),
    '@type': 'Person',
    name: '',
    email: '',
    identifier: '',
  };

  const elements = {
    name: { l: 'Name', v: node.name },
    email: { l: 'eMail', v: node.email },
    identifier: { l: 'ORCID', v: node.identifier },
  };

  Dialog.create({
    component: FormDialog,
    componentProps: {
      title: 'Author',
      btn_ok: found ? 'Update' : 'Add',
      elements: elements,
    },
  }).onOk(async r => {
    for (let k of Object.keys(r)) node[k] = r[k].v;

    if (!found) _.roc['@graph'].push(node);
  });
};

const readRoc = async () => {
  _.roc = await window.MainService.readRoc(App._.location);

  if (!_.roc) _.roc = {};
  _.roc['@context'] = [
    'https://w3id.org/ro/crate/1.1/context',
    {
      parameterValue: 'https://bioschemas.org/properties/parameterValue',
      LabProcess: 'https://bioschemas.org/LabProcess',
    },
  ];

  if (!_.roc['@graph']) _.roc['@graph'] = [];

  if (!_.roc['@graph'].find(n => n['@id'] === 'ro-crate-metadata.json'))
    _.roc['@graph'].push({
      '@id': 'ro-crate-metadata.json',
      '@type': 'CreativeWork',
      conformsTo: { '@id': 'https://w3id.org/ro/crate/1.1' },
      about: { '@id': './' },
    });

  if (!_.roc['@graph'].find(n => n['@id'] === './'))
    _.roc['@graph'].push({
      '@id': './',
      '@type': 'Dataset',
      name: '',
      description: '',
      author: [],
      datePublished: new Date(Date.now()).toISOString().slice(0, 10),
      license: 'https://creativecommons.org/licenses/by/4.0/',
      publisher: [],
      hasPart: [],
    });

  if (!_.roc['@graph'].find(n => n['@id'] === '#ct-instrument'))
    _.roc['@graph'].push({
      '@id': '#ct-instrument',
      '@type': 'PropertyValue',
      name: '',
      value: '',
    });

  if (!_.roc['@graph'].find(n => n['@type'] === 'LabProcess')) {
    const node = {
      '@id': '#LabProcess',
      '@type': 'LabProcess',
      name: 'Computed Tomography',
      instrument: { '@id': '#ct-instrument' },
      result: [],
      agent: [],
      parameterValue: [],
    };
    [
      [
        'voltage',
        'http://purl.allotrope.org/ontologies/quality#AFQ_0000048',
        0,
        '',
        'kV',
        'http://purl.obolibrary.org/obo/NCIT_C42551',
      ],
      [
        'current',
        'http://purl.allotrope.org/ontologies/quality#AFQ_0000049',
        0,
        '',
        'uA',
        'http://purl.obolibrary.org/obo/NCIT_C42536',
      ],
      [
        'power',
        'http://purl.allotrope.org/ontologies/result#AFR_0001917',
        0,
        '',
        'W',
        'http://purl.obolibrary.org/obo/NCIT_C204406',
      ],
      [
        'exposure_time',
        'http://purl.allotrope.org/ontologies/process#AFP_0003700',
        0,
        '',
        's',
        'http://purl.obolibrary.org/obo/NCIT_C42535',
      ],

      ['pixel_size', '', 0, '', 'um/pixel', ''],
      ['image_width_scan', '', 0, '', 'pixel', ''],
      ['image_height_scan', '', 0, '', 'pixel', ''],
      ['number_of_images_scan', '', 0, '', '', ''],
      ['filter', '', 0, '', '', ''],
      ['binning', '', 0, '', '', ''],
      ['source_isocenter_distance', '', 0, '', 'um', ''],
      ['detector_isocenter_distance', '', 0, '', 'um', ''],
      ['cone_angle', '', 0, '', 'deg', ''],
      ['fan_angle', '', 0, '', 'deg', ''],
      ['center_shift', '', 0, '', 'um', ''],
      ['image_width_reco', '', 0, '', 'pixel', ''],
      ['image_height_reco', '', 0, '', 'pixel', ''],
      ['number_of_images_reco', '', 0, '', '', ''],
      ['scaling_min', '', 0, '', '', ''],
      ['scaling_max', '', 0, '', '', ''],
    ].forEach(([name, nameRef, value, valueRef, unit, unitRef]) => {
      const n = {
        '@id': crypto.randomUUID(),
        '@type': 'PropertyValue',
        name: name,
      };
      if (nameRef) n.propertyID = nameRef;
      if (value) n.value = value;
      if (valueRef) n.valueReference = valueRef;
      if (unit) n.unitText = unit;
      if (unitRef) n.unitCode = unitRef;
      node.parameterValue.push({ '@id': n['@id'] });
      _.roc['@graph'].push(n);
    });
    _.roc['@graph'].push(node);
  }

  const files_on_disk = await window.MainService.getPathToTiffFiles(App._.location);
  // delete all file elements
  _.roc['@graph'] = _.roc['@graph'].filter(n => n['@type'] !== 'MediaObject');
  const location_url = App._.location;
  // .split(' ').join('%20');

  const files = [];
  for (let file of files_on_disk) {
    const file_url = file;
    // .split(' ').join('%20');
    const n = {
      '@id': '.' + file_url.split(location_url)[1],
      '@type': 'MediaObject',
    };
    _.roc['@graph'].push(n);
    files.push(n);
  }
  const files_refs = files.map(f => {
    return { '@id': f['@id'] };
  });
  const dataset = _.roc['@graph'].find(n => n['@id'] === './');
  dataset.hasPart = files_refs;
  const process = _.roc['@graph'].find(n => n['@type'] === 'LabProcess');
  process.result = files_refs;

  // console.log(files_on_disk)
  // const files = !_.roc['@graph'].filter(n=>n['@type']==='MediaObject');
  // if(!files.length){
  //   const tiffs = await =
  // }

  console.log(_.roc);
};

const reset = async () => {
  await window.MainService.writeRoc(App._.location, '{}');
  await readRoc();
};

const writeRoc = async () => {
  const clone = JSON.parse(JSON.stringify(_.roc));

  const persons = clone['@graph']
    .filter(n => n['@type'] === 'Person')
    .map(p => {
      return { '@id': p['@id'] };
    });
  clone['@graph'].find(n => n['@id'] === './').author = persons;
  clone['@graph'].find(n => n['@id'] === '#LabProcess').agent = persons;

  await window.MainService.writeRoc(App._.location, JSON.stringify(clone, null, 1));
};

const init = async () => {
  await readRoc();
  watch(() => _.roc, App.debounce(writeRoc, 1000), { deep: true });
};

onMounted(init);
</script>

<template>
  <q-step v-bind="$attrs">
    <div class="q-gutter-md row" style="margin: 0 auto 2em auto; width: 35em">
      <q-btn label="Import JSON" icon="sym_o_source_notes" style="background-color: #ddd" />
      <q-btn label="Reset" icon="refresh" style="background-color: #ddd" @click="reset" />
      <q-btn label="Continue" icon="arrow_circle_right" color="primary" @click="() => App._.step++" />
    </div>

    <q-list bordered class="rounded-borders" style="max-width: 60em; margin: 0 auto" v-if="_.roc">
      <q-expansion-item
        expand-separator
        icon="sym_o_database"
        label="General"
        :def="root = _.roc['@graph'].find(n => n['@id'] === './')"
        :header-style="
          root.name && root.description && _.roc['@graph'].find(n => n['@type'] === 'Person')
            ? 'color:#090;'
            : 'color:#c00;'
        "
        default-opened
      >
        <div style="padding: 0 5em 2em 5em">
          <q-input v-model="root.name" label="Title" outlined dense style="padding: 0.5em 0" />
          <q-input v-model="root.description" label="Description" outlined dense style="padding: 0.5em 0" autogrow />
          <q-input v-model="root.datePublished" label="Date" outlined dense style="padding: 0.5em 0" mask="####-##-##" placeholder='YYYY-MM-DD'>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="root.datePublished" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="_.roc['@graph'].find(n => n['@id'] === '#ct-instrument').name"
            label="Instrument Model"
            outlined
            dense
            style="padding: 0.5em 0"
          />

          <q-list
            style="border-radius: 0.3em; border-color: silver; width: 100%; margin: 0.5em 0"
            v-if="_.roc"
            bordered
            dense
          >
            <q-item-label header
              >Authors
              <q-btn
                style="float: right; margin: -0.4em 0 0 0; font-size: 0.85em"
                icon="add"
                flat
                round
                dense
                @click="editAuthor"
            /></q-item-label>

            <q-item
              v-for="p in _.roc['@graph'].filter(n => n['@type'] === 'Person')"
              :key="p['@id']"
              dense
              style="margin: 0 0 0.5em 0"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">{{ p.name[0] || '' }}</q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label
                  >{{ p.name }} <span v-if="p.email">({{ p.email }})</span></q-item-label
                >
                <q-item-label v-if="p.identifier" caption lines="1">{{ p.identifier }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row">
                  <q-btn icon="edit" flat rounded dense @click="() => editAuthor(p['@id'])" />
                  <q-btn icon="delete" flat rounded dense @click="() => deleteAuthor(p['@id'])" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <q-select
            v-model="_.roc['@graph'].find(n => n['@id'] === './').license"
            :options="_.licenses"
            label="License"
            outlined
            dense
            style="padding: 0.5em 0"
            autogrow
            options-dense
          />
        </div>
      </q-expansion-item>

      <q-expansion-item icon="podcasts" label="Scan">
        <div style="margin: 0 auto 2em auto; max-width: 20em" v-if="_.roc">
          <div
            :def="
              parameter_ids = _.roc['@graph'].find(n => n['@id'] === '#LabProcess').parameterValue.map(pv => pv['@id'])
            "
          >
            <div :def="parameters = _.roc['@graph'].filter(n => parameter_ids.indexOf(n['@id']) >= 0)">
              <q-input
                v-for="pv in parameters"
                :key="pv['@id']"
                v-model="pv.value"
                :label="pv.name.split('_').join(' ') + (pv.unitText ? ` (${pv.unitText})` : '')"
                outlined
                dense
                style="padding: 0.5em 0"
              />
            </div>
          </div>
        </div>
      </q-expansion-item>

      <div :def="files = _.roc['@graph'].filter(n => n['@type'] === 'MediaObject')">
        <q-expansion-item icon="folder" :label="`Data Files (${files.length})`">
          <q-list v-if="_.roc">
            <q-item v-for="f in files" :key="f['@id']">
              <q-item-section>
                {{ f['@id'] }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </div>
    </q-list>
    <!-- <q-list bordered class="rounded-borders col"> -->
    <!--   <q-item-label header> -->
    <!--     Authors -->
    <!--     <q-btn -->
    <!--       @click="clear" -->
    <!--       style="float: right; margin: -0.2em 0 0 0; font-size: 0.85em" -->
    <!--       icon="close" -->
    <!--       flat -->
    <!--       round -->
    <!--       dense -->
    <!--     /> -->
    <!--   </q-item-label> -->
    <!--   <q-item> -->
    <!--     Person -->
    <!--   </q-item> -->
    <!-- </q-list> -->
  </q-step>
</template>

<style></style>
