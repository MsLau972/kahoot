import { Component, OnInit, OnDestroy } from '@angular/core';
import { switchMap, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ViewWillLeave } from '@ionic/angular/standalone';
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
  IonIcon,
} from '@ionic/angular/standalone';

import { QuizService } from '../services/quiz.service';
import { Quiz } from '../models/quiz';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import { StatsService } from '../services/stats-service';
import { Game, GameService } from '../services/game.service';
import { AuthService } from '../services/auth';
import { ActivatedRoute, Router } from '@angular/router';

import { EmojiReactionsComponent } from '../emoji-reaction/emoji-reaction.component';

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
    IonIcon,
    EmojiReactionsComponent
  ],
})
export class GamePage implements OnInit, OnDestroy, ViewWillLeave {
  game: Game = {
    id: '',
    quizId: '',
    pin: '',
    currentQuestionIndex: 0,
    gamePhase: 'question',
    started: false,
    finished: false,
    hostUid: '',
    players: [],
    reactions: [],
  };

  quiz!: Quiz;
  selectedAnswerId: number | null = null;
  score = 0;
  showResult = false;
  playerRank: number | null = null;

  timeLeft = 10;
  timer: any;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private gameService: GameService,
    private authService: AuthService,
    private statsService: StatsService,
  ) {}

 ngOnInit() {
    this.game.id = this.route.snapshot.paramMap.get('id')!;

    // Mark that we entered the game page
    localStorage.removeItem(`leftGame_${this.game.id}`);

    this.gameService.getGame(this.game.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(game => {
        if (game && !game.started) {
          this.router.navigate(['/lobby', this.game.id]);
        }
      });

    this.gameService.getGame(this.game.id).pipe(
      switchMap(game => {
        if (!game) return of(null);
        this.game = game;
        this.game.gamePhase = game.gamePhase ?? 'question';
        return this.quizService.get(game.quizId);
      }),
      takeUntil(this.destroy$)
    ).subscribe(quiz => {
      this.quiz = quiz!;
    });
    if(!this.timer) {
      this.startTimer();
    }
  }

  get currentQuestion(): Question | null {
    return this.quiz?.questions?.[this.game.currentQuestionIndex] ?? null;
  }

  get progress(): number {
    if (!this.quiz) return 0;
    return ((this.game.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 10;

    this.timer = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finishQuestion();
      }
    }, 1000);
  }

  async finishQuestion() {
    this.showResult = true;

    // Calculate score based on final selected answer
    if (this.selectedAnswerId !== null) {
      const selectedChoice = this.currentQuestion?.choices.find(c => c.id === this.selectedAnswerId);
      if (selectedChoice && this.isAnswerCorrect(selectedChoice)) {
        this.score++;
      }
    }

    const user = this.authService.isConnected();
    if (user && this.selectedAnswerId !== null) {
      await this.gameService.submitAnswer(this.game.id || '', user.uid, this.selectedAnswerId, this.score);
    }

    setTimeout(() => this.nextQuestion(), 4000);
  }

  selectAnswer(choice: Choice) {
    if (this.game.gamePhase !== 'question') return;

    this.selectedAnswerId = choice.id;
  }

  nextQuestion() {
    if (!this.quiz?.questions) {
      return; // Quiz not loaded yet
    }

    const totalQuestions = this.quiz.questions.length;
    const isLastQuestion = this.game.currentQuestionIndex >= totalQuestions - 1;

    if (!isLastQuestion) {
      this.game.currentQuestionIndex++;
      this.selectedAnswerId = null;
      this.showResult = false;

      this.gameService.updateGameProgress(this.game.id || '', this.game.currentQuestionIndex);
      this.startTimer();
    } else {
      const user = this.authService.isConnected();
      if (user) {
        this.statsService.saveScore(
          user.uid,
          this.quiz.id,
          this.quiz.title,
          this.score,
          this.quiz.questions.length
        );
      }

      // Compute player rank before finishing
      this.playerRank = this.computePlayerRank();

      this.game.finished = true;
      this.game.reactions = [];
      this.gameService.finishGame(this.game.id || '');
    }
  }

  isAnswerCorrect(choice: Choice): boolean {
    return choice.id === this.currentQuestion?.correctChoiceId;
  }

  isSelectedAnswerCorrect(): boolean {
    return this.selectedAnswerId === this.currentQuestion?.correctChoiceId;
  }

  getCorrectAnswerText(): string {
    const correct = this.currentQuestion?.choices.find(
      c => c.id === this.currentQuestion?.correctChoiceId
    );
    return correct?.text || '';
  }

  restart() {
    this.game.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedAnswerId = null;
    this.showResult = false;
    this.game.finished = false;
    this.game.gamePhase = 'question';

    // Reset game in database to sync state and send all players back to lobby
    this.gameService.resetGame(this.game.id || '');

    // Clear the flag so we can rejoin automatically when game restarts
    localStorage.removeItem(`leftGame_${this.game.id}`);

    // Redirect host back to lobby
    this.router.navigate(['/lobby', this.game.id]);
  }

  goBack() {
    // Mark that we voluntarily left the game
    localStorage.setItem(`leftGame_${this.game.id}`, 'true');
    this.router.navigate(['/home']);
  }

  quitGame() {
    // Mark that we voluntarily left the game
    localStorage.setItem(`leftGame_${this.game.id}`, 'true');
    this.router.navigate(['/home']);
  }

  getAnswerStats(choiceId: number): number {
    if (!this.game?.players) return 0;

    const total = this.game.players.length;
    const count = this.game.players.filter(
      (p: any) => p.lastAnswer === choiceId
    ).length;

    return total ? (count / total) * 100 : 0;
  }

  getAnswerCount(choiceId: number): number {
    if (!this.game?.players) return 0;
    return this.game.players.filter((p: any) => p.lastAnswer === choiceId).length;
  }

  getTotalPlayers(): number {
    return this.game?.players?.length || 0;
  }

  ngOnDestroy() {
    // Clean up when leaving game page
    clearInterval(this.timer);
    // Unsubscribe from all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave() {
    localStorage.setItem(`leftGame_${this.game.id}`, 'true');
    clearInterval(this.timer);
    this.destroy$.next();
  }

  private computePlayerRank(): number | null {
    const user = this.authService.isConnected();
    if (!user || !this.game?.players?.length) return null;

    const sortedPlayers = [...this.game.players].sort((a: any, b: any) => b.score - a.score);
    const rank = sortedPlayers.findIndex((p: any) => p.uid === user.uid);

    return rank >= 0 ? rank + 1 : null;
  }
}