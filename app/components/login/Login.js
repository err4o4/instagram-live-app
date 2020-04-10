import React from 'react';
import { InstagramLogin } from './InstagramLogin';
import { Invite } from './Invite';

export class Login extends React.Component {
  constructor(props: Props) {
    super(props);

    this.state = { componentState: '' };

    this.haveInvite = this.haveInvite.bind(this);
    this.IGLoggenIn = this.IGLoggenIn.bind(this);
  }

  haveInvite(invite) {
    this.setState({ componentState: 'igLogin' });
  }

  IGLoggenIn(username) {
    this.props.callback(username);
  }

  componentWillMount() {
    this.setState({ componentState: this.props.loginStage });
  }

  render() {
    return (
      <div>
        {this.state.componentState == "invite" ? ( <Invite callback={this.haveInvite} /> ) : null}
        {this.state.componentState == "igLogin" ? ( <InstagramLogin callback={this.IGLoggenIn} /> ) : null}
      </div>
    );
  }
}
