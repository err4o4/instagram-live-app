import React from 'react';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button
} from 'reactstrap';

export class CheckPoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = { code: '' };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({ [nam]: val });
  }

  handleSubmit(event) {
    this.props.callback(this.state.code);
    event.preventDefault();
  }

  render() {
    return (
      <div className="checkPoint">
        <h1>One more step</h1>
        <p>
          To prove that it's you enter security code that Instagram sent you.
        </p>
        <Form>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label for="exampleInvite" className="mr-sm-2">
              security code
            </Label>
            <Input
              className="input"
              type="text"
              placeholder="123 456"
              name="code"
              value={this.state.code}
              onChange={this.handleChange}
            />
          </FormGroup>

          <button
            onClick={this.handleSubmit}
            className="pct-btn"
          >
            next
          </button>
        </Form>
      </div>
    );
  }
}
