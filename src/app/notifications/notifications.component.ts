import {Component} from '@angular/core';

import * as SockJS from 'sockjs-client';
import * as StompJs from '@stomp/stompjs';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent {

  public notifications: string[] = [];

  private client: StompJs.Client;

  public sessionId: string="";

  public messageText: string="";

  public receiverId: string="";

  connectClicked() {
    if (!this.client || this.client.connected) {
      //Stomp config
      this.client = new StompJs.Client({
        //Get URL from host
        webSocketFactory: () => new SockJS('https://pinch.net.in:8762/notifications/?token='),
        debug: (msg: string) => console.log(msg)
      });



      this.client.onConnect = () => {
        //Notification count subscrbe
        this.client.subscribe('/user/notification/count', (response) => {
          const text: string = JSON.parse(response.body).text;
          console.log('Got ' + text);
          this.notifications.push("count("+text+") at "+new Date());
          this.notifications=[...this.notifications];
        });
        //Chat mesaage subscribe
        this.client.subscribe('/user/chat/message', (response) => {
          console.error("message coming")
          console.error(JSON.parse(response.body));
        });
        // Register with current userId
        this.client.publish({destination: '/pinch/register',headers:{userId:this.sessionId},body:""});
        console.info('connected!');
      };

    

      this.client.onStompError = (frame) => {
        console.error(frame.headers['message']);
        console.error('Details:', frame.body);
      };

      this.client.activate();
    }
  }

  disconnectClicked() {
    if (this.client && this.client.connected) {
      this.client.deactivate();
      this.client = null;
      console.info("disconnected :-/");
    }
  }

  startClicked() {
    if (this.client && this.client.connected) {
      let payload={
        receiverId:this.receiverId,
        message:this.messageText,
        messageType:"text"
      }
      this.client.publish({destination: '/pinch/send',body:JSON.stringify(payload),headers:{userId:this.sessionId}});
    }
  }

  stopClicked() {
    if (this.client && this.client.connected) {
      this.client.publish({destination: '/pinch/stop'});
    }
  }
}
