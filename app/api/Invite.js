const request = require('request');
import * as Bluebird from 'bluebird';

const APIURL = 'https://api.iglive.err4o4.com/';

const Store = require('electron-store');
const store = new Store();

function updateInvite(invite) {
  return new Promise(async (resolve) => {
    store.set('invite', JSON.stringify(invite));
    resolve();
  });
}

export async function checkCode(code) {
  return new Promise(async (resolve, reject) => {
    request(APIURL + 'invites/check/' + code.toUpperCase(), { json: true }, function (error, response, body) {
      if(error) {
        reject({ errorType: 'Unknown', error: error })
      }
      if(response.statusCode == 200){
        updateInvite(body)
        resolve(body)
      } else {
        reject({ errorType: 'codeNotFound', error: '404 Not Found' })
      }
    });
  });
}

export async function activateCode() {
  return new Promise(async (resolve, reject) => {
    const code = JSON.parse(store.get('invite')).code
    const username = store.get('username')
    request.post({url:APIURL+'invites/activate', form: {code:code, username:username}}, function(error, response, body){
      //console.log(error,response.statusCode,body)
      if(error) {
        reject(error);
      }
      if(response.statusCode == 200){
        resolve(body)
      } else {
        reject({ errorType: 'codeNotFound', error: '404 Not Found' })
      }
    })
  });
}
