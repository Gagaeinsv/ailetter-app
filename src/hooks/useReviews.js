// src/hooks/useReviews.js
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const FALLBACK_REVIEWS = [
  { name: 'Olena M.', role: 'UX Designer → Google', text: 'Got 3 interview calls within a week. The letters felt genuinely personalized, not templated.', stars: 5, avatar: 'O', color: 'from-indigo-500 to-purple-600' },
  { name: 'Marco B.', role: 'Product Manager → Spotify', text: "I was spending 2 hours per application. Now it's literally 30 seconds and the quality is better.", stars: 5, avatar: 'M', color: 'from-green-500 to-teal-600' },
  { name: 'Anna K.', role: 'Data Analyst → Amazon', text: 'The Ukrainian language support is flawless. Finally an AI tool that actually works for us.', stars: 5, avatar: 'A', color: 'from-orange-500 to-red-600' },
  { name: 'Dmitri V.', role: 'Software Engineer → Netflix', text: 'Used it for 12 applications. Got 4 interviews. The ATS optimization really works.', stars: 5, avatar: 'D', color: 'from-blue-500 to-indigo-600' },
  { name: 'Sofia R.', role: 'Marketing → Meta', text: 'The different tone options are a game-changer. Professional for corporate, friendly for startups.', stars: 5, avatar: 'S', color: 'from-pink-500 to-rose-600' },
  { name: 'Taras H.', role: 'Finance → Deutsche Bank', text: 'Switched from ChatGPT prompting to AIletter. Night and day difference in output quality.', stars: 5, avatar: 'T', color: 'from-purple-500 to-violet-600' },
];

const COLORS = [
  'from-indigo-500 to-purple-600',
  'from-green-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-purple-500 to-violet-600',
  'from-cyan-500 to-blue-600',
  'from-amber-500 to-orange-600',
];

export const useReviews = () => {
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('approved', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          // Немає реальних відгуків — показуємо fallback
          setReviews(FALLBACK_REVIEWS);
          return;
        }

        const real = snap.docs.map((doc, i) => {
          const d = doc.data();
          return {
            name:   d.name || 'User',
            role:   d.role || '',
            text:   d.text,
            stars:  d.stars || 5,
            avatar: d.avatar || d.name?.[0]?.toUpperCase() || 'U',
            color:  COLORS[i % COLORS.length],
          };
        });

        // Якщо реальних менше 6 — доповнюємо фейковими
        if (real.length < 6) {
          const needed = 6 - real.length;
          setReviews([...real, ...FALLBACK_REVIEWS.slice(0, needed)]);
        } else {
          setReviews(real);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews(FALLBACK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return { reviews, loading };
};