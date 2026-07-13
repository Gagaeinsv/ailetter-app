import { useCallback, useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LS_KEY = 'userProfile';
const lsKeyForUser = (uid) => (uid ? `${LS_KEY}_${uid}` : LS_KEY);

const loadLocal = (uid) => {
  try {
    const key = lsKeyForUser(uid);
    let raw = localStorage.getItem(key);
    if (!raw && uid) {
      const legacy = localStorage.getItem(LS_KEY);
      if (legacy) {
        raw = legacy;
        localStorage.setItem(key, legacy);
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const saveLocal = (uid, profile) => {
  try {
    localStorage.setItem(lsKeyForUser(uid), JSON.stringify(profile || {}));
  } catch (e) {
    console.warn('useProfile: localStorage save failed', e);
  }
};

const normalizeProfile = (p) => {
  const obj = p && typeof p === 'object' ? p : {};
  const skills =
    Array.isArray(obj.skills)
      ? obj.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 30)
      : typeof obj.skills === 'string'
        ? obj.skills.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30)
        : [];
  return {
    fullName: String(obj.fullName || obj.name || '').trim(),
    profession: String(obj.profession || '').trim(),
    email: String(obj.email || '').trim(),
    phone: String(obj.phone || '').trim(),
    location: String(obj.location || '').trim(),
    linkedin: String(obj.linkedin || '').trim(),
    summary: String(obj.summary || '').trim(),
    projects: Array.isArray(obj.projects)
      ? obj.projects.map((proj) => ({
          name: String(proj?.name || '').trim(),
          description: String(proj?.description || '').trim(),
          link: String(proj?.link || '').trim(),
          technologies: String(proj?.technologies || '').trim(),
        })).filter(p => p.name)
      : [],
    skills,
    // keep these for gemini prompt compatibility if ever added later
    experience: obj.experience ?? '',
    education: obj.education ?? '',
    languages: Array.isArray(obj.languages) ? obj.languages : obj.languages ? [obj.languages] : [],
    certifications: Array.isArray(obj.certifications) ? obj.certifications : obj.certifications ? [obj.certifications] : [],
    courses: Array.isArray(obj.courses) ? obj.courses.map(String) : [],
    awards: Array.isArray(obj.awards) ? obj.awards.map(String) : [],
    publications: Array.isArray(obj.publications) ? obj.publications.map(String) : [],
    interests: Array.isArray(obj.interests) ? obj.interests.map(String) : [],
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  };
};

export const useProfile = (user) => {
  const uid = user?.uid;
  const [profile, setProfileState] = useState(() => normalizeProfile(loadLocal(uid) || {}));
  const [syncStatus, setSyncStatus] = useState('idle');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      const local = loadLocal(null) || {};
      setProfileState(normalizeProfile(local));
      setSyncStatus('idle');
      initializedRef.current = false;
      return;
    }

    // Prime state from local cache for instant UI.
    const local = loadLocal(uid);
    if (local) setProfileState(normalizeProfile(local));

    const ref = doc(db, 'users', uid, 'profile', 'main');
    setSyncStatus('syncing');
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        const fromCloud = snap.exists() ? normalizeProfile(snap.data()) : null;
        const localNow = loadLocal(uid);
        const localNorm = localNow ? normalizeProfile(localNow) : null;

        // Cloud-first if it exists; fallback to local cache.
        const next = fromCloud || localNorm || normalizeProfile({});
        saveLocal(uid, next);
        setProfileState(next);
        setSyncStatus('synced');

        // If cloud missing but we have local data, seed it once after first server-backed read.
        const canSeed = !snap.metadata.fromCache && !snap.metadata.hasPendingWrites;
        if (!initializedRef.current && canSeed) {
          initializedRef.current = true;
          if (!snap.exists() && localNorm) {
            try {
              await setDoc(ref, { ...localNorm, updatedAt: Date.now() }, { merge: true });
            } catch (e) {
              console.warn('useProfile: initial seed failed', e);
              setSyncStatus('error');
            }
          }
        }
      },
      (err) => {
        console.error('useProfile sync error:', err);
        setSyncStatus('error');
      }
    );

    return () => unsub();
  }, [uid]);

  const saveProfile = useCallback(
    async (patch) => {
      const next = normalizeProfile({ ...profile, ...(patch || {}), updatedAt: Date.now() });
      setProfileState(next);
      saveLocal(uid, next);

      if (!uid) return;
      try {
        await setDoc(doc(db, 'users', uid, 'profile', 'main'), next, { merge: true });
        setSyncStatus('synced');
      } catch (e) {
        console.warn('useProfile: save failed', e);
        setSyncStatus('error');
      }
    },
    [uid, profile]
  );

  return { profile, setProfile: saveProfile, profileSyncStatus: uid ? syncStatus : 'idle' };
};

