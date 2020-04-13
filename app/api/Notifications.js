const request = require('request');
import moment from 'moment'
import * as Bluebird from 'bluebird';

const APIURL = 'https://api.iglive.err4o4.com/';

export async function getNotifications() {
  return new Promise(async (resolve, reject) => {
    request(APIURL + 'notifications?valid_until_gte='+moment().format('YYYY-MM-DD')+'&_sort=created_at:DESC', { json: true }, function (error, response, body) {
      if(error) {
        reject({ errorType: 'Unknown', error: error })
      }
      if(response.statusCode == 200){
        const oldNotifications = JSON.parse(localStorage.getItem('readNotifications'));
        if(oldNotifications) {
          const readIDs = JSON.parse(localStorage.getItem('readNotifications')).id
          var newNotifications = body.filter(function(item){
            return readIDs.indexOf(item.id) === -1;
          });
          resolve(newNotifications)
        } else {
          localStorage.setItem('readNotifications', JSON.stringify({id: []}))
          resolve(body)
        }
      } else {
        reject({ errorType: 'codeNotFound', error: '404 Not Found' })
      }
    });
  });
}
