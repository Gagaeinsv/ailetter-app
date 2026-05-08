import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';

const LEGACY_LS_KEY = 'letterHistory';
const FREE_LIMIT = 30;
const PRO_LIMIT = 500;

const lsKeyForUser = (uid) => (uid ? `${LEGACY_LS_KEY}_${uid}` : LEGACY_LS_KEY);

const loadLocal = (uid) => {
  const key = lsKeyForUser(uid);
  try {
    let raw = localStorage.getItem(key);
    if (!raw && uid) {
      const legacy = localStorage.getItem(LEGACY_LS_KEY);
      if (legacy) {
        raw = legacy;
        localStorage.setItem(key, legacy);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocal = (uid, items) => {
  try {
    localStorage.setItem(lsKeyForUser(uid), JSON.stringify(items));
  } catch (e) {
    console.warn('useHistory: localStorage save failed', e);
  }
};

const firestoreLimit = (isPro) => (isPro ? PRO_LIMIT : FREE_LIMIT);

const toLetterDoc = (entry) => {
  const { id, ...rest } = entry;
  return {
    ...rest,
    id,
    savedAt: typeof entry.savedAt === 'number' ? entry.savedAt : id,
  };
};

export const useHistory = (user, isPro) => {
  const uid = user?.uid;
  const [history, setHistoryState] = useState(() => loadLocal(uid));
  const [syncStatus, setSyncStatus] = useState('idle');
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      setHistoryState(loadLocal(null));
      setSyncStatus('idle');
      migratedRef.current = false;
      return;
    }

    const cap = firestoreLimit(isPro);
    const lettersRef = collection(db, 'users', uid, 'letters');
    /** No server orderBy: older docs may lack savedAt/indexed fields and would be excluded from ordered queries */

    setSyncStatus('syncing');
    const unsub = onSnapshot(
      lettersRef,
      async (snap) => {
        const cloud = snap.docs.map((d) => {
          const data = d.data();
          const rawId = data.id ?? d.id;
          const id = typeof rawId === 'number' ? rawId : Number(rawId) || rawId;
          const savedAt =
            typeof data.savedAt === 'number'
              ? data.savedAt
              : typeof id === 'number'
                ? id
                : Date.now();
          return {
            id,
            date: data.date ?? '',
            savedAt,
            job: data.job ?? '',
            jobDescription: data.jobDescription ?? '',
            text: data.text ?? '',
            lang: data.lang ?? '',
            company: data.company ?? 'Unknown',
            followUpSent: !!data.followUpSent,
            savedVia: data.savedVia ?? 'manual',
          };
        });

        const local = loadLocal(uid);
        const sortBySaved = (a, b) => Number(b.savedAt || b.id) - Number(a.savedAt || a.id);

        let merged;
        if (cloud.length > 0) {
          const cloudIds = new Set(cloud.map((e) => String(e.id)));
          const localsNotInCloud = local.filter((e) => !cloudIds.has(String(e.id)));
          merged = [...cloud, ...localsNotInCloud].sort(sortBySaved).slice(0, cap);
        } else {
          merged = [...local].sort(sortBySaved).slice(0, cap);
        }
        saveLocal(uid, merged);
        setHistoryState(merged);
        setSyncStatus('synced');

        const canMigrateSeed =
          !snap.metadata.fromCache && !snap.metadata.hasPendingWrites;
        if (!migratedRef.current && canMigrateSeed && cloud.length === 0 && local.length > 0) {
          migratedRef.current = true;
          try {
            const batch = writeBatch(db);
            local.slice(0, cap).forEach((entry) => {
              const ref = doc(db, 'users', uid, 'letters', String(entry.id));
              batch.set(ref, toLetterDoc(entry));
            });
            await batch.commit();
          } catch (e) {
            console.warn('useHistory: initial migration failed', e);
            migratedRef.current = false;
          }
        }
      },
      (err) => {
        console.error('useHistory sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsub();
  }, [uid, isPro]);

  const addEntry = useCallback(
    async (entry) => {
      const cap = firestoreLimit(isPro);
      setHistoryState((prev) => {
        const next = [entry, ...prev.filter((h) => h.id !== entry.id)].slice(0, cap);
        saveLocal(uid, next);
        return next;
      });
      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid, 'letters', String(entry.id)), toLetterDoc(entry));
        } catch (e) {
          console.warn('useHistory: addEntry Firestore failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid, isPro]
  );

  const updateEntry = useCallback(
    async (id, changes) => {
      setHistoryState((prev) => {
        const next = prev.map((h) => (h.id === id ? { ...h, ...changes } : h));
        saveLocal(uid, next);
        return next;
      });
      if (uid) {
        try {
          const ref = doc(db, 'users', uid, 'letters', String(id));
          await setDoc(ref, { id, ...changes }, { merge: true });
        } catch (e) {
          console.warn('useHistory: updateEntry Firestore failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid]
  );

  const removeEntry = useCallback(
    async (id) => {
      setHistoryState((prev) => {
        const next = prev.filter((h) => h.id !== id);
        saveLocal(uid, next);
        return next;
      });
      if (uid) {
        try {
          await deleteDoc(doc(db, 'users', uid, 'letters', String(id)));
        } catch (e) {
          console.warn('useHistory: removeEntry Firestore failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid]
  );

  const replaceHistory = useCallback(
    async (items) => {
      const cap = firestoreLimit(isPro);
      const next = (Array.isArray(items) ? items : []).slice(0, cap);
      saveLocal(uid, next);
      setHistoryState(next);
      if (uid) {
        try {
          const snap = await getDocs(collection(db, 'users', uid, 'letters'));
          const batch = writeBatch(db);
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          const w = writeBatch(db);
          next.forEach((entry) => {
            w.set(doc(db, 'users', uid, 'letters', String(entry.id)), toLetterDoc(entry));
          });
          await w.commit();
        } catch (e) {
          console.warn('useHistory: replaceHistory Firestore failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid, isPro]
  );

  return {
    history,
    setHistory: replaceHistory,
    addEntry,
    updateEntry,
    removeEntry,
    syncStatus,
  };
};
