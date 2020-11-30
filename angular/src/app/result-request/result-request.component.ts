import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorageService } from '../local-storage.service';



@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css']
})
export class ResultRequestComponent implements OnInit {

  @Input() resultRequest;
  @Input() use;

  constructor(
    public api: ApiService,
    public storage: LocalStorageService,
  ) { }

  ngOnInit(): void {
  }

  public accept() {
    console.log("Accept this friend", this.resultRequest._id);
    this.api.resolveFriendRequest('accept', this.resultRequest._id).then((val)=>{
      console.log(val);
    });
  }

  public decline() {
    console.log("Decline this friend", this.resultRequest._id);
    this.api.resolveFriendRequest('decline', this.resultRequest._id).then((val)=>{
      console.log(val);
    });
  }


}
