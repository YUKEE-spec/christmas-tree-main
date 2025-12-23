import React from 'react';
import { TechIcon } from './icons/TechIcons';

// 树形状配置
export const TREE_SHAPE_OPTIONS = [
  { name: 'CONE', value: 'cone' },
  { name: 'SPIRAL', value: 'spiral' },
];

// 粒子数量配置
export const PARTICLE_OPTIONS = [
  { name: 'LITE', value: 5000 },
  { name: 'STD', value: 10000 },
  { name: 'HIGH', value: 18000 },
  { name: 'ULTRA', value: 30000 },
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
  buttonLabel = 'SYSTEM'
}) => {
  const isMobile = detectMobile();
  const updateConfig = (updates: Partial<SettingsConfig>) => {
    onChange({ ...config, ...updates });
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

      {isOpen && (
        <div className="tech-panel" style={{
          position: 'absolute',
          top: isMobile ? '40px' : '0',
          left: isMobile ? '-150px' : '110%',
          width: '200px',
          padding: '15px',
          borderRadius: '12px',
          zIndex: 20
        }}>
          {/* 树形状选择 */}
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>GEOMETRY</p>
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
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: '0 0 10px 0' }}>PARTICLE COUNT</p>
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
    </>
  );
};