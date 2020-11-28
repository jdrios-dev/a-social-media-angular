import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './_app/app.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageFeedComponent } from './page-feed/page-feed.component';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { PageMessagesComponent } from './page-messages/page-messages.component';
import { PageSearchesComponent } from './page-searches/page-searches.component';
import { PageFriendRequestComponent } from './page-friend-request/page-friend-request.component';
import { ResultRequestComponent } from './result-request/result-request.component';
import { PostComponent } from './post/post.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FormBgComponent } from './form-bg/form-bg.component';

@NgModule({
  declarations: [
    AppComponent,
    PageRegisterComponent,
    PageLoginComponent,
    PageFeedComponent,
    PageProfileComponent,
    PageMessagesComponent,
    PageSearchesComponent,
    PageFriendRequestComponent,
    ResultRequestComponent,
    PostComponent,
    SidebarComponent,
    TopbarComponent,
    FormBgComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
