import { Component, Inject, OnInit } from '@angular/core';
import { UserDataService } from '../user-data.service';
import { ApiService } from '../api.service';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-page-friend-request',
  templateUrl: './page-friend-request.component.html',
  styleUrls: ['./page-friend-request.component.css']
})
export class PageFriendRequestComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private centralUserData: UserDataService,
    public api: ApiService,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');
    this.title.setTitle('Friend Requests.');
    this.centralUserData.getUserData.subscribe((data) => {
      this.userData = data;

      let array = JSON.stringify(data.friend_requests);

      let requestObject = {
        location: `users/get-friend-requests?friend_requests=${array}`,
        type: 'GET',
        
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

  public updateFriendRequests(id) {
    let arr = this.friendRequests;
    for (let i = 0; i < arr.length; i++){
      if(arr[i]._id == id){
        arr.splice(i, 1);
        break;
      }
    }
  }
}
