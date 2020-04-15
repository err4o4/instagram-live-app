import React from 'react';
import { Button } from 'reactstrap';
import { IgEndStream } from '../../api/Instagram';

import { Loading } from '../helpers/Loading';
import { Error } from '../helpers/Error';

const Store = require('electron-store');
const store = new Store();

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
        store.delete('stream');
        store.delete('isLive');
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
        <p> You can go live only for 1 hour due to Instagram policies. If you need more than 1 hour just stop this stream and go live again.</p>
        <p> To stop streaming <b>stop stream in your app then end stream here.</b> </p>
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
