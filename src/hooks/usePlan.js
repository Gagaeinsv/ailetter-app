import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const usePlan = (user) => {
  const [isPro, setIsPro] = useState(false);
  const [bonusGenerations, setBonusGenerations] = useState(0);
  const [planLoading, setPlanLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setIsPro(false);
      setBonusGenerations(0);
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
          setBonusGenerations(data.bonusGenerations || 0);
        } else {
          setIsPro(false);
          setBonusGenerations(0);
        }
        setPlanLoading(false);
      },
      (error) => {
        console.error('Plan check failed:', error.code);
        setIsPro(false);
        setBonusGenerations(0);
        setPlanLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { isPro, bonusGenerations, planLoading };
};