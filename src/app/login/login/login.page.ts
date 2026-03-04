import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class LoginPage {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async login() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Email et mot de passe sont obligatoires';
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = "Cet utilisateur n'existe pas";
      } else if (error.code === 'auth/wrong-password') {
        this.errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-credential') {
        this.errorMessage = 'Email ou mot de passe incorrect';
      } else {
        this.errorMessage = error.message;
      }
    } finally {
      this.isLoading = false;
    }
  }
}
