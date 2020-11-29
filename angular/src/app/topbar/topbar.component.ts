import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  constructor(
    public auth: AuthService,
    public router: Router,
  ) { }

  ngOnInit(): void {
  }

  public query: string = '';

  public searchForFriends(){
    this.router.navigate(['/search-result', {query: this.query}])
  }

}