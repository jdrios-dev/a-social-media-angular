import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ApiService } from '../api.service';
import { UserDataService } from '../user-data.service';
import { ActivatedRoute } from '@angular/router';
import { EventEmitterService } from '../event-emitter.service';
import { AutoUnsubscribe } from '../unsubscribe';

@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.css']
})

@AutoUnsubscribe
export class PageProfileComponent implements OnInit {

  constructor(
    private title: Title,
    private api: ApiService,
    private centralUserData: UserDataService,
    private route: ActivatedRoute,
    public events: EventEmitterService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your Profile.');
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');

    let userDataEvent = this.centralUserData.getUserData.subscribe((user)=>{

      this.route.params.subscribe((params)=> {
        this.showPosts = 6;
        if(user._id == params.userid){
          this.setComponentValues(user)
          this.resetBooleans();
        }else{
          this.canSendMessage = true;
          let requestObject = {
            location: `users/get-user-data/${params.userid}`,
            type: 'GET'
          }
          this.api.makeRequest(requestObject).then((data) => {
            if(data.statusCode == 200){

              this.canAddUser = user.friends.includes(data.user._id) ? false : true
              this.haveReceivedFriendRequest = user.friend_requests.includes(data.user._id);
              this.haveSentFriendRequest = data.user.friend_requests.includes(user._id) ? true : false ;
              if (this.canAddUser) { this.showPosts = 0 ;}
              this.setComponentValues(data.user);
            }
          })
        }
      })
    });

    this.subscriptions.push( userDataEvent );
  }
  private subscriptions = [];

  public randomFriends: string[] = [];
  public totalfriends: number;
  public posts: object[] = [];
  public showPosts: number = 6;
  public profilePicture: string = 'default-avatar';
  public usersName: string = '';
  public usersEmail: string = '';
  public usersId: string = '';

  public canAddUser: boolean = false;
  public canSendMessage: boolean = false;
  public haveSentFriendRequest: boolean = false;
  public haveReceivedFriendRequest: boolean = false;

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
    this.usersId = user._id;
  }

  public accept() {
    this.api.resolveFriendRequest('accept', this.usersId).then((val: any)=> {
      if(val.statusCode == 201) {
        this.haveReceivedFriendRequest = false;
        this.canAddUser = false;
        this.totalfriends++;
        this.showPosts = 6;
      }
    })
  }
  public decline() {
    this.api.resolveFriendRequest('decline', this.usersId).then((val: any)=> {
      if(val.statusCode == 201) {
        this.haveReceivedFriendRequest = false;
        this.canAddUser = true;
      }
    })
  }

  public makeFriendRequest(){
    this.api.makeFriendRequest(this.usersId).then((val: any)=> {
      if(val.statusCode = 201) { this.haveSentFriendRequest = true; }
    });
  }

  private resetBooleans(){
    this.canAddUser = false;
    this.canSendMessage = false;
    this.haveReceivedFriendRequest = false;
    this.haveSentFriendRequest = false;
  }
}
