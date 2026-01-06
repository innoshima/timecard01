import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration
// これらの値は公開されても問題ありません（Firestore Rulesで保護）
const firebaseConfig = {
  apiKey: "AIzaSyBQqX9kJxY8vZ5RzLqnHUw2mPxJzQfKj8M",
  authDomain: "izakaya-timecard.firebaseapp.com",
  projectId: "izakaya-timecard",
  storageBucket: "izakaya-timecard.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)
