import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import { Setup } from '../setup/Setup';
import { Live } from '../live/Live';
import { Login } from '../login/Login';
import { Dashboard } from '../dashboard/Dashboard';
import { Notifications } from '../helpers/Notifications';

import { getNotifications } from '../../api/Notifications';
import { checkCode } from '../../api/Invite';
import { IgRestoreSession } from '../../api/Instagram';

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

    getNotifications().then(data => {
      console.log(data)
      if(data.length > 0){
        this.setState({ componentState: 'notifications',
                        prevComponentState: this.state.componentState,
                        notifications : data
                      });
      }
    })

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

  closeNotifications() {
    this.setState({ componentState: this.state.prevComponentState });
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
                logout={this.logOut}
              />
            ) : null}
            {this.state.componentState == "live" ? <Live callback={this.streamEnd} /> : null}
            {this.state.componentState == "notifications" ? <Notifications notifications={this.state.notifications} callback={this.closeNotifications} /> : null}

          </Col>
        </Row>
    );
  }
}
