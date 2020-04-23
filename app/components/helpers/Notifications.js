import React from 'react';
import { Button } from 'reactstrap';
const ReactMarkdown = require('react-markdown')
import moment from 'moment'

const Store = require('electron-store');
const store = new Store();

export class Notifications extends React.Component {
  constructor(){
      super();
      this.state = { notifications: [] }
      this.delete = this.delete.bind(this);
   }

   delete(id){
      let readIDs = JSON.parse(store.get('readNotifications'))
      readIDs.id.push(id)
      store.set('readNotifications', JSON.stringify(readIDs))
      this.setState(prevState => ({
          notifications: prevState.notifications.filter(el => el.id != id)
      }));
      if(this.state.notifications.length == 1) {
        this.props.callback()
      }
   }


   /*
   componentWillReceiveProps(nextProps) {
     alert(nextProps)
     if (nextProps.notifications !== this.props.notifications) {
        this.setState({ notifications: nextProps.notifications });
      }
   }
   */

   componentWillMount(){
     this.setState({ notifications: this.props.notifications });
   }

   render(){
      return(
        <div>
          <h1>Notifications</h1>
          <Notification delete={this.delete} data={this.state.notifications}/>
        </div>
      )
   }
}


class Notification extends React.Component{
   delete(id){
      this.props.delete(id);
   }
   render(){
      return(
         <div className="notifications">
           { this.props.data.map((i, key) =>
             <div key={i.id} className="notification">
                <h4>{i.title}</h4>
                <small>{moment(i.created_at).format('DD MMMM, HH:mm')}</small>
                <div className="body"><ReactMarkdown source={i.body}/></div>
                <button onClick={this.delete.bind(this, i.id)} outline color="primary" className="pct-btn">{i.button_text}</button>
             </div>
            )}
         </div>
      )
   }
}
