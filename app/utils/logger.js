const { debugInfo } = require('electron-util');
const log = require('electron-log');
const Store = require('electron-store');

const store = new Store();

log.transports.remote.level = 'warn';
log.transports.remote.url = 'https://api.iglive.err4o4.com/logs'
log.transports.remote.client = {
  app: debugInfo().split('\n')[0],
  electron: debugInfo().split('\n')[1],
  platform: debugInfo().split('\n')[2],
  locale: debugInfo().split('\n')[3],
  user: {
    username: store.has('username') ? store.get('username') : null,
    invite: store.has('invite') ? JSON.parse(store.get('invite')).code : null,
  }
 }

 export { log };
