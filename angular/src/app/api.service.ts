import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { AlertsService } from './alerts.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private alert: AlertsService,
  ) { }

  private baseUrl = 'http://localhost:3000';

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

    if(requestObject.authorize){
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

    console.log('Could not make the request. Make sure a type og GET ot POST is supplied.');

  }

  public makeFriendRequest(to: string) {
    let from = this.storage.getParsedToken()._id;

    let requestObject = {
      location: `users/make-friend-request/${from}/${to}`,
      type: 'POST',
      authorize: true
    }
    this.makeRequest(requestObject).then((val)=> {
      console.log(val);

      if(val.statusCode === 201){
        this.alert.onAlertEvent.emit('Successfully sent a friend request!')
      } else {
        this.alert.onAlertEvent.emit('Something went wrong, we could not send a friend request. Perhaps you already sent a friend request to this user.')
      }
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
          let resolutioned = (resolution == "accept") ? "accepted" : "declined";
          this.alert.onAlertEvent.emit(`Successfully ${resolutioned} friend request.`);
        } else {
          this.alert.onAlertEvent.emit('Something went wrong and we could not handle your friend request.');
        }
        resolve(val)
      });
    });
  }
}
