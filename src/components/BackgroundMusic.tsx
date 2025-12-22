import React, { useState, useRef, useEffect } from 'react';

interface BackgroundMusicProps {
  isMobile: boolean;
}

// 免费圣诞音乐 URL（可替换为自己的音乐文件）
const MUSIC_URL = '/music/christmas.mp3';

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ isMobile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 创建音频元素
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.log('音乐播放失败:', error);
      // 某些浏览器需要用户交互才能播放
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isMobile ? '60px' : '30px',
        left: isMobile ? '10px' : '40px',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      {/* 播放/暂停按钮 */}
      <button
        onClick={togglePlay}
        style={{
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
          transition: 'all 0.2s ease',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={() => !isMobile && setShowVolumeSlider(true)}
        onMouseLeave={() => !isMobile && setShowVolumeSlider(false)}
        title={isPlaying ? '暂停音乐' : '播放音乐'}
      >
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* 音量滑块（桌面端悬停显示） */}
      {!isMobile && showVolumeSlider && (
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '8px 12px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '80px',
              height: '4px',
              cursor: 'pointer',
              accentColor: '#FFD700',
            }}
          />
          <span style={{ color: '#888', fontSize: '10px', minWidth: '30px' }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* 移动端点击显示音量控制 */}
      {isMobile && isPlaying && (
        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          style={{
            padding: '6px 10px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: '1px solid #444',
            borderRadius: '4px',
            color: '#888',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          音量
        </button>
      )}

      {/* 移动端音量滑块 */}
      {isMobile && showVolumeSlider && (
        <div
          style={{
            position: 'absolute',
            bottom: '45px',
            left: '0',
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              width: '100px',
              height: '4px',
              cursor: 'pointer',
              accentColor: '#FFD700',
            }}
          />
          <p style={{ color: '#888', fontSize: '9px', margin: '5px 0 0 0', textAlign: 'center' }}>
            {Math.round(volume * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};
