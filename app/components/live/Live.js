import React from 'react';
import { Button, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { FaEye, FaClock, FaStop, FaCommentSlash, FaTelegramPlane } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';

import { IgEndStream, GetComments, MuteComments, UnmuteComments, HeartbeatAndGetViewerCount, Comment } from '../../api/Instagram';

import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

const Store = require('electron-store');
const store = new Store();

export class Live extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentState: '',
      message : { title: '', body: '' },
      timeleft: 59,
      tileLeftUpdater: '',
      comments: [],
      commentsUpdater: '',
      commentsMuted: false,
      hbvc: { viewer_count: 0, total_unique_viewer_count: 0},
      hbvcUpdater: '',
      userComment: ''
    };

    this.EndStream = this.EndStream.bind(this);
    this.TimeLeft = this.TimeLeft.bind(this);
    this.UpdateComments = this.UpdateComments.bind(this);
    this.MuteCommentsBtn = this.MuteCommentsBtn.bind(this);
    this.UpdateHBVC = this.UpdateHBVC.bind(this);
    this.AbbrNum = this.AbbrNum.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.SendComment = this.SendComment.bind(this);
  }

  componentWillMount() {
    if(store.has('timeLeft')) {
      this.setState({ timeleft: store.get('timeLeft') });
    }

    var tileLeftUpdater = setInterval(this.TimeLeft, 1000 * 60);
    var commentsUpdater = setInterval(this.UpdateComments, 1000 * (Math.floor(Math.random() * (7 - 3 + 1)) + 3));
    var hbvcUpdater = setInterval(this.UpdateHBVC, 1000 * (Math.floor(Math.random() * (10 - 5 + 1)) + 5));
    this.setState({tileLeftUpdater: tileLeftUpdater, commentsUpdater: commentsUpdater, hbvcUpdater: hbvcUpdater});
  }

  TimeLeft() {
   // setState method is used to update the state

   if(this.state.timeleft != 0) {
     this.setState({ timeleft: this.state.timeleft -1 });
     store.set('timeLeft', this.state.timeleft)
     console.log(this.state.timeleft)
   } else {
     if(!document.hasFocus()) {
       let streamEndNotification = new Notification('Instagram Live', {
         body: 'Stream ended after 1 hour'
       })
     }
     this.EndStream()
   }

   if(this.state.timeleft == 10){
     let timeLeftNotification = new Notification('Instagram Live', {
       body: 'Your stream will end in 10 minutes'
     })
   }

 }

  EndStream() {
    store.delete('timeLeft')
    clearInterval(this.state.tileLeftUpdater);
    clearInterval(this.state.commentsUpdater);
    clearInterval(this.state.hbvcUpdater);
    this.setState({ componentState: 'loading', message : { title: 'Ending stream', body: 'Please wait a bit.' } });
    IgEndStream()
      .then(() => {
        this.props.callback();
      })
      .catch(error => {
        store.delete('stream');
        store.delete('isLive');
        this.setState({ componentState: 'error', message : { title: 'Unable to stop steam', body: 'Please relogin.' } });
        console.error(error);
      });
  }

  UpdateComments() {
    if(store.has('isLive') && !this.state.commentsMuted){
      GetComments().then(comments => {
        //console.log(comments)
        if(comments.length > 0) {
          this.setState({comments: comments});
        }
        //console.log(this.state.comments)
      })
    } else {
      console.log('not live or commentsMuted')
    }
  }

  MuteCommentsBtn() {
    if(this.state.commentsMuted == true) {
      UnmuteComments().then(status => {
        this.setState({commentsMuted: false});
        console.log('unmuted' + status)
      })
    } else {
      MuteComments().then(status => {
        this.setState({commentsMuted: true});
        console.log('muted' + status)
      })
    }
  }

  UpdateHBVC() {
    if(store.has('isLive')){
      HeartbeatAndGetViewerCount().then(hbvc => {
        this.setState({hbvc: { viewer_count: hbvc.viewer_count, total_unique_viewer_count: hbvc.total_unique_viewer_count} });
      })
    }
  }

  AbbrNum(number, decPlaces) {
    decPlaces = Math.pow(10,decPlaces);
    var abbrev = [ "k", "m", "b", "t" ];
    for (var i=abbrev.length-1; i>=0; i--) {
        var size = Math.pow(10,(i+1)*3);
        if(size <= number) {
             number = Math.round(number*decPlaces/size)/decPlaces;
             if((number == 1000) && (i < abbrev.length - 1)) {
                 number = 1;
                 i++;
             }
             number += abbrev[i];
             break;
        }
    }
    return number;
}

  handleChange(event) {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({ [nam]: val });
  }

  SendComment(event) {
    //console.log(this.state.userComment)
    if(!this.state.commentsMuted) {
      this.setState({ userComment: '' });
      Comment(this.state.userComment);
      event.preventDefault();
    }
  }

  render() {
    if (this.state.componentState == 'loading') {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == 'error') {
      return <Error callback={this.props.callback} message={this.state.message} />;
    }
    return (
      <div className="full-height live" onClick={this.UpdateHBVC}>

        <div className={this.state.comments.length == 0 ? 'no-comments' : 'hidden'}>
          live will end automaticaly after 1 hour
        </div>

        <div className="controll-btns">
          <button className={this.state.commentsMuted ? 'pct-btn active' : 'pct-btn'} onClick={this.MuteCommentsBtn}>
            <FaCommentSlash/>
          </button>
          <div className="live-indicator-container">
          <div className="live-indicator">
            <span className="time-left"><FaClock/> <b>0:{this.state.timeleft}</b></span>
            <span className="viewer-count"><FaEye size={20}/> <b>{this.AbbrNum(this.state.hbvc.viewer_count,1)}</b></span>
          </div>
          </div>
          <button className="pct-btn" onClick={this.EndStream} >
            <FaStop/>
          </button>
        </div>

        <div className="bottom">
          <div className="comments">

            { this.state.comments.map((comment, key) =>
              <div key={comment.pk} className="comment">
                <b>{comment.user.username}: </b> {comment.text}
              </div>
             )}

          </div>
          <Form onSubmit={this.SendComment}>
            <InputGroup className="send-comment input">
              <Input autoFocus disabled={this.state.commentsMuted} name="userComment" value={this.state.userComment} onChange={this.handleChange} placeholder={this.state.commentsMuted ? 'comments disabled' : 'comment'} />
              <InputGroupAddon addonType="append">
                <InputGroupText onClick={this.SendComment} className="input-btn">{this.state.commentsMuted ? '' : <MdSend/>}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>
        </div>
      </div>
    );
  }
}

//


//<InputGroupAddon addonType="append">
//  <InputGroupText className="send-comment-btn"><MdSend/></InputGroupText>
//</InputGroupAddon>
