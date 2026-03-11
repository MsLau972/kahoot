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
  ) {}

  ngOnInit() {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.quizService.get(id).subscribe((q) => {
      this.quiz = q;
    });
  }

  async openEditModal() {
    const modal = await this.modalCtrl.create({
      component: EditQuizModalComponent,
      componentProps: {
        quiz: this.quiz,
      },
    });

    modal.onDidDismiss().then(async () => {});

    await modal.present();
  }

  playGame() {
    if (this.quiz?.id) {
      this.router.navigate(['/game', this.quiz.id]);
    }
  }
}
