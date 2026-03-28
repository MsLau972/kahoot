import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewWillLeave } from '@ionic/angular/standalone';
import {
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmojiReactionsComponent } from '../emoji-reaction/emoji-reaction.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonButtons,
    EmojiReactionsComponent,
    TopBarComponent,
  ],
})
export class LobbyPage implements OnInit, OnDestroy, ViewWillLeave {
  gameId!: string;
  pin!: string;
  players: any[] = [];
  game$: Observable<any> | undefined;
  isHost: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.gameId = this.route.snapshot.paramMap.get('gameId')!;
    const user = this.authService.isConnected();
    if (!user) this.router.navigate(['/login']);

    // Mark that we are currently in the lobby - this allows automatic navigation to game
    localStorage.setItem(`inLobby_${this.gameId}`, 'true');

    this.game$ = this.gameService.getGame(this.gameId);
    this.game$
      .pipe(takeUntil(this.destroy$))
      .subscribe((game: any) => {
        this.pin = game.pin;
        this.players = game.players || [];
        this.isHost = game.hostUid === user?.uid;
        if (game.started) {
          // Only auto-navigate if we are still in the lobby and haven't voluntarily left
          const stillInLobby = localStorage.getItem(`inLobby_${this.gameId}`);
          const hasLeftGame = localStorage.getItem(`leftGame_${this.gameId}`);
          if (stillInLobby && !hasLeftGame) {
            this.router.navigate(['/game', this.gameId]);
          }
        }
      });
  }

  ngOnDestroy() {
    // Clean up: remove lobby flag when leaving this page
    localStorage.removeItem(`inLobby_${this.gameId}`);
    // Unsubscribe from all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  ionViewWillLeave() {
    localStorage.removeItem(`inLobby_${this.gameId}`);
    this.destroy$.next();
  }

  async startGame() {
    if (!this.isHost) return;
    await this.gameService.startGame(this.gameId);
  }
}