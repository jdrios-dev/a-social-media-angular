import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { ApiService } from '../api.service';

@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css']
})
export class PageFeedComponent implements OnInit {

  constructor(
    private api: ApiService,
    private title: Title,
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

}
