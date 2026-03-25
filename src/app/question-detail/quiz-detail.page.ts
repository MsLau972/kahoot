import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz';
import { EditQuizModalComponent } from './edit-quiz.modal';
import { AuthService } from '../services/auth';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonIcon,
    IonBackButton,
    IonButtons,
  ],
})
export class QuizDetailPage implements OnInit {
  quiz?: Quiz;
  isEditing = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private gameService: GameService
  ) {}

  ngOnInit() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.quizService.get(id).subscribe((q) => {
      this.quiz = q;
    });
  }

  async openEditModal() {

    const user = this.authService.isConnected();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const isAuthor = this.quiz?.authorId === user.uid;
    const isAdmin = user.email === 'admin@example.com';
    if (!isAuthor && !isAdmin) {
      alert("Vous n'êtes pas autorisé à modifier ce quiz.");
      return;
    }

    const modal = await this.modalCtrl.create({
      component: EditQuizModalComponent,
      componentProps: {
        quiz: this.quiz,
      },
    });

    modal.onDidDismiss().then(async () => {});

    await modal.present();
  }

  async playGame() {
    const user = this.authService.isConnected();
    if (!user) {
      this.router.navigate(['/login']); 
      return;
    }

    if (this.quiz?.id) {
      const result = await this.gameService.createGame(this.quiz.id, user.email || 'Hôte', user.uid);
      this.router.navigate(['/lobby', result.gameId]);
    }
  }
}
