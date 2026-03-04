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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit avoir au moins 6 caractères';
      return;
    }

    try {
      await this.authService.createUser(this.email, this.password);
      this.successMessage = 'Compte créé avec succès! Redirection...';
      setTimeout(() => {
        this.router.navigateByUrl('/home');
      }, 1500);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'Cet email est déjà utilisé';
      } else if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'Email invalide';
      } else if (error.code === 'auth/weak-password') {
        this.errorMessage = 'Le mot de passe est trop faible';
      } else {
        this.errorMessage = error.message;
      }
    }
  }
}
