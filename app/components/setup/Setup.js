import React from 'react';
import { FiClipboard } from 'react-icons/fi';
import { CopyToClipboard } from 'react-copy-to-clipboard';
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
        localStorage.removeItem('stream');
        localStorage.removeItem('isLive');
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
      <div className="setup">
        <h1>Ready to go live?</h1>
        <p>Copy URL and KEY to OBS, Wirecast, etc. and start streaming. Press on field to copy.</p>

        <Form>
          <CopyToClipboard text={this.props.streamUrl}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label className="mr-sm-2">
                stream URL:
              </Label>
              <span className="copy-icon"><FiClipboard /></span>
              <textarea disabled className="txt-small" value={this.props.streamUrl} />
            </FormGroup>
           </CopyToClipboard>
           <CopyToClipboard text={this.props.streamKey}>
            <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
              <Label className="mr-sm-2">
                stream KEY:
              </Label>
              <span className="copy-icon"><FiClipboard /></span>
              <textarea disabled className="txt-big" value={this.props.streamKey}/>
            </FormGroup>
           </CopyToClipboard>
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
