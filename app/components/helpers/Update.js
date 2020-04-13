import React from 'react';
import { Button } from 'reactstrap';
const ReactMarkdown = require('react-markdown')
import moment from 'moment'
var shell = require('electron').shell;

export class Update extends React.Component {
  constructor(){
      super();

      this.update = this.update.bind(this);
   }

   update(){

     if(process.platform == 'win32') {
       shell.openExternal(this.props.version[0].binaries.win);
     } else if (process.platform == 'darwin') {
       shell.openExternal(this.props.version[0].binaries.mac);
     } else {
       alert('Error! Email us live@bad.family')
     }

   }


   render(){

      return(
        <div>
            <h1>Update required</h1>

         <div className="notifications notification">
            <h4>version {this.props.version[0].version}</h4>

            <span>notes:</span>
            <ReactMarkdown source={this.props.version[0].notes}/>

            <span>changelog:</span>
            <ReactMarkdown source={this.props.version[0].changelog}/>
            <br />
            <Button onClick={this.update} outline color="primary" className="pct-btn">Download update</Button>

          </div>
          </div>
      )
   }
}
