import {
  IgApiClient,
  IgCheckpointError,
  IgLoginBadPasswordError,
  IgLoginInvalidUserError,
  IgLoginTwoFactorRequiredError
} from 'instagram-private-api';
import { activateCode } from './Invite'
import * as Bluebird from 'bluebird';
// import inquirer from 'inquirer'
const ig = new IgApiClient();
let BroadcastID = '';
let TwoFactorInfo = {};

function IgSaveSession() {
  return new Promise(async (resolve) => {
    const session = await ig.state.serializeCookieJar();
    await localStorage.setItem('session', JSON.stringify(session));
    console.log('saved session');
    resolve();
  });
}

export async function IgRestoreSession() {
  return new Promise(async (resolve, reject) => {
    const session = await localStorage.getItem('session');
    const sessionParsed = JSON.parse(session);
    if (session) {
      if (new Date() < new Date(sessionParsed.cookies[0].expires)) {
        await ig.state.generateDevice(
          localStorage.getItem(sessionParsed.cookies[3].value)
        );
        await ig.state.deserializeCookieJar(JSON.parse(session));
        const stream = localStorage.getItem('stream')
        if(stream) {
          BroadcastID = JSON.parse(stream).broadcast_id
        }
        resolve(session);
      } else {
        reject("session can't be restored");
      }
    } else {
      reject("session can't be restored");
    }
  });
}

export async function IgCheckPoint(code) {
  return new Promise(async (resolve, reject) => {
    Bluebird.try(async () => {
    const user = ig.challenge.sendSecurityCode(code.replace(' ', ''))
      console.log(user);
      IgSaveSession();
      activateCode();
      resolve(user);
    }).catch(error => {
      console.error(error);
      reject(error)
    });
  });
}

export async function IgTwoFactor(code) {
  return new Promise(async (resolve, reject) => {
    Bluebird.try(async () => {
      const {username, totp_two_factor_on, two_factor_identifier} = TwoFactorInfo;
      const verificationMethod = totp_two_factor_on ? '0' : '1'; // default to 1 for SMS
      const user = await ig.account.twoFactorLogin({
        username,
        verificationCode: code.replace(' ', ''),
        twoFactorIdentifier: two_factor_identifier,
        verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
        trustThisDevice: '1', // Can be omitted as '1' is used by default
      })
    }).then(user => {
        console.log(user)
        IgSaveSession();
        activateCode();
        resolve(user);
    }).catch(IgCheckpointError, async err => {
        await ig.challenge.auto(false); // Requesting sms-code or click "It was me" button
        reject({ errorType: 'IgCheckpointError', error: err});
    }).catch(err => {
        console.error(err);
        reject({ errorType: 'Unknown', error: err})
    });
  });
}

export async function IgLogin(username, password) {
  return new Promise(async (resolve, reject) => {
    localStorage.setItem('username', username)
    ig.state.generateDevice(username);
    Bluebird.try(async () => {
      const user = await ig.account.login(username, password);
      IgSaveSession();
      activateCode();
      resolve(user);
    }).catch(IgCheckpointError, async err => {
      await ig.challenge.auto(false); // Requesting sms-code or click "It was me" button
      reject({ errorType: 'IgCheckpointError', error: err});
    }).catch(IgLoginBadPasswordError, async err => {
      reject({ errorType: 'IgLoginBadPasswordError', error: err});
    }).catch(IgLoginInvalidUserError, async err => {
      reject({ errorType: 'IgLoginInvalidUserError', error: err});
    }).catch(IgLoginTwoFactorRequiredError, async err => {
      TwoFactorInfo = err.response.body.two_factor_info
      reject({ errorType: 'IgLoginTwoFactorRequiredError', error: err});
    }).catch(err => {
      reject({ errorType: 'Unknown', error: err})
    });
  });
}

export async function IgCreateStream() {
  return new Promise(async (resolve, reject) => {
    ig.live
      .create({
        previewWidth: 1080,
        previewHeight: 1920
      }).then(stream => {
        console.log(stream.broadcast_id, stream.upload_url);
        BroadcastID = stream.broadcast_id;
        resolve({
          broadcast_id: stream.broadcast_id,
          upload_url: stream.upload_url
        });
      }).catch(error => {
        reject(error);
      });
  });
}

export async function IgGoLive() {
  return new Promise((resolve, reject) => {
    ig.live.start(BroadcastID).then(startInfo => {
      resolve(startInfo)
    }).catch(error => {
      reject(error);
    });
  })
  console.log(startInfo);
}

export async function IgEndStream() {
  return new Promise((resolve, reject) => {
    ig.live.endBroadcast(BroadcastID).then(endInfo => {
      resolve(endInfo)
    }).catch(error => {
      reject(error);
    });
  })
  console.log('stream end');
}
