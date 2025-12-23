import React, { useRef } from 'react';
import { TechIcon } from './icons/TechIcons';

// 照片配置接口
export interface PhotoConfig {
  enabled: boolean;
  customPhotos: string[];
  uploadSuccess: boolean;
}

// 默认照片配置
export const DEFAULT_PHOTO_CONFIG: PhotoConfig = {
  enabled: true,  // 默认开启，这样上传后立即显示
  customPhotos: [],
  uploadSuccess: false,
};

// 照片配置面板Props
interface PhotoConfigPanelProps {
  config: PhotoConfig;
  onChange: (config: PhotoConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  buttonLabel?: string;
}

// 照片配置面板组件
export const PhotoConfigPanel: React.FC<PhotoConfigPanelProps> = ({
  config,
  onChange,
  isOpen,
  onToggle,
  buttonLabel = '照片墙'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  const updateConfig = (updates: Partial<PhotoConfig>) => {
    onChange({ ...config, ...updates });
  };

  // 处理照片上传
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      newPhotos.push(url);
    });

    // 合并新照片到现有列表
    const updatedPhotos = [...config.customPhotos, ...newPhotos];

    onChange({
      ...config,
      customPhotos: updatedPhotos,
      enabled: true,
      uploadSuccess: true
    });

    // 清空文件输入，允许重复上传相同文件
    e.target.value = '';
  };

  // 删除单张照片
  const removePhoto = (index: number) => {
    const newPhotos = [...config.customPhotos];
    URL.revokeObjectURL(newPhotos[index]); // 释放内存
    newPhotos.splice(index, 1);
    updateConfig({ customPhotos: newPhotos });
  };

  // 清空所有自定义照片
  const clearAllPhotos = () => {
    config.customPhotos.forEach(url => URL.revokeObjectURL(url));
    updateConfig({ customPhotos: [] });
  };

  return (
    <>
      <button
        className={`tech-btn ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        style={{ padding: '8px 12px', fontSize: '12px' }}
      >
        <TechIcon name="photo" size={16} />
        {!isMobile && (
          <>
            {" " + buttonLabel}
            {config.customPhotos.length > 0 && <span style={{ opacity: 0.7, marginLeft: '4px' }}>({config.customPhotos.length})</span>}
          </>
        )}
      </button>

      {isOpen && (
        <div className="tech-panel" style={{
          position: 'absolute',
          top: isMobile ? '40px' : '0',
          left: isMobile ? '-220px' : '110%',
          width: '240px',
          padding: '15px',
          borderRadius: '12px',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ color: 'var(--tech-cyan)', fontSize: '10px', letterSpacing: '2px' }}>
              记忆模块
            </span>
            <button
              className={`tech-btn ${config.enabled ? 'active' : ''}`}
              onClick={() => updateConfig({ enabled: !config.enabled })}
              style={{
                padding: '4px 8px',
                fontSize: '9px',
                height: 'auto'
              }}
            >
              <TechIcon name={config.enabled ? "check" : "close"} size={10} />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />

          <button
            className="tech-btn"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              justifyContent: 'center',
              marginBottom: '10px',
              borderStyle: 'dashed'
            }}
          >
            <TechIcon name="plus" size={12} /> 上传照片
          </button>

          <p style={{ color: '#555', fontSize: '9px', margin: '0 0 10px 0', textAlign: 'center' }}>
            {config.customPhotos.length} / 50 已用空间
          </p>

          {/* 照片预览 */}
          {config.customPhotos.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
              marginBottom: '10px'
            }}>
              {config.customPhotos.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <div
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#000',
                      border: '1px solid #333',
                      borderRadius: '50%',
                      color: '#fff',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    ×
                  </div>
                </div>
              ))}
            </div>
          )}

          {config.customPhotos.length > 0 && (
            <button
              className="tech-btn"
              onClick={clearAllPhotos}
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '10px',
                borderColor: '#442222',
                color: '#ff4444'
              }}
            >
              清空所有
            </button>
          )}
        </div>
      )}
    </>
  );
};