import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "dotenv/config";

export default async function signServerIntoFirebase() {
  try {
    const email = process.env.FIREBASE_EMAIL;
    const password = process.env.FIREBASE_PASSWORD;
    const auth = getAuth();

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(`✅ Server authenticated as: ${userCredential.user.email}`);
    console.log(`📌 Server auth UID: ${userCredential.user.uid}`); // Log the UID

    return userCredential;
  } catch (error) {
    console.error("❌ Firebase Authentication Failed:", error);
    throw error;
  }
}
