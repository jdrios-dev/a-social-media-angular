import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from '../unsubscribe';


//SERVICES
import { LocalStorageService } from '../local-storage.service';
import { EventEmitterService } from '../event-emitter.service';
import { AuthService } from '../auth.service';
import { ApiService } from '../api.service';



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

    let userDataEvent = this.events.getUserData.subscribe((user) => {
      this.notifications.friendRequest = user.friend_requests.length;
      this.notifications.messages = user.new_message_notifications.length;
      this.profilePicture = user.profile_image;
      this.notifications.alerts = user.new_notifications;

      this.setAlerts(user.notifications);
      this.setMessagesPreviews(user.messages, user.new_message_notifications);
    });

    let updateMessageEvent = this.events.updateSendMessageObjectEvent.subscribe((d)=>{
      this.sendMessageObject.id = d.id;
      this.sendMessageObject.name = d.name;
    })

    let resetMessageEvent = this.events.resetMessageNotificationsEvent.subscribe(()=> {
      this.notifications.messages = 0;
    });

    let requestObject = {
      location: `users/get-user-data/${this.usersId}`,
      type: 'GET',
      authorize: true
    }
    this.api.makeRequest(requestObject).then((val)=> {
      if(val.statusCode == 404){
        return this.auth.logout();
      }

      if(val.statusCode == 200){
        this.events.getUserData.emit(val.user)
      }
    });

    this.subscriptions.push(
      friendRequestEvent,
      alertEvent,
      userDataEvent,
      updateMessageEvent,
      resetMessageEvent
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
  public usersName: string = '';
  public usersId: string = '';
  public profilePicture: string = 'default-avatar';
  public messagePreviews = [];
  public alerts = [];
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

  public resetMessageNotifications(){
    if(this.notifications.messages == 0) { return; }
    this.api.resetMessageNotifications();
  }

  public resetAlertNotifications(){
    if(this.notifications.alerts == 0) { return; }
    let requestObject = {
      location: 'users/reset-alert-notifications',
      type: 'POST'
    }

    this.api.makeRequest(requestObject).then((val)=>{
      if(val.statusCode == 201){
        this.notifications.alerts == 0;
      }
    })
  }

  private setMessagesPreviews(messages, messageNotifications){
    for (let i = messages.length - 1; i >= 0; i--){
      let lastMessage = messages[i].content[messages[i].content.length - 1];

      let preview = {
        messengerName: messages[i].messengerName,
        messageContent: lastMessage.message,
        messengerImage: '',
        messengerId: messages[i].from_id,
        isNew: false,
      }

      if (lastMessage.messenger == this.usersId) {
        preview.messengerImage = this.profilePicture;
      } else {
        preview.messengerImage = messages[i].messengerProfileImage;
        if (messageNotifications.includes(messages[i].from_id)) {
          preview.isNew = true;
        }
      }
      if (preview.isNew) {
        this.messagePreviews.unshift(preview);
      } else {
        this.messagePreviews.push(preview);
      }
    }
  }

  public messageLink(messageId){
    this.router.navigate(['/messages'], { state: { data: { msgId: messageId } } })
  }

  private setAlerts(notificationData){

    for(let alert of notificationData){
      let alertObj = JSON.parse(alert);

      let newAlert = {
        text: alertObj.alert_text,
        icon: '',
        bgColor: '',
        href: ''
      }

      switch(alertObj.alert_type){
        case 'new_friend':
          newAlert.icon = 'fa-user-check';
          newAlert.bgColor = 'bg-success';
          newAlert.href = `/profile/${alertObj.from_id}`;
          break;
        case 'liked_post':
          newAlert.icon = 'fa-thumbs-up';
          newAlert.bgColor = 'bg-purple';
          newAlert.href = `/profile/${this.usersId}`;
          break;
        case 'commented_post':
          newAlert.icon = 'fa-comment';
          newAlert.bgColor = 'bg-primary';
          newAlert.href = `/profile/${this.usersId}`;
          break;
      }
      this.alerts.push(newAlert)
    }
  }

}
