import {
  IgApiClient,
  IgCheckpointError,
  IgLoginBadPasswordError,
  IgLoginInvalidUserError,
  IgLoginTwoFactorRequiredError
} from 'instagram-private-api';
import { activateCode } from './Invite'
import { createSession, updateSession } from './Session'
import { log } from '../utils/logger.js';


const Store = require('electron-store');
const store = new Store();


import * as Bluebird from 'bluebird';
// import inquirer from 'inquirer'
const ig = new IgApiClient();
let BroadcastID = '';
let TwoFactorInfo = {};

function IgSaveSession() {
  return new Promise(async (resolve) => {
    const session = await ig.state.serializeCookieJar();
    await store.set('session', JSON.stringify(session));
    log.info('[IgSaveSession]: ok');
    resolve();
  });
}

export async function IgRestoreSession() {
  return new Promise(async (resolve, reject) => {
    const session = await store.get('session');
    const sessionParsed = JSON.parse(session);
    if (session) {
      if (new Date() < new Date(sessionParsed.cookies[0].expires)) {
        await ig.state.generateDevice(
          store.get(sessionParsed.cookies[3].value)
        );
        await ig.state.deserializeCookieJar(JSON.parse(session));
        const stream = store.get('stream')
        if(stream) {
          BroadcastID = JSON.parse(stream).broadcast_id
        }
        log.info('[IgRestoreSession]: ok');
        resolve(session);
      } else {
        log.error("[IgRestoreSession]: session can't be restored (1)");
        reject("session can't be restored");
      }
    } else {
      log.error("[IgRestoreSession]: session can't be restored (2)");
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
      log.info("[IgCheckPoint] ok");
      resolve(user);
    }).catch(error => {
      console.error(error);
      log.error("[IgCheckPoint]", error.stack);
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
        log.info("[TwoFactorInfo] ok");
        resolve(user);
    }).catch(IgCheckpointError, async err => {
        await ig.challenge.auto(false); // Requesting sms-code or click "It was me" button
        log.warn("[TwoFactorInfo]: (IgCheckPoint needed) " + err);
        reject({ errorType: 'IgCheckpointError', error: err});
    }).catch(err => {
        console.error(err);
        log.error("[TwoFactorInfo]", err.stack);
        reject({ errorType: 'Unknown', error: err})
    });
  });
}

export async function IgLogin(username, password) {
  return new Promise(async (resolve, reject) => {
    store.set('username', username)
    log.transports.remote.client.user.username = username;
    ig.state.generateDevice(username);
    Bluebird.try(async () => {
      const user = await ig.account.login(username, password);
      IgSaveSession();
      activateCode();
      log.info("[IgLogin]: ok");
      resolve(user);
    }).catch(IgCheckpointError, async err => {
      await ig.challenge.auto(false); // Requesting sms-code or click "It was me" button
      log.warn("[IgLogin]: (IgCheckPoint needed)", err.stack);
      reject({ errorType: 'IgCheckpointError', error: err});
    }).catch(IgLoginBadPasswordError, async err => {
      log.warn("[IgLogin]: (IgLoginBadPasswordError)", err.stack);
      reject({ errorType: 'IgLoginBadPasswordError', error: err});
    }).catch(IgLoginInvalidUserError, async err => {
      log.warn("[IgLogin]: (IgLoginInvalidUserError)", err.stack);
      reject({ errorType: 'IgLoginInvalidUserError', error: err});
    }).catch(IgLoginTwoFactorRequiredError, async err => {
      TwoFactorInfo = err.response.body.two_factor_info
      log.warn("[IgLogin]: (IgTwoFactor needed)", err.stack);
      reject({ errorType: 'IgLoginTwoFactorRequiredError', error: err});
    }).catch(err => {
      log.error("[IgLogin]", err.stack);
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
        createSession()
        log.info("[IgCreateStream]: ok");
        resolve({
          broadcast_id: stream.broadcast_id,
          upload_url: stream.upload_url
        });
      }).catch(error => {
        log.error("[IgCreateStream]", error.stack);
        reject(error);
      });
  });
}

export async function IgGoLive() {
  return new Promise((resolve, reject) => {
    ig.live.start(BroadcastID).then(startInfo => {
      updateSession('live')
      log.info("[IgGoLive]: ok");
      resolve(startInfo)
    }).catch(error => {
      log.error("[IgGoLive]", error.stack);
      reject(error);
    });
  })
  console.log(startInfo);
}

export async function IgEndStream() {
  return new Promise((resolve, reject) => {
    ig.live.endBroadcast(BroadcastID).then(endInfo => {
      updateSession('end')
      console.log(endInfo)
      log.info("[IgEndStream]: ok");
      resolve(endInfo)
    }).catch(error => {
      log.error("[IgEndStream]", error.stack);
      reject(error);
    });
  })
  console.log('stream end');
}
