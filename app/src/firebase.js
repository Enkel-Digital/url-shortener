import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// firebaseConfig auto generated in project settings
const firebaseApp = initializeApp({
  apiKey: "AIzaSyCXVTgYvNpQD1RMmb5RI4i_yCRh90xQEq4",
  authDomain: "zca-url-shortener.firebaseapp.com",
  projectId: "zca-url-shortener",
  appId: "1:132713416735:web:7cf170b5dc776aab266d2a",
});

const auth = getAuth(firebaseApp);

// Make firebase auth use browser's default language
auth.useDeviceLanguage();

/**
 * Only returns authentication header object if user is authenticated.
 * If user is unauthenticated, this does not throw and just returns undefined.
 * @function getAuthHeader
 * @returns {object | undefined} Authentication header object or nothing.
 */
async function getAuthHeader() {
  if (auth.currentUser)
    return { Authorization: `Bearer ${await auth.currentUser.getIdToken()}` };
}

// Export only the items that will be used
export { firebaseApp, auth, onAuthStateChanged, getAuthHeader };
