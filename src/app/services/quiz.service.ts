import { inject, Injectable } from '@angular/core';
import { Quiz } from '../models/quiz';
import { BehaviorSubject, map, Observable, of, switchMap } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  setDoc,
  writeBatch,
} from '@angular/fire/firestore';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore: Firestore = inject(Firestore);
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  quizzes$ = this.quizzesSubject.asObservable();
  authService: AuthService = inject(AuthService);

  getAll(): Observable<Quiz[]> {
    const quizzesCollection = collection(this.firestore, 'quizzes');
    return collectionData(quizzesCollection, { idField: 'id' }) as Observable<
      Quiz[]
    >;
  }

  get(quizId: string): Observable<Quiz> {
    const quizDoc = doc(this.firestore, `quizzes/${quizId}`);
    return docData(quizDoc, { idField: 'id' }) as Observable<Quiz>;
  }

  async addQuiz(quiz: Quiz): Promise<void> {
    const user = this.authService.isConnected();
    if (!user) throw new Error('Utilisateur non connecté');

    const batch = writeBatch(this.firestore);
    const quizzesCollection = collection(this.firestore, 'quizzes');
    const quizId = doc(quizzesCollection).id;

    batch.set(doc(quizzesCollection, quizId), {
      title: quiz.title,
      description: quiz.description,
      authorId: user.uid,
    });

    quiz.questions.forEach((question) => {
      const questionId = doc(
        collection(this.firestore, 'quizzes/' + quizId + '/questions'),
      ).id;
      batch.set(
        doc(
          collection(this.firestore, 'quizzes/' + quizId + '/questions'),
          questionId,
        ),
        {
          text: question.text,
          choices: question.choices,
          correctChoiceId: question.correctChoiceId,
        },
      );
    });
    return await batch.commit();
  }

  deleteQuiz(quizId: string) {
    const quizDoc = doc(this.firestore, `quizzes/${quizId}`);
    return deleteDoc(quizDoc);
  }

updateQuiz(quiz: Quiz) {
  const quizDoc = doc(this.firestore, `quizzes/${quiz.id}`);
  return setDoc(quizDoc, quiz, { merge: true });
}

getCurrentUserId(): string | null {
    const user = this.authService.isConnected();
    return user ? user.uid : null;
  }

  canEditQuiz(quiz: Quiz): boolean {
    const user = this.authService.isConnected();
    if (!user) return false;
    const isAdmin = user.email === 'admin@example.com';
    const isAuthor = quiz.authorId === user.uid;
    return isAdmin || isAuthor;
  }
}
