import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post;

  constructor() { }

  ngOnInit(): void {

    function removeLeadingnumbers(string){
      function isNumber(n){
        n = Number(n);
        if(!isNaN(n)){
          return true
        }
      }
      if(string && isNumber(string[0])){
        string = removeLeadingnumbers(string.substring(1));
      }
      return string;
    }
    this.fakeId = removeLeadingnumbers(this.post._id);
  }

  public fakeId: string = '';
}
