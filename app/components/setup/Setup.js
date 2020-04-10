import React from 'react';
import { Button, Input, Label, Form, FormGroup } from 'reactstrap';
import { IgGoLive } from '../../api/Instagram';

export class Setup extends React.Component {
  constructor(props) {
    super(props);
    this.GoLive = this.GoLive.bind(this);
  }

  GoLive() {
    IgGoLive()
      .then(() => {
        this.props.callback();
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <div>
        <h1>Ready to go live?</h1>
        <p>Copy URL and KEY to OBS, Wirecast, etc. and start streaming.</p>

        <Form>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2">
              stream URL:
            </Label>
            <textarea disabled className="txt-small" value={this.props.streamUrl} />
          </FormGroup>
          <FormGroup className="mb-2 mr-sm-2 mb-sm-0">
            <Label className="mr-sm-2">
              stream KEY:
            </Label>
            <textarea disabled className="txt-big" value={this.props.streamKey}/>
          </FormGroup>
          <Button
            className="pct-btn"
            outline
            color="primary"
            onClick={this.GoLive}
          >
            go live
          </Button>
        </Form>

      </div>
    );
  }
}
