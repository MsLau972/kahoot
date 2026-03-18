import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonBackButton,
  IonProgressBar,
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import { StatsService } from '../services/stats-service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-game',
  templateUrl: 'game.page.html',
  styleUrls: ['game.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonBackButton,
    IonProgressBar,
  ],
})
export class GamePage implements OnInit {
  quiz: Quiz = {
  id: '',
  title: '',
  questions: [],
  description: '',
};
  currentQuestionIndex: number = 0;
  score: number = 0;
  selectedAnswerId: number | null = null;
  showResult: boolean = false;
  gameFinished: boolean = false;
  answers: { questionId: number; selectedChoiceId: number; isCorrect: boolean }[] = [];

  timeLeft: number = 10;
  timer: any;

    startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 10;

    this.timer = setInterval(() => {
        this.timeLeft--;

        if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.showResult = true;
        }
    }, 1000);
    }

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private statsService: StatsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
  this.route.paramMap.subscribe((params) => {
    const quizId = params.get('id');

    if (quizId) {
      this.quizService.get(quizId).subscribe((quiz) => {
        
        this.quiz = quiz;
        this.quiz.questions = this.shuffleArray(this.quiz.questions);
        this.quiz.questions.forEach(q => {
          q.choices = this.shuffleArray(q.choices);
        });

        this.startTimer();
      });
    }
  });
}

  shuffleArray(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }

  get currentQuestion(): Question | null {
    if (!this.quiz || this.currentQuestionIndex >= this.quiz.questions.length) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    if (!this.quiz) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  selectAnswer(choice: Choice) {
    if (this.showResult) return;

    this.selectedAnswerId = choice.id;
    this.showResult = true;

    const currentQuestion = this.currentQuestion;
    if (currentQuestion) {
      const isCorrect = choice.id === currentQuestion.correctChoiceId;
      if (isCorrect) {
        this.score++;
      }

      this.answers.push({
        questionId: currentQuestion.id,
        selectedChoiceId: choice.id,
        isCorrect,
      });
    }
  }

  nextQuestion() {
    if (!this.quiz) return;

    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswerId = null;
      this.showResult = false;

      this.startTimer();
    } else {
      this.gameFinished = true;

      const user = this.authService.isConnected();
      if (user) {
        this.statsService.saveScore(
          user.uid,
          this.quiz.id,
          this.quiz.title,
          this.score,
          this.quiz.questions.length
        )
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  restart() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswerId = null;
    this.showResult = false;
    this.gameFinished = false;
    this.answers = [];
    this.startTimer();
  }

  isAnswerCorrect(choice: Choice): boolean {
    if (!this.currentQuestion) return false;
    return choice.id === this.currentQuestion.correctChoiceId;
  }

  isSelectedAnswerCorrect(): boolean {
    if (!this.currentQuestion || this.selectedAnswerId === null) return false;
    return this.selectedAnswerId === this.currentQuestion.correctChoiceId;
  }

  getCorrectAnswerText(): string {
  if (!this.currentQuestion) return '';

  const correct = this.currentQuestion.choices.find(
    c => c.id === this.currentQuestion?.correctChoiceId
  );

  return correct ? correct.text : '';
}
}
