import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';


import { ApiService } from '../api.service';
import { EventEmitterService } from '../event-emitter.service';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css']
})
export class PageFeedComponent implements OnInit {

  constructor(
    private api: ApiService,
    private title: Title,
    private storage: LocalStorageService,
    private events: EventEmitterService,
  ) { }

  ngOnInit(): void {
    this.title.setTitle('A Social Media - Feed');

    let requestObject = {
      type: 'GET',
      location: 'users/generate-feed',
      authorize: true
    }

    this.api.makeRequest(requestObject).then((val)=> {
      console.log(val);
    })
  }

  public newPostContent: string = '';
  public newPostTheme: string = this.storage.getPostTheme() || 'primary';

  public changeTheme(newTheme){
    this.newPostTheme = newTheme;
    this.storage.setPostTheme(newTheme);
  }

  public createPost(){
    if(this.newPostContent.length == 0){
      return this.events.onAlertEvent.emit('No content for your post was provided.')
    }


    console.log('CreatePost!');

    let requestObject = {
      location: 'users/create-post',
      type: 'POST',
      authorize: true,
      body: {
        theme: this.newPostTheme,
        content: this.newPostContent
      }
    }
    this.api.makeRequest(requestObject)
      .then((val)=> {
        console.log(val);
        this.newPostContent = '';
      });
  }
}
