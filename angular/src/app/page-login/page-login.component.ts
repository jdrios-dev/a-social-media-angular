import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorageService } from '../local-storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.css']
})
export class PageLoginComponent implements OnInit {

  constructor(
    private api: ApiService,
    private storage: LocalStorageService,
    private router: Router ) { }

  ngOnInit(): void {}

  public formError = '';

  public credentials = {
    email: '',
    password: ''
  };

  public formSubmit() {
    this.formError = '';

    if (
      !this.credentials.email ||
      !this.credentials.password
    ) {
      return this.formError ='All fields are required.'
    }

    if(!this.formError) {
      this.login();
    }
  }

  private login() {
    let requestObject = {
      type: 'POST',
      location: 'users/login',
      body: this.credentials
    }
    this.api.makeRequest(requestObject).then((val)=> {
      if(val.token) {
        this.storage.setToken(val.token)
        this.router.navigate(['/']);
        return;
      }
      if(val.message) { this.formError = val.message }
    });
  }

}
