import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Імпорт db потрібен!
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  // Функція входу
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Якщо користувач не залогінений -> все просто
      if (!currentUser) {
        setUser(null);
        setIsNewUser(false);
        setLoading(false);
        return;
      }

      // Якщо залогінений -> перевіряємо Firestore
      // (loading залишається true!)
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // 1. Документа немає -> Створюємо і це новий юзер
          console.log("No doc found, creating...");
          await setDoc(docRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            photo: currentUser.photoURL,
            plan: 'free',
            createdAt: new Date(),
            setupComplete: false // Флаг для онбордингу
          });
          setIsNewUser(true);

          // Credit referrer if applicable
          const referrerUid = localStorage.getItem('referrer_uid');
          if (referrerUid && referrerUid !== currentUser.uid) {
            try {
              const referrerRef = doc(db, 'users', referrerUid);
              await updateDoc(referrerRef, {
                bonusGenerations: increment(2)
              });
              localStorage.removeItem('referrer_uid');
              console.log('Referrer credited with 2 bonus generations!');
            } catch (err) {
              console.error('Could not credit referrer:', err);
            }
          }
        } else {
          // 2. Документ є -> Перевіряємо setupComplete
          // Якщо setupComplete == false (або undefined), то це теж "новий" для нас
          const data = docSnap.data();
          setIsNewUser(!data.setupComplete);
        }
      } catch (error) {
        console.error("Firestore check failed:", error);
        // У разі помилки бази краще не блокувати, а пустити як старого
        setIsNewUser(false);
      }

      // Тільки ТЕПЕР оновлюємо стан і знімаємо лоадер
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, logout, loading, signInWithGoogle, isNewUser, setIsNewUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);