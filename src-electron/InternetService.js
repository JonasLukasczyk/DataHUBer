import { shell, net } from 'electron';

const default_header = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'user-agent': 'node.js',
};

const InternetService = {
  openExternal: async url => shell.openExternal(url),

  getWebPageAsJson: async options => {
    try {
      await net.resolveHost(options.host);
    } catch (err) {
      return new Promise(resolve => resolve(null, err));
    }

    return new Promise(resolve => {
      try {
        const request = net.request(options);
        const header = options.header || default_header;
        for (let h in header) request.setHeader(h, header[h]);

        request.on('response', response => {
          if (response.statusCode === 200) {
            let output = '';
            response.on('data', chunk => {
              output += chunk;
            });
            response.on('end', () => {
              resolve([response.statusCode, JSON.parse(output)]);
            });
          } else {
            resolve([response.statusCode, null]);
          }
        });
        /** net.request does not throw error on ERR_CONNECTION_TIMED_OUT and similar,
         * there will me a rather interuptive, non helpful message to the user, that there is a connection error
         * in a case like that the promise will not be resolved
         * as an intermediate we "catch" the error in .on('error') and resolve the promise with null
         */
        request.on('error', () => resolve(null));
        request.end();
      } catch (err) {
        resolve([err, null]);
      }
    });
  },
};

export default InternetService;
