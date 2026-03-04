import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-add-quiz-modal',
  templateUrl: './add-quiz.modal.html',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonButton,
  ],
})
export class AddQuizModalComponent {
  title = '';
  description = '';

  constructor(
    private modalCtrl: ModalController,
    private quizService: QuizService,
  ) {}

  async addQuiz() {
    await this.quizService.addQuiz({
      id: Date.now().toString(),
      title: this.title,
      description: this.description,
      questions: [],
    });

    this.modalCtrl.dismiss();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
