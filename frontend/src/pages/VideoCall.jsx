import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Settings, Shield, User, Activity, Monitor, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export default function VideoCall() {
  const { user, loading: authLoading } = useAuth();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [loading, setLoading] = useState(!!appointmentId);
  const [error, setError] = useState('');
  const [callState, setCallState] = useState('idle'); // idle | requesting | incoming | connecting | active | ended
  const [remoteStream, setRemoteStream] = useState(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const pendingOfferRef = useRef(null);

  useEffect(() => {
    if (!appointmentId || authLoading || !user) return;

    api.get(`/appointments/${appointmentId}`)
      .then(({ data }) => {
        setAppointment(data.appointment);
        const isDoctor = user.role === 'doctor';
        const peer = isDoctor ? data.appointment.patientId : data.appointment.doctorId;
        const id = peer?._id || peer;
        setPeerId(id);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to initialize session'))
      .finally(() => setLoading(false));
  }, [appointmentId, user, authLoading]);

  useEffect(() => {
    if (!peerId || !user) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(WS_URL, { auth: { token }, query: { authToken: token } });
    socketRef.current = s;

    s.on('video_call_request', ({ from }) => {
      if (from === peerId) setCallState('incoming');
    });
    s.on('video_call_accept', ({ from }) => {
      if (from === peerId) setCallState('connecting');
    });
    s.on('video_call_reject', () => {
      setCallState('ended');
    });
    s.on('webrtc_offer', async ({ from, offer }) => {
      if (from !== peerId) return;
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          s.emit('webrtc_answer', { to: peerId, answer: pcRef.current.localDescription });
        } catch (e) {
          console.error(e);
        }
      } else {
        pendingOfferRef.current = offer;
      }
    });
    s.on('webrtc_answer', async ({ from, answer }) => {
      if (from !== peerId || !pcRef.current) return;
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error(e);
      }
    });
    s.on('webrtc_ice_candidate', async ({ from, candidate }) => {
      if (from !== peerId || !pcRef.current) return;
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error(e);
      }
    });
    s.on('video_call_hangup', () => {
      setCallState('ended');
      setRemoteStream(null);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [peerId, user]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current && peerId)
        socketRef.current.emit('webrtc_ice_candidate', { to: peerId, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      setCallState('active');
    };
    pcRef.current = pc;
    return pc;
  };

  const startCall = async () => {
    if (!appointment) return;
    const appointmentDateTime = new Date(appointment.date);
    const [hours, minutes] = appointment.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const now = new Date();

    if (now < appointmentDateTime) {
      alert("Encryption protocol restricted: Consultation only available at scheduled epoch.");
      return;
    }
    if (!peerId || !socketRef.current) return;
    setCallState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const pc = createPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('video_call_request', { to: peerId });
      socketRef.current.emit('webrtc_offer', { to: peerId, offer: pc.localDescription });
      setCallState('connecting');
    } catch (e) {
      setError('Media interface initialization failed.');
      setCallState('idle');
    }
  };

  const acceptCall = async () => {
    if (!peerId || !socketRef.current) return;
    setCallState('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const pc = createPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      socketRef.current.emit('video_call_accept', { to: peerId });
      const offer = pendingOfferRef.current;
      if (offer) {
        pendingOfferRef.current = null;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit('webrtc_answer', { to: peerId, answer: pc.localDescription });
      }
    } catch (e) {
      setError('Media interface initialization failed.');
      setCallState('idle');
    }
  };

  const rejectCall = () => {
    if (socketRef.current && peerId) socketRef.current.emit('video_call_reject', { to: peerId });
    setCallState('idle');
  };

  const hangUp = () => {
    if (socketRef.current && peerId) socketRef.current.emit('video_call_hangup', { to: peerId });
    setCallState('ended');
    setRemoteStream(null);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
    }
  };

  const toggleMic = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-medical-bg p-6 flex flex-col items-center justify-center medical-grid">
        <Monitor className="text-medical-secondary opacity-30 mb-6" size={64} />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-medical-text opacity-30">No Active Stream</h2>
        <Link to="/appointments" className="btn-medical-outline mt-8 px-10">Return to Schedule</Link>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-medical-bg flex items-center justify-center medical-grid">
        <div className="flex flex-col items-center gap-4">
           <div className="h-12 w-12 border-4 border-medical-primary border-t-transparent rounded-full animate-spin shadow-medical-soft" />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-primary">Initializing Link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-medical-bg p-6 flex flex-col items-center justify-center text-center medical-grid">
        <div className="p-8 glass-card border-medical-border bg-white shadow-medical-card max-w-sm">
           <Shield className="text-red-500 mx-auto mb-6" size={48} />
           <h2 className="text-xl font-bold mb-2 uppercase tracking-tight text-medical-text">Access Fault</h2>
           <p className="text-medical-secondary text-xs mb-8 uppercase tracking-widest font-medium leading-loose">{error}</p>
           <Link to="/appointments" className="btn-medical-outline w-full py-4 font-bold">Return to Schedule</Link>
        </div>
      </div>
    );
  }

  const isDoctor = user?.role === 'doctor';

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text flex flex-col pt-20 medical-grid overflow-hidden">
      <Navbar backTo={true} />
      
      {/* Consultation Header */}
      <div className="max-w-7xl mx-auto w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border-b border-medical-border shadow-sm z-20">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-medical-soft border border-medical-primary/20 flex items-center justify-center text-medical-primary shadow-inner">
               <Activity size={20} className="animate-pulse" />
            </div>
            <div>
               <h2 className="text-sm font-bold tracking-tight uppercase text-medical-text">Telemedicine Portal</h2>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest">Current Subject</p>
               <p className="text-xs font-bold text-medical-text">{isDoctor ? appointment?.patientId?.name : appointment?.doctorId?.name}</p>
            </div>
            {callState === 'active' && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 animate-pulse transition-all shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                <span className="text-[9px] font-bold uppercase tracking-widest">Live Stream</span>
              </div>
            )}
         </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col lg:flex-row gap-8 items-stretch relative z-10 overflow-hidden">
        {/* Remote Video (Main) */}
        <div className="flex-1 relative glass-card border-medical-border rounded-[2.5rem] bg-slate-900 shadow-medical-card overflow-hidden group">
           <video
             ref={remoteVideoRef}
             autoPlay
             playsInline
             className="w-full h-full object-cover"
           />
           
           {!remoteStream && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 text-medical-secondary p-12 text-center backdrop-blur-sm">
                <div className="w-24 h-24 rounded-full bg-medical-soft flex items-center justify-center text-medical-primary border border-medical-primary/10 shadow-inner mb-6">
                   <User size={64} className="opacity-40" />
                </div>
                <h3 className="text-xl font-bold text-medical-text mb-2 uppercase tracking-wide">
                   {callState === 'idle' && (isDoctor ? 'Initialize ' : 'Waiting for Clinician...')}
                   {callState === 'incoming' && 'Inbound Stream Detected'}
                   {callState === 'requesting' && 'Establishing Connection...'}
                   {callState === 'connecting' && 'Syncing Bitstream...'}
                   {callState === 'ended' && 'Session Terminated'}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold max-w-xs leading-loose text-medical-secondary opacity-60">
                   {callState === 'idle' && isDoctor && 'Encryption ready. Click initialize to begin encrypted session.'}
                   {callState === 'idle' && !isDoctor && 'The secure link will activate when the clinician initiates session.'}
                   {callState === 'incoming' && 'Subject is requesting immediate encrypted uplink.'}
                   {callState === 'requesting' && 'Establishing multi-hop peer relay...'}
                   {callState === 'connecting' && 'Performing cryptographic handshake...'}
                   {callState === 'ended' && 'Connection dissolved. Manifest archived.'}
                </p>
             </div>
           )}

           {/* Remote Label */}
           <div className="absolute top-6 left-6 flex items-center gap-3">
              <div className="glass px-4 py-2 rounded-full border-white/30 text-[9px] font-bold uppercase tracking-widest backdrop-blur-xl bg-black/30 text-white shadow-lg">
                 Remote Host: {isDoctor ? 'Subject' : 'Clinician'}
              </div>
           </div>
        </div>

        {/* Sidebar Controls & Local Video */}
        <div className="lg:w-80 flex flex-col gap-8">
           {/* Local Video - Mirror */}
           <div className="relative glass-card border-medical-border rounded-[2rem] bg-slate-900 aspect-video lg:aspect-auto flex-1 overflow-hidden shadow-medical-card border-4  transition-all">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-4 left-4 glass px-3 py-1.5 rounded-xl border-white/30 text-[8px] font-bold uppercase tracking-widest bg-black/20 text-white backdrop-blur-md">
                 Primary Input (Local)
              </div>
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-medical-bg">
                   <VideoOff size={32} className="text-medical-secondary opacity-20" />
                </div>
              )}
           </div>

           {/* Toolbar */}
           <div className="glass-card border-medical-border p-8 space-y-8 bg-white shadow-medical-card rounded-[2rem]">
              <div className="flex flex-col gap-4"> 
                 <div className="flex justify-center gap-4">
                    <button 
                       onClick={toggleMic}
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-sm ${isMicOn ? 'bg-medical-soft border-medical-primary/20 text-medical-primary hover:bg-medical-primary/10' : 'bg-red-500 border-red-500 text-white shadow-red-200'}`}
                       title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                    >
                       {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>
                    <button 
                       onClick={toggleVideo}
                       className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-sm ${isVideoOn ? 'bg-medical-soft border-medical-primary/20 text-medical-primary hover:bg-medical-primary/10' : 'bg-red-500 border-red-500 text-white shadow-red-200'}`}
                       title={isVideoOn ? 'Deactivate Camera' : 'Activate Camera'}
                    >
                       {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-medical-soft border border-medical-primary/10 text-medical-secondary hover:bg-medical-soft/80 flex items-center justify-center transition-all shadow-sm">
                       <Settings size={20} />
                    </button>
                 </div>

                 <div className="pt-4">
                    {callState === 'idle' && isDoctor && (
                      <button
                        onClick={startCall}
                        className="w-full btn-medical-primary py-4 group shadow-md"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-xs">
                           <Activity size={18} /> Initialize
                        </span>
                      </button>
                    )}
                    {callState === 'incoming' && (
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={acceptCall} className="bg-medical-primary text-white rounded-xl py-4 font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-medical-soft shadow-md">Accept</button>
                         <button onClick={rejectCall} className="bg-red-500 text-white rounded-xl py-4 font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-md">Reject</button>
                      </div>
                    )}
                    {(callState === 'connecting' || callState === 'active') && (
                      <button 
                         onClick={hangUp} 
                         className="w-full bg-red-600 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-200 group transition-all"
                      >
                         <PhoneOff size={20} className="group-hover:rotate-12 transition-transform" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Dissolve Link</span>
                      </button>
                    )}
                    {(callState === 'ended' || (callState === 'idle' && !isDoctor)) && (
                      <Link 
                         to="/appointments" 
                         className="w-full btn-medical-outline py-4 text-center block rounded-xl font-bold transition-all shadow-sm"
                      >
                         <span className="text-[10px] font-bold uppercase tracking-widest">Return to Base</span>
                      </Link>
                    )}
                 </div>
              </div>

              <div className="pt-6 border-t border-medical-border text-center">
                 <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-medical-secondary opacity-40">MediConnect Telemedicine v2.0</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
