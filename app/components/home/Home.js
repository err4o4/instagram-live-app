import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { MdClose } from 'react-icons/md';
import { AiOutlineLine } from 'react-icons/ai';
import { Setup } from '../setup/Setup';
import { Live } from '../live/Live';
import { Login } from '../login/Login';
import { Dashboard } from '../dashboard/Dashboard';
import { Notifications } from '../helpers/Notifications';
import { Update } from '../helpers/Update';

import { checkVersion } from '../../api/Version';
import { getNotifications } from '../../api/Notifications';
import { checkCode } from '../../api/Invite';
import { IgRestoreSession } from '../../api/Instagram';

const remote = require('electron').remote;

export default class Home extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      componentState: 'dashboard',
      prevComponentState: '',
      loginStage: 'invite',
      username: localStorage.getItem('username'),
      streamUrl: '',
      streamKey: '',
      notifications: []
    };

    this.loggenIn = this.loggenIn.bind(this);
    this.streamCreated = this.streamCreated.bind(this);
    this.live = this.live.bind(this);
    this.streamEnd = this.streamEnd.bind(this);
    this.logOut = this.logOut.bind(this);
    this.closeNotifications = this.closeNotifications.bind(this);
    this.closeApp = this.closeApp.bind(this);
    this.minimizeApp = this.minimizeApp.bind(this);
  }

  componentWillMount() {

    checkVersion().then(version => {
      if(version.length > 0 && version[0].update_required) {
        this.setState({
          componentState: 'update',
          version: version
         });
      }
    })

    const code = JSON.parse(localStorage.getItem('invite'));
    const username = localStorage.getItem('username')
    if (code && username) {
      checkCode(code.code)
        .then(() => {

          if(code.username !== username) {
            localStorage.removeItem('session');
            localStorage.removeItem('username');
            localStorage.removeItem('invite');
            this.setState({ componentState: 'login', loginStage: 'invite' });
          }

          IgRestoreSession()
            .then(invite => {
              // ok
            })
            .catch(error => {
              this.setState({ componentState: 'login', loginStage: 'igLogin' });
              console.error(error);
            });

          // if code ok inst not ok
        })
        .catch(error => {
          console.log(error);
          this.setState({ componentState: 'login', loginStage: 'invite' });
        });
    } else {
      this.setState({ componentState: 'login', loginStage: 'invite' });
    }

    getNotifications().then(data => {
      if(data.length > 0){
        this.setState({ componentState: 'notifications',
                        prevComponentState: this.state.componentState,
                        notifications : data
                      });
      }
    })


    const stream = localStorage.getItem('stream')
    const isLive = localStorage.getItem('isLive')

    if(stream && isLive) {
      this.setState({ componentState: 'live' });
    }
    if(stream && !isLive) {

      this.setState({
        componentState: 'setup',
        streamUrl: JSON.parse(stream).url,
        streamKey: JSON.parse(stream).key,
      });
    }



  }

  loggenIn(username) {
    this.setState({ username : username, componentState: 'dashboard' });
  }

  streamCreated(info) {
    const parts = info.upload_url.split(new RegExp(info.broadcast_id));
    this.setState({
      streamUrl: parts[0],
      streamKey: info.broadcast_id + parts[1],
      componentState: 'setup'
    });
    localStorage.setItem('stream', JSON.stringify({
      broadcast_id: info.broadcast_id,
      url: parts[0],
      key: info.broadcast_id + parts[1],
    }))
  }

  live() {
    localStorage.setItem('isLive', true)
    this.setState({ componentState: 'live' });
  }

  streamEnd() {
    localStorage.removeItem('stream');
    localStorage.removeItem('isLive');
    this.setState({ componentState: 'dashboard' });
  }

  logOut() {
    this.setState({ componentState: 'login' });
  }

  closeNotifications() {
    this.setState({ componentState: this.state.prevComponentState });
  }

  closeApp() {
    const stream = localStorage.getItem('stream')
    if(!stream) {
      var window = remote.getCurrentWindow();
      window.close();
    } else {
      alert('You have to end stream first.')
    }
  }

  minimizeApp() {
    var window = remote.getCurrentWindow();
    window.minimize();
  }

  render() {
    return (
        <Row>
          <Col sm="12">
            <div className="titleBar">
              <span onClick={this.closeApp}><MdClose /></span>
              <span onClick={this.minimizeApp}><AiOutlineLine /></span>
            </div>
            {this.state.componentState == "login" ? (
              <Login
                callback={this.loggenIn}
                loginStage={this.state.loginStage}
              />
            ) : null}
            {this.state.componentState == "dashboard" ? (
              <Dashboard
                username={this.state.username}
                callback={this.streamCreated}
                logout={this.logOut}
              />
            ) : null}
            {this.state.componentState == "setup" ? (
              <Setup
                streamUrl={this.state.streamUrl}
                streamKey={this.state.streamKey}
                callback={this.live}
                logout={this.logOut}
              />
            ) : null}
            {this.state.componentState == "live" ? <Live callback={this.streamEnd} /> : null}
            {this.state.componentState == "notifications" ? <Notifications notifications={this.state.notifications} callback={this.closeNotifications} /> : null}
            {this.state.componentState == "update" ? <Update version={this.state.version} /> : null}
          </Col>
        </Row>
    );
  }
}
