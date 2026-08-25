import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export const authService = {
  // Listen to auth changes
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current auth user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Sign in with Email and Password
  async signInWithEmail(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  // Sign up with Email and Password
  async signUpWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && cred.user) {
      await updateFirebaseProfile(cred.user, { displayName });
    }
    return cred.user;
  },

  // Sign in with Google Popup
  async signInWithGoogle(): Promise<User> {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  },

  // Send Password Reset Email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth);
  },
};
