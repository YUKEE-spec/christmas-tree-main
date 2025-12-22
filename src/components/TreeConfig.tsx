import React from 'react';

// 树颜色配置 - 使用更亮更鲜艳的颜色
export const TREE_COLOR_OPTIONS = [
  { name: '沙特绿', value: '#00CC66' },
  { name: '北满金', value: '#FFD700' },
  { name: '新加坡红', value: '#FF4466' },
  { name: '冠军紫', value: '#AA66FF' },
  { name: '银河银', value: '#E8E8E8' },
  { name: 'LV橙', value: '#FF9933' },
  { name: '瑞士蓝', value: '#44AAFF' },
  { name: '小豆包白', value: '#FFFFFF' },
  { name: '自定义', value: 'custom' },
];

// 树形状配置
export const TREE_SHAPE_OPTIONS = [
  { name: '经典锥形', value: 'cone' },
  { name: '螺旋塔', value: 'spiral' },
];

// 粒子数量配置
export const PARTICLE_OPTIONS = [
  { name: '轻量', value: 5000 },
  { name: '标准', value: 15000 },
  { name: '华丽', value: 30000 },
  { name: '极致', value: 50000 },
];

// 树配置接口
export interface TreeConfig {
  color: string;
  customColor: string;
  shape: string;
  particleCount: number;
}

// 默认树配置
export const DEFAULT_TREE_CONFIG: TreeConfig = {
  color: TREE_COLOR_OPTIONS[0].value, // 沙特绿
  customColor: '#006C35',
  shape: TREE_SHAPE_OPTIONS[0].value, // 经典锥形
  particleCount: PARTICLE_OPTIONS[3].value, // 极致
};

// 树配置面板Props
interface TreeConfigPanelProps {
  config: TreeConfig;
  onChange: (config: TreeConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// 树配置面板组件
export const TreeConfigPanel: React.FC<TreeConfigPanelProps> = ({ 
  config, 
  onChange, 
  isOpen, 
  onToggle 
}) => {
  const updateConfig = (updates: Partial<TreeConfig>) => {
    onChange({ ...config, ...updates });
  };

  const getActualColor = () => {
    return config.color === 'custom' ? config.customColor : config.color;
  };

  const currentColorName = TREE_COLOR_OPTIONS.find(c => c.value === config.color)?.name || '自定义';

  return (
    <div style={{ position: 'absolute', top: '70px', left: '40px', zIndex: 10 }}>
      <button
        onClick={onToggle}
        style={{
          padding: '10px 20px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          border: `2px solid ${getActualColor()}`,
          color: getActualColor(),
          fontFamily: 'sans-serif',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span style={{ 
          width: '16px', 
          height: '16px', 
          backgroundColor: getActualColor(), 
          borderRadius: '50%', 
          display: 'inline-block' 
        }}></span>
        {currentColorName}
      </button>
      
      {isOpen && (
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '12px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          minWidth: '220px'
        }}>
          {/* 颜色选择 */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#888', margin: '0 0 8px 0' }}>树颜色</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '15px' }}>
              {TREE_COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => { 
                    updateConfig({ color: color.value }); 
                    if (color.value !== 'custom') onToggle(); 
                  }}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: config.color === color.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${color.value === 'custom' ? config.customColor : color.value}`,
                    color: color.value === 'custom' ? config.customColor : color.value,
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: color.value === 'custom' ? config.customColor : color.value, 
                    borderRadius: '50%', 
                    display: 'inline-block', 
                    boxShadow: `0 0 8px ${color.value === 'custom' ? config.customColor : color.value}` 
                  }}></span>
                  {color.name}
                </button>
              ))}
            </div>
            
            {config.color === 'custom' && (
              <div>
                <p style={{ color: '#888', fontSize: '10px', margin: '0 0 8px 0' }}>自定义树颜色</p>
                <input
                  type="color"
                  value={config.customColor}
                  onChange={(e) => updateConfig({ customColor: e.target.value })}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                />
              </div>
            )}
          </div>

          {/* 形状选择 */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#888', margin: '0 0 8px 0' }}>树形状</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TREE_SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  onClick={() => updateConfig({ shape: shape.value })}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: config.shape === shape.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${config.shape === shape.value ? '#888' : '#333'}`,
                    color: config.shape === shape.value ? '#fff' : '#666',
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

          {/* 粒子数量 */}
          <div>
            <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#888', margin: '0 0 8px 0' }}>粒子数量</p>
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
    </div>
  );
};

// 获取实际颜色的辅助函数
export const getActualTreeColor = (config: TreeConfig): string => {
  return config.color === 'custom' ? config.customColor : config.color;
};