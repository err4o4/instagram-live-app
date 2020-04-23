import React from 'react';
import { Button } from 'reactstrap';
import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

import { IgCreateStream } from '../../api/Instagram';

const Store = require('electron-store');
const store = new Store();

export class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentState: '',
      message : { title: 'Creating live stream', body: 'Please wait a bit.' }
    };
    this.CreateStream = this.CreateStream.bind(this);
    this.LogOut = this.LogOut.bind(this);
  }

  CreateStream() {
    this.setState({ componentState: 'loading', message : { title: 'Creating live stream', body: 'Please wait a bit.' } });
    IgCreateStream()
      .then(stream => {
        this.setState({ componentState: '' });
        this.props.callback(stream);
      })
      .catch(error => {
        console.log(error);
        store.delete('stream');
        store.delete('isLive');
        this.setState({ componentState: 'error', message : { title: "Unable to create stream", body: 'Please relogin and try again.' } });
      });
  }

  LogOut() {
    store.delete('session');
    store.delete('username');
    store.delete('invite');
    store.delete('readNotifications');
    this.props.logout();
  }

  render() {
    if (this.state.componentState == 'loading') {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == 'error') {
      return <Error callback={this.LogOut} message={this.state.message} />;
    }
    return (
      <div className="full-height dashboard" >
        <h1>Welcome back, {store.get('username')}</h1>
        <p>
          To go live you have to prepare streaming app. Set OBS,
          Wirecast, etc. output parameters to 1080x1920 (9:16), prepare scenes and you are ready to go!
        </p>
        <button
          className="pct-btn"
          onClick={this.CreateStream}
        >
          create stream
        </button>

        <p>
          Remember your invite code if you logout. You will need it to login back.
        </p>

        <div className="bottom">
          <p>Email <a href="mailto:live@bad.family">live@bad.family</a> if you find bugs.</p>
        </div>

        <button
          className="pct-btn"
          onClick={this.LogOut}
        >
          logout
        </button>
      </div>
    );
  }
}
