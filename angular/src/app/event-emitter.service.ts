import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  onAlertEvent: EventEmitter<string> = new EventEmitter();
  updateNumOfFriendRequestEvent: EventEmitter<string> = new EventEmitter();
  updateSendMessageObjectEvent: EventEmitter<object> = new EventEmitter();
  resetMessageNotificationsEvent: EventEmitter<string> = new EventEmitter();

  constructor() { }
}
