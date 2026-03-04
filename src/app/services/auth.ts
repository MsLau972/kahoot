import { inject, Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  getAuth,
} from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private firestore: Firestore = inject(Firestore);
  private auth = getAuth();

  createUser(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  isConnected(): User | null {
    return this.auth.currentUser;
  }
}
