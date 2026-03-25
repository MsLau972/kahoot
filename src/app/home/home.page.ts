import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
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
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz';
import { AddQuizModalComponent } from './add-quiz.modal';
import { JoinModalComponent } from './join.modal';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
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
  ],
})
export class HomePage implements OnInit {
  quizzes: Quiz[] = [];

  constructor(
    private authService: AuthService,
    private quizService: QuizService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.quizService.getAll().subscribe((quizzes) => {
      this.quizzes = quizzes;
    });
  }

  goToQuizDetail(quiz: Quiz) {
    this.router.navigate(['/quiz', quiz.id]);
  }

  goToRegisterPage() {
    this.router.navigate(['/login'])
  }

  goToAccountInfos() {
    this.router.navigate(['/account-infos']);
  }

  async openAddQuizModal() {
    const modal = await this.modalCtrl.create({
      component: AddQuizModalComponent,
    });

    modal.onDidDismiss().then(async () => {
      this.quizService.getAll();
    });

    await modal.present();
  }

  async deleteQuiz(id: string) {
  const user = this.authService.isConnected();
  if (!user) {
    alert("Vous devez être connecté pour supprimer un quiz.");
    return;
  }

  try {
    const quiz = await firstValueFrom(this.quizService.get(id));
    if (!quiz) {
      alert("Quiz introuvable.");
      return;
    }

    const isAuthor = quiz.authorId === user.uid;
    const isAdmin = user.email === 'admin@example.com';
    if (!isAuthor && !isAdmin) {
      alert("Vous n'êtes pas autorisé à supprimer ce quiz.");
      return;
    }

    await this.quizService.deleteQuiz(id);
    alert("Quiz supprimé !");

    this.quizzes = await firstValueFrom(this.quizService.getAll());

  } catch (err) {
    console.error(err);
    alert("Erreur lors de la suppression du quiz.");
  }
}

  isLogged() {
    return this.authService.isConnected();
  }

  signOut() {
    this.authService.signOut();
  }

  async openJoinModal() {
    const modal = await this.modalCtrl.create({
      component: JoinModalComponent,
    });

    modal.onDidDismiss().then((result: any) => {
      if (result.data && result.data.success && result.data.gameId) {
        this.router.navigate(['/lobby', result.data.gameId]);
      }
    });

    await modal.present();
  }
}
