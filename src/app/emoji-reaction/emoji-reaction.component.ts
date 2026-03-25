import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { AuthService } from 'src/app/services/auth';
import { IonFab, IonFabButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-emoji-reactions',
  templateUrl: './emoji-reaction.component.html',
  styleUrl: './emoji-reaction.component.scss',
  imports: [CommonModule, IonFab, IonFabButton],
  standalone: true,
})
export class EmojiReactionsComponent implements OnInit {
  @Input() gameId!: string | undefined;

  reactions: any[] = [];

  constructor(
    private gameService: GameService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.gameService.getGame(this.gameId?? '').subscribe(game => {
      if (!game) return;

      this.reactions = game.reactions || [];
      this.cleanOldReactions();
    });
  }

  sendReaction() {
    const user = this.authService.isConnected();
    if (!user) return;

    const emojis = ['😂', '🔥', '🎉', '💀', '😎', '👀', '💩', '💖'];

    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    this.gameService.sendReaction(this.gameId ?? '', {
      uid: user.uid,
      emoji
    });
  }

  cleanOldReactions() {
    const now = Date.now();

    this.reactions = this.reactions.filter(r => now - r.timestamp < 6000);
  }

  getOpacity(timestamp: number): number {
    return 1 - (Date.now() - timestamp) / 6000;
  }
}