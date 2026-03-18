import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonText, IonCardTitle, IonCard, IonCardContent, IonButton, IonCardHeader, IonButtons } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-infos',
  templateUrl: './account-infos.page.html',
  styleUrls: ['./account-infos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonText, IonCardTitle, IonCard, IonCardContent, IonButton, IonCardHeader, IonButtons]
})
export class AccountInfosPage implements OnInit {
  protected userEmail: string = "";

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.authService.isConnected();

    if (user) {
      this.userEmail = user.email || "no email";
    }
  }

  goBack() {
    this.router.navigate(['/home'])
  }

}
