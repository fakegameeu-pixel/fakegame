import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [email, name = "Administrators"] = process.argv.slice(2);
const adminUid = process.env.FIREBASE_ADMIN_UID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!email) {
  console.error("Usage: npm run create:single-admin -- admin@example.com 'Administrators'");
  process.exit(1);
}
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
const auth = getAuth();
const db = getFirestore();

async function readPassword() {
  if (!process.stdin.isTTY) throw new Error("Run this command in an interactive terminal.");
  process.stdout.write("Administrator password (minimum 6 characters): ");
  return new Promise((resolve, reject) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const receive = (key) => {
      if (key === "\u0003") { cleanup(); reject(new Error("Cancelled")); return; }
      if (key === "\r" || key === "\n") { cleanup(); process.stdout.write("\n"); resolve(value); return; }
      if (key === "\u007F" || key === "\b") { value = value.slice(0, -1); return; }
      value += key;
    };
    const cleanup = () => { process.stdin.off("data", receive); process.stdin.setRawMode(false); process.stdin.pause(); };
    process.stdin.on("data", receive);
  });
}

let user;
try {
  user = await auth.getUser(adminUid);
  if (user.email?.toLowerCase() !== email.toLowerCase()) throw new Error("This UID already belongs to another e-mail.");
} catch (error) {
  if (error?.code !== "auth/user-not-found") throw error;
  const password = await readPassword();
  if (password.length < 6) throw new Error("Password must contain at least 6 characters.");
  user = await auth.createUser({ uid: adminUid, email, password, displayName: name });
}

await db.collection("users").doc(adminUid).set({ email: user.email ?? email, name, role: "admin", createdAt: new Date() }, { merge: true });
console.log(`Single administrator is ready: ${user.email}`);
