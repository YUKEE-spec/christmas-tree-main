import React from 'react';

// 树形状配置
export const TREE_SHAPE_OPTIONS = [
  { name: '经典锥形', value: 'cone' },
  { name: '螺旋塔', value: 'spiral' },
];

// 粒子数量配置
export const PARTICLE_OPTIONS = [
  { name: '轻量', value: 5000 },
  { name: '标准', value: 10000 },
  { name: '华丽', value: 18000 },
  { name: '极致', value: 30000 },
];

// 设置配置接口
export interface SettingsConfig {
  treeShape: string;
  particleCount: number;
}

// 默认设置配置
export const DEFAULT_SETTINGS_CONFIG: SettingsConfig = {
  treeShape: TREE_SHAPE_OPTIONS[1].value, // 螺旋塔
  particleCount: PARTICLE_OPTIONS[1].value, // 标准
};

// 设置配置面板Props
interface SettingsConfigPanelProps {
  config: SettingsConfig;
  onChange: (config: SettingsConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// 设置配置面板组件
export const SettingsConfigPanel: React.FC<SettingsConfigPanelProps> = ({ 
  config, 
  onChange, 
  isOpen, 
  onToggle 
}) => {
  const updateConfig = (updates: Partial<SettingsConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <>
      <button
        onClick={onToggle}
        style={{
          padding: '10px 16px',
          backgroundColor: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.6)',
          border: `1px solid ${isOpen ? '#888' : '#444'}`,
          color: isOpen ? '#fff' : '#666',
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
        设置
      </button>

      {isOpen && (
        <div style={{
          padding: '15px',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '200px'
        }}>
          {/* 树形状选择 */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', margin: '0 0 10px 0' }}>树形状</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {TREE_SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => updateConfig({ treeShape: shape.value })}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: config.treeShape === shape.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${config.treeShape === shape.value ? '#888' : '#333'}`,
                    color: config.treeShape === shape.value ? '#fff' : '#666',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 粒子数量选择 */}
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', margin: '0 0 10px 0' }}>粒子数量</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PARTICLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateConfig({ particleCount: option.value })}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: config.particleCount === option.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${config.particleCount === option.value ? '#888' : '#333'}`,
                    color: config.particleCount === option.value ? '#fff' : '#666',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};