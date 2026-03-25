import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonFab, IonFabButton } from '@ionic/angular/standalone';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-emoji-reactions',
  standalone: true,
  imports: [CommonModule, IonFab, IonFabButton],
  templateUrl: './emoji-reaction.component.html',
  styleUrls: ['./emoji-reaction.component.scss'],
})
export class EmojiReactionsComponent implements OnInit {
  @Input() gameId!: string | undefined;

  reactions: any[] = [];

  private lastReactionTime = 0;
  private comboCount = 0;

  emojis = ['😂', '🔥', '🎉', '💀', '😎', '👀', '💩', '💖'];
  masters = ['💣', '👑', '🚀', '🌟', '⚡', '🍾', '🥳', '🤩'];

  constructor(
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.gameService.getGame(this.gameId ?? '').subscribe(game => {
      if (!game) return;

      this.reactions = game.reactions || [];
      this.cleanOldReactions();
    });
  }

  sendReaction() {
  const user = this.authService.isConnected();
  if (!user) return;

  const now = Date.now();

  if (now - this.lastReactionTime < 2000) {
    this.comboCount++;
  } else {
    this.comboCount = 1;
  }

  this.lastReactionTime = now;

  const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];

  let masterEmoji: string | null = null;
  let bigEmoji: string | null = null;

  if (this.comboCount > 5 && Math.random() < 0.2) {
    masterEmoji = this.masters[Math.floor(Math.random() * this.masters.length)];
  } else if (this.comboCount > 10 && Math.random() < 0.1) {
    bigEmoji = emoji;
  }

  this.gameService.sendReaction(this.gameId ?? '', {
    uid: user.uid,
    emoji,
    masterEmoji,
    bigEmoji,
    combo: this.comboCount,
    timestamp: now
  });
}

  cleanOldReactions() {
    const now = Date.now();
    this.reactions = this.reactions.filter(r => now - r.timestamp < 6000);
  }

  getOpacity(timestamp: number): number {
    const opacity = 1 - (Date.now() - timestamp) / 6000;
    return Math.max(0, opacity);
  }

  getScale(combo: number): number {
    if (combo >= 10) return 2;
    if (combo >= 5) return 1.6;
    if (combo >= 3) return 1.3;
    return 1;
  }
}