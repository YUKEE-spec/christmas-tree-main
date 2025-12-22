import React, { useRef } from 'react';

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
}

// 照片配置面板组件
export const PhotoConfigPanel: React.FC<PhotoConfigPanelProps> = ({ 
  config, 
  onChange, 
  isOpen, 
  onToggle 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (updates: Partial<PhotoConfig>) => {
    onChange({ ...config, ...updates });
  };

  // 处理照片上传
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    console.log('Uploading files:', files.length);
    
    const newPhotos: string[] = [];
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      console.log('Created blob URL:', url);
      newPhotos.push(url);
    });
    
    // 合并新照片到现有列表
    const updatedPhotos = [...config.customPhotos, ...newPhotos];
    console.log('Total photos after upload:', updatedPhotos.length);
    
    onChange({ 
      ...config,
      customPhotos: updatedPhotos,
      enabled: true,
      uploadSuccess: true
    });

    // 上传成功后自动关闭上传面板，但不重置照片
    setTimeout(() => {
      onToggle();
    }, 1500);
    
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
        onClick={onToggle}
        style={{
          padding: '10px 16px',
          backgroundColor: config.enabled ? 'rgba(255,182,193,0.15)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${config.enabled ? '#FFB6C1' : '#444'}`,
          color: config.enabled ? '#FFB6C1' : '#666',
          fontFamily: 'sans-serif',
          fontSize: '11px',
          fontWeight: '500',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
          letterSpacing: '1px'
        }}
      >
        照片 {config.customPhotos.length > 0 ? `(${config.customPhotos.length})` : ''}
      </button>

      {isOpen && (
        <div style={{
          padding: '15px',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '200px',
          position: 'relative'
        }}>
          {/* 关闭按钮 */}
          <button
            onClick={() => {
              onToggle();
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              padding: 0,
              backgroundColor: 'transparent',
              border: 'none',
              color: config.uploadSuccess ? '#90EE90' : '#666',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.3s ease'
            }}
            title={config.uploadSuccess ? '上传成功，点击关闭' : '关闭'}
          >
            {config.uploadSuccess ? '✓' : '×'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingRight: '20px' }}>
            <span style={{ color: config.uploadSuccess ? '#90EE90' : '#FFB6C1', fontSize: '12px', fontWeight: 'bold' }}>
              {config.uploadSuccess ? '✓ 上传成功！' : '上传照片'}
            </span>
            <button
              onClick={() => updateConfig({ enabled: !config.enabled })}
              style={{
                padding: '4px 8px',
                backgroundColor: config.enabled ? '#FFB6C1' : 'transparent',
                border: '1px solid #FFB6C1',
                color: config.enabled ? '#000' : '#FFB6C1',
                fontSize: '9px',
                cursor: 'pointer',
                borderRadius: '4px',
                letterSpacing: '1px'
              }}
            >
              {config.enabled ? '显示' : '隐藏'}
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
            onClick={() => fileInputRef.current?.click()}
            disabled={config.uploadSuccess}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: config.uploadSuccess ? 'rgba(144,238,144,0.15)' : 'rgba(255,255,255,0.05)',
              border: config.uploadSuccess ? '1px solid #90EE90' : '1px dashed #555',
              color: config.uploadSuccess ? '#90EE90' : '#888',
              fontSize: '11px',
              cursor: config.uploadSuccess ? 'default' : 'pointer',
              borderRadius: '6px',
              marginBottom: '10px',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
          >
            {config.uploadSuccess ? '✓ 照片已添加到圣诞树' : '+ 上传照片'}
          </button>
          
          <p style={{ color: '#555', fontSize: '9px', margin: '0 0 10px 0' }}>
            {config.uploadSuccess 
              ? `✨ ${config.customPhotos.length} 张照片已装饰到圣诞树上` 
              : `${config.customPhotos.length} 已上传 · 50 个位置`
            }
          </p>
          
          {config.uploadSuccess && (
            <p style={{ 
              color: '#90EE90', 
              fontSize: '8px', 
              margin: '0 0 10px 0', 
              textAlign: 'center',
              opacity: 0.8
            }}>
              面板将自动关闭，请欣赏您的圣诞树 🎄
            </p>
          )}
          
          {/* 照片预览 */}
          {config.customPhotos.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {config.customPhotos.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={url}
                    alt={`照片 ${i + 1}`}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: '2px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '14px',
                      height: '14px',
                      padding: 0,
                      backgroundColor: '#333',
                      border: 'none',
                      borderRadius: '50%',
                      color: '#888',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {config.customPhotos.length > 0 && (
            <button
              onClick={clearAllPhotos}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '10px',
                backgroundColor: 'transparent',
                border: '1px solid #444',
                color: '#666',
                fontSize: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                letterSpacing: '1px'
              }}
            >
              清空全部
            </button>
          )}
        </div>
      )}
    </>
  );
};