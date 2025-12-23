import { useState, useCallback, useEffect, useRef } from 'react';
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
import { BackgroundMusic } from './components/BackgroundMusic';
import { TechIcon } from './components/icons/TechIcons';

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

  // Canvas 引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number>(0);
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

  // 获取所有照片列表
  const getAllPhotos = useCallback(() => {
    if (photoConfig.customPhotos.length > 0) {
      return photoConfig.customPhotos;
    }
    return [
      '/photos/top.jpg',
      ...Array.from({ length: 20 }, (_, i) => `/photos/${i + 1}.jpg`)
    ];
  }, [photoConfig.customPhotos]);

  // 处理照片点击预览
  const handlePhotoClick = (index: number) => {
    const photos = getAllPhotos();
    setPreviewPhotoIndex(index);
    setPreviewPhoto(photos[index] || photos[0]);
  };

  // 切换到上一张照片
  const handlePrevPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const photos = getAllPhotos();
    const newIndex = previewPhotoIndex > 0 ? previewPhotoIndex - 1 : photos.length - 1;
    setPreviewPhotoIndex(newIndex);
    setPreviewPhoto(photos[newIndex]);
  }, [previewPhotoIndex, getAllPhotos]);

  // 切换到下一张照片
  const handleNextPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const photos = getAllPhotos();
    const newIndex = previewPhotoIndex < photos.length - 1 ? previewPhotoIndex + 1 : 0;
    setPreviewPhotoIndex(newIndex);
    setPreviewPhoto(photos[newIndex]);
  }, [previewPhotoIndex, getAllPhotos]);

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
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* 3D 场景 */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, touchAction: 'none' }}>
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
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
          }}
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
        bottom: isMobile ? 'calc(90px + env(safe-area-inset-bottom, 0px))' : '30px',
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
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          left: 0,
          zIndex: 100,
          display: 'flex',
          gap: isMobile ? '4px' : '8px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: isMobile ? 'center' : 'flex-end',
          padding: isMobile ? '10px 10px calc(10px + env(safe-area-inset-bottom, 0px))' : '30px 40px',
          backgroundColor: isMobile ? 'rgba(0,0,0,0.8)' : 'transparent',
          backdropFilter: isMobile ? 'blur(4px)' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. 音乐开关 */}
        <BackgroundMusic isMobile={isMobile} inline={true} />

        {/* 2. 消失/点我 */}
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
          {sceneState === 'CHAOS' ? '点我聚成树' : '散开成星河'}
        </button>

        {/* 3. 进阶魔法 */}
        <button
          onClick={() => {
            const newEnabled = !gestureEnabled;
            setGestureEnabled(newEnabled);
            if (newEnabled) {
              setDecorations(prev => ({
                ...prev,
                showShine: false
              }));
              setAiStatus("请允许使用摄像头，正在加载...");
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
          {isMobile ? '魔法' : '进阶魔法'} {gestureEnabled ? '🪄' : ''}
        </button>

        {/* 4. 写祝福 */}
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

        {/* 5. 导出贺卡 */}
        <ExportCard
          canvasRef={canvasRef}
          treeColor={actualTreeColor}
          particleText={particleText}
        />

        {/* 桌面端额外按钮 */}
        {!isMobile && (
          <>
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
          </>
        )}
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
        <div className="tech-panel" style={{
          position: 'fixed',
          bottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom, 0px))' : '90px',
          right: isMobile ? '10px' : '40px',
          left: isMobile ? '10px' : 'auto',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 100,
          minWidth: isMobile ? 'auto' : '300px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <p style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--tech-cyan)', margin: 0 }}>写入祝福</p>
            <span onClick={() => setShowTextInput(false)} style={{ cursor: 'pointer', opacity: 0.8 }}>
              <TechIcon name="close" size={16} />
            </span>
          </div>

          <input
            type="text"
            value={particleText}
            onChange={(e) => setParticleText(e.target.value)}
            placeholder="输入祝福语..."
            maxLength={20}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--tech-cyan)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '16px',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '10px',
              textAlign: 'center'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              className="tech-btn"
              onClick={() => setParticleText('')}
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              清除
            </button>
            <button
              className="tech-btn purple"
              onClick={() => setShowTextInput(false)}
              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
            >
              确认发送
            </button>
          </div>
          <p style={{ fontSize: '9px', color: 'gray', margin: '10px 0 0 0', textAlign: 'center', fontFamily: 'monospace' }}>最多20字 // 支持多语言</p>
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
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          {/* 左箭头 */}
          <button
            onClick={handlePrevPhoto}
            style={{
              position: 'absolute',
              left: isMobile ? '10px' : '30px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: isMobile ? '40px' : '50px',
              height: isMobile ? '40px' : '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: isMobile ? '18px' : '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 1001,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ‹
          </button>

          {/* 照片 */}
          <img
            src={previewPhoto}
            alt="预览照片"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: isMobile ? '80vw' : '70vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 0 50px rgba(255,255,255,0.3)',
              cursor: 'default'
            }}
          />

          {/* 右箭头 */}
          <button
            onClick={handleNextPhoto}
            style={{
              position: 'absolute',
              right: isMobile ? '10px' : '30px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: isMobile ? '40px' : '50px',
              height: isMobile ? '40px' : '50px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: isMobile ? '18px' : '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 1001,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ›
          </button>

          {/* 关闭按钮 */}
          <button
            onClick={() => setPreviewPhoto(null)}
            style={{
              position: 'absolute',
              top: isMobile ? '15px' : '30px',
              right: isMobile ? '15px' : '30px',
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: isMobile ? '16px' : '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              zIndex: 1001,
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ✕
          </button>

          {/* 照片计数 */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '20px' : '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '12px' : '14px',
            fontFamily: 'sans-serif',
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            {previewPhotoIndex + 1} / {getAllPhotos().length}
          </div>
        </div>
      )}

      {/* 手势状态显示 */}
      {gestureEnabled && (
        <div style={{
          position: 'absolute',
          top: isMobile ? 'auto' : '30px',
          bottom: isMobile ? 'calc(80px + env(safe-area-inset-bottom, 0px))' : 'auto',
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