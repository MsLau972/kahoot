import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel, IonInput as IonicInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-join-modal',
  templateUrl: './join.modal.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonLabel,
    IonicInput,
  ],
})
export class JoinModalComponent {
  joinForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private gameService: GameService,
    private authService: AuthService
  ) {
    this.joinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.pattern(/^\d{4,6}$/)]],
    });
  }

  async joinGame() {
    if (this.joinForm.invalid) {
      this.joinForm.markAllAsTouched();
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      this.errorMessage = 'Vous devez être connecté pour rejoindre une partie.';
      return;
    }

    const { pin } = this.joinForm.value;

    try {
      const game = await this.gameService.findGameByPin(pin.toString());
      if (!game) {
        this.errorMessage = 'Aucune partie trouvée avec ce code PIN.';
        return;
      }

      await this.gameService.joinGame(game.id, user.email || 'Joueur', user.uid);

      this.modalCtrl.dismiss({ success: true, gameId: game.id });
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Impossible de rejoindre la partie. Réessayez.';
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}