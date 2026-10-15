import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const adminUid = process.env.FIREBASE_ADMIN_UID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!adminUid || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  console.error("FIREBASE_ADMIN_UID and Firebase Admin credentials are required in .env.local.");
  process.exit(1);
}
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: privateKey,
};
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

const user = await getAuth().getUser(adminUid);
await getFirestore().collection("users").doc(adminUid).set({
  email: user.email ?? "",
  name: user.displayName ?? "Администратор",
  role: "admin",
  createdAt: new Date(),
}, { merge: true });
console.log(`The single administrator is set: ${user.email ?? adminUid}`);
