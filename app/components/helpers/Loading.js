import React from 'react';

export class Loading extends React.Component {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div className="loading-wrapper">
        <div className="center">
          <h1 className="loading">{this.props.message.title}</h1>
          <p>{this.props.message.body}</p>
        </div>
      </div>
    );
  }
}
