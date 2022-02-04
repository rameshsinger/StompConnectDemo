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

  connectClicked() {
    if (!this.client || this.client.connected) {
      this.client = new StompJs.Client({
        //Get URL from host
        webSocketFactory: () => new SockJS('http://localhost:8762/notifications'),
        debug: (msg: string) => console.log(msg)
      });

      this.client.onConnect = () => {

        this.client.subscribe('/user/notification/count', (response) => {
          const text: string = JSON.parse(response.body).text;
          console.log('Got ' + text);
          this.notifications.push("count("+text+") at "+new Date());
          this.notifications=[...this.notifications];
        });

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
      this.client.publish({destination: '/pinch/start'});
    }
  }

  stopClicked() {
    if (this.client && this.client.connected) {
      this.client.publish({destination: '/pinch/stop'});
    }
  }
}
