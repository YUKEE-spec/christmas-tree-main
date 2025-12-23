import React from 'react';
import { TechIcon } from './icons/TechIcons';

// 树形状配置
export const TREE_SHAPE_OPTIONS = [
  { name: '经典锥形', value: 'cone' },
  { name: '螺旋塔', value: 'spiral' },
];

// 粒子数量配置
export const PARTICLE_OPTIONS = [
  { name: '节能', value: 5000 },
  { name: '标准', value: 10000 },
  { name: '高配', value: 18000 },
  { name: '极致', value: 30000 },
];

// 设置配置接口
export interface SettingsConfig {
  treeShape: string;
  particleCount: number;
}

// 检测移动设备的函数
const detectMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// 默认设置配置 - 根据设备自动选择
export const DEFAULT_SETTINGS_CONFIG: SettingsConfig = {
  treeShape: TREE_SHAPE_OPTIONS[0].value, // 经典锥形
  particleCount: detectMobile() ? PARTICLE_OPTIONS[0].value : PARTICLE_OPTIONS[3].value, // 移动端用轻量(5000)，桌面用极致
};

// 设置配置面板Props
interface SettingsConfigPanelProps {
  config: SettingsConfig;
  onChange: (config: SettingsConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
  buttonLabel?: string;
}

// 设置配置面板组件
export const SettingsConfigPanel: React.FC<SettingsConfigPanelProps> = ({
  config,
  onChange,
  isOpen,
  onToggle,
  buttonLabel = '系统设置'
}) => {
  const isMobile = detectMobile();
  const updateConfig = (updates: Partial<SettingsConfig>) => {
    onChange({ ...config, ...updates });
  };

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
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: 0 }}>系统设置</p>
            <span onClick={onToggle} style={{ cursor: 'pointer', opacity: 0.8 }}>×</span>
          </div>

          {/* 树形状选择 */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#888', margin: '0 0 10px 0' }}>几何形状</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {TREE_SHAPE_OPTIONS.map((shape) => (
                <button
                  key={shape.value}
                  className={`tech-btn ${config.treeShape === shape.value ? 'active' : ''}`}
                  onClick={() => updateConfig({ treeShape: shape.value })}
                  style={{ flex: 1, fontSize: '10px' }}
                >
                  {shape.name}
                </button>
              ))}
            </div>
          </div>

          {/* 粒子数量选择 */}
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#888', margin: '0 0 10px 0' }}>粒子总量</p>
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
      </div>
    );
  };

  return (
    <>
      <button
        className={`tech-btn ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        style={{ padding: '8px 12px', fontSize: '12px' }}
      >
        <TechIcon name="settings" size={16} />
        {!isMobile && ` ${buttonLabel}`}
      </button>
      {renderModal()}
    </>
  );
};