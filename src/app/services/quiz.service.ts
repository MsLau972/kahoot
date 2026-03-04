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

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore: Firestore = inject(Firestore);
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  quizzes$ = this.quizzesSubject.asObservable();

  getAll(): Observable<Quiz[]> {
    const quizzesCollection = collection(this.firestore, 'quizzes');
    return collectionData(quizzesCollection, { idField: 'id' }) as Observable<
      Quiz[]
    >;
  }

  get(quizId: string): Observable<Quiz | undefined> {
    const quizDoc = doc(this.firestore, `quizzes/${quizId}`);

    return docData(quizDoc, { idField: 'id' }).pipe(
      switchMap((quiz: any) => {
        if (!quiz) {
          return of(undefined);
        }

        const questionsCollection = collection(
          this.firestore,
          `quizzes/${quizId}/questions`,
        );

        return collectionData(questionsCollection, { idField: 'id' }).pipe(
          map((questions) => ({
            ...quiz,
            questions,
          })),
        );
      }),
    ) as Observable<Quiz>;
  }

  async addQuiz(quiz: Quiz): Promise<void> {
    const batch = writeBatch(this.firestore);
    const quizzesCollection = collection(this.firestore, 'quizzes');
    const quizId = doc(quizzesCollection).id;

    batch.set(doc(quizzesCollection, quizId), {
      title: quiz.title,
      description: quiz.description,
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
    return setDoc(quizDoc, quiz);
  }
}
