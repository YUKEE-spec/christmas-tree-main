import React from 'react';

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
    name: '大红礼盒',
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
    name: '圣诞铃铛',
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
  { name: '少量', value: 30 },
  { name: '适中', value: 60 },
  { name: '丰富', value: 100 },
  { name: '满载', value: 150 }
];

// 礼物分布模式
export const GIFT_DISTRIBUTION_OPTIONS = [
  { name: '螺旋分布', value: 'spiral' },
  { name: '随机分布', value: 'random' },
  { name: '层次分布', value: 'layered' },
  { name: '集中分布', value: 'clustered' }
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
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      maxHeight: '80vh',
      backgroundColor: 'rgba(0,0,0,0.95)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      padding: '20px',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: 'bold' }}>礼物配置</h3>
        <button
          onClick={onClose}
          style={{
            width: '24px',
            height: '24px',
            padding: 0,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>

      {/* 基础设置 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#ccc', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '1px' }}>基础设置</h4>
        
        {/* 启用开关 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#fff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
              style={{ 
                margin: 0,
                width: '16px',
                height: '16px',
                accentColor: '#D32F2F'
              }}
            />
            启用礼物显示
          </label>
        </div>
        
        {/* 数量选择 */}
        <div style={{ marginBottom: '12px', opacity: config.enabled ? 1 : 0.5 }}>
          <p style={{ color: '#888', fontSize: '10px', margin: '0 0 6px 0' }}>礼物数量</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {GIFT_COUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateConfig({ count: option.value })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: config.count === option.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${config.count === option.value ? '#888' : '#333'}`,
                  color: config.count === option.value ? '#fff' : '#888',
                  fontSize: '10px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {option.name} ({option.value})
              </button>
            ))}
          </div>
        </div>

        {/* 分布模式 */}
        <div style={{ marginBottom: '12px', opacity: config.enabled ? 1 : 0.5 }}>
          <p style={{ color: '#888', fontSize: '10px', margin: '0 0 6px 0' }}>分布模式</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {GIFT_DISTRIBUTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => updateConfig({ distribution: option.value })}
                style={{
                  padding: '6px 12px',
                  backgroundColor: config.distribution === option.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${config.distribution === option.value ? '#888' : '#333'}`,
                  color: config.distribution === option.value ? '#fff' : '#888',
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

        {/* 亮度调节 */}
        <div style={{ marginBottom: '12px', opacity: config.enabled ? 1 : 0.5 }}>
          <p style={{ color: '#888', fontSize: '10px', margin: '0 0 6px 0' }}>亮度调节</p>
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
              backgroundColor: '#333',
              borderRadius: '2px',
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#666', marginTop: '2px' }}>
            <span>暗淡</span>
            <span>{config.brightness.toFixed(1)}</span>
            <span>明亮</span>
          </div>
        </div>
      </div>

      {/* 礼物类型选择 */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: '#ccc', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '1px' }}>礼物类型</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '10px' }}>
          {GIFT_PRESETS.map((gift) => (
            <button
              key={gift.id}
              onClick={() => toggleGiftType(gift.id)}
              style={{
                padding: '8px',
                backgroundColor: config.selectedTypes.includes(gift.id) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${config.selectedTypes.includes(gift.id) ? gift.color : '#333'}`,
                color: config.selectedTypes.includes(gift.id) ? '#fff' : '#888',
                fontSize: '10px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                backgroundColor: gift.color,
                borderRadius: gift.shape === 'sphere' ? '50%' : '2px',
                display: 'inline-block'
              }}></span>
              {gift.name}
            </button>
          ))}
        </div>
        
        <button
          onClick={addCustomGift}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px dashed #666',
            color: '#888',
            fontSize: '10px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          + 添加自定义礼物
        </button>
      </div>

      {/* 自定义礼物编辑 */}
      {config.customTypes.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#ccc', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '1px' }}>自定义礼物</h4>
          {config.customTypes.map((gift, index) => (
            <div key={gift.id} style={{
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              marginBottom: '8px',
              border: '1px solid #333'
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
                <button
                  onClick={() => removeCustomGift(index)}
                  style={{
                    width: '16px',
                    height: '16px',
                    padding: 0,
                    backgroundColor: '#333',
                    border: 'none',
                    color: '#888',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '50%'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '9px' }}>
                <div>
                  <label style={{ color: '#888', display: 'block', marginBottom: '2px' }}>形状</label>
                  <select
                    value={gift.shape}
                    onChange={(e) => updateCustomGift(index, { shape: e.target.value as any })}
                    style={{
                      width: '100%',
                      backgroundColor: '#333',
                      border: '1px solid #555',
                      color: '#fff',
                      fontSize: '9px',
                      padding: '2px'
                    }}
                  >
                    <option value="box">盒子</option>
                    <option value="sphere">球体</option>
                    <option value="cylinder">圆柱</option>
                    <option value="star">星形</option>
                    <option value="heart">心形</option>
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
        <h4 style={{ color: '#ccc', fontSize: '12px', margin: '0 0 10px 0', letterSpacing: '1px' }}>动画效果</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {Object.entries(config.animation).map(([key, value]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#888' }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateConfig({
                  animation: { ...config.animation, [key]: e.target.checked }
                })}
                style={{ margin: 0 }}
              />
              {key === 'wobble' ? '摆动' : key === 'rotation' ? '旋转' : '浮动'}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};