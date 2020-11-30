import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';


import { ApiService } from '../api.service';
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
    console.log(this.newPostTheme);
  }
}
