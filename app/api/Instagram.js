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
let CommentsAll = [];
let LastCommentTs = 0;
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

export async function GetComments() {

  //const commentsObj =  JSON.parse('{"comment_likes_enabled":false,"comments":[{"pk":"17859401434871266","user_id":43429131,"text":"Втыолшш","type":0,"created_at":1587408049,"created_at_utc":1587408049,"content_type":"comment","status":"Active","bit_flags":0,"did_report_as_spam":false,"share_enabled":false,"user":{"pk":43429131,"username":"err4o4","full_name":"Ivan Savelyev","is_private":false,"profile_pic_url":"https://scontent-arn2-1.cdninstagram.com/v/t51.2885-19/s150x150/20688031_1947309065522469_2502029736541159424_a.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&_nc_ohc=x1TShI6rlTAAX9K2q9m&oh=ff0a844495049227ed87bcc5e188d775&oe=5EC7A17A","profile_pic_id":"1578004091626412939_43429131","is_verified":false,"live_with_eligibility":"1"}},{"pk":"17912656666423928","user_id":43429131,"text":"Яиуруов","type":0,"created_at":1587408047,"created_at_utc":1587408047,"content_type":"comment","status":"Active","bit_flags":0,"did_report_as_spam":false,"share_enabled":false,"user":{"pk":43429131,"username":"err4o4","full_name":"Ivan Savelyev","is_private":false,"profile_pic_url":"https://scontent-arn2-1.cdninstagram.com/v/t51.2885-19/s150x150/20688031_1947309065522469_2502029736541159424_a.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&_nc_ohc=x1TShI6rlTAAX9K2q9m&oh=ff0a844495049227ed87bcc5e188d775&oe=5EC7A17A","profile_pic_id":"1578004091626412939_43429131","is_verified":false,"live_with_eligibility":"1"}},{"pk":"17858411128880034","user_id":43429131,"text":"Алковововш","type":0,"created_at":1587408045,"created_at_utc":1587408045,"content_type":"comment","status":"Active","bit_flags":0,"did_report_as_spam":false,"share_enabled":false,"user":{"pk":43429131,"username":"err4o4","full_name":"Ivan Savelyev","is_private":false,"profile_pic_url":"https://scontent-arn2-1.cdninstagram.com/v/t51.2885-19/s150x150/20688031_1947309065522469_2502029736541159424_a.jpg?_nc_ht=scontent-arn2-1.cdninstagram.com&_nc_ohc=x1TShI6rlTAAX9K2q9m&oh=ff0a844495049227ed87bcc5e188d775&oe=5EC7A17A","profile_pic_id":"1578004091626412939_43429131","is_verified":false,"live_with_eligibility":"1"}}],"comment_count":3,"caption":null,"caption_is_edited":false,"has_more_comments":false,"has_more_headload_comments":false,"media_header_display":"none","can_view_more_preview_comments":false,"live_seconds_per_comment":2,"is_first_fetch":"True","system_comments":null,"comment_muted":0,"status":"ok"}')


  //let commentsObj =  JSON.parse('{"comment_likes_enabled":false,"comments":[],"comment_count":3,"caption":null,"caption_is_edited":false,"has_more_comments":false,"has_more_headload_comments":false,"media_header_display":"none","can_view_more_preview_comments":false,"live_seconds_per_comment":2,"is_first_fetch":"True","system_comments":null,"comment_muted":0,"status":"ok"}')

  //console.log(BroadcastID, LastCommentTs)
  const commentsObj  = await ig.live.getComment({ broadcastId: BroadcastID, lastCommentTs: LastCommentTs });
  //console.log(JSON.stringify(comments))
  //comments = comments.comments
  //console.log(commentsObj)
  if (commentsObj.comments.length > 0) {
    commentsObj.comments.forEach(comment => {
      add_comment(CommentsAll, comment)
    })
    LastCommentTs = commentsObj.comments[commentsObj.comments.length - 1].created_at;

  }

  CommentsAll.sort(function(a, b) {
    var keyA = new Date(a.created_at),
      keyB = new Date(b.created_at);
    // Compare the 2 dates
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });

  return CommentsAll

}

function add_comment(CommentsAll, comment) {
  const found = CommentsAll.some(el => el.pk === comment.pk);
  if (!found) CommentsAll.push(comment);
}


export async function MuteComments() {
  return new Promise((resolve, reject) => {
    ig.live.muteComment(BroadcastID).then(muted => {
      resolve(muted)
    }).catch(error => {
      log.error("[IgMuteComment]", error.stack);
      reject(error);
    });
  })
}

export async function UnmuteComments() {
  return new Promise((resolve, reject) => {
    ig.live.unmuteComment(BroadcastID).then(unmuted => {
      resolve(unmuted)
    }).catch(error => {
      log.error("[IgUnMuteComment]", error.stack);
      reject(error);
    });
  })
}

export async function HeartbeatAndGetViewerCount() {

  //return { viewer_count: 10, total_unique_viewer_count: 13}

  return new Promise((resolve, reject) => {
    ig.live.heartbeatAndGetViewerCount(BroadcastID).then(hbvc => {
      console.log(hbvc)
      resolve({ viewer_count: hbvc.viewer_count, total_unique_viewer_count: hbvc.total_unique_viewer_count})
    }).catch(error => {
      log.error("[IgHackeartbeatAndGetViewerCount]", error.stack);
      reject(error);
    });
  })

}

export async function Comment(message) {

  //return { viewer_count: 10, total_unique_viewer_count: 13}

  return new Promise((resolve, reject) => {
    ig.live.comment(BroadcastID, message).then(res => {
      console.log(res)

      add_comment(CommentsAll, res.comment)
      resolve(res)
    }).catch(error => {
      log.error("[IgComment]", error.stack);
      reject(error);
    });
  })

}
