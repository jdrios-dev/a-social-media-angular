import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { ApiService } from '../api.service';
@Component({
  selector: 'app-page-friend-request',
  templateUrl: './page-friend-request.component.html',
  styleUrls: ['./page-friend-request.component.css']
})
export class PageFriendRequestComponent implements OnInit {

  constructor(
    private centralUserData: UserDataService,
    public api: ApiService,
  ) { }

  ngOnInit(): void {
    this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;
      console.log(this.userData);

      let array = JSON.stringify(data.friend_requests);

      let requestObject = {
        location: `users/get-friend-requests?friend_requests=${array}`,
        type: 'GET',
        authorize: true
      }
      this.api.makeRequest(requestObject).then((val)=> {
        if (val.statusCode === 200) {
          this.friendRequests = val.users;
        }
      })
    });
  }

  public userData: object = {};
  public friendRequests = [];

}
