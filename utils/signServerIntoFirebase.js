import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "dotenv/config";
export default function signServerIntoFirebase() {
  const email = process.env.FIREBASE_EMAIL;
  const password = process.env.FIREBASE_PASSWORD;
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}
