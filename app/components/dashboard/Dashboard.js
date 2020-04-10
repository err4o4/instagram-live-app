import React from 'react';
import { Button } from 'reactstrap';
import { Loading } from '../helpers/Loading';

import { IgCreateStream } from '../../api/Instagram';

export class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showLoading: false, message: '' };
    this.CreateStream = this.CreateStream.bind(this);
    this.LogOut = this.LogOut.bind(this);
  }

  CreateStream() {
    this.setState({ showLoading: true, message: 'Creating live stream' });
    IgCreateStream()
      .then(stream => {
        this.setState({ showLoading: false });
        this.props.callback(stream);
      })
      .catch(error => {
        console.log(error);
      });
  }

  LogOut() {
    localStorage.removeItem('session');
    localStorage.removeItem('username');
    localStorage.removeItem('invite');
    this.props.logout();
  }

  render() {
    if (this.state.showLoading) {
      return <Loading message={this.state.message} />;
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
