import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth';
import { Observable } from 'rxjs';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonButtons,
    IonBackButton,
    TopBarComponent,
  ],
})
export class LobbyPage implements OnInit {
  gameId!: string;
  pin!: string;
  players: any[] = [];
  game$: Observable<any> | undefined;
  isHost: boolean = false;

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

    this.game$ = this.gameService.getGame(this.gameId);
    this.game$.subscribe((game: any) => {
      this.pin = game.pin;
      this.players = game.players || [];
      this.isHost = game.hostUid === user?.uid;
      if (game.started) {
        this.router.navigate(['/game', this.gameId]);
      }
    });
  }

  async startGame() {
    if (!this.isHost) return;
    await this.gameService.startGame(this.gameId);
  }
}