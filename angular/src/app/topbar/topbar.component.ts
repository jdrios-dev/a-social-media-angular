import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

    this.events.updateNumOfFriendRequestEvent.subscribe((msg)=> {
      this.numberOfFriendRequests--;
    });

    this.events.onAlertEvent.subscribe((msg)=> {
      this.alertMessage = msg;
    });

    this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      this.numberOfFriendRequests = data.friend_requests.length;
      this.profilePicture = data.profile_image;
    });

    let requestObject = {
      location: `users/get-user-data/${this.usersId}`,
      type: 'GET',
      authorize: true
    }
    this.api.makeRequest(requestObject).then((val)=> {
      this.centralUserData.getUserData.emit(val.user)
    })

  }

  public query: string = '';
  public usersName: string;
  public usersId: string = '';
  public alertMessage: string = '';
  public userData: object = {};
  public numberOfFriendRequests: number ;
  public profilePicture: string = 'default-avatar';

  public searchForFriends(){
    this.router.navigate(['/search-result', {query: this.query}])
  }
}
