import React from 'react';
import { Button } from 'reactstrap';

export class Error extends React.Component {
  constructor(props) {
    super(props);
  }



  render() {
    return (
        <div className="loading-wrapper">
          <div className="center">
            <h1>{this.props.message}</h1>
            <p>please try again.</p>

            <Button
              outline
              color="primary"
              onClick={this.props.callback}
              className="pct-btn"
            >
              back
            </Button>
          </div>
        </div>
    );
  }
}
