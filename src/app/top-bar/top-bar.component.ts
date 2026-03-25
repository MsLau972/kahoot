import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import {
  IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonButtons,
    IonLabel,
    IonIcon,
    IonItem,
    IonList,
    IonPopover,
    IonAvatar,
    IonFab,
    IonFabButton, 
    IonBackButton,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  imports:
  [
    IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButton,
        IonButtons,
        IonItem,
        IonList,
        IonPopover,
        IonAvatar,
        IonBackButton,
  ]
})
export class TopBarComponent  implements OnInit {

  @Input() title: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showProfileButton: boolean = false;

  profileButtonId = 'profile-btn-' + Math.random().toString(36).substring(2);

  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  ngOnInit() {}

  goBackToHomePage() {
    if (this.authService.isConnected()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToRegisterPage() {
    this.router.navigate(['/login'])
  }

  goToAccountInfos() {
    this.router.navigate(['/account-infos']);
  }

  isLogged() {
    return this.authService.isConnected();
  }

  signOut() {
    this.authService.signOut();
  }
}
