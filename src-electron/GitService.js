import {dialog, BrowserWindow} from 'electron'


const GitService = {
  hello: async (e,a,b) => {
    return [a,b];
  },

  selectDirectory: async (e,title)=>{
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed())
    const result = await dialog.showOpenDialog(window, {
      title: title,
      properties: ['openDirectory'],
    });
    return result.filePaths[0];
  }
};

export default GitService;
