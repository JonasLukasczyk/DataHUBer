import fs from 'fs';
import path from 'path';

const MainService = {
  readRoc: path => {
    try {
      const data = fs.readFileSync(path + '/ro-crate-metadata.json', 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  writeRoc: (path, json) => {
    try {
      fs.writeFileSync(path + '/ro-crate-metadata.json', json);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  getPathToTiffFiles: async root => {
    let results = [];
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(root, entry.name);
      if (entry.isDirectory()) results = results.concat(await MainService.getPathToTiffFiles(fullPath));
      else if (entry.isFile() && /\.(tif|tiff)$/i.test(entry.name)) results.push(fullPath);
    }

    return results;
  },
};

export default MainService;
