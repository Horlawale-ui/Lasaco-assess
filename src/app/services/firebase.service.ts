import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  isLogggedIn = false
  imageUrl = "https://res.cloudinary.com/djnqxvljr/image/upload/v1620660773/perlfood/assets/svg/bxs-user-circle_lpxmj4.svg"
  testScore: number = 0;
  totalQuestionsAttempted: number = 0;
  totalCorrectAnswered: number = 0;
  totalWrongAnswered: number = 0;
  scorePercentage: number = 0;

  // currentUser: string;
  private currentUserSubject: BehaviorSubject<any>
  public currentUser: Observable<any>

  constructor(public firebaseAuth: AngularFireAuth, private profileService: ProfileService) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('id') || '{}'))
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currenUserValue() {
    return this.currentUserSubject.value
  }

  // Sign In
  async signinUser(payload: any) {
    await this.firebaseAuth.signInWithEmailAndPassword(payload.emailAddress, payload.password)
      .then(res => {
        this.isLogggedIn = true

        localStorage.setItem('token', JSON.stringify(res.user?.refreshToken))

        localStorage.setItem('id', JSON.stringify(res.user?.uid))

        this.currentUserSubject.next(res.user)
      })

  }

  // Sign Up
  async createUser(email: string, password: string, payload: any) {
    await this.firebaseAuth.createUserWithEmailAndPassword(email, password)
      .then(res => {
        let data = {
          fullName: payload.fullName,
          emailAddress: payload.emailAddress.toLowerCase(),
          telNumber: payload.telNumber,
          role: payload.role,
          imageUrl: this.imageUrl,
          testScore: this.testScore,
          totalQuestionsAttempted: this.totalQuestionsAttempted,
          totalCorrectAnswered: this.totalCorrectAnswered,
          totalWrongAnswered: this.totalWrongAnswered,
          scorePercentage: this.scorePercentage,
          uid: res.user?.uid,
        }

        /** sends verification email **/
        // res.user?.sendEmailVerification();

        this.profileService.addUser(data)

        this.isLogggedIn = true

        localStorage.setItem('token', JSON.stringify(res.user?.refreshToken))

        localStorage.setItem('id', JSON.stringify(res.user?.uid))

        this.currentUserSubject.next(res.user)


      })
  }

  // Sign Out
  signout() {
    this.firebaseAuth.signOut()
    // Clear from Local Storage
    localStorage.removeItem('id')
    localStorage.removeItem('token')

    this.currentUserSubject.next(null)

  }

}
