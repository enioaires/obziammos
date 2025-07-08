import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsLoading(false);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audio.load();

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const newTime = (clickX / progressWidth) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (!audio) return;

    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="bg-dark-3 rounded-lg p-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-dark-4 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 bg-dark-4 rounded mb-1"></div>
            <div className="h-2 bg-dark-4 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-3 rounded-lg p-3 border border-dark-4">
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Barra de progresso no topo - Mobile First */}
      <div className="mb-3">
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-2 bg-dark-4 rounded-full cursor-pointer relative group"
        >
          <div
            className="h-full bg-primary-500 rounded-full relative transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        {/* Tempo - Mobile */}
        <div className="flex justify-between text-xs text-light-4 mt-1">
          <span className="tabular-nums">{formatTime(currentTime)}</span>
          <span className="tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controles principais - Mobile First */}
      <div className="flex items-center justify-between">
        {/* Controles de pulo e play */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
            className="w-8 h-8 p-0 hover:bg-dark-4"
          >
            <SkipBack className="w-3 h-3 text-light-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="w-10 h-10 p-0 bg-primary-500 hover:bg-primary-600 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            className="w-8 h-8 p-0 hover:bg-dark-4"
          >
            <SkipForward className="w-3 h-3 text-light-3" />
          </Button>
        </div>

        {/* Volume - Escondido no mobile, visível no desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="w-8 h-8 p-0 hover:bg-dark-4"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-light-3" />
            ) : (
              <Volume2 className="w-4 h-4 text-light-3" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-dark-4 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Status - Mobile */}
        <div className="flex items-center gap-1 sm:hidden">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs text-light-4">
            {isPlaying ? 'Play' : 'Pause'}
          </span>
        </div>
      </div>

      {/* Status desktop */}
      <div className="hidden sm:flex items-center justify-between text-xs text-light-4 mt-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span>{isPlaying ? 'Reproduzindo' : 'Pausado'}</span>
        </div>
        
        <span className="text-light-4">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #877EFF;
          cursor: pointer;
          border: 2px solid #1A1A1A;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #877EFF;
          cursor: pointer;
          border: 2px solid #1A1A1A;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;