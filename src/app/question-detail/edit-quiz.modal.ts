import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonRadio,
  IonRadioGroup,
  IonItem,
  IonText,
} from '@ionic/angular/standalone';

import { Quiz } from '../models/quiz';
import { QuizService } from '../services/quiz.service';

@Component({
  selector: 'app-edit-quiz-modal',
  templateUrl: './edit-quiz.modal.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonButton,
    IonRadio,
    IonRadioGroup,
    IonItem,
    IonText,
  ],
})
export class EditQuizModalComponent {
  @Input() quiz!: Quiz;
  form!: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private quizService: QuizService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: [this.quiz.title, Validators.required],
      description: [this.quiz.description],
      questions: this.fb.array(
        this.quiz.questions.map((q) => this.createQuestionForm(q)),
      ),
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  choices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  removeChoice(questionIndex: number, choiceIndex: number) {
    const question = this.questions.at(questionIndex);
    const choices = this.choices(questionIndex);
    const removedChoiceId = choices.at(choiceIndex).get('id')?.value;

    choices.removeAt(choiceIndex);

    if (question.get('correctChoiceId')?.value === removedChoiceId) {
      question.get('correctChoiceId')?.reset();
    }
  }

  createQuestionForm(question: any): FormGroup {
    return this.fb.group({
      id: [question.id],
      text: [question.text, Validators.required],
      correctChoiceId: [question.correctChoiceId, Validators.required],
      choices: this.fb.array(
        question.choices.map((c: any) =>
          this.fb.group({
            id: [c.id],
            text: [c.text, Validators.required],
          }),
        ),
      ),
    });
  }

  addQuestion() {
    this.questions.push(
      this.createQuestionForm({
        id: Date.now(),
        text: '',
        correctChoiceId: null,
        choices: [],
      }),
    );
  }

  addChoice(questionIndex: number) {
    const nextId = this.choices(questionIndex).length + 1;
    this.choices(questionIndex).push(
      this.fb.group({
        id: [nextId],
        text: '',
      }),
    );
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;

    const updatedQuiz: Quiz = {
      ...this.quiz,
      title: formValue.title,
      description: formValue.description,
      questions: formValue.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        correctChoiceId: q.correctChoiceId,
        choices: q.choices.map((c: any) => ({
          id: c.id,
          text: c.text,
        })),
      })),
    };

    this.quizService.updateQuiz(updatedQuiz);
    this.modalCtrl.dismiss();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
