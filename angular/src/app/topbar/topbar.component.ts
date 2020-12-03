import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from '../unsubscribe';


//SERVICES
import { LocalStorageService } from '../local-storage.service';
import { EventEmitterService } from '../event-emitter.service';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';
import { UserDataService } from '../user-data.service';



@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})

@AutoUnsubscribe

export class TopbarComponent implements OnInit {

  constructor(
    public router: Router,
    public auth: AuthService,
    public api: ApiService,
    public events: EventEmitterService,
    public storage: LocalStorageService,
    public centralUserData: UserDataService,
  ) { }

  ngOnInit(): void {
    this.usersName = this.storage.getParsedToken().name;
    this.usersId = this.storage.getParsedToken()._id;

    let friendRequestEvent =this.events.updateNumOfFriendRequestEvent.subscribe((msg)=> {
      this.numberOfFriendRequests--;
    });

    let alertEvent = this.events.onAlertEvent.subscribe((msg)=> {
      this.alertMessage = msg;
    });

    let userDataEvent = this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      this.numberOfFriendRequests = data.friend_requests.length;
      this.profilePicture = data.profile_image;
    });

    let updateMessageEvent = this.events.updateSendMessageObjectEvent.subscribe((d)=>{
      this.sendMessageObject.id = d.id;
      this.sendMessageObject.name = d.name;
    })

    let requestObject = {
      location: `users/get-user-data/${this.usersId}`,
      type: 'GET',
      authorize: true
    }
    this.api.makeRequest(requestObject).then((val)=> {
      this.centralUserData.getUserData.emit(val.user)
    });

    this.subscriptions.push(
      friendRequestEvent,
      alertEvent,
      userDataEvent,
      updateMessageEvent
    )

  }

  public query: string = '';
  public usersName: string;
  public usersId: string = '';
  public alertMessage: string = '';
  public profilePicture: string = 'default-avatar';
  public userData: object;
  public numberOfFriendRequests: number ;

  public sendMessageObject = {
    id: '',
    name: '',
    content: '',
  }

  public sendMessage(){
    this.api.sendMessage(this.sendMessageObject);
    this.sendMessageObject.content='';
  }

  private subscriptions = [];

  public searchForFriends(){
    this.router.navigate(['/search-result', {query: this.query}])
  }
}
