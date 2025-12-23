import React from 'react';
import { TechIcon } from './icons/TechIcons';

// 礼物类型配置
export interface GiftType {
  id: string;
  name: string;
  shape: 'box' | 'sphere' | 'cylinder' | 'star' | 'heart';
  color: string;
  size: number;
  metalness: number;
  roughness: number;
  emissiveIntensity: number;
}

// 预设礼物类型
export const GIFT_PRESETS: GiftType[] = [
  {
    id: 'christmas-red-box',
    name: '红色礼盒',
    shape: 'box',
    color: '#DC143C',
    size: 0.9,
    metalness: 0.2,
    roughness: 0.3,
    emissiveIntensity: 0.3
  },
  {
    id: 'golden-gift-box',
    name: '金色礼盒',
    shape: 'box',
    color: '#FFD700',
    size: 0.8,
    metalness: 0.7,
    roughness: 0.1,
    emissiveIntensity: 0.4
  },
  {
    id: 'orange-gift-box',
    name: '橙色礼盒',
    shape: 'box',
    color: '#FF8C00',
    size: 0.85,
    metalness: 0.3,
    roughness: 0.2,
    emissiveIntensity: 0.35
  },
  {
    id: 'christmas-hat',
    name: '圣诞帽',
    shape: 'cylinder',
    color: '#DC143C',
    size: 0.7,
    metalness: 0.1,
    roughness: 0.8,
    emissiveIntensity: 0.2
  },
  {
    id: 'christmas-sock',
    name: '圣诞袜',
    shape: 'cylinder',
    color: '#228B22',
    size: 0.6,
    metalness: 0.1,
    roughness: 0.9,
    emissiveIntensity: 0.15
  },
  {
    id: 'gingerbread-man',
    name: '姜饼人',
    shape: 'star',
    color: '#D2691E',
    size: 0.75,
    metalness: 0.0,
    roughness: 0.7,
    emissiveIntensity: 0.25
  },
  {
    id: 'christmas-bell',
    name: '铃铛',
    shape: 'sphere',
    color: '#FFD700',
    size: 0.6,
    metalness: 0.9,
    roughness: 0.05,
    emissiveIntensity: 0.4
  },
  {
    id: 'candy-cane',
    name: '拐杖糖',
    shape: 'cylinder',
    color: '#FF0000',
    size: 0.8,
    metalness: 0.2,
    roughness: 0.4,
    emissiveIntensity: 0.3
  }
];

// 礼物数量选项
export const GIFT_COUNT_OPTIONS = [
  { name: '极简', value: 30 },
  { name: '适中', value: 60 },
  { name: '丰富', value: 100 },
  { name: '堆满', value: 150 }
];

// 礼物分布模式
export const GIFT_DISTRIBUTION_OPTIONS = [
  { name: '螺旋', value: 'spiral' },
  { name: '随机', value: 'random' },
  { name: '分层', value: 'layered' },
  { name: '聚簇', value: 'clustered' }
];

// 礼物配置接口
export interface GiftConfig {
  enabled: boolean;
  count: number;
  distribution: string;
  selectedTypes: string[]; // 选中的礼物类型ID
  customTypes: GiftType[]; // 自定义礼物类型
  brightness: number; // 整体亮度调节 0-2
  animation: {
    wobble: boolean;
    rotation: boolean;
    floating: boolean;
  };
}

// 默认礼物配置
export const DEFAULT_GIFT_CONFIG: GiftConfig = {
  enabled: true,
  count: 60,
  distribution: 'spiral',
  selectedTypes: ['christmas-red-box', 'golden-gift-box', 'orange-gift-box', 'christmas-hat', 'christmas-bell', 'gingerbread-man'],
  customTypes: [],
  brightness: 1.2,
  animation: {
    wobble: true,
    rotation: false,
    floating: true
  }
};

// 礼物配置组件Props
interface GiftConfigPanelProps {
  config: GiftConfig;
  onChange: (config: GiftConfig) => void;
  onClose: () => void;
}

