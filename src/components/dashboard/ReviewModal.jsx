// src/components/dashboard/ReviewModal.jsx
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ReviewModal = ({ onClose, user }) => {
  const [stars, setStars]     = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState('');
  const [role, setRole]       = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (stars === 0) { setError('Please select a rating'); return; }
    if (text.trim().length < 20) { setError('Please write at least 20 characters'); return; }

    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'reviews'), {
        uid:       user.uid,
        name:      user.displayName || 'Anonymous',
        avatar:    user.displayName?.[0]?.toUpperCase() || 'U',
        role:      role.trim() || '',
        text:      text.trim(),
        stars,
        approved:  false, // модерація — true щоб показати на лендінгу
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <h2 className="text-white font-bold text-sm">Leave a Review</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-4xl">🙏</div>
            <p className="text-white font-bold">Thank you for your review!</p>
            <p className="text-gray-500 text-sm">It will appear on the landing page after approval.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all">
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">

            {/* Stars */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setStars(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        n <= (hovered || stars)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Your Role / Position <span className="text-gray-700 normal-case font-normal">(optional)</span>
              </label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Product Manager → Google"
                className="w-full bg-[#1e293b] border border-[#334155] text-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Text */}
            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1.5">
                Your Review
              </label>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setError(''); }}
                rows={4}
                placeholder="Share your experience with AIletter..."
                className="w-full bg-[#1e293b] border border-[#334155] text-gray-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 transition-all resize-none"
              />
              <p className="text-xs text-gray-700 mt-1">{text.length} / 300 characters</p>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>

            <p className="text-xs text-gray-700 text-center">
              Reviews appear on the landing page after moderation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;