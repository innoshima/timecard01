import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// 環境変数から読み込むか、ダミー値を使用
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBQqX9kJxY8vZ5RzLqnHUw2mPxJzQfKj8M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "izakaya-timecard.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "izakaya-timecard",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "izakaya-timecard.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456"
}

// Firebase設定の検証
export const isFirebaseConfigured = () => {
  // ダミー値でないかチェック
  return firebaseConfig.projectId !== "izakaya-timecard" &&
         firebaseConfig.apiKey !== "AIzaSyBQqX9kJxY8vZ5RzLqnHUw2mPxJzQfKj8M"
}

// Initialize Firebase
let app: any
let db: any

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  console.log('Firebase initialized successfully')
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase is using dummy configuration. Please set up your Firebase project and update the configuration.')
  }
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
  db = null
}

export { db }
