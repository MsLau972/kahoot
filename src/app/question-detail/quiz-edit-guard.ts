import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';
import { QuizService } from '../services/quiz.service';
import { first, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuizEditGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private quizService: QuizService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const quizId = route.paramMap.get('id');
    const user = this.auth.isConnected();

    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    return this.quizService.get(quizId!).pipe(
      first(),
      map(quiz => {
        if (quiz.authorId === user.uid || user.email === 'admin@example.com') {
          return true;
        } else {
          this.router.navigate(['/home']);
          return false;
        }
      })
    );
  }
}