import React from 'react';
import { Button } from 'reactstrap';
import { IgEndStream } from '../../api/Instagram';

import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';


export class Live extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      componentState: '',
      message : { title: 'Creating live stream', body: 'Please wait a bit.' }
    };

    this.EndStream = this.EndStream.bind(this);
  }

  EndStream() {
    this.setState({ componentState: 'loading', message : { title: 'Ending stream', body: 'Please wait a bit.' } });
    IgEndStream()
      .then(() => {
        this.props.callback();
      })
      .catch(error => {
        this.setState({ componentState: 'error', message : { title: 'Unable to stop steam', body: 'Please relogin.' } });
        console.error(error);
      });
  }

  render() {
    if (this.state.componentState == 'loading') {
      return <Loading message={this.state.message} />;
    } else if (this.state.componentState == 'error') {
      return <Error callback={this.props.callback} message={this.state.message} />;
    }
    return (
      <div>
        <h1>Yo! You are live now!</h1>
        <p>
          To stop streaming simply stop stream in your app then press "end stream" here.
        </p>
        <Button
          className="pct-btn"
          outline
          color="primary"
          onClick={this.EndStream}
        >
          end stream
        </Button>
      </div>
    );
  }
}
