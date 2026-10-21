import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, 
  ShieldCheck, Radio, Sparkles, AlertCircle, Camera
} from 'lucide-react';

interface DropInVideoCallProps {
  onEndCall: () => void;
  patientName?: string;
  caregiverName?: string;
}

export const DropInVideoCall: React.FC<DropInVideoCallProps> = ({
  onEndCall,
  patientName = 'Eleanor Vance',
  caregiverName = 'Sarah Vance (Daughter)'
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number[]>(Array(12).fill(10));

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Call duration counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize WebRTC / MediaStream for real camera and microphone
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function setupMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia not supported in this browser environment');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });

        activeStream = stream;
        streamRef.current = stream;
        setHasWebcamAccess(true);
        setWebcamError(null);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup Web Audio API Analyzer for real-time microphone dancing waves
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function updateAudioBars() {
              analyser.getByteFrequencyData(dataArray);
              // Pick 12 frequency sample bands
              const levels: number[] = [];
              for (let i = 0; i < 12; i++) {
                const val = dataArray[i * 2] || 0;
                // Scale from 0-255 to percentage height 10% - 100%
                const pct = Math.max(10, Math.min(100, (val / 255) * 100));
                levels.push(pct);
              }
              setAudioLevel(levels);
              animationFrameRef.current = requestAnimationFrame(updateAudioBars);
            }
            updateAudioBars();
          }
        } catch (audioErr) {
          console.warn('Audio analyzer setup error:', audioErr);
        }
      } catch (err: any) {
        console.warn('Webcam/Mic access could not be acquired:', err.message);
        setHasWebcamAccess(false);
        setWebcamError(err.message || 'Camera permission denied or camera unavailable');
      }
    }

    setupMedia();

    return () => {
      // Clean up all hardware camera & mic streams when call ends
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Toggle Mute
  const handleToggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  // Toggle Video
  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    } else {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-[2.2rem] p-5 flex flex-col justify-between border-2 border-indigo-500/80 shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500 flex items-center justify-center shadow-lg">
            <Video className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Alexa Drop-In <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono animate-pulse">LIVE TWO-WAY WEBRTC</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Connected: {caregiverName} ↔ Living Room Echo Show 15
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-emerald-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {formatTime(callDuration)}
          </span>
        </div>
      </div>

      {/* Main Video Arena: Remote Sarah Feed + Live Webcam PiP */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 my-3 flex items-center justify-center">
        
        {/* Remote Feed: Sarah Vance (Daughter) */}
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&auto=format&fit=crop&q=80"
            alt="Sarah Vance Remote Video"
            className="w-full h-full object-cover brightness-95 contrast-105"
          />

          {/* Sarah Speaking Banner */}
          <div className="absolute bottom-3 left-3 max-w-md p-3 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="font-semibold text-indigo-300">Sarah Vance (Remote):</span>
              <span className="text-[10px] text-slate-400 font-mono">1080p WebRTC</span>
            </div>
            <p className="italic text-slate-200 text-[11px] leading-relaxed">
              "Mom! I received the high-impact alert on my phone! I can see your vitals on my portal and the front deadbolt is unlocked for EMTs. Please stay still, I'm right here!"
            </p>
          </div>
        </div>

        {/* PIP: Eleanor's Live Echo Show Webcam (Uses Real Browser Camera!) */}
        <div className="absolute top-3 right-3 w-44 sm:w-52 aspect-video rounded-xl overflow-hidden border-2 border-indigo-400/80 bg-slate-950 shadow-2xl transition-all">
          {hasWebcamAccess ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${!isVideoEnabled ? 'hidden' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900">
              <Camera className="w-5 h-5 text-slate-500 mb-1" />
              <span className="text-[10px] font-mono text-slate-400">Echo Cam Active</span>
              <span className="text-[9px] text-slate-500">{webcamError ? 'Webcam simulated' : 'Connecting cam...'}</span>
            </div>
          )}

          {!isVideoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-mono">
              <VideoOff className="w-5 h-5" />
            </div>
          )}

          {/* PiP Badge */}
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] text-slate-200 font-mono flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${hasWebcamAccess && isVideoEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{hasWebcamAccess ? 'Your Live Cam' : 'Echo Cam (Simulated)'}</span>
          </div>
        </div>

        {/* Real-Time Microphone Audio Spectrum Analyzer */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-300">Live Mic Input:</span>
          <div className="flex items-center gap-0.5 h-4">
            {audioLevel.map((lvl, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-gradient-to-t from-sky-500 to-indigo-400 transition-all duration-75"
                style={{ height: `${isMuted ? 10 : lvl}%` }}
              ></span>
            ))}
          </div>
        </div>
      </div>

      {/* Call Controls Bar */}
      <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted
                ? 'bg-amber-950 border-amber-700 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-amber-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          {/* Toggle Video Button */}
          <button
            onClick={handleToggleVideo}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              !isVideoEnabled
                ? 'bg-amber-950 border-amber-700 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title={isVideoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {!isVideoEnabled ? <VideoOff className="w-4 h-4 text-amber-400" /> : <Video className="w-4 h-4 text-indigo-400" />}
            <span className="hidden sm:inline">{!isVideoEnabled ? 'Camera Off' : 'Camera On'}</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 hidden md:inline ml-2">
            Protocol: <span className="text-sky-400">WebRTC Encrypted P2P</span>
          </span>
        </div>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Drop-In Call</span>
        </button>
      </div>
    </div>
  );
};
