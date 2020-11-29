import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';



@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css']
})
export class PageSearchesComponent implements OnInit {

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    console.log(this.route.snapshot.params)
  }

  public results;
  public query = this.route.snapshot.params

}
