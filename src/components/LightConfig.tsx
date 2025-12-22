import React from 'react';

// 彩灯颜色预设
export const LIGHT_COLOR_PRESETS = [
  { 
    name: '经典金银', 
    colors: ['#FFD700', '#FFF8DC', '#C0C0C0', '#E6E6FA', '#F5F5DC', '#DCDCDC', '#FFFACD', '#D3D3D3']
  },
  { 
    name: '暖金色调', 
    colors: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', '#CD853F', '#DEB887', '#F4A460']
  },
  { 
    name: '冷银色调', 
    colors: ['#C0C0C0', '#A9A9A9', '#808080', '#D3D3D3', '#DCDCDC', '#E6E6FA', '#F0F8FF', '#F5F5F5']
  },
  { 
    name: '彩虹经典', 
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#FFFFFF']
  },
  { 
    name: '温暖色调', 
    colors: ['#FF6B6B', '#FFE66D', '#FF8E53', '#FF6B9D', '#C44569', '#F8B500', '#FF7675', '#FDCB6E']
  },
  { 
    name: '冰雪色调', 
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
  const updateConfig = (updates: Partial<LightConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <>
      <button
        onClick={() => updateConfig({ enabled: !config.enabled })}
        style={{
          padding: '10px 16px',
          backgroundColor: config.enabled ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${config.enabled ? '#FFD700' : '#444'}`,
          color: config.enabled ? '#FFD700' : '#666',
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
        点灯 {config.enabled ? '💡' : ''}
      </button>

      {config.enabled && (
        <button
          onClick={onToggle}
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            border: '1px solid #888',
            color: '#888',
            fontFamily: 'sans-serif',
            fontSize: '10px',
            fontWeight: '500',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            letterSpacing: '1px'
          }}
        >
          灯光配色
        </button>
      )}

      {isOpen && (
        <div style={{
          padding: '12px',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '180px'
        }}>
          <p style={{ fontSize: '9px', letterSpacing: '1px', color: '#888', margin: '0 0 8px 0' }}>灯光颜色方案</p>
          {LIGHT_COLOR_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                updateConfig({ presetIndex: index });
                if (index !== LIGHT_COLOR_PRESETS.length - 1) {
                  onToggle();
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: config.presetIndex === index ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${config.presetIndex === index ? '#888' : '#333'}`,
                color: config.presetIndex === index ? '#fff' : '#888',
                fontSize: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                {preset.colors.slice(0, 4).map((color, i) => (
                  <span
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: color,
                      borderRadius: '50%',
                      display: 'inline-block'
                    }}
                  />
                ))}
              </div>
              {preset.name}
            </button>
          ))}
          
          {config.presetIndex === LIGHT_COLOR_PRESETS.length - 1 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ color: '#888', fontSize: '9px', margin: '0 0 6px 0' }}>自定义颜色 (最多8个)</p>
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
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    />
                    <button
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
                        padding: 0,
                        backgroundColor: '#333',
                        border: 'none',
                        borderRadius: '50%',
                        color: '#888',
                        fontSize: '8px',
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
                {config.customColors.length < 8 && (
                  <button
                    onClick={() => updateConfig({ 
                      customColors: [...config.customColors, '#FFD700'] 
                    })}
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      border: '1px dashed #666',
                      borderRadius: '4px',
                      color: '#666',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
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