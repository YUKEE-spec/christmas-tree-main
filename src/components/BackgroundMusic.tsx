import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BackgroundMusicProps {
  isMobile: boolean;
  inline?: boolean; // 是否作为内联按钮
}

const MUSIC_URL = '/music/christmas.mp3';

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isMobile, inline = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('音乐播放失败:', error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // 内联按钮样式（用于底部按钮栏）
  if (inline) {
    return (
      <button
        onClick={togglePlay}
        style={{
          padding: isMobile ? '8px 10px' : '10px 14px',
          backgroundColor: isPlaying ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${isPlaying ? '#FFD700' : '#444'}`,
          color: isPlaying ? '#FFD700' : '#666',
          fontFamily: 'sans-serif',
          fontSize: isMobile ? '9px' : '10px',
          fontWeight: '500',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          borderRadius: '6px',
          letterSpacing: '1px',
          WebkitTapHighlightColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {isPlaying ? '🔊' : '🔇'} 音乐
      </button>
    );
  }

  // 原有的浮动按钮样式
  return (
    <button
      onClick={togglePlay}
      style={{
        position: 'fixed',
        bottom: isMobile ? 'calc(70px + env(safe-area-inset-bottom, 0px))' : '30px',
        left: isMobile ? '10px' : '40px',
        zIndex: 20,
        width: isMobile ? '36px' : '40px',
        height: isMobile ? '36px' : '40px',
        borderRadius: '50%',
        backgroundColor: isPlaying ? 'rgba(255,215,0,0.2)' : 'rgba(0,0,0,0.6)',
        border: `1px solid ${isPlaying ? '#FFD700' : '#444'}`,
        color: isPlaying ? '#FFD700' : '#666',
        fontSize: isMobile ? '14px' : '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        WebkitTapHighlightColor: 'transparent',
      }}
      title={isPlaying ? '暂停音乐' : '播放音乐'}
    >
      {isPlaying ? '🔊' : '🔇'}
    </button>
  );
};
