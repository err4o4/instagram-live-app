const request = require('request');
import * as Bluebird from 'bluebird';

const APIURL = 'https://api.iglive.err4o4.com/';
const CurrentVer = '1.0.0';

export async function checkVersion() {
  return new Promise(async (resolve, reject) => {
    request(APIURL + 'versions?version_gt='+CurrentVer+'&_limit=1&_sort=version:DESC', { json: true }, function (error, response, body) {
      if(error) {
        reject({ errorType: 'Unknown', error: error })
      }
      if(response.statusCode == 200){
        //console.log(body)
        resolve(body)
      } else {
        reject({ errorType: 'notFound', error: '404 Not Found' })
      }
    });
  });
}
