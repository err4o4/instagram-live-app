const request = require('request');
import moment from 'moment'
import * as Bluebird from 'bluebird';

const APIURL = 'http://134.209.238.226:1339/';

function setReadNotifications(notifications) {
  return new Promise(async (resolve) => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    resolve();
  });
}

//getNotifications()

export async function getNotifications() {
  return new Promise(async (resolve, reject) => {
    request(APIURL + 'notifications?valid_until_gte='+moment().format('YYYY-MM-DD'), { json: true }, function (error, response, body) {
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
          //console.log(newNotifications)
          resolve(newNotifications)
        } else {
          localStorage.setItem('readNotifications', JSON.stringify({id: []}))
          resolve(body)
        }
        //setReadNotifications(body)
      } else {
        reject({ errorType: 'codeNotFound', error: '404 Not Found' })
      }
    });
  });
}
