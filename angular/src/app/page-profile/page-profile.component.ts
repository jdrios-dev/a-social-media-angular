import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { ApiService } from '../api.service';
//import { UserDataService } from '../user-data.service';
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
    //private centralUserData: UserDataService,
    private route: ActivatedRoute,
    public events: EventEmitterService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('Your Profile.');
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');

    let userDataEvent = this.events.getUserData.subscribe((user)=>{

      this.besties = user.besties;
      this.enemies = user.enemies;

      this.route.params.subscribe((params)=> {
        this.showPosts = 6;

        this.isBestie = user.besties.some((v) => v._id == params.userid);
        this.isEnemy = user.enemies.some((v) => v._id == params.userid);

        this.maxAmountOfBeties = user.besties.length >= 2;

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
  public totalfriends: number = 0;
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

  public isBestie: boolean = false;
  public isEnemy: boolean = false;

  private besties = [];
  private enemies = [];

  public maxAmountOfBeties: boolean = false;

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
    this.isBestie = false;
    this.isEnemy = false;
    this.maxAmountOfBeties = false;
  }

  public updateSendMessageObject(id, name) {
    this.events.updateSendMessageObjectEvent.emit({id, name});
  }

  public toggleRequest(toggle){

    function toggleValue(array){
      for(let i = 0; i  < array.length; i++ ){
        if(array[i]._id == this.usersId){
          return array.splice(i, 1);
        }
      }
      array.push({_id: this.usersId})
    }

    let requestObject = {
      location: `users/bestie-enemy-toggler/${this.usersId}?toggle=${toggle}`,
      type: 'POST'
    }

    this.api.makeRequest(requestObject).then((val) => {
      if(val.statusCode == 201){
        toggleValue.call(this, this.besties);
        this.maxAmountOfBeties = this.besties.length >= 2;
        if (toggle == 'besties'){
          this.isBestie = !this.isBestie
        } else {
          toggleValue.call(this, this.enemies);
          this.isEnemy = !this.isEnemy
        }
      }
    })

  }

  public toggleBestie() {
    console.log('toggle bestie');
  }

  public toggleEnemy() {
    console.log('toggle enemy');
  }
}
