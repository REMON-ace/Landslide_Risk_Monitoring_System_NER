import React, { useState, useEffect } from 'react';
import { getPendingUsers, verifyUser } from '../../api/client';
import { X, ShieldCheck, Check, FileText, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function UserVerificationModal({ isOpen, onClose }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getPendingUsers();
      setPendingUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleVerify = async (userId) => {
    setVerifyingId(userId);
    try {
      await verifyUser(userId);
      setMessage(`User verified successfully!`);
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to verify user');
    } finally {
      setVerifyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0D0E10] border border-[#D9E2DE] dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#D9E2DE] dark:border-[#27272A] flex items-center justify-between bg-[#F5F7F6] dark:bg-[#141418]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF5F0] dark:bg-emerald-950/50 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Resident Verification Approvals</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Review residency proof documents & activate accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {message && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 text-xs text-[#2F855A] dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{message}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {pendingUsers.length} Pending Registration Request{pendingUsers.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-2.5 py-1 text-xs rounded-lg border border-[#D9E2DE] dark:border-[#27272A] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading pending user applications...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-[#D9E2DE] dark:border-[#27272A] rounded-xl p-6">
              <UserCheck className="w-10 h-10 mx-auto text-[#006B4F] dark:text-emerald-400 mb-2 opacity-60" />
              <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">All Registration Applications Reviewed</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                No unverified resident registrations awaiting approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-xl bg-[#F5F7F6] dark:bg-[#141418] border border-[#D9E2DE] dark:border-[#27272A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{u.username}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5F0] dark:bg-emerald-950/50 text-[#006B4F] dark:text-emerald-400 border border-[#006B4F]/20">
                        {u.district || 'East Khasi Hills'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                      <span>Applied: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recently'}</span>
                      {u.proof_path && (
                        <a
                          href={`http://localhost:8000${u.proof_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#006B4F] dark:text-emerald-400 hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Residency Proof</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerify(u.id)}
                    disabled={verifyingId === u.id}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#006B4F] hover:bg-[#00523C] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{verifyingId === u.id ? 'Approving...' : 'Approve & Verify'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#D9E2DE] dark:border-[#27272A] bg-[#F5F7F6] dark:bg-[#141418] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
