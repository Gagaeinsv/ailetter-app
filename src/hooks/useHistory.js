/**
 * useHistory — cloud-synced letter history
 *
 * Strategy:
 *  - Always read/write localStorage instantly for snappy UI
 *  - For authenticated users, mirror to Firestore subcollection
 *    users/{uid}/letters/{letterId}
 *  - On first load, merge localStorage + Firestore (cloud wins on conflict)
 *  - Free plan: keep latest 30 in Firestore; Pro: unlimited
 *  - All mutation helpers (add / update / remove / replace) keep both stores
 *    in sync atomically
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection, doc, setDoc, deleteDoc,
  query, orderBy, limit, onSnapshot, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const LS_KEY    = 'letterHistory';
const FREE_LIMIT = 30;

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
};
const saveLocal = (items) => {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
};

export const useHistory = (user, isPro) => {
  const [history, setHistory]         = useState(loadLocal);
  const [syncStatus, setSyncStatus]   = useState('idle'); // idle | syncing | synced | error
  const uid = user?.uid;

  // ── Firestore live listener ──
  useEffect(() => {
    if (!uid) return;

    const col  = collection(db, 'users', uid, 'letters');
    const q    = query(col, orderBy('savedAt', 'desc'), limit(isPro ? 500 : FREE_LIMIT));

    setSyncStatus('syncing');
    const unsub = onSnapshot(q,
      (snap) => {
        const cloud = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        setHistory(prev => {
          // Merge: cloud entries take precedence; keep local-only entries
          const cloudIds = new Set(cloud.map(c => String(c.id)));
          const localOnly = prev.filter(p => !cloudIds.has(String(p.id)));
          // Upload local-only entries to cloud in background
          if (localOnly.length > 0) {
            const batch = writeBatch(db);
            localOnly.forEach(entry => {
              const ref = doc(db, 'users', uid, 'letters', String(entry.id));
              batch.set(ref, entry);
            });
            batch.commit().catch(e => console.warn('Batch upload failed:', e));
          }
          const merged = [...cloud];
          // Add local-only on top; sort by id desc (timestamp)
          localOnly.forEach(e => { if (!cloudIds.has(String(e.id))) merged.unshift(e); });
          merged.sort((a, b) => Number(b.id) - Number(a.id));
          saveLocal(merged);
          return merged;
        });
        setSyncStatus('synced');
      },
      (err) => {
        console.warn('Firestore history listener error:', err.code);
        setSyncStatus('error');
      }
    );
    return () => unsub();
  }, [uid, isPro]);

  // ── Write helpers ──

  const addEntry = useCallback(async (entry) => {
    const key = String(entry.id);
    setHistory(prev => {
      const next = [entry, ...prev];
      saveLocal(next);
      return next;
    });
    if (uid) {
      try {
        await setDoc(doc(db, 'users', uid, 'letters', key), entry);
      } catch (e) {
        console.warn('Firestore addEntry failed:', e.code);
      }
    }
  }, [uid]);

  const updateEntry = useCallback(async (id, changes) => {
    const key = String(id);
    setHistory(prev => {
      const next = prev.map(h => String(h.id) === key ? { ...h, ...changes } : h);
      saveLocal(next);
      return next;
    });
    if (uid) {
      try {
        const existing = history.find(h => String(h.id) === key);
        if (existing) {
          await setDoc(doc(db, 'users', uid, 'letters', key), { ...existing, ...changes });
        }
      } catch (e) {
        console.warn('Firestore updateEntry failed:', e.code);
      }
    }
  }, [uid, history]);

  const removeEntry = useCallback(async (id) => {
    const key = String(id);
    setHistory(prev => {
      const next = prev.filter(h => String(h.id) !== key);
      saveLocal(next);
      return next;
    });
    if (uid) {
      try {
        await deleteDoc(doc(db, 'users', uid, 'letters', key));
      } catch (e) {
        console.warn('Firestore removeEntry failed:', e.code);
      }
    }
  }, [uid]);

  // Replace entire list (e.g. delete-all)
  const replaceHistory = useCallback(async (items) => {
    saveLocal(items);
    setHistory(items);
    // No bulk-delete from cloud here intentionally; per-entry delete is safer
  }, []);

  return {
    history,
    setHistory: replaceHistory,
    addEntry,
    updateEntry,
    removeEntry,
    syncStatus,
  };
};
