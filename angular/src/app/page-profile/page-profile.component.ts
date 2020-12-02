import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ApiService } from '../api.service';
import { UserDataService } from '../user-data.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.css']
})
export class PageProfileComponent implements OnInit {

  constructor(
    private title: Title,
    private api: ApiService,
    private centralUserData: UserDataService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your Profile.');
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');

    this.centralUserData.getUserData.subscribe((user)=>{

      this.route.params.subscribe((params)=> {
        if(user._id == params.userid){
          this.setComponentValues(user)
        }else{
          this.canSendMessage = true;
          let requestObject = {
            location: `users/get-user-data/${params.userid}`,
            type: 'GET'
          }
          this.api.makeRequest(requestObject).then((data) => {
            if(data.statusCode == 200){
              this.setComponentValues(data.user)
            }
          })
        }
      })

    });
  }

  public randomFriends: string[] = [];
  public totalfriends: number;
  public posts: object[] = [];
  public showPosts: number = 6;
  public profilePicture: string = 'default-avatar';
  public usersName: string = '';
  public usersEmail: string = '';

  public canAddUser: boolean = false;
  public canSendMessage: boolean = false;

  public showMorePosts() {
    this.showPosts += 6;
  }

  public backToTop() {
    this.document.body.scrollTop = this.document.documentElement.scrollTop = 0;
  }

  public setComponentValues(user){
    this.randomFriends = user.random_friends;
    this.profilePicture = user.profile_image;
    this.posts = user.posts;
    this.usersName = user.name;
    this.usersEmail = user.email;
    this.totalfriends = user.friends.length;
  }
}
