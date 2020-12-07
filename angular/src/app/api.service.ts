import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { EventEmitterService } from './event-emitter.service';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private events: EventEmitterService,
  ) { }

  private baseUrl = environment.baseUrl;

  private successHandler(value) { return value; }
  private errorHandler(error) { return error; }

  public makeRequest(requestObject): any {
    let type = requestObject.type.toLowerCase();
    if(!type){ return console.log('No type specified in the request object.'); }

    let body = requestObject.body || {};
    let location = requestObject.location;
    if (!location) { return console.log('No location specified in the request object.'); }

    let url = `${this.baseUrl}/${location}`;

    let httpOptions = {};

    if(this.storage.getToken()){
      httpOptions = {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.storage.getToken()}`
        }),
      }
    }

    if(type === 'get'){
      return this.http.get(url, httpOptions).toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }

    if(type === 'post'){
      return this.http.post(url, body, httpOptions).toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
  }

  public makeFriendRequest(to: string) {
    let from = this.storage.getParsedToken()._id;

    let requestObject = {
      location: `users/make-friend-request/${from}/${to}`,
      type: 'POST'
    }

    return new Promise((resolve, reject) => {
      this.makeRequest(requestObject).then((val)=> {
        if(val.statusCode === 201){
          this.events.onAlertEvent.emit('Successfully sent a friend request!')
        } else {
          this.events.onAlertEvent.emit('Something went wrong, we could not send a friend request. Perhaps you already sent a friend request to this user.')
        }
        resolve(val)
      });
    });
  }

  public resolveFriendRequest(resolution, id) {
    let to = this.storage.getParsedToken()._id;
    return new Promise((resolve, reject)=> {
      let requestObject = {
        location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
        type: 'POST',
        authorize: true
      }
      this.makeRequest(requestObject).then((val)=>{
        if (val.statusCode === 201) {
          this.events.updateNumOfFriendRequestEvent.emit();
          let resolutioned = (resolution == "accept") ? "accepted" : "declined";
          this.events.onAlertEvent.emit(`Successfully ${resolutioned} friend request.`);
        } else {
          this.events.onAlertEvent.emit('Something went wrong and we could not handle your friend request.');
        }
        resolve(val)
      });
    });
  }

  public sendMessage(sendMessageObject, showAlerts = true){
    if(!sendMessageObject.content){
      this.events.onAlertEvent.emit('Message not sent. You must provide some content for your message')
      return;
    }

    let requestObject = {
      location: `users/send-message/${sendMessageObject.id}`,
      type: 'POST',
      body: {
        content: sendMessageObject.content
      }
    }
    return new Promise((resolve, reject)=> {
      this.makeRequest(requestObject).then((val)=>{
        if(val.statusCode == 201){
          this.events.onAlertEvent.emit('successfully sent a message.')
        }
        resolve(val);
      })
    })
  }

  public resetMessageNotifications(){

    let requestObject = {
      location: 'users/reset-message-notification',
      type: 'POST'
    }

    return new Promise ((resolve, reject) => {
      this.makeRequest(requestObject).then((val)=>{
        if(val.statusCode == 201){
          this.events.resetMessageNotificationsEvent.emit();
        }
        resolve();
      })
    })
  }
}
