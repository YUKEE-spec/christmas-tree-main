import React from 'react';
import { TechIcon } from './icons/TechIcons';

// 彩灯颜色预设
export const LIGHT_COLOR_PRESETS = [
  {
    name: 'CLASSIC',
    colors: ['#FFD700', '#FFF8DC', '#C0C0C0', '#E6E6FA', '#F5F5DC', '#DCDCDC', '#FFFACD', '#D3D3D3']
  },
  {
    name: 'WARM GOLD',
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', '#CD853F', '#DEB887', '#F4A460']
  },
  {
    name: 'COLD SILVER',
    colors: ['#C0C0C0', '#A9A9A9', '#808080', '#D3D3D3', '#DCDCDC', '#E6E6FA', '#F0F8FF', '#F5F5F5']
  },
  {
    name: 'RAINBOW',
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FFFFFF']
  },
  {
    name: 'COZY',
    colors: ['#FF6B6B', '#FFE66D', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500', '#FF7675', '#FDCB6E']
  },
  {
    name: 'FROST',
    colors: ['#FFFFFF', '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5']
  },
  {
    name: 'CUSTOM',
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

  return (
    <>
      <button
        className={`tech-btn ${config.enabled ? 'active' : ''}`}
        onClick={() => updateConfig({ enabled: !config.enabled })}
        style={{ padding: '8px 12px', fontSize: '12px' }}
      >
        <TechIcon name="light" size={16} />
        {!isMobile && " LIGHTS"}
      </button>

      {config.enabled && (
        <button
          className="tech-btn"
          onClick={onToggle}
          style={{ padding: '8px 12px', fontSize: '12px' }}
        >
          <TechIcon name="settings" size={14} />
          {!isMobile && " CONFIG"}
        </button>
      )}

      {isOpen && (
        <div className="tech-panel" style={{
          position: 'absolute',
          top: isMobile ? '40px' : '0',
          left: isMobile ? '-100px' : '110%',
          width: isMobile ? '200px' : '200px',
          padding: '15px',
          borderRadius: '12px',
          zIndex: 20
        }}>
          <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>LIGHT SCHEMES</p>
          {LIGHT_COLOR_PRESETS.map((preset, index) => (
            <button
              key={index}
              className={`tech-btn ${config.presetIndex === index ? 'active' : ''}`}
              onClick={() => {
                updateConfig({ presetIndex: index });
                if (index !== LIGHT_COLOR_PRESETS.length - 1) {
                  onToggle();
                }
              }}
              style={{
                width: '100%',
                marginBottom: '4px',
                fontSize: '10px',
                justifyContent: 'flex-start',
                padding: '6px'
              }}
            >
              <div style={{ display: 'flex', gap: '2px', marginRight: '5px' }}>
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
              <p style={{ color: '#888', fontSize: '10px', margin: '0 0 6px 0' }}>CUSTOM PALETTE (MAX 8)</p>
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
                        width: '20px',
                        height: '20px',
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
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#333',
                        borderRadius: '50%',
                        color: '#fff',
                        fontSize: '8px',
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
                      width: '20px',
                      height: '20px',
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
      )}
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