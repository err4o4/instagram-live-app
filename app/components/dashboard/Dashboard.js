import React from 'react';
import { Button } from 'reactstrap';
import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

import { IgCreateStream } from '../../api/Instagram';

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
        this.setState({ componentState: 'error', message : { title: "Unable to create stream", body: 'Please relogin and try again.' } });
      });
  }

  LogOut() {
    localStorage.removeItem('session');
    localStorage.removeItem('username');
    localStorage.removeItem('invite');
    localStorage.removeItem('readNotifications');
    this.props.logout();
  }

  render() {
    if (this.state.componentState == 'loading') {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == 'error') {
      return <Error callback={this.LogOut} message={this.state.message} />;
    }
    return (
      <div>
        <h1>Welcome back, {this.props.username}</h1>
        <p>
          To go live you have to prepare streaming app. Set OBS,
          Wirecast, etc. output parameters to 1080x1920 (9:16), prepare scenes and press
          "create stream". Tutorial links here.
        </p>
        <Button
          className="pct-btn"
          outline
          color="primary"
          onClick={this.CreateStream}
        >
          create stream
        </Button>

        <p>
          This app will be free of charge on period of quarantine.
        </p>

        <div className="bottom">
          <p>Email <a href="mailto:me@err4o4.com">hello@err4o4.com</a> if you find bugs.</p>
        </div>

        <Button
          className="pct-btn"
          outline
          color="primary"
          onClick={this.LogOut}
        >
          logout
        </Button>
      </div>
    );
  }
}
