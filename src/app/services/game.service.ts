import { inject, Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  docData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private firestore: Firestore = inject(Firestore);

  async createGame(quizId: string, hostName: string, hostUid: string): Promise<{ gameId: string; pin: string }> {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const gamesCollection = collection(this.firestore, 'games');
    const docRef = await addDoc(gamesCollection, {
      quizId,
      pin,
      currentQuestionIndex: 0,
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
    await updateDoc(gameDoc, { started: true });
  }

  async joinGame(gameId: string, playerName: string) {
    const gameDoc = doc(this.firestore, `games/${gameId}`);
    const snapshot = await getDoc(gameDoc);
    if (!snapshot.exists()) {
      throw new Error('Partie introuvable');
    }

    const game = snapshot.data() as any;
    const players = Array.isArray(game.players) ? [...game.players] : [];
    players.push({ uid: '', name: playerName, score: 0 });

    await updateDoc(gameDoc, { players });
  }

  async findGameByPin(pin: string) {
    const gamesCollection = collection(this.firestore, 'games');
    const q = query(gamesCollection, where('pin', '==', pin));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0]; 
  }
}