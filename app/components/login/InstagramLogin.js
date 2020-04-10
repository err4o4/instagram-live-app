import React from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';
import { CheckPoint } from './CheckPoint'
import { TwoFactor } from './TwoFactor'
import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';
import { IgLogin, IgTwoFactor, IgCheckPoint } from '../../api/Instagram';

export class InstagramLogin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      disabled: false,
      password: '',
      autoFocus: 'username',
      message: 'Working',
      componentState: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.twoFactor = this.twoFactor.bind(this);
    this.checkPoint = this.checkPoint.bind(this);
    this.errorCallback = this.errorCallback.bind(this);
  }

  componentWillMount() {
    const invite = JSON.parse(localStorage.getItem('invite'))
    console.log(invite)
    if(invite.username && invite.username.length > 0) {
      this.setState({ username: invite.username, disabled: true, autoFocus: 'password' });
    }
  }

  handleChange(event) {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({ [nam]: val });
  }

  handleSubmit(event) {
    this.setState({ componentState: 'loading', message: 'Logging you in' });
    IgLogin(this.state.username, this.state.password)
      .then(user => {
        localStorage.setItem('username', user.username);
        this.setState({ componentState: '' });
        this.props.callback(user.username);
      }).catch(error => {
        this.setState({ componentState: '' });
        if(error.errorType == 'IgLoginTwoFactorRequiredError') {
          this.setState({ componentState: 'twoFactor' });
        } else if(error.errorType == 'IgCheckpointError') {
          this.setState({ componentState: 'checkPoint' });
        } else if(error.errorType == 'IgLoginBadPasswordError') {
          this.setState({ componentState: 'error', message: 'Invalid password.' });
        } else if(error.errorType == 'IgLoginInvalidUserError') {
          this.setState({ componentState: 'error', message: 'Invalid username.' });
        } else if (error.errorType == 'Unknown') {
          this.setState({ componentState: 'error', message: 'Unknown error :(' });
        }
      });
  }

  twoFactor(code) {
    this.setState({ componentState: 'loading', message: 'Checking code'  });
    IgTwoFactor(code).then(user => {
      //localStorage.setItem('username', user.username);
      this.setState({ componentState: '' });
      this.props.callback(user.username);
    }).catch(error => {
      console.error(error);
      if(error.errorType == 'IgCheckpointError') {
        this.setState({ componentState: 'checkPoint' });
      } else if (error.errorType == 'Unknown') {
        this.setState({ componentState: 'error', message: 'Unknown error :(' });
      }
    })
  }

  checkPoint(code) {
    this.setState({ componentState: 'loading', message: 'Checking code' });
    IgCheckPoint(code).then(user => {
      //localStorage.setItem('username', user.username);
      this.setState({ componentState: '' });
      this.props.callback(user.username);
    }).catch(error => {
      this.setState({ componentState: 'error', message: 'Invalid security code.' });
      console.error(error);
    })
  }

  errorCallback() {
    this.setState({ componentState: '' });
  }

  render() {
    if (this.state.componentState == "loading") {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == "checkPoint") {
      return <CheckPoint callback={this.checkPoint} />;
    } else if (this.state.componentState == "twoFactor") {
      return <TwoFactor callback={this.twoFactor} />;
    } else if (this.state.componentState == "error") {
      return <Error message={this.state.message} callback={this.errorCallback} />;
    }
    return (
      <div>
        <h1>Hello!</h1>
        <p>
          Now you can login with your Instagram account. We don't store your
          password.
        </p>
        <Form className="loginForm" onSubmit={this.handleSubmit}>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label for="exampleEmail" className="mr-sm-2">
              username
            </Label>
            <Input
              autoFocus={this.state.autoFocus == "username" ? true : false}
              disabled={this.state.disabled}
              className="input"
              type="text"
              placeholder=""
              name="username"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label for="examplePassword" className="mr-sm-2">
              password
            </Label>
            <Input
              autoFocus={this.state.autoFocus == "password" ? true : false}
              className="input"
              type="password"
              placeholder=""
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
            />
          </FormGroup>
          <Button
            outline
            color="primary"
            onClick={this.handleSubmit}
            className="pct-btn"
            type="submit" >
            sign in
          </Button>
        </Form>
      </div>
    );
  }
}
