import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css']
})
export class PageSearchesComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private api: ApiService,
    private route: ActivatedRoute,
    private title: Title,
  ) { }

  ngOnInit(): void {
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');
    this.title.setTitle('Search');
    this.subscription = this.route.params.subscribe( params => {
      this.query = params.query;
      this.getResults();
    })
  }
  public subscription;
  public results;
  public query = this.route.snapshot.params.query;

  private getResults() {
    let requestObject = {
      location: `users/get-search-results?query=${this.query}`,
      type: 'GET',
      authorize: true
    }
    this.api.makeRequest(requestObject).then((val)=>{
      this.results = val.results
    })
  }
}
