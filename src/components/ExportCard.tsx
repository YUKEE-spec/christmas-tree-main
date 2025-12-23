import React, { useState, useRef, useCallback } from 'react';
import GIF from 'gif.js';
import { TechIcon } from './icons/TechIcons';

interface ExportCardProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  treeColor: string;
  particleText: string;
}

// 字体选项接口
interface FontOption {
  name: string;
  family: string;
  label: string; // 显示在按钮上的名字
}

// 字体配置
const FONT_OPTIONS: FontOption[] = [
  { name: 'inter', family: '"Inter", sans-serif', label: '现代黑体 (Inter)' },
  { name: 'bodoni-moda', family: '"Bodoni Moda", serif', label: '时尚宋体' },
  { name: 'dancing-script', family: '"Dancing Script", cursive', label: '舞蹈手写' },
  { name: 'ma-shan-zheng', family: '"Ma Shan Zheng", cursive', label: '马善政' },
  { name: 'zhi-mang-xing', family: '"Zhi Mang Xing", cursive', label: '志莽行书' },
  { name: 'long-cang', family: '"Long Cang", cursive', label: '龙苍' },
];

export const ExportCard: React.FC<ExportCardProps> = ({ canvasRef, treeColor, particleText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'image' | 'gif'>('image');
  const [greeting, setGreeting] = useState('Merry Christmas');
  const [fromName, setFromName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [greetingColor, setGreetingColor] = useState('#FFFFFF');

  // 字体选择状态
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]);

  const recordingRef = useRef(false);
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  // 获取 canvas 元素
  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    if (canvasRef && canvasRef.current) return canvasRef.current;
    return document.querySelector('canvas');
  }, [canvasRef]);

  // 截取当前画面
  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const canvas = getCanvas();
    if (!canvas) {
      console.error("Canvas not found");
      return null;
    }
    try {
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = canvas.width;
      frameCanvas.height = canvas.height;
      const ctx = frameCanvas.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, 0);
      return frameCanvas;
    } catch (e) {
      console.error("Capture frame failed", e);
      return null;
    }
  }, [getCanvas]);

  // 绘制装饰性雪花
  const drawSnowflake = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#89CFF0'; // Baby Blue
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // 简单的六角雪花
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, radius);
      ctx.moveTo(0, radius * 0.5);
      ctx.lineTo(radius * 0.3, radius * 0.7);
      ctx.moveTo(0, radius * 0.5);
      ctx.lineTo(-radius * 0.3, radius * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  };

  // 创建贺卡 Canvas（午夜蓝梦幻版）
  const createCardCanvas = useCallback((frameCanvas: HTMLCanvasElement, forGif: boolean = false): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      document.fonts.ready.then(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // 统一尺寸比例 3:4 (竖向明信片)
        const scale = forGif ? 1 : 2;
        const w = 900 * scale;
        const h = 1200 * scale;

        canvas.width = w;
        canvas.height = h;

        // 1. 背景：午夜蓝深邃渐变
        // 顶部黑色过渡到底部深蓝
        const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
        bgGradient.addColorStop(0, '#020b1c'); // Deep Dark Blue/Black
        bgGradient.addColorStop(1, '#0c2e4e'); // Midnight Blue
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, w, h);

        // 2. 绘制模糊的蓝色光晕（模拟图二顶部的光）
        const glowGradient = ctx.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w * 0.6);
        glowGradient.addColorStop(0, 'rgba(66, 170, 255, 0.15)'); // Swiss Blue
        glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, w, h);

        // 3. 装饰雪花
        // 随机种子在很多次重绘时不便，这里固定绘制几个位置作为装饰
        drawSnowflake(ctx, w * 0.1, h * 0.1, 40 * scale, 0.4);
        drawSnowflake(ctx, w * 0.9, h * 0.15, 30 * scale, 0.3);
        drawSnowflake(ctx, w * 0.85, h * 0.05, 20 * scale, 0.2);
        drawSnowflake(ctx, w * 0.05, h * 0.2, 15 * scale, 0.3);

        drawSnowflake(ctx, w * 0.9, h * 0.8, 35 * scale, 0.2);
        drawSnowflake(ctx, w * 0.1, h * 0.9, 25 * scale, 0.3);

        // 4. 圣诞树区域 - 放大主角！
        const imgAspect = frameCanvas.width / frameCanvas.height;
        // 增加宽度占比到 95% (原 85%)，高度占比到 65% (原 55%)
        const maxTreeW = w * 0.95;
        const maxTreeH = h * 0.65;

        let targetW = maxTreeW;
        let targetH = targetW / imgAspect;

        if (targetH > maxTreeH) {
          targetH = maxTreeH;
          targetW = targetH * imgAspect;
        }

        const drawX = (w - targetW) / 2;
        // 向下移动一点，给顶部大字留空间
        const drawY = h * 0.28 + (maxTreeH - targetH) / 2;

        // 树底部添加一点发光托底
        ctx.save();
        ctx.shadowColor = '#44AAFF';
        ctx.shadowBlur = 50;
        ctx.drawImage(frameCanvas, 0, 0, frameCanvas.width, frameCanvas.height, drawX, drawY, targetW, targetH);
        ctx.restore();

        // 5. 大标题 "Merry Christmas" (花体烫金风格)
        // 使用 Dancing Script 或 Great Vibes
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const titleY = h * 0.15;

        ctx.save();
        ctx.font = `700 ${96 * scale}px "Great Vibes", cursive`; // 更大，更华丽

        // 创建烫金渐变
        const goldGradient = ctx.createLinearGradient(w / 2 - 200, titleY - 50, w / 2 + 200, titleY + 50);
        goldGradient.addColorStop(0, '#BF953F'); // Dark Gold
        goldGradient.addColorStop(0.25, '#FCF6BA'); // Light Gold
        goldGradient.addColorStop(0.5, '#B38728'); // Medium Gold
        goldGradient.addColorStop(0.75, '#FBF5B7'); // Light Gold
        goldGradient.addColorStop(1, '#AA771C'); // Dark Gold
        ctx.fillStyle = goldGradient;

        // 发光效果
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 15;

        ctx.fillText('Merry Christmas', w / 2, titleY);
        ctx.restore();

        // 6. 用户祝福语 Greeting
        const textYStart = drawY + targetH + (30 * scale);
        const fontSize = 32 * scale;
        ctx.font = `400 ${fontSize}px ${selectedFont.family}`;
        ctx.fillStyle = greetingColor;

        // 处理文字换行
        const lines = greeting.split('\n');
        const lineHeight = fontSize * 1.5;
        lines.forEach((line, index) => {
          ctx.fillText(line, w / 2, textYStart + index * lineHeight);
        });

        // 7. 粒子祝福水印
        if (particleText) {
          const ptY = textYStart + lines.length * lineHeight + (20 * scale);
          ctx.font = `600 ${20 * scale}px "Inter", sans-serif`;
          ctx.fillStyle = 'rgba(68, 170, 255, 0.8)';
          ctx.fillText(`✨ ${particleText} ✨`, w / 2, ptY);
        }

        // 8. 底部署名
        if (fromName) {
          const bottomY = h - (40 * scale);
          // 底部细线装饰
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(w * 0.3, bottomY - (30 * scale));
          ctx.lineTo(w * 0.7, bottomY - (30 * scale));
          ctx.stroke();

          ctx.font = `400 ${18 * scale}px "Inter", sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fillText(`Created by ${fromName}`, w / 2, bottomY);
        }

        resolve(canvas);
      });
    });
  }, [greeting, fromName, particleText, treeColor, selectedFont, greetingColor]);

  // 生成预览
  const handlePreview = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(10);
    // 强制关闭弹窗背景点击
    setTimeout(async () => {
      const frameCanvas = captureFrame();
      if (!frameCanvas) {
        setIsExporting(false);
        alert('获取画面失败，请确保页面加载完成');
        return;
      }
      setExportProgress(50);
      const cardCanvas = await createCardCanvas(frameCanvas, true);
      setExportProgress(100);
      const url = cardCanvas.toDataURL('image/png', 0.9);
      setPreviewUrl(url);
      setShowPreview(true);
      setIsExporting(false);
    }, 100);
  }, [captureFrame, createCardCanvas]);

  // 导出 GIF (简化版，复用逻辑)
  const exportGif = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    recordingRef.current = true;
    const frames: HTMLCanvasElement[] = [];
    const frameCount = isMobile ? 15 : 20;

    for (let i = 0; i < frameCount; i++) {
      if (!recordingRef.current) break;
      const frameCanvas = captureFrame();
      if (frameCanvas) {
        const cardCanvas = await createCardCanvas(frameCanvas, true);
        frames.push(cardCanvas);
      }
      setExportProgress(Math.round((i / frameCount) * 50));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    recordingRef.current = false;

    if (frames.length === 0) { setIsExporting(false); return; }

    const gif = new GIF({ workers: 2, quality: 10, width: frames[0].width, height: frames[0].height, workerScript: '/gif.worker.js' });
    frames.forEach(frame => gif.addFrame(frame, { delay: 100, copy: true }));
    gif.on('progress', (p: number) => setExportProgress(50 + Math.round(p * 50)));
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      if (isMobile) {
        setMobileImageUrl(url);
        setIsExporting(false);
        setExportDone(true);
      } else {
        const link = document.createElement('a');
        link.download = `midnight-christmas-${Date.now()}.gif`;
        link.href = url;
        link.click();
        setIsExporting(false);
        setIsOpen(false);
      }
    });
    gif.render();
  }, [captureFrame, createCardCanvas, isMobile]);

  const [exportDone, setExportDone] = useState(false);
  const [mobileImageUrl, setMobileImageUrl] = useState<string | null>(null);

  const confirmExport = useCallback(async () => {
    if (exportType === 'image') {
      setIsExporting(true);
      const frameCanvas = captureFrame();
      if (frameCanvas) {
        const cardCanvas = await createCardCanvas(frameCanvas, false); // High Res
        const dataUrl = cardCanvas.toDataURL('image/png', 1.0);
        if (isMobile) {
          setMobileImageUrl(dataUrl);
          setExportDone(true);
        } else {
          const link = document.createElement('a');
          link.download = `midnight-christmas-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          setIsOpen(false);
        }
      }
      setIsExporting(false);
    } else {
      exportGif();
    }
  }, [captureFrame, createCardCanvas, exportType, exportGif, isMobile]);

  // 移动端/桌面端统一弹窗布局
  const renderModal = () => (
    <div style={{
      position: 'fixed',
      top: isMobile ? 'auto' : '50%',
      bottom: isMobile ? '0' : 'auto',
      left: isMobile ? '0' : '50%',
      right: isMobile ? '0' : 'auto',
      transform: isMobile ? 'none' : 'translate(-50%, -50%)',
      width: isMobile ? '100vw' : 'auto',
      height: isMobile ? 'auto' : 'auto',
      zIndex: 2000,
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      {!isMobile && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: -1, pointerEvents: 'auto' }} onClick={() => !isExporting && setIsOpen(false)} />}

      <div className="tech-panel" style={{
        width: isMobile ? '100vw' : '450px',
        maxHeight: isMobile ? '80vh' : '85vh',
        padding: isMobile ? '20px' : '30px',
        borderRadius: isMobile ? '20px 20px 0 0' : '16px',
        overflowY: 'auto',
        pointerEvents: 'auto',
        background: '#0a0a12', // Darker background
        border: '1px solid #1a1a2e',
        boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.8)' : undefined
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ color: '#89CFF0', margin: 0, fontFamily: 'Orbitron', fontSize: 16, letterSpacing: 1 }}>MIDNIGHT CARD</h3>
          <span onClick={() => !isExporting && setIsOpen(false)} style={{ cursor: 'pointer' }}><TechIcon name="close" size={20} color="#89CFF0" /></span>
        </div>

        {showPreview && previewUrl ? (
          <div style={{ textAlign: 'center' }}>
            {exportDone ? (
              <>
                <p style={{ color: '#4caf50', marginBottom: 10 }}>🎉 生成成功</p>
                <img src={mobileImageUrl!} style={{ width: '80%', border: '2px solid #333', borderRadius: 4, marginBottom: 10 }} />
                <p style={{ fontSize: 12, color: '#666' }}>长按上方图片保存到相册</p>
                <button className="tech-btn" onClick={() => { setIsOpen(false); setExportDone(false); setShowPreview(false); }} style={{ width: '100%', marginTop: 10 }}>关闭</button>
              </>
            ) : (
              <>
                <img src={previewUrl} style={{ width: '80%', border: '2px solid #333', borderRadius: 4, marginBottom: 15 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="tech-btn" onClick={() => setShowPreview(false)} disabled={isExporting}>调整</button>
                  <button className="tech-btn purple" style={{ flex: 1 }} onClick={confirmExport} disabled={isExporting}>{isExporting ? '保存中...' : '保存到相册'}</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* 编辑表单 */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', color: '#666', fontSize: 10, marginBottom: 5 }}>字体风格</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f.name} onClick={() => setSelectedFont(f)}
                    className={`tech-btn ${selectedFont.name === f.name ? 'active' : ''}`}
                    style={{
                      fontSize: 10, padding: '6px 2px', fontFamily: f.family,
                      color: selectedFont.name === f.name ? '#fff' : '#888',
                      borderColor: selectedFont.name === f.name ? '#44AAFF' : '#333',
                      background: selectedFont.name === f.name ? 'rgba(68,170,255,0.2)' : 'transparent'
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', color: '#666', fontSize: 10, marginBottom: 5 }}>祝福语</label>
              <textarea value={greeting} onChange={e => setGreeting(e.target.value)}
                style={{ width: '100%', height: 60, background: '#111', border: '1px solid #333', color: '#fff', padding: 10, fontFamily: selectedFont.family }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', color: '#666', fontSize: 10, marginBottom: 5 }}>署名</label>
                <input type="text" value={fromName} onChange={e => setFromName(e.target.value)}
                  style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '8px' }}
                />
              </div>
              <div style={{ width: 60 }}>
                <label style={{ display: 'block', color: '#666', fontSize: 10, marginBottom: 5 }}>文字颜色</label>
                <input type="color" value={greetingColor} onChange={e => setGreetingColor(e.target.value)} style={{ width: '100%', height: 34, border: 'none', background: 'transparent' }} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 0, background: '#111', borderRadius: 4, padding: 2 }}>
                <button className={`tech-btn`} style={{ flex: 1, background: exportType === 'image' ? '#222' : 'transparent', border: 'none', color: exportType === 'image' ? '#fff' : '#666' }} onClick={() => setExportType('image')}>图片 (高清)</button>
                <button className={`tech-btn`} style={{ flex: 1, background: exportType === 'gif' ? '#222' : 'transparent', border: 'none', color: exportType === 'gif' ? '#fff' : '#666' }} onClick={() => setExportType('gif')}>GIF (动态)</button>
              </div>
            </div>

            <button className="tech-btn" style={{ width: '100%', padding: 12, background: 'linear-gradient(90deg, #1E88E5, #42A5F5)', border: 'none', color: '#fff', fontSize: 14 }}
              onClick={handlePreview} disabled={isExporting}>
              {isExporting ? `正在生成 ${exportProgress}%` : '生成贺卡预览'}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button className={`tech-btn ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(true)} style={{ padding: '8px 12px', fontSize: '12px' }}>
        <TechIcon name="download" size={16} />
        {!isMobile && " 导出贺卡"}
      </button>
      {isOpen && renderModal()}
    </>
  );
};
