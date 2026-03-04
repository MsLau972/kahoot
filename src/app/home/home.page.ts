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
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz';
import { AddQuizModalComponent } from './add-quiz.modal';

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
  ],
})
export class HomePage implements OnInit {
  quizzes: Quiz[] = [];

  constructor(
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
    this.quizService.deleteQuiz(id);
    this.quizService.getAll().subscribe((quizzes) => {
      this.quizzes = quizzes;
    });
  }
}
