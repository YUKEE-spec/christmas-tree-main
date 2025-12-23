import React from 'react';

// 树颜色配置 - 使用更亮更鲜艳的颜色
export const TREE_COLOR_OPTIONS = [
  { name: '沙特绿', value: '#00CC66' }, // 沙特绿
  { name: '北满金', value: '#FFD700' }, // 北满金
  { name: '新加坡红', value: '#FF4466' }, // 新加坡红
  { name: '冠军紫', value: '#AA66FF' }, // 冠军紫
  { name: '银河银', value: '#E8E8E8' }, // 银河银
  { name: 'LV橙', value: '#FF9933' }, // LV橙
  { name: '瑞士蓝', value: '#44AAFF' }, // 瑞士蓝
  { name: '小豆包白', value: '#FFFFFF' }, // 小豆包白
  { name: '自定义', value: 'custom' },
];

// 树形状配置
export const TREE_SHAPE_OPTIONS = [
  { name: '经典锥形', value: 'cone' },
  { name: '螺旋塔', value: 'spiral' },
];

// 粒子数量配置
export const PARTICLE_OPTIONS = [
  { name: '节能', value: 5000 },
  { name: '标准', value: 15000 },
  { name: '高配', value: 30000 },
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
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  const updateConfig = (updates: Partial<TreeConfig>) => {
    onChange({ ...config, ...updates });
  };

  const getActualColor = () => {
    return config.color === 'custom' ? config.customColor : config.color;
  };

  const currentColorName = TREE_COLOR_OPTIONS.find(c => c.value === config.color)?.name || '自定义';

  return (
    <div style={{
      position: 'absolute',
      top: isMobile ? '10px' : '70px',
      left: isMobile ? '10px' : '40px',
      zIndex: 10
    }}>
      <button
        className="tech-btn"
        onClick={onToggle}
        style={{
          border: `1px solid ${getActualColor()}`,
          color: getActualColor(),
          textShadow: `0 0 5px ${getActualColor()}`,
          padding: isMobile ? '8px 12px' : '10px 20px',
        }}
      >
        <span style={{
          width: isMobile ? '8px' : '10px',
          height: isMobile ? '8px' : '10px',
          backgroundColor: getActualColor(),
          borderRadius: '50%',
          display: 'inline-block',
          boxShadow: `0 0 8px ${getActualColor()}`
        }}></span>
        {currentColorName}
      </button>

      {isOpen && (
        <div className="tech-panel" style={{
          marginTop: '10px',
          padding: isMobile ? '15px' : '20px',
          borderRadius: '12px',
          minWidth: isMobile ? '200px' : '250px',
          maxWidth: isMobile ? '85vw' : 'none',
          maxHeight: isMobile ? '60vh' : 'none',
          overflowY: isMobile ? 'auto' : 'visible'
        }}>
          {/* 颜色选择 */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>树影光谱</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '15px'
            }}>
              {TREE_COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  className={`tech-btn ${config.color === color.value ? 'active' : ''}`}
                  onClick={() => {
                    updateConfig({ color: color.value });
                    if (color.value !== 'custom') onToggle();
                  }}
                  style={{
                    fontSize: '10px',
                    borderColor: config.color === color.value ? color.value : 'rgba(255,255,255,0.1)',
                    justifyContent: 'flex-start'
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: color.value === 'custom' ? config.customColor : color.value,
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: `0 0 5px ${color.value === 'custom' ? config.customColor : color.value}`,
                    flexShrink: 0
                  }}></span>
                  {color.name}
                </button>
              ))}
            </div>

            {config.color === 'custom' && (
              <div>
                <p style={{ color: '#888', fontSize: '10px', margin: '0 0 8px 0' }}>选取颜色</p>
                <input
                  type="color"
                  value={config.customColor}
                  onChange={(e) => updateConfig({ customColor: e.target.value })}
                  style={{
                    width: '100%',
                    height: '30px',
                    border: '1px solid var(--tech-cyan)',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </div>

          {/* 形状选择 */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>树形结构</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TREE_SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  className={`tech-btn ${config.shape === shape.value ? 'active' : ''}`}
                  onClick={() => updateConfig({ shape: shape.value })}
                  style={{ flex: 1, fontSize: '10px' }}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>

          {/* 粒子数量 */}
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>粒子密度</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PARTICLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`tech-btn ${config.particleCount === option.value ? 'active' : ''}`}
                  onClick={() => updateConfig({ particleCount: option.value })}
                  style={{ fontSize: '10px' }}
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