import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { Stethoscope, Send, ChevronLeft, User, Search, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export default function Chat() {
  const { user } = useAuth();
  const { userId: paramUserId } = useParams();
  const location = useLocation();
  const peerFromState = location.state?.peer;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(WS_URL, { auth: { token }, query: { authToken: token } });
    socketRef.current = s;
    s.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    api.get('/messages/conversations')
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!paramUserId) return;
    const peer = conversations.find(c => c._id === paramUserId) || peerFromState;
    setSelectedPeer(peer);
  }, [paramUserId, conversations, peerFromState]);

  useEffect(() => {
    if (!selectedPeer) return;
    setLoadingMessages(true);
    api.get('/messages', { params: { with: selectedPeer._id } })
      .then(({ data }) => setMessages(data.messages || []))
      .finally(() => setLoadingMessages(false));
  }, [selectedPeer]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    socketRef.current.emit(
      'send_message',
      { to: selectedPeer._id, content: text },
      (res) => {
        if (res?.success) {
          setMessages(prev => [...prev, res.message]);
          setInput('');
        }
      }
    );
  };

  const isDoctor = user?.role === 'doctor';

  return (
    <div className="h-screen bg-medical-bg text-medical-text flex flex-col pt-20">
      <Navbar backTo={true} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-medical-border flex flex-col bg-white">
          <div className="p-6 border-b border-medical-border">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-medical-secondary group-focus-within:text-medical-primary transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="Search protocols..." 
                 className="w-full bg-medical-soft/50 border border-medical-border rounded-xl py-2 pl-10 pr-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm"
               />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.length === 0 && !loading && (
              <div className="p-10 text-center text-medical-secondary italic text-sm">No active channels.</div>
            )}
            {conversations.map(peer => (
              <Link
                key={peer._id}
                to={`/chat/${peer._id}`}
                className={`flex items-center gap-4 px-6 py-4 border-b border-medical-border transition-all relative group
                ${selectedPeer?._id === peer._id ? 'bg-medical-soft/40' : 'hover:bg-medical-soft/20'}`}
              >
                {selectedPeer?._id === peer._id && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-medical-primary shadow-medical-soft"></div>
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${selectedPeer?._id === peer._id ? 'bg-white border-medical-primary/30 text-medical-primary shadow-sm' : 'bg-medical-soft border-medical-border text-medical-secondary group-hover:border-medical-primary/20'}`}>
                  <User size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`font-bold text-sm truncate ${selectedPeer?._id === peer._id ? 'text-medical-text' : 'text-medical-secondary'}`}>{peer.name}</h4>
                  </div>
                  <p className="text-[10px] text-medical-secondary/60 truncate uppercase tracking-widest font-medium">{peer.email}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-medical-grid pb-4">
          {selectedPeer ? (
            <>
              {/* Chat Header */}
              <header className="px-8 py-5 border-b border-medical-border flex items-center justify-between bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-medical-soft border border-medical-primary/20 flex items-center justify-center text-medical-primary shadow-inner">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight text-medical-text">{selectedPeer.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-medical-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Protocol:</span>
                    <span className="text-[10px] font-bold text-medical-text px-2 py-0.5 rounded bg-medical-soft border border-medical-primary/10">AES-256-ENCRYPTED</span>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-medical-bg/20">
                {messages.length === 0 && !loadingMessages && (
                  <div className="h-full flex flex-col items-center justify-center text-medical-secondary/40 space-y-4">
                     <div className="p-6 bg-white rounded-full shadow-inner border border-medical-border">
                        <MessageSquare size={64} className="opacity-20" />
                     </div>
                     <p className="text-sm font-bold uppercase tracking-widest">Initializing Secure Stream...</p>
                  </div>
                )}
                {messages.map((m, idx) => {
                  const isMe = m.senderId === user._id || m.senderId?._id === user._id;
                  return (
                    <div key={m._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <div className="max-w-[70%]">
                         <div className={`px-5 py-3 rounded-2xl shadow-medical-card border ${isMe ? 'bg-medical-primary text-white rounded-br-none border-medical-primary shadow-glow-primary/20' : 'bg-white border-medical-border text-medical-text rounded-bl-none'}`}>
                            <p className="text-sm leading-relaxed font-medium">{m.content}</p>
                            <div className={`flex items-center gap-2 mt-2 text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-medical-secondary/50'}`}>
                               {format(new Date(m.createdAt), 'HH:mm')} 
                               {isMe && <span>/ SENT</span>}
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="px-8 pt-4">
                <div className="glass-card border-medical-border p-2 flex items-center gap-2 shadow-medical-card bg-white">
                   <input
                     value={input}
                     onChange={e => setInput(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && sendMessage()}
                     placeholder="Deploy message into stream..."
                     className="flex-1 bg-transparent border-none px-4 py-3 text-sm text-medical-text placeholder:text-medical-secondary/30 focus:ring-0 outline-none"
                   />
                   <button
                     onClick={sendMessage}
                     disabled={!input.trim()}
                     className="w-12 h-12 rounded-xl bg-medical-primary text-white flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-30 disabled:hover:brightness-100 shadow-medical-soft"
                   >
                     <Send size={20} />
                   </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
               <div className="w-24 h-24 rounded-3xl bg-white border border-medical-border flex items-center justify-center text-medical-secondary/20 mb-4 shadow-sm animate-pulse">
                  <Stethoscope size={48} />
               </div>
               <h2 className="text-2xl font-bold tracking-tight text-medical-text">Select a Communications Channel</h2>
               <p className="text-medical-secondary max-w-sm text-sm uppercase tracking-widest leading-loose font-medium">
                 Select a protocol from the manifest to initialize a secure healthcare communication stream.
               </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
