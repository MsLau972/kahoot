import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonText, 
  IonCardTitle, 
  IonCard, 
  IonCardContent, 
  IonButton, 
  IonCardHeader, 
  IonButtons,
  IonItem, 
  IonLabel, 
  IonList 
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { StatsService } from '../services/stats-service';
import { Observable } from 'rxjs';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-account-infos',
  templateUrl: './account-infos.page.html',
  styleUrls: ['./account-infos.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule, 
    IonText, 
    IonCardTitle, 
    IonCard, 
    IonCardContent, 
    IonButton, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonCardHeader, 
    IonButtons,
    TopBarComponent,
  ]
})
export class AccountInfosPage implements OnInit {
  protected userEmail: string = "";
  protected stats$: Observable<any[]> | undefined;

  constructor(
    private authService: AuthService,
    private statsService: StatsService,
    private router: Router,
  ) { }

  ngOnInit() {
    const user = this.authService.isConnected();

    if (user) {
      this.userEmail = user.email || "no email";
      this.stats$ = this.statsService.getUserStats(user.uid);
    } else {
      console.log("Utilisateur non connecté");
    }
  }

  goBack() {
    this.router.navigate(['/home'])
  }

}
