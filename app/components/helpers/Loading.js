import React from 'react';

export class Loading extends React.Component {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="loading-wrapper">
        <div className="center">
          <h1 className="loading">{this.props.message}</h1>
          <p>please wait a bit.</p>
        </div>
      </div>
    );
  }
}
