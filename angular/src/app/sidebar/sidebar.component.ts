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
    let userDataEvent = this.events.getUserData.subscribe((data)=>{
      this.userData = data;
      this.userDataId = data._id;
    })

    this.subscriptions.push( userDataEvent );
  }

  public userData;
  public userDataId;
  private subscriptions = [];

}
