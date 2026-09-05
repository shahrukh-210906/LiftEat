const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
function auth() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error('Firebase project is not configured');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    initializeApp({ projectId, ...(clientEmail && privateKey ? { credential: cert({ projectId, clientEmail, privateKey }) } : {}) });
  }
  return getAuth();
}
module.exports = { auth };
