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

    if(this.post.content.length < 40 ) { this.fontSize = 22; }
    if(this.post.content.length < 24 ) { this.align = "center"; this.fontSize = 28; }
    if(this.post.content.length < 14) { this.fontSize = 32; }
    if(this.post.content.length < 8 ) { this.fontSize = 44; }
    if(this.post.content.length < 5 ) { this.fontSize = 62; }
  }

  public fakeId: string = 'fakeId';
  public fontSize: number = 18;
  public align: string = 'center';
}
