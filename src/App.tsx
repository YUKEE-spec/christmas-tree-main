import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

// Import all modular components
import { TreeConfigPanel, DEFAULT_TREE_CONFIG, getActualTreeColor, TREE_COLOR_OPTIONS } from './components/TreeConfig';
import type { TreeConfig } from './components/TreeConfig';
import { LightConfigPanel, DEFAULT_LIGHT_CONFIG, getActualLightColors, LIGHT_COLOR_PRESETS } from './components/LightConfig';
import type { LightConfig } from './components/LightConfig';
import { PhotoConfigPanel, DEFAULT_PHOTO_CONFIG } from './components/PhotoConfig';
import type { PhotoConfig } from './components/PhotoConfig';
import { GiftConfigPanel, DEFAULT_GIFT_CONFIG } from './components/GiftConfig';
import type { GiftConfig } from './components/GiftConfig';
import { SettingsConfigPanel, DEFAULT_SETTINGS_CONFIG } from './components/SettingsConfig';
import type { SettingsConfig } from './components/SettingsConfig';
import { GestureController } from './components/GestureController';
import { Experience } from './components/Experience';
import { ExportCard } from './components/ExportCard';

// 装饰配置类型（合并星空、闪烁、星云为"闪耀"）
interface DecorationSettings {
  showGifts: boolean;
  showPhotos: boolean;
  showLights: boolean;
  showSnow: boolean;
  showShine: boolean; // 合并了 showStars, showSparkles, showGoldenNebula
}

