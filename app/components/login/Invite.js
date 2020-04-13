import React from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import { Error } from '../helpers/Error';
import { Loading } from '../helpers/Loading';
import { checkCode } from '../../api/Invite';

export class Invite extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invite: '',
      componentState: '',
      message: { title: '', body: '' }
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
  }

  handleChange(event) {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({ [nam]: val });
  }

  handleSubmit(event) {
    this.setState({ componentState: 'loading', message : { title: 'Checking code', body: 'Please wait a bit.' } });
    checkCode(this.state.invite).then(invite => {
        this.props.callback(invite);
      }).catch(error => {
        //alert('Invalid invite code. Please check your code and try again.');
        this.setState({ componentState: 'error', message : { title: 'Invalid invite code', body: 'Please check invite code and try again.' } });
      });
    event.preventDefault();
  }

  errorCallback() {
    this.setState({ componentState: '' });
  }

  render() {
    if(this.state.componentState == "loading") {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == "error") {
      return <Error message={this.state.message} callback={this.errorCallback} />;
    }
    return (
      <div>
        <h1>Hello!</h1>
        <p>
          Welcome to Instagram Live. This app allows you to go live on Instagram from any device.
        </p>
        <p>
          App is currently in beta. It will be publicly available soon.
        </p>
        <p>
          If you don't have invite code email us on live@bad.family or @err4o4 on Telegram to get it :)
        </p>
        <Form onSubmit={this.handleSubmit}>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label for="exampleInvite" className="mr-sm-2">
              invite code
            </Label>
            <Input
              autoFocus
              className="input inviteCode"
              maxLength="5"
              minLength="5"
              type="text"
              placeholder="XXXXX"
              name="invite"
              value={this.state.invite}
              onChange={this.handleChange}
            />
          </FormGroup>
          <Button
            outline
            color="primary"
            onClick={this.handleSubmit}
            className="pct-btn"
            type="submit">
            let's go
          </Button>
        </Form>
      </div>
    );
  }
}
