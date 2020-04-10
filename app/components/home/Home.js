import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Setup } from '../setup/Setup';
import { Live } from '../live/Live';
import { Login } from '../login/Login';
import { Dashboard } from '../dashboard/Dashboard';

import { checkCode } from '../../api/Invite';
import { IgRestoreSession } from '../../api/Instagram';

const lol = 0;

export default class Home extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      componentState: 'dashboard',
      loginStage: 'invite',
      username: localStorage.getItem('username'),
      streamUrl: 'rtmps://live-upload.instagram.com:443/rtmp/',
      streamKey: '17991083032295132?s_efg=eyJxZV9ncm91cHMiOnsiaWdfbGl2ZV9lbmFibGVfcG9wX3ByaW1pbmciOnsiZW5hYmxlZCI6InRydWUifSwiaWdfbGl2ZV9ub3RpZmljYXRpb25zX2FmdGVyX2ZpcnN0X21wZF91bml2ZXJzZSI6W10sImlnX2xpdmVfdXNlX2ZpcmVmbHlfZW5jb2RpbmciOltdLCJpZ19sb3dfbGF0ZW5jeV9wcm9kdWN0aW9uX3VuaXZlcnNlIjp7ImVuYWJsZWQiOiJ0cnVlIn19fQ%3D%3D&s_sw=0&s_vt=ig&a=AbyK_QfCml88-wa5'
    };

    this.loggenIn = this.loggenIn.bind(this);
    this.streamCreated = this.streamCreated.bind(this);
    this.live = this.live.bind(this);
    this.streamEnd = this.streamEnd.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  componentWillMount() {
    /*
    0. show loading screen
    1. check invite from localStorage and update exp date
    2. check exp instagram login from localStorage (if ok -> restore session)
    3. if one or both checks failed pass status as var to Login (login will accept and show desired screen (iglogin or invitelogin))
    4. logincheck = ok, invitecheck = ok as vars to login
    */

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
  }

  live() {
    this.setState({ componentState: 'live' });
  }

  streamEnd() {
    this.setState({ componentState: 'dashboard' });
  }

  logOut() {
    this.setState({ componentState: 'login' });
  }

  render() {
    return (
        <Row>
          <Col sm="12">
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
              />
            ) : null}
            {this.state.componentState == "live" ? <Live callback={this.streamEnd} /> : null}
          </Col>
        </Row>
    );
  }
}