// 主应用组件
export default function GrandTreeApp() {
  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 核心状态
  const [sceneState, setSceneState] = useState<'CHAOS' | 'FORMED'>('FORMED');
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [aiStatus, setAiStatus] = useState("手势控制已关闭");
  const [debugMode, setDebugMode] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [particleText, setParticleText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // 配置状态
  const [treeConfig, setTreeConfig] = useState<TreeConfig>(DEFAULT_TREE_CONFIG);
  const [lightConfig, setLightConfig] = useState<LightConfig>(DEFAULT_LIGHT_CONFIG);
  const [photoConfig, setPhotoConfig] = useState<PhotoConfig>(DEFAULT_PHOTO_CONFIG);
  const [giftConfig, setGiftConfig] = useState<GiftConfig>(DEFAULT_GIFT_CONFIG);
  const [settingsConfig, setSettingsConfig] = useState<SettingsConfig>(DEFAULT_SETTINGS_CONFIG);

  // UI 面板状态
  const [showTreeConfig, setShowTreeConfig] = useState(false);
  const [showLightConfig, setShowLightConfig] = useState(false);
  const [showPhotoConfig, setShowPhotoConfig] = useState(false);
  const [showGiftConfig, setShowGiftConfig] = useState(false);
  const [showSettingsConfig, setShowSettingsConfig] = useState(false);

  // 装饰开关状态（合并闪耀效果）
  const [decorations, setDecorations] = useState<DecorationSettings>({
    showGifts: giftConfig.enabled,
    showPhotos: photoConfig.enabled,
    showLights: lightConfig.enabled,
    showSnow: true,
    showShine: true // 合并了星空、闪烁、星云
  });

  // 为 Experience 组件转换装饰状态
  const experienceDecorations = {
    showGifts: decorations.showGifts,
    showPhotos: decorations.showPhotos,
    showLights: decorations.showLights,
    showSnow: decorations.showSnow,
    showStars: decorations.showShine,
    showSparkles: decorations.showShine,
    showGoldenNebula: decorations.showShine
  };

  // 同步配置状态到装饰状态
  useEffect(() => {
    setDecorations(prev => ({
      ...prev,
      showGifts: giftConfig.enabled,
      showPhotos: photoConfig.enabled,
      showLights: lightConfig.enabled
    }));
  }, [giftConfig.enabled, photoConfig.enabled, lightConfig.enabled]);

  // 处理照片点击预览
  const handlePhotoClick = (index: number) => {
    if (photoConfig.customPhotos.length > 0) {
      setPreviewPhoto(photoConfig.customPhotos[index]);
    } else {
      // 使用默认照片路径
      const defaultPhotos = [
        '/photos/top.jpg',
        ...Array.from({ length: 20 }, (_, i) => `/photos/${i + 1}.jpg`)
      ];
      setPreviewPhoto(defaultPhotos[index]);
    }
  };

  // 装饰切换
  const toggleDecoration = useCallback((key: keyof DecorationSettings) => {
    setDecorations(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 手势控制回调 - 切换礼物显示
  const handleToggleGifts = useCallback(() => {
    setDecorations(prev => ({ ...prev, showGifts: !prev.showGifts }));
  }, []);

  // 手势控制回调 - 切换照片显示
  const handleTogglePhotos = useCallback(() => {
    setDecorations(prev => ({ ...prev, showPhotos: !prev.showPhotos }));
  }, []);

  // 手势控制回调 - 切换调试模式
  const handleToggleDebug = useCallback(() => {
    setDebugMode(d => !d);
  }, []);

  // 手势控制回调 - 切换彩灯颜色方案
  const handleNextLightColor = useCallback(() => {
    const presetCount = LIGHT_COLOR_PRESETS.length - 1; // 排除自定义
    setLightConfig(prev => {
      const nextIndex = (prev.presetIndex + 1) % presetCount;
      return { ...prev, presetIndex: nextIndex };
    });
  }, []);

  // 手势控制回调 - 切换树颜色
  const handleNextColor = useCallback(() => {
    // 使用 TreeConfig 中的颜色选项，支持自定义颜色
    const colorOptions = TREE_COLOR_OPTIONS.filter(c => c.value !== 'custom');
    const colors = colorOptions.map(c => c.value);
    
    setTreeConfig(prev => {
      // 如果当前是自定义颜色，从第一个开始
      if (prev.color === 'custom') {
        return { ...prev, color: colors[0] };
      }
      const currentIndex = colors.indexOf(prev.color);
      const nextIndex = (currentIndex + 1) % colors.length;
      return { ...prev, color: colors[nextIndex] };
    });
  }, []);

  // 获取实际配置值
  const actualTreeColor = getActualTreeColor(treeConfig);
  const actualLightColors = getActualLightColors(lightConfig);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden', touchAction: 'none' }}>
      {/* 3D 场景 */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Canvas 
          dpr={isMobile ? [1, 1.5] : [1, 2]} 
          gl={{ 
            toneMapping: THREE.ACESFilmicToneMapping,
            alpha: true, 
            preserveDrawingBuffer: true,
            antialias: !isMobile,
            powerPreference: isMobile ? 'default' : 'high-performance',
            failIfMajorPerformanceCaveat: false,
            precision: isMobile ? 'mediump' : 'highp'
          }} 
          shadows={false}
          frameloop="always"
        >
          <Experience 
            sceneState={sceneState} 
            rotationSpeed={rotationSpeed} 
            treeColor={actualTreeColor} 
            decorations={experienceDecorations} 
            customPhotos={photoConfig.customPhotos} 
            onPhotoClick={handlePhotoClick} 
            particleCount={settingsConfig.particleCount} 
            treeShape={settingsConfig.treeShape} 
            lightColors={actualLightColors} 
            giftConfig={giftConfig}
            particleText={particleText}
            particleTextColor={actualTreeColor}
          />
        </Canvas>
      </div>

      {/* 手势控制器 */}
      {gestureEnabled && (
        <GestureController 
          onGesture={setSceneState} 
          onMove={setRotationSpeed} 
          onStatus={setAiStatus} 
          debugMode={debugMode}
          onToggleLights={handleNextLightColor}
          onToggleGifts={handleToggleGifts}
          onTogglePhotos={handleTogglePhotos}
          onNextColor={handleNextColor}
          onToggleDebug={handleToggleDebug}
        />
      )}

      {/* UI - 粒子数量显示 */}
      <div style={{ 
        position: 'absolute', 
        bottom: isMobile ? '80px' : '30px', 
        left: isMobile ? '15px' : '40px', 
        color: '#888', 
        zIndex: 10, 
        fontFamily: 'sans-serif', 
        userSelect: 'none' 
      }}>
        <div style={{ marginBottom: '15px' }}>
          <p style={{ fontSize: isMobile ? '8px' : '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.6 }}>粒子数量</p>
          <p style={{ fontSize: isMobile ? '18px' : '24px', color: actualTreeColor, fontWeight: 'bold', margin: 0 }}>
            {settingsConfig.particleCount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* UI - 树配置 */}
      <TreeConfigPanel 
        config={treeConfig}
        onChange={setTreeConfig}
        isOpen={showTreeConfig}
        onToggle={() => setShowTreeConfig(!showTreeConfig)}
      />

      {/* UI - 装饰控制面板 */}
      <div style={{ 
        position: 'absolute', 
        top: isMobile ? '10px' : '70px', 
        right: isMobile ? '10px' : '40px', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '6px' : '10px',
        maxHeight: isMobile ? '50vh' : 'auto',
        overflowY: isMobile ? 'auto' : 'visible'
      }}>
        {!isMobile && <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#666', margin: 0, marginBottom: '5px' }}>装饰控制</p>}
        
        {/* 1. 种树（设置配置） */}
        <SettingsConfigPanel 
          config={settingsConfig}
          onChange={setSettingsConfig}
          isOpen={showSettingsConfig}
          onToggle={() => setShowSettingsConfig(!showSettingsConfig)}
          buttonLabel="种树"
        />

        {/* 2. 点灯（彩灯配置） */}
        <LightConfigPanel 
          config={lightConfig}
          onChange={(config) => {
            setLightConfig(config);
            setDecorations(prev => ({ ...prev, showLights: config.enabled }));
          }}
          isOpen={showLightConfig}
          onToggle={() => setShowLightConfig(!showLightConfig)}
        />

        {/* 3. 挂礼物 */}
        <button
          onClick={() => setShowGiftConfig(!showGiftConfig)}
          style={{
            padding: '10px 16px',
            backgroundColor: giftConfig.enabled ? 'rgba(211,47,47,0.15)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${giftConfig.enabled ? '#D32F2F' : '#444'}`,
            color: giftConfig.enabled ? '#D32F2F' : '#666',
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
          挂礼物
        </button>

        {/* 4. 挂照片 */}
        <PhotoConfigPanel 
          config={photoConfig}
          onChange={(config) => {
            setPhotoConfig(config);
            setDecorations(prev => ({ ...prev, showPhotos: config.enabled }));
          }}
          isOpen={showPhotoConfig}
          onToggle={() => setShowPhotoConfig(!showPhotoConfig)}
          buttonLabel="挂照片"
        />

        {/* 5. 下雪 */}
        <button
          onClick={() => toggleDecoration('showSnow')}
          style={{
            padding: '10px 16px',
            backgroundColor: decorations.showSnow ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${decorations.showSnow ? '#FFFFFF' : '#444'}`,
            color: decorations.showSnow ? '#FFFFFF' : '#666',
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
          下雪
        </button>

        {/* 6. 闪耀 */}
        <button
          onClick={() => toggleDecoration('showShine')}
          style={{
            padding: '10px 16px',
            backgroundColor: decorations.showShine ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.6)',
            border: `1px solid ${decorations.showShine ? '#FFD700' : '#444'}`,
            color: decorations.showShine ? '#FFD700' : '#666',
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
          闪耀
        </button>
      </div>

      {/* UI - 控制按钮 */}
      <div style={{ 
        position: 'absolute', 
        bottom: isMobile ? '15px' : '30px', 
        right: isMobile ? '10px' : '40px', 
        left: isMobile ? '10px' : 'auto',
        zIndex: 10, 
        display: 'flex', 
        gap: isMobile ? '4px' : '8px',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'center' : 'flex-end'
      }}>
        <ExportCard 
          canvasRef={{ current: null }}
          treeColor={actualTreeColor}
          particleText={particleText}
        />
        <button 
          onClick={() => setShowTextInput(!showTextInput)}
          style={{ 
            padding: isMobile ? '8px 10px' : '10px 14px', 
            backgroundColor: particleText ? 'rgba(255,105,180,0.15)' : 'rgba(0,0,0,0.6)', 
            border: `1px solid ${particleText ? '#FF69B4' : '#444'}`, 
            color: particleText ? '#FF69B4' : '#666', 
            fontFamily: 'sans-serif', 
            fontSize: isMobile ? '9px' : '10px', 
            fontWeight: '500', 
            cursor: 'pointer', 
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            letterSpacing: '1px',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          写祝福 {particleText ? '💌' : ''}
        </button>
        {/* 手势控制 - 移动端和桌面端都可用 */}
        <button 
          onClick={() => {
            const newEnabled = !gestureEnabled;
            setGestureEnabled(newEnabled);
            if (newEnabled) {
              // 移动端开启手势时关闭部分特效以节省性能
              if (isMobile) {
                setDecorations(prev => ({
                  ...prev,
                  showShine: false
                }));
              } else {
                setDecorations(prev => ({
                  ...prev,
                  showShine: false
                }));
              }
              setAiStatus("正在加载魔法...");
            } else {
              setAiStatus("魔法控制已关闭");
            }
          }} 
          style={{ 
            padding: isMobile ? '8px 10px' : '10px 14px', 
            backgroundColor: gestureEnabled ? 'rgba(0,206,209,0.15)' : 'rgba(0,0,0,0.6)', 
            border: `1px solid ${gestureEnabled ? '#00CED1' : '#444'}`, 
            color: gestureEnabled ? '#00CED1' : '#666', 
            fontFamily: 'sans-serif', 
            fontSize: isMobile ? '9px' : '10px', 
            fontWeight: '500', 
            cursor: 'pointer', 
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            letterSpacing: '1px',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {isMobile ? '📷魔法' : '进阶魔法'} {gestureEnabled ? '🪄' : ''}
        </button>
        {!isMobile && (
          <button 
            onClick={() => setDebugMode(!debugMode)} 
            style={{ 
              padding: '10px 14px', 
              backgroundColor: debugMode ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.6)', 
              border: `1px solid ${debugMode ? '#FFD700' : '#444'}`, 
              color: debugMode ? '#FFD700' : '#666', 
              fontFamily: 'sans-serif', 
              fontSize: '10px', 
              fontWeight: '500', 
              cursor: 'pointer', 
              backdropFilter: 'blur(4px)',
              borderRadius: '6px',
              letterSpacing: '1px'
            }}
          >
            调试 {debugMode ? '🔧' : ''}
          </button>
        )}
        <button 
          onClick={() => setSceneState(s => s === 'CHAOS' ? 'FORMED' : 'CHAOS')} 
          style={{ 
            padding: isMobile ? '8px 16px' : '10px 24px', 
            backgroundColor: sceneState === 'FORMED' ? 'rgba(255,215,0,0.1)' : 'rgba(0,0,0,0.6)', 
            border: `1px solid ${sceneState === 'FORMED' ? 'rgba(255,215,0,0.6)' : 'rgba(255,215,0,0.3)'}`, 
            color: '#FFD700', 
            fontFamily: 'sans-serif', 
            fontSize: isMobile ? '10px' : '11px', 
            fontWeight: '600', 
            letterSpacing: '2px', 
            cursor: 'pointer', 
            backdropFilter: 'blur(4px)',
            borderRadius: '6px',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {sceneState === 'CHAOS' ? '🎄点我' : '🎄消失'}
        </button>
      </div>

      {/* 礼物配置模态框 */}
      {showGiftConfig && (
        <GiftConfigPanel 
          config={giftConfig}
          onChange={(config) => {
            setGiftConfig(config);
            setDecorations(prev => ({ ...prev, showGifts: config.enabled }));
          }}
          onClose={() => setShowGiftConfig(false)}
        />
      )}

      {/* 文字输入面板 */}
      {showTextInput && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '70px' : '80px',
          right: isMobile ? '10px' : '40px',
          left: isMobile ? '10px' : 'auto',
          backgroundColor: 'rgba(0,0,0,0.9)',
          padding: '15px',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 100,
          minWidth: isMobile ? 'auto' : '250px'
        }}>
          <p style={{ fontSize: '10px', letterSpacing: '1px', color: '#888', margin: '0 0 10px 0' }}>粒子文字</p>
          <input
            type="text"
            value={particleText}
            onChange={(e) => setParticleText(e.target.value)}
            placeholder="输入文字，如 Merry Christmas"
            maxLength={20}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={() => setParticleText('')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid #444',
                borderRadius: '4px',
                color: '#888',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              清除
            </button>
            <button
              onClick={() => setShowTextInput(false)}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'rgba(255,105,180,0.2)',
                border: '1px solid #FF69B4',
                borderRadius: '4px',
                color: '#FF69B4',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              确定
            </button>
          </div>
          <p style={{ fontSize: '9px', color: '#555', margin: '10px 0 0 0' }}>支持中英文，最多20字符</p>
        </div>
      )}

      {/* 照片预览模态框 */}
      {previewPhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <img 
            src={previewPhoto} 
            alt="预览照片" 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 0 50px rgba(255,255,255,0.3)'
            }}
          />
        </div>
      )}

      {/* 手势状态显示 */}
      {gestureEnabled && (
        <div style={{ 
          position: 'absolute', 
          top: isMobile ? 'auto' : '30px',
          bottom: isMobile ? '70px' : 'auto',
          left: isMobile ? '10px' : 'auto',
          right: isMobile ? '10px' : '40px', 
          color: '#00CED1', 
          fontSize: isMobile ? '10px' : '11px', 
          fontFamily: 'sans-serif', 
          zIndex: 10, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          padding: isMobile ? '6px 10px' : '8px 12px', 
          borderRadius: '6px', 
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(0,206,209,0.3)',
          letterSpacing: '1px',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          {aiStatus}
        </div>
      )}
    </div>
  );
}