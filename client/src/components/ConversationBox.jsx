import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Database, ShieldAlert, Sparkles, User, Tag } from 'lucide-react';

export function ConversationBox({ incidentId, ticketNumber, isClosed }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState('');
  const [activityType, setActivityType] = useState('Comment');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchActivities = async () => {
    if (!incidentId) return;
    try {
      const res = await api.get(`/activities/incident/${incidentId}`);
      if (res.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.warn('Activity fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 6000);
    return () => clearInterval(interval);
  }, [incidentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newText.trim() || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await api.post('/activities', {
        incident_id: Number(incidentId),
        ticket_number: ticketNumber || `INC-${incidentId}`,
        activity_type: activityType,
        performed_by: user.name || user.email,
        description: newText.trim(),
        metadata: {
          role_name: user.role_name,
          role_id: user.role_id
        }
      });

      if (res.data?.activity) {
        setActivities((prev) => [res.data.activity, ...prev]);
        setNewText('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900 text-sm">Ticket Discussion & Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Database className="w-3 h-3 text-emerald-600" />
            MongoDB Chat Storage
          </span>
        </div>
      </div>

      {/* Activities Scroll Area (showing oldest to newest) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 flex flex-col-reverse">
        <div ref={messagesEndRef} />
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No activity or conversation messages yet. Post a comment below!
          </div>
        ) : (
          activities.map((act) => {
            const isMe = act.performed_by === (user.name || user.email);
            const isNote = act.activity_type === 'Internal Note';

            return (
              <div
                key={act._id}
                className={`flex flex-col ${isMe && !isNote ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{act.performed_by}</span>
                  <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">
                    {act.activity_type}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    isNote
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm'
                      : isMe
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{act.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Composer */}
      {isClosed ? (
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          This ticket is closed. Discussion thread is archived.
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200">
          {error && <div className="mb-2 text-xs text-rose-600">{error}</div>}

          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Type:</span>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none"
              >
                <option value="Comment">Public Comment</option>
                <option value="Status Update">Status Update</option>
                {user.role_id !== 1 && <option value="Internal Note">Internal Technician Note</option>}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <textarea
              rows="2"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Type your message, diagnostic note, or inquiry..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending || !newText.trim()}
              className="px-4 rounded-lg flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
