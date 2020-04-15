const request = require('request');
import * as Bluebird from 'bluebird';

const Store = require('electron-store');
const store = new Store();

const APIURL = 'https://api.iglive.err4o4.com/';

export async function createSession() {
  return new Promise(async (resolve, reject) => {
    const invite = JSON.parse(store.get('invite'))
    request.post({url:APIURL+'sessions', form: { invite : invite.id, stream_created : new Date() }}, function(error, response, body){
      //console.log(error,response.statusCode,body)
      if(error) {
        reject(error);
      }
      if(response.statusCode == 200){
        //console.log(body)
        store.set('streamSession', body)
        resolve(body)
      } else {
        reject({ errorType: 'notFound', error: '404 Not Found' })
      }
    })
  });
}

export async function updateSession(action) {
  return new Promise(async (resolve, reject) => {
    const streamSession = JSON.parse(store.get('streamSession'))
    console.log(action)
    let form = {}
    if(action == 'live') {
      form = {
        stream_started : new Date()
      }
    }
    if(action == 'end') {
      form = {
        stream_ended : new Date()
      }
    }
    request.put({url:APIURL+'sessions/'+streamSession.id, form: form }, function(error, response, body){
      //console.log(error,response.statusCode,body)
      if(error) {
        reject(error);
      }
      if(response.statusCode == 200){
        //console.log(body)

        if(action == 'end') {
          store.delete('streamSession')
        }
        resolve(body)
      } else {
        reject({ errorType: 'notFound', error: '404 Not Found' })
      }
    })
  });
}
