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
      this.notifications.friendRequest--;
    });

    let alertEvent = this.events.onAlertEvent.subscribe((msg)=> {
      this.alertMessage = msg;
    });

    let userDataEvent = this.centralUserData.getUserData.subscribe((user) => {
      this.notifications.friendRequest = user.friend_requests.length;
      this.notifications.messages = user.new_message_notifications.length;
      this.profilePicture = user.profile_image;
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
  private subscriptions = [];
  public query: string = '';
  public sendMessageObject = {
    id: '',
    name: '',
    content: '',
  };
  public alertMessage: string = '';

  //USER DATA
  public usersName: string;
  public usersId: string = '';
  public profilePicture: string = 'default-avatar';
  public messagePreviews = [];
  public notifications = {
    alerts: 0,
    friendRequest: 0,
    messages: 0
  };

  public searchForFriends(){
    this.router.navigate(['/search-result', {query: this.query}])
  };

  public sendMessage(){
    this.api.sendMessage(this.sendMessageObject);
    this.sendMessageObject.content='';
  };
}
