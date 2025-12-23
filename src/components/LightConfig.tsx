import React from 'react';
import { TechIcon } from './icons/TechIcons';

// 彩灯颜色预设
export const LIGHT_COLOR_PRESETS = [
  {
    name: '经典',
    colors: ['#FFD700', '#FFF8DC', '#C0C0C0', '#E6E6FA', '#F5F5DC', '#DCDCDC', '#FFFACD', '#D3D3D3']
  },
  {
    name: '暖金',
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', '#CD853F', '#DEB887', '#F4A460']
  },
  {
    name: '冷银',
    colors: ['#C0C0C0', '#A9A9A9', '#808080', '#D3D3D3', '#DCDCDC', '#E6E6FA', '#F0F8FF', '#F5F5F5']
  },
  {
    name: '彩虹',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FFFFFF']
  },
  {
    name: '温馨',
    colors: ['#FF6B6B', '#FFE66D', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500', '#FF7675', '#FDCB6E']
  },
  {
    name: '冰雪',
    colors: ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5']
  },
  {
    name: '自定义',
    colors: []
  }
];

// 彩灯配置接口
export interface LightConfig {
  enabled: boolean;
  presetIndex: number;
  customColors: string[];
}

// 默认彩灯配置
export const DEFAULT_LIGHT_CONFIG: LightConfig = {
  enabled: true,
  presetIndex: 0,
  customColors: [],
};

// 彩灯配置面板Props
interface LightConfigPanelProps {
  config: LightConfig;
  onChange: (config: LightConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// 彩灯配置面板组件
export const LightConfigPanel: React.FC<LightConfigPanelProps> = ({
  config,
  onChange,
  isOpen,
  onToggle
}) => {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  const updateConfig = (updates: Partial<LightConfig>) => {
    onChange({ ...config, ...updates });
  };

  // 统一移动端/桌面端弹窗逻辑
  const renderModal = () => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: isMobile ? 'auto' : '50%',
        bottom: isMobile ? '0' : 'auto',
        left: isMobile ? '0' : '50%',
        right: isMobile ? '0' : 'auto',
        transform: isMobile ? 'none' : 'translate(-50%, -50%)',
        width: isMobile ? '100vw' : 'auto',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        {/* 遮罩背景 */}
        {!isMobile && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: -1, pointerEvents: 'auto'
          }} onClick={onToggle}></div>
        )}

        <div className="tech-panel" style={{
          width: isMobile ? '100vw' : '220px',
          padding: isMobile ? '20px' : '20px',
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          maxHeight: isMobile ? '60vh' : 'auto',
          overflowY: 'auto',
          pointerEvents: 'auto',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.8)' : undefined
        }}>
          {/* 标题栏 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: 0 }}>灯光方案</p>
            <span onClick={onToggle} style={{ cursor: 'pointer', opacity: 0.8 }}>×</span>
          </div>

          {LIGHT_COLOR_PRESETS.map((preset, index) => (
            <button
              key={index}
              className={`tech-btn ${config.presetIndex === index ? 'active' : ''}`}
              onClick={() => {
                updateConfig({ presetIndex: index });
                if (index !== LIGHT_COLOR_PRESETS.length - 1) {
                  // onToggle(); // 保持打开以便预览
                }
              }}
              style={{
                width: '100%',
                marginBottom: '4px',
                fontSize: '10px',
                justifyContent: 'flex-start',
                padding: '8px'
              }}
            >
              <div style={{ display: 'flex', gap: '2px', marginRight: '8px' }}>
                {preset.colors.slice(0, 4).map((color, i) => (
                  <span
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      backgroundColor: color,
                      borderRadius: '50%',
                      display: 'inline-block',
                      boxShadow: `0 0 4px ${color}`
                    }}
                  />
                ))}
              </div>
              {preset.name}
            </button>
          ))}

          {config.presetIndex === LIGHT_COLOR_PRESETS.length - 1 && (
            <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <p style={{ color: '#888', fontSize: '10px', margin: '0 0 6px 0' }}>自定义配色 (最多8个)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {config.customColors.map((color, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...config.customColors];
                        newColors[index] = e.target.value;
                        updateConfig({ customColors: newColors });
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid #555',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'transparent',
                        overflow: 'hidden'
                      }}
                    />
                    <span
                      onClick={() => {
                        const newColors = config.customColors.filter((_, i) => i !== index);
                        updateConfig({ customColors: newColors });
                      }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#333',
                        borderRadius: '50%',
                        color: '#fff',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </span>
                  </div>
                ))}
                {config.customColors.length < 8 && (
                  <button
                    className="tech-btn"
                    onClick={() => updateConfig({
                      customColors: [...config.customColors, '#FFD700']
                    })}
                    style={{
                      width: '24px',
                      height: '24px',
                      padding: 0,
                      borderRadius: '50%',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        className={`tech-btn ${config.enabled ? 'active' : ''}`}
        onClick={() => updateConfig({ enabled: !config.enabled })}
        style={{ padding: '8px 12px', fontSize: '12px' }}
      >
        <TechIcon name="light" size={16} />
        {!isMobile && " 灯光"}
      </button>

      {config.enabled && (
        <button
          className="tech-btn"
          onClick={onToggle}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          <TechIcon name="settings" size={14} />
          {!isMobile && " 配色"}
        </button>
      )}

      {renderModal()}
    </>
  );
};

// 获取实际彩灯颜色的辅助函数
export const getActualLightColors = (config: LightConfig): string[] => {
  if (config.presetIndex === LIGHT_COLOR_PRESETS.length - 1) {
    return config.customColors.length > 0 ? config.customColors : LIGHT_COLOR_PRESETS[0].colors;
  }
  return LIGHT_COLOR_PRESETS[config.presetIndex].colors;
};