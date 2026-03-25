import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  docData,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';

export interface Game {
  id?: string;
  quizId: string;
  pin: string;
  currentQuestionIndex: number;
  gamePhase: 'question' | 'result';
  started: boolean;
  finished: boolean;
  hostUid: string;
  players: any[];
  reactions: {
        id: string;
        emoji: string;
        timestamp: number;
      }[];
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private firestore: Firestore = inject(Firestore);

  async createGame(quizId: string, hostName: string, hostUid: string) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const docRef = await addDoc(collection(this.firestore, 'games'), {
      quizId,
      pin,
      currentQuestionIndex: 0,
      gamePhase: 'question',
      started: false,
      finished: false,
      hostUid,
      players: [{ uid: hostUid, name: hostName, score: 0 }],
    });

    return { gameId: docRef.id, pin };
  }

  getGame(gameId: string): Observable<any> {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    return docData(gameDoc, { idField: 'id' });
  }

  async startGame(gameId: string) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snap = await getDoc(gameDoc);
    if (!snap.exists()) return;

    await updateDoc(gameDoc, { started: true });
  }

  async joinGame(gameId: string, playerName: string, playerUid?: string) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snapshot = await getDoc(gameDoc);
    if (!snapshot.exists()) return;

    const game = snapshot.data() as any;
    const players = [...(game.players || [])];

    const existingIndex = players.findIndex(p => p.uid === playerUid);
    if (existingIndex !== -1) {
      // Update name if changed, keep existing score (no duplicate)
      players[existingIndex] = {
        ...players[existingIndex],
        name: playerName,
      };
    } else {
      players.push({
        uid: playerUid || '',
        name: playerName,
        score: 0,
      });
    }

    await updateDoc(gameDoc, { players });
  }

  async findGameByPin(pin: string) {
    const gamesCollection = collection(this.firestore, 'games');
    const q = query(gamesCollection, where('pin', '==', pin));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0];
  }

  async setGamePhase(gameId: string, phase: 'question' | 'result') {
    if (!gameId) return;

    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snap = await getDoc(gameDoc);

    if (!snap.exists()) {
      console.warn('Game not ready yet');
      return;
    }

    await updateDoc(gameDoc, { gamePhase: phase });
  }

  getGamePhase(gameId: string): Observable<'question' | 'result'> {
    return this.getGame(gameId).pipe(
      map(game => game?.gamePhase ?? 'question')
    );
  }

  async submitAnswer(gameId: string, playerUid: string, choiceId: number, score: number) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snap = await getDoc(gameDoc);
    if (!snap.exists()) return;

    const game = snap.data() as any;
    const players = [...(game.players || [])];

    const index = players.findIndex(p => p.uid === playerUid);
    if (index !== -1) {
      players[index].lastAnswer = choiceId;
      players[index].score = score;
    }

    await updateDoc(gameDoc, { players });
  }

  async finishGame(gameId: string) {
    if (!gameId) return;

    const gameDoc = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDoc, { finished: true, reactions: [] });
  }

  async updateGameProgress(gameId: string, currentQuestionIndex: number) {
    if (!gameId) return;

    const gameDoc = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDoc, { currentQuestionIndex });
  }

  async resetGame(gameId: string) {
    if (!gameId) return;

    const gameDoc = doc(this.firestore, `games/${gameId}`);
    await updateDoc(gameDoc, { 
      currentQuestionIndex: 0,
      finished: false,
      gamePhase: 'question',
      started: false
    });
  }

  async sendReaction(gameId: string, reaction: any) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snap = await getDoc(gameDoc);
    if (!snap.exists()) return;

    const game = snap.data() as any;

    const reactions = [...(game.reactions || [])];

    reactions.push({
      id: Date.now(),
      ...reaction,
      timestamp: Date.now()
    });

    await updateDoc(gameDoc, { reactions });
  }
}