import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../models/models';

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (err) {
    console.error('Error fetching user:', err);
    return null;
  }
}
