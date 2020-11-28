import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-page-register',
  templateUrl: './page-register.component.html',
  styleUrls: ['./page-register.component.css']
})
export class PageRegisterComponent implements OnInit {

  constructor(private api: ApiService) { }

  ngOnInit(): void { }

  public formError = '';

  public credentials = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: ''
  };

  public formSubmit() {
    this.formError = '';

    if(
      !this.credentials.first_name ||
      !this.credentials.last_name ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.password_confirm
    ) {
      return this.formError = 'All fields are required.'
    }

    var re = new RegExp(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);

    if(!re.test(this.credentials.email)) {
      return this.formError = 'Please enter a valid email address.';
    }

    if (this.credentials.password !== this.credentials.password_confirm){
      return this.formError = 'Passwords do not match.' 
    }


    console.log('Form Submit');
    console.log(this.credentials);
    this.register();
  }

  private register() {
    console.log('register');
  }

}
