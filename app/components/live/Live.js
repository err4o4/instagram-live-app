import React from 'react';
import { Button } from 'reactstrap';
import { IgEndStream } from '../../api/Instagram';

export class Live extends React.Component {
  constructor(props) {
    super(props);

    this.state = { endStream: false };
    this.EndStream = this.EndStream.bind(this);
  }

  EndStream() {
    IgEndStream()
      .then(() => {
        this.props.callback();
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
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
