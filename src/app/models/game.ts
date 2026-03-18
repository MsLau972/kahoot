export interface Game {
  id: string;
  quizId: string;
  pin: string;
  currentQuestionIndex: number;
  gamePhase: 'question' | 'result';
  started: boolean;
  finished: boolean;
  hostUid: string;
  players: any[];
}