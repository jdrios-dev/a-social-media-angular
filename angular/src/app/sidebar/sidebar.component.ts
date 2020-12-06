import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { EventEmitterService } from '../event-emitter.service';
import { AutoUnsubscribe } from '../unsubscribe';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

@AutoUnsubscribe
export class SidebarComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private events: EventEmitterService,
  ) { }

  ngOnInit(): void {
    let userDataEvent = this.events.getUserData.subscribe((user)=>{
      this.userData = user;
      this.userDataId = user._id;
      this.enemies = user.enemies;
      this.besties = user.besties;
      this
    })

    this.subscriptions.push( userDataEvent );
  }

  public userData = {};
  public userDataId = '';
  public besties = [];
  public enemies = [];
  private subscriptions = [];

}
