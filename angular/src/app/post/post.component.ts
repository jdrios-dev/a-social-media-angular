import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  @Input() post;

  constructor(
    private api: ApiService,
    private storage: LocalStorageService,
  ) { }

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

    this.userId = this.storage.getParsedToken()._id;
    if(this.post.likes.includes(this.userId)){
      this.liked = true;
    }
  }

  public fakeId: string = 'fakeId';
  public fontSize: number = 18;
  public align: string = 'center';
  public liked: boolean = false;
  public userId: string = '';
  public comment: string = '';

  public likeButtonClicked(postid) {

    let requestObject = {
      location: `users/like-unlike/${this.post.ownerid}/${this.post._id}`,
      type: 'POST',
      authorize: true
    }

    this.api.makeRequest(requestObject).then((val)=> {
      if(this.post.likes.includes(this.userId)){
        this.post.likes.splice(this.post.likes.indexOf(this.userId), 1);
        this.liked = false;
      } else {
        this.post.likes.push(this.userId)
        this.liked = true;
      }
    });
  }

  public postComponent(){
    if(this.comment.length == 0){ return; }
    console.log('POST COMMENT', this.comment);

    let requestObject = {
      location: `users/post-comment/${this.post.ownerid}/${this.post._id}`,
      type: 'POST',
      authorize: true,
      body: { content: this.comment }
    }

    this.api.makeRequest(requestObject).then((val)=> {
      if(val.statusCode == 201){
        let newComment = {
          ...val.comment,
          commenter_name: val.commenter.name,
          commenter_image: val.commenter.profile_image
        }
        this.post.comments.push(newComment);
        this.comment='';
      }
    });
  }
}
