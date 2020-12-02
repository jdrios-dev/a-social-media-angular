import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { PageFeedComponent } from './page-feed/page-feed.component';
import { PageFriendRequestComponent } from './page-friend-request/page-friend-request.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageMessagesComponent } from './page-messages/page-messages.component';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { PageSearchesComponent } from './page-searches/page-searches.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/feed',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: PageRegisterComponent,
    canActivate: [AuthService]
  },
  {
    path: 'login',
    component: PageLoginComponent,
    canActivate: [AuthService]
  },
  {
    path: 'feed',
    component: PageFeedComponent,
    canActivate: [AuthService],
    data: { loggedIn: true }
  },
  {
    path: 'profile/:userid',
    component: PageProfileComponent,
    canActivate: [AuthService],
    data: { loggedIn: true }
  },
  {
    path: 'messages',
    component: PageMessagesComponent,
    canActivate: [AuthService],
    data: { loggedIn: true }
  },
  {
    path: 'search-result',
    component: PageSearchesComponent,
    canActivate: [AuthService],
    data: { loggedIn: true }
  },
  {
    path: 'friend-request',
    component: PageFriendRequestComponent,
    canActivate: [AuthService],
    data: { loggedIn: true }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
