import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private firestore: Firestore = inject(Firestore);

  async saveScore(userId: string, quizId: string, quizTitle: string, score: number, total: number) {
    const statsCollection = collection(this.firestore, 'statistiques');

    await addDoc(statsCollection, {
      userId,
      quizId,
      quizTitle,
      score,
      total,
      date: new Date(),
    });
  }

  getUserStats(userId: string): Observable<any[]> {
    const statsCollection = collection(this.firestore, 'statistiques');
    const q = query(statsCollection, where('userId', '==', userId));

    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}
