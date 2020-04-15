const request = require('request');
import moment from 'moment'
import * as Bluebird from 'bluebird';

const Store = require('electron-store');
const store = new Store();

const APIURL = 'https://api.iglive.err4o4.com/';

export async function getNotifications() {
  return new Promise(async (resolve, reject) => {
    request(APIURL + 'notifications?valid_until_gte='+moment().format('YYYY-MM-DD')+'&_sort=created_at:DESC', { json: true }, function (error, response, body) {
      if(error) {
        reject({ errorType: 'Unknown', error: error })
      }
      if(response.statusCode == 200){
        if(store.has('readNotifications')) {
          const oldNotifications = JSON.parse(store.get('readNotifications'));
          const readIDs = JSON.parse(store.get('readNotifications')).id
          var newNotifications = body.filter(function(item){
            return readIDs.indexOf(item.id) === -1;
          });
          resolve(newNotifications)
        } else {
          store.set('readNotifications', JSON.stringify({id: []}))
          resolve(body)
        }
      } else {
        reject({ errorType: 'codeNotFound', error: '404 Not Found' })
      }
    });
  });
}
