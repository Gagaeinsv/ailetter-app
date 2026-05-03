import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const LEGACY_LS_KEY = 'jobTracker';

const TRACKER_FREE_LIMIT = 200;
const TRACKER_PRO_LIMIT = 1000;

const lsKeyForUser = (uid) => (uid ? `${LEGACY_LS_KEY}_${uid}` : LEGACY_LS_KEY);

const normalizeId = (raw) => {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const n = Number(raw);
  return Number.isFinite(n) ? n : String(raw || '');
};

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
    return Array.isArray(parsed) ? parsed.map(normalizeJobFromStorage) : [];
  } catch {
    return [];
  }
};

function normalizeJobFromStorage(j) {
  if (!j || typeof j !== 'object') return null;
  const id = normalizeId(j.id);
  const updatedAt = typeof j.updatedAt === 'number' ? j.updatedAt : (typeof id === 'number' ? id : Date.now());
  return {
    company: String(j.company || ''),
    role: String(j.role || ''),
    url: String(j.url || ''),
    notes: String(j.notes || ''),
    status: ['applied', 'interview', 'offer', 'rejected'].includes(j.status) ? j.status : 'applied',
    date: typeof j.date === 'string' ? j.date : new Date().toISOString().slice(0, 10),
    id,
    updatedAt,
  };
}

const saveLocal = (uid, jobs) => {
  try {
    localStorage.setItem(lsKeyForUser(uid), JSON.stringify(jobs));
  } catch (e) {
    console.warn('useJobTracker: localStorage save failed', e);
  }
};

const firestoreCap = (isPro) => (isPro ? TRACKER_PRO_LIMIT : TRACKER_FREE_LIMIT);

/** Firestore-ready payload (omit undefined) */
function toFsDoc(job) {
  const id = normalizeId(job.id);
  return {
    id,
    company: job.company ?? '',
    role: job.role ?? '',
    url: job.url ?? '',
    notes: job.notes ?? '',
    status: job.status ?? 'applied',
    date: job.date ?? '',
    updatedAt: typeof job.updatedAt === 'number' ? job.updatedAt : (typeof id === 'number' ? id : Date.now()),
  };
}

function jobFromFirestore(data, docClientId) {
  const rawId = data.id ?? docClientId;
  const id = normalizeId(rawId);
  return normalizeJobFromStorage({
    ...data,
    id,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : (typeof id === 'number' ? id : Date.now()),
  });
}

export const useJobTracker = (user, isPro) => {
  const uid = user?.uid;
  const [jobs, setJobsState] = useState(() => loadLocal(uid));
  const [syncStatus, setSyncStatus] = useState('idle');
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      setJobsState(loadLocal(null));
      setSyncStatus('idle');
      migratedRef.current = false;
      return;
    }

    const cap = firestoreCap(isPro);
    const appsRef = collection(db, 'users', uid, 'jobApplications');
    /** Full subcollection subscribe — orderBy(updatedAt) omits docs without that field, breaking cross-device sync */

    setSyncStatus('syncing');
    const unsub = onSnapshot(
      appsRef,
      async (snap) => {
        const cloud = snap.docs.map((d) => jobFromFirestore(d.data(), d.id));

        const local = loadLocal(uid);
        const byId = new Map();

        cloud.forEach((j) => byId.set(String(j.id), j));
        local.forEach((j) => {
          const key = String(j.id);
          if (!byId.has(key)) byId.set(key, j);
        });

        let merged = [...byId.values()].sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
        merged = merged.slice(0, cap);
        saveLocal(uid, merged);
        setJobsState(merged);
        setSyncStatus('synced');

        if (!migratedRef.current && cloud.length === 0 && local.length > 0) {
          migratedRef.current = true;
          try {
            const batch = writeBatch(db);
            local.slice(0, cap).forEach((job) => {
              const normalized = normalizeJobFromStorage(job);
              if (!normalized) return;
              const ref = doc(db, 'users', uid, 'jobApplications', String(normalized.id));
              batch.set(ref, toFsDoc(normalized));
            });
            await batch.commit();
          } catch (e) {
            console.warn('useJobTracker: migration failed', e);
            migratedRef.current = false;
          }
        }
      },
      (err) => {
        console.error('useJobTracker sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsub();
  }, [uid, isPro]);

  const persistList = useCallback(
    async (next) => {
      const cap = firestoreCap(isPro);
      const list = Array.isArray(next) ? next.map(normalizeJobFromStorage).filter(Boolean).slice(0, cap) : [];
      saveLocal(uid, list);
      setJobsState(list);
      if (!uid) return;
      try {
        const snap = await getDocs(collection(db, 'users', uid, 'jobApplications'));
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        const w = writeBatch(db);
        list.forEach((job) => {
          w.set(doc(db, 'users', uid, 'jobApplications', String(job.id)), toFsDoc(job));
        });
        await w.commit();
      } catch (e) {
        console.warn('useJobTracker: replace failed', e);
        setSyncStatus('error');
      }
    },
    [uid, isPro]
  );

  /** Insert or replace one job (matches previous setJobs patterns) */
  const upsertJob = useCallback(
    async (job) => {
      const normalized = normalizeJobFromStorage({
        ...job,
        updatedAt: Date.now(),
      });
      if (!normalized) return;

      const cap = firestoreCap(isPro);
      setJobsState((prev) => {
        const nid = normalized.id;
        const next = [normalized, ...prev.filter((j) => String(j.id) !== String(nid))].slice(0, cap);
        saveLocal(uid, next);
        return next;
      });

      if (uid) {
        try {
          await setDoc(doc(db, 'users', uid, 'jobApplications', String(normalized.id)), toFsDoc(normalized));
        } catch (e) {
          console.warn('useJobTracker: upsertJob failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid, isPro]
  );

  const patchJob = useCallback(
    async (id, patch) => {
      const sid = String(normalizeId(id));
      let updatedDoc = null;
      setJobsState((prev) => {
        const next = prev.map((j) => {
          if (String(j.id) !== sid) return j;
          const merged = normalizeJobFromStorage({
            ...j,
            ...patch,
            updatedAt: Date.now(),
          });
          updatedDoc = merged;
          return merged;
        });
        saveLocal(uid, next);
        return next;
      });

      if (uid && updatedDoc) {
        try {
          await setDoc(doc(db, 'users', uid, 'jobApplications', String(updatedDoc.id)), toFsDoc(updatedDoc));
        } catch (e) {
          console.warn('useJobTracker: patchJob failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid]
  );

  const removeJob = useCallback(
    async (id) => {
      const sid = String(normalizeId(id));
      setJobsState((prev) => {
        const next = prev.filter((j) => String(j.id) !== sid);
        saveLocal(uid, next);
        return next;
      });
      if (uid) {
        try {
          await deleteDoc(doc(db, 'users', uid, 'jobApplications', sid));
        } catch (e) {
          console.warn('useJobTracker: removeJob failed', e);
          setSyncStatus('error');
        }
      }
    },
    [uid]
  );

  const clearJobs = useCallback(async () => {
    await persistList([]);
  }, [persistList]);

  return {
    trackerJobs: jobs,
    trackerSyncStatus: uid ? syncStatus : 'idle',
    setTrackerJobs: persistList,
    upsertTrackerJob: upsertJob,
    patchTrackerJob: patchJob,
    removeTrackerJob: removeJob,
    clearTrackerJobs: clearJobs,
  };
};
