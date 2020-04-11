import React from 'react';
import { Button, Input, Label, Form, FormGroup } from 'reactstrap';
import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

import { IgGoLive } from '../../api/Instagram';

export class Setup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentState: '',
      message : { title: 'Creating live stream', body: 'Please wait a bit.' }
    };
    this.GoLive = this.GoLive.bind(this);
    this.LogOut = this.LogOut.bind(this);
  }

  GoLive() {
    this.setState({ componentState: 'loading', message : { title: 'Going live', body: 'Please wait a bit.' } });
    IgGoLive()
      .then(() => {
        this.setState({ componentState: '' });
        this.props.callback();
      }).catch(error => {
        this.setState({ componentState: 'error', message : { title: 'Unable to go live', body: 'Please relogin and try again.' } });
        console.log(error);
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
        <h1>Ready to go live?</h1>
        <p>Copy URL and KEY to OBS, Wirecast, etc. and start streaming.</p>

        <Form>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2">
              stream URL:
            </Label>
            <textarea disabled className="txt-small" value={this.props.streamUrl} />
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2">
              stream KEY:
            </Label>
            <textarea disabled className="txt-big" value={this.props.streamKey}/>
          </FormGroup>
          <Button
            className="pct-btn"
            outline
            color="primary"
            onClick={this.GoLive}
          >
            go live
          </Button>
        </Form>

      </div>
    );
  }
}
