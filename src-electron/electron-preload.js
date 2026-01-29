import { ipcRenderer, contextBridge } from 'electron';

const services = JSON.parse(process.argv.find(a => a.startsWith('--services='))?.split('=')[1]);
for (let [service_name, function_names] of Object.entries(services)) {
  const api = {};
  for (let f of function_names) api[f] = (...args) => ipcRenderer.invoke(`${service_name}.${f}`, ...args);

  api.onMessage = handler => {
    const wrapped = (_event, payload) => handler(payload);
    ipcRenderer.on(service_name, wrapped);
    return () => ipcRenderer.removeListener(service_name, wrapped);
  };
  contextBridge.exposeInMainWorld(service_name, api);
}
