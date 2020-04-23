import React from 'react';
import { FiClipboard } from 'react-icons/fi';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Input, InputGroup, InputGroupAddon, InputGroupText, Label, Form, FormGroup } from 'reactstrap';
import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

import { IgGoLive } from '../../api/Instagram';

export class Setup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentState: '',
      message : { title: '', body: '' },
      copyStatus: { key: false, url: false }
    };
    this.GoLive = this.GoLive.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.URLCopied = this.URLCopied.bind(this);
    this.KEYCopied = this.KEYCopied.bind(this);
  }

  GoLive() {
    this.setState({ componentState: 'loading', message : { title: 'Going live', body: 'Please wait a bit.' } });
    IgGoLive()
      .then(() => {
        this.setState({ componentState: '' });
        this.props.callback();
      }).catch(error => {
        store.delete('stream');
        store.delete('isLive');
        this.setState({ componentState: 'error', message : { title: 'Unable to go live', body: 'Please relogin and try again.' } });
        console.log(error);
      });
  }

  LogOut() {
    store.delete('session');
    store.delete('username');
    store.delete('invite');
    store.delete('readNotifications');
    this.props.logout();
  }

  URLCopied() {
    this.setState({ copyStatus: { url: true, key: this.state.copyStatus.key } });
  }

  KEYCopied() {
    this.setState({ copyStatus: { key: true, url: this.state.copyStatus.url } });
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
        <p>Copy URL and KEY to OBS, Wirecast, etc. and start streaming.</p>

        <Form>
          <CopyToClipboard text={this.props.streamUrl}>
            <FormGroup onClick={this.URLCopied} className="mb-2 mr-sm-2 mb-sm-0">
              <Label className="mr-sm-2">
                stream URL:
              </Label>
              <span className="copied-text">{this.state.copyStatus.url ? 'copied to clipboard' : ''}</span>
              <InputGroup className="input">
                <Input disabled value={this.props.streamUrl} className={this.state.copyStatus.url ? 'copied' : ''}/>
                <InputGroupAddon addonType="append">
                  <InputGroupText className="input-btn"><FiClipboard className={this.state.copyStatus.url ? 'copied' : ''}/></InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
           </CopyToClipboard>
           <CopyToClipboard text={this.props.streamKey}>
            <FormGroup onClick={this.KEYCopied} className="mb-2 mr-sm-2 mb-sm-0">
              <Label className="mr-sm-2">
                stream KEY:
              </Label>
              <span className="copied-text">{this.state.copyStatus.key ? 'copied to clipboard' : ''}</span>
              <InputGroup className="input">
                <Input disabled value={this.props.streamKey} type="password" className={this.state.copyStatus.key ? 'copied' : ''}/>
                <InputGroupAddon addonType="append">
                  <InputGroupText className="input-btn"><FiClipboard className={this.state.copyStatus.key ? 'copied' : ''}/></InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
           </CopyToClipboard>
          <button
            className="pct-btn"
            onClick={this.GoLive}
          >
            go live
          </button>
        </Form>

      </div>
    );
  }
}