// 礼物配置面板组件
export const GiftConfigPanel: React.FC<GiftConfigPanelProps> = ({ config, onChange, onClose }) => {
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  const updateConfig = (updates: Partial<GiftConfig>) => {
    onChange({ ...config, ...updates });
  };

  const toggleGiftType = (typeId: string) => {
    const newSelected = config.selectedTypes.includes(typeId)
      ? config.selectedTypes.filter(id => id !== typeId)
      : [...config.selectedTypes, typeId];
    updateConfig({ selectedTypes: newSelected });
  };

  const addCustomGift = () => {
    const newGift: GiftType = {
      id: `custom-${Date.now()}`,
      name: '自定义礼物',
      shape: 'box',
      color: '#FF0000',
      size: 0.8,
      metalness: 0.5,
      roughness: 0.3,
      emissiveIntensity: 0.3
    };
    updateConfig({
      customTypes: [...config.customTypes, newGift],
      selectedTypes: [...config.selectedTypes, newGift.id]
    });
  };

  const updateCustomGift = (index: number, updates: Partial<GiftType>) => {
    const newCustomTypes = [...config.customTypes];
    newCustomTypes[index] = { ...newCustomTypes[index], ...updates };
    updateConfig({ customTypes: newCustomTypes });
  };

  const removeCustomGift = (index: number) => {
    const giftId = config.customTypes[index].id;
    updateConfig({
      customTypes: config.customTypes.filter((_, i) => i !== index),
      selectedTypes: config.selectedTypes.filter(id => id !== giftId)
    });
  };

  return (
    <div style={{
      position: 'fixed',
      // 移动端：靠底部显示，留出操作空间
      // 桌面端：居中显示
      top: isMobile ? 'auto' : '50%',
      bottom: isMobile ? '0' : 'auto',
      left: isMobile ? '0' : '50%',
      right: isMobile ? '0' : 'auto',
      transform: isMobile ? 'none' : 'translate(-50%, -50%)',
      width: isMobile ? '100vw' : 'auto',
      height: isMobile ? 'auto' : 'auto',
      zIndex: 2000, // 确保在最上层
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      pointerEvents: 'none' // 让遮罩层不直接阻挡点击，内容层开启点击
    }}>
      {/* 遮罩背景 (仅桌面端需要，移动端不全屏遮挡) */}
      {!isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: -1, pointerEvents: 'auto'
        }} onClick={onClose}></div>
      )}

      <div className="tech-panel" style={{
        width: isMobile ? '100vw' : '500px',
        maxHeight: isMobile ? '70vh' : '80vh',
        padding: isMobile ? '20px' : '30px',
        borderRadius: isMobile ? '20px 20px 0 0' : '16px',
        overflowY: 'auto',
        borderBottom: isMobile ? 'none' : undefined,
        pointerEvents: 'auto', // 开启点击
        boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.8)' : undefined
      }} onClick={e => e.stopPropagation()}>

        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: 'var(--tech-cyan)', margin: 0, fontSize: '14px', letterSpacing: '2px', fontFamily: 'Orbitron' }}>礼物配置 (GIFT CONFIG)</h3>
          <span onClick={onClose} style={{ cursor: 'pointer', padding: '5px' }}>
            <TechIcon name="close" size={20} color="var(--tech-cyan)" />
          </span>
        </div>

        {/* 基础设置 */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <button
              className={`tech-btn ${config.enabled ? 'active' : ''}`}
              onClick={() => updateConfig({ enabled: !config.enabled })}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {config.enabled ? '已启用礼物挂载' : '礼物挂载已暂停'}
            </button>
          </div>

          {/* 数量选择 */}
          <div style={{ marginBottom: '15px', opacity: config.enabled ? 1 : 0.5 }}>
            <p style={{ color: 'var(--tech-cyan)', fontSize: '10px', margin: '0 0 8px 0', letterSpacing: '1px' }}>数量</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {GIFT_COUNT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`tech-btn ${config.count === option.value ? 'active' : ''}`}
                  onClick={() => updateConfig({ count: option.value })}
                  style={{ flex: 1, fontSize: '10px' }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* 分布模式 */}
          <div style={{ marginBottom: '15px', opacity: config.enabled ? 1 : 0.5 }}>
            <p style={{ color: 'var(--tech-cyan)', fontSize: '10px', margin: '0 0 8px 0', letterSpacing: '1px' }}>分布模式</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {GIFT_DISTRIBUTION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`tech-btn ${config.distribution === option.value ? 'active' : ''}`}
                  onClick={() => updateConfig({ distribution: option.value })}
                  style={{ flex: 1, fontSize: '10px' }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* 亮度调节 */}
          <div style={{ marginBottom: '15px', opacity: config.enabled ? 1 : 0.5 }}>
            <p style={{ color: 'var(--tech-cyan)', fontSize: '10px', margin: '0 0 8px 0', letterSpacing: '1px' }}>发光强度: {config.brightness.toFixed(1)}</p>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={config.brightness}
              onChange={(e) => updateConfig({ brightness: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                height: '4px',
                background: 'var(--tech-cyan)',
                borderRadius: '2px',
                outline: 'none',
                appearance: 'none',
                accentColor: 'var(--tech-cyan)'
              }}
            />
          </div>
        </div>

        {/* 礼物类型选择 */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: 'var(--tech-cyan)', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '2px', fontFamily: 'Orbitron' }}>挂载类型</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
            {GIFT_PRESETS.map((gift) => (
              <button
                key={gift.id}
                className={`tech-btn ${config.selectedTypes.includes(gift.id) ? 'active' : ''}`}
                onClick={() => toggleGiftType(gift.id)}
                style={{ fontSize: '10px', justifyContent: 'flex-start' }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: gift.color,
                  borderRadius: gift.shape === 'sphere' ? '50%' : '1px',
                  display: 'inline-block',
                  marginRight: '6px',
                  boxShadow: `0 0 5px ${gift.color}`
                }}></span>
                {gift.name}
              </button>
            ))}
          </div>

          <button
            className="tech-btn"
            onClick={addCustomGift}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <TechIcon name="plus" size={12} /> 添加自定义礼物
          </button>
        </div>

        {/* 自定义礼物编辑 */}
        {config.customTypes.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--tech-cyan)', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '2px' }}>自定义列表</h4>
            {config.customTypes.map((gift, index) => (
              <div key={gift.id} style={{
                padding: '10px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                marginBottom: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={gift.name}
                    onChange={(e) => updateCustomGift(index, { name: e.target.value })}
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #555',
                      color: '#fff',
                      fontSize: '10px',
                      padding: '4px 6px',
                      borderRadius: '3px',
                      width: '120px'
                    }}
                  />
                  <span onClick={() => removeCustomGift(index)} style={{ cursor: 'pointer', opacity: 0.8 }}>
                    <TechIcon name="close" size={14} color="#888" />
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '9px' }}>
                  <div>
                    <label style={{ color: '#888', display: 'block', marginBottom: '2px' }}>形状</label>
                    <select
                      value={gift.shape}
                      onChange={(e) => updateCustomGift(index, { shape: e.target.value as any })}
                      style={{
                        width: '100%',
                        backgroundColor: '#111',
                        border: '1px solid #555',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '2px'
                      }}
                    >
                      <option value="box">方块</option>
                      <option value="sphere">圆球</option>
                      <option value="cylinder">圆柱</option>
                      <option value="star">星星</option>
                      <option value="heart">爱心</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ color: '#888', display: 'block', marginBottom: '2px' }}>颜色</label>
                    <input
                      type="color"
                      value={gift.color}
                      onChange={(e) => updateCustomGift(index, { color: e.target.value })}
                      style={{
                        width: '100%',
                        height: '20px',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 动画设置 */}
        <div>
          <h4 style={{ color: 'var(--tech-cyan)', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '2px' }}>动态效果</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.animation.wobble}
                onChange={(e) => updateConfig({
                  animation: { ...config.animation, wobble: e.target.checked }
                })}
                style={{ margin: 0, accentColor: 'var(--tech-cyan)' }}
              />
              摇晃
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.animation.rotation}
                onChange={(e) => updateConfig({
                  animation: { ...config.animation, rotation: e.target.checked }
                })}
                style={{ margin: 0, accentColor: 'var(--tech-cyan)' }}
              />
              自转
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#ccc', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.animation.floating}
                onChange={(e) => updateConfig({
                  animation: { ...config.animation, floating: e.target.checked }
                })}
                style={{ margin: 0, accentColor: 'var(--tech-cyan)' }}
              />
              悬浮
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};