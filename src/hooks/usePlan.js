import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const usePlan = (user) => {
  const [isPro, setIsPro] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setIsPro(false);
      setPlanLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const expiry = data.planExpiry?.toDate
            ? data.planExpiry.toDate()
            : data.planExpiry
              ? new Date(data.planExpiry)
              : null;
          setIsPro(data.plan === 'pro' && (!expiry || expiry > new Date()));
        } else {
          setIsPro(false);
        }
        setPlanLoading(false);
      },
      (error) => {
        console.error('Plan check failed:', error.code);
        setIsPro(false);
        setPlanLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { isPro, planLoading };
};