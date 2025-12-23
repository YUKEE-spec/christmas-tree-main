import React, { useState, useRef, useCallback } from 'react';
import GIF from 'gif.js';
import { TechIcon } from './icons/TechIcons';

interface ExportCardProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  treeColor: string;
  particleText: string;
}

export const ExportCard: React.FC<ExportCardProps> = ({ canvasRef, treeColor, particleText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'image' | 'gif'>('image');
  const [greeting, setGreeting] = useState('Merry Christmas\n& Happy New Year');
  const [fromName, setFromName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const recordingRef = useRef(false);

  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  // 获取 canvas 元素
  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    // 优先使用传入的 ref
    if (canvasRef && canvasRef.current) return canvasRef.current;
    // 降级: 查询 DOM
    const canvas = document.querySelector('canvas');
    return canvas;
  }, [canvasRef]);

  // 截取当前画面
  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const canvas = getCanvas();
    if (!canvas) {
      console.error("Canvas not found");
      return null;
    }

    try {
      // 创建一个新的 canvas 来复制当前帧
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = canvas.width;
      frameCanvas.height = canvas.height;
      const ctx = frameCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(canvas, 0, 0);
      }
      return frameCanvas;
    } catch (e) {
      console.error("Capture frame failed", e);
      return null;
    }
  }, [getCanvas]);

  // 创建贺卡 Canvas（用于 GIF 帧）- 白色烫金效果版
  const createCardCanvas = useCallback((frameCanvas: HTMLCanvasElement, forGif: boolean = false): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      // 动态加载字体确保渲染正确
      document.fonts.ready.then(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // GIF 用较小尺寸，图片用高分辨率
        const scale = forGif ? 1 : 2;
        const w = forGif ? 600 : 1080;
        const h = forGif ? 750 : 1350;
        canvas.width = w * scale;
        canvas.height = h * scale;
        ctx.scale(scale, scale);

        // 1. 背景：纯白 + 纸纹质感（模拟）
        ctx.fillStyle = '#FFFAF0'; // FloralWhite
        ctx.fillRect(0, 0, w, h);

        // 添加噪点纹理
        // ... (简略)

        // 2. 边框：烫金效果
        // 使用渐变模拟金色
        const goldGradient = ctx.createLinearGradient(0, 0, w, h);
        goldGradient.addColorStop(0, '#B8860B'); // DarkGoldenRod
        goldGradient.addColorStop(0.2, '#FFD700'); // Gold
        goldGradient.addColorStop(0.4, '#FFFFE0'); // LightYellow
        goldGradient.addColorStop(0.6, '#DAA520'); // GoldenRod
        goldGradient.addColorStop(0.8, '#FFD700');
        goldGradient.addColorStop(1, '#B8860B');

        const borderWidth = forGif ? 10 : 20;
        const innerMargin = forGif ? 15 : 30;

        // 外框
        ctx.lineWidth = 2;
        ctx.strokeStyle = goldGradient;
        ctx.strokeRect(borderWidth, borderWidth, w - borderWidth * 2, h - borderWidth * 2);

        // 内装饰框 (花纹角)
        ctx.lineWidth = 1;
        const cornerSize = 50;

        // 左上
        ctx.beginPath();
        ctx.moveTo(borderWidth + innerMargin, borderWidth + innerMargin + cornerSize);
        ctx.lineTo(borderWidth + innerMargin, borderWidth + innerMargin);
        ctx.lineTo(borderWidth + innerMargin + cornerSize, borderWidth + innerMargin);
        ctx.stroke();

        // 右上
        ctx.beginPath();
        ctx.moveTo(w - borderWidth - innerMargin - cornerSize, borderWidth + innerMargin);
        ctx.lineTo(w - borderWidth - innerMargin, borderWidth + innerMargin);
        ctx.lineTo(w - borderWidth - innerMargin, borderWidth + innerMargin + cornerSize);
        ctx.stroke();

        // 左下
        ctx.beginPath();
        ctx.moveTo(borderWidth + innerMargin, h - borderWidth - innerMargin - cornerSize);
        ctx.lineTo(borderWidth + innerMargin, h - borderWidth - innerMargin);
        ctx.lineTo(borderWidth + innerMargin + cornerSize, h - borderWidth - innerMargin);
        ctx.stroke();

        // 右下
        ctx.beginPath();
        ctx.moveTo(w - borderWidth - innerMargin - cornerSize, h - borderWidth - innerMargin);
        ctx.lineTo(w - borderWidth - innerMargin, h - borderWidth - innerMargin);
        ctx.lineTo(w - borderWidth - innerMargin, h - borderWidth - innerMargin - cornerSize);
        ctx.stroke();

        // 3. 顶部文字 (Logo/Title) - 烫金
        ctx.fillStyle = goldGradient;
        ctx.font = `400 ${forGif ? 24 : 40}px "Great Vibes", cursive`;
        ctx.textAlign = 'center';
        ctx.fillText('Magic Christmas', w / 2, forGif ? 60 : 100);

        // 4. 圣诞树区域 (圆形遮罩或柔和边缘)
        const treeY = forGif ? 80 : 140;
        const treeH = forGif ? 400 : 700;
        const treeW = w - (borderWidth + innerMargin) * 2;

        // 保存状态进行裁剪
        ctx.save();
        // 这里我们简单居中放置，可以是矩形
        // 为了融合白色背景，我们在树图周围加一个白色光晕
        // 计算绘制位置

        const imgAspect = frameCanvas.width / frameCanvas.height;
        // 目标区域
        const targetW = treeW;
        const targetH = treeW / imgAspect; // 保持比例

        const drawX = (w - targetW) / 2;
        const drawY = treeY + (treeH - targetH) / 2;

        // 绘制黑色背景以衬托树的粒子 (因为树是在黑背景下渲染的)
        // 或者使用 destination-over 技巧，但这里是在白纸上画
        // 最好的效果是保留树的黑底，然后做一个圆角矩形

        const radius = 20;
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, targetW, targetH, radius);
        ctx.clip();

        // 绘制树
        ctx.drawImage(frameCanvas, 0, 0, frameCanvas.width, frameCanvas.height, drawX, drawY, targetW, targetH);
        ctx.restore();

        // 给树加一个金边框
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, targetW, targetH, radius);
        ctx.lineWidth = 4;
        ctx.strokeStyle = goldGradient;
        ctx.stroke();

        // 5. 祝福语 (多行支持)
        const textYStart = drawY + targetH + (forGif ? 40 : 60);

        ctx.fillStyle = goldGradient; // 烫金字
        // 稍微加深一点阴影增加可读性
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 2;

        // 使用花体/手写体
        // 检测是否有中文字符
        const hasChinese = /[\u4e00-\u9fa5]/.test(greeting);
        const fontName = hasChinese ? '"Ma Shan Zheng", cursive' : '"Great Vibes", cursive';
        const fontSize = forGif ? 30 : 50;
        ctx.font = `400 ${fontSize}px ${fontName}`;

        const lines = greeting.split('\n');
        const lineHeight = fontSize * 1.5;

        lines.forEach((line, index) => {
          ctx.fillText(line, w / 2, textYStart + index * lineHeight);
        });

        ctx.shadowBlur = 0;

        // 6. 粒子文字 (如果有)
        if (particleText) {
          const ptY = textYStart + lines.length * lineHeight + (forGif ? 5 : 10);
          ctx.font = `400 ${forGif ? 16 : 24}px monospace`;
          ctx.fillStyle = '#555';
          ctx.fillText(`— ${particleText} —`, w / 2, ptY);
        }

        // 7. 署名
        if (fromName) {
          const fromY = h - (forGif ? 40 : 70);
          ctx.font = `400 ${forGif ? 18 : 32}px "Great Vibes", cursive`;
          ctx.fillStyle = '#B8860B';
          ctx.fillText(`By ${fromName}`, w / 2, fromY);
        }

        resolve(canvas);
      });
    });
  }, [greeting, fromName, particleText, treeColor]);

  // 生成预览
  const handlePreview = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(10);

    // 延时一小会确保 UI 渲染完成（防止菜单遮挡等，虽然是截取 canvas 这里其实不用担心 DOM）
    setTimeout(async () => {
      const frameCanvas = captureFrame();
      if (!frameCanvas) {
        setIsExporting(false);
        alert('获取画面失败，请确保页面加载完成');
        return;
      }

      setExportProgress(50);
      const cardCanvas = await createCardCanvas(frameCanvas, true); // 预览用低清

      setExportProgress(100);
      const url = cardCanvas.toDataURL('image/png', 0.8);
      setPreviewUrl(url);
      setShowPreview(true);
      setIsExporting(false);
    }, 100);
  }, [captureFrame, createCardCanvas]);

  // 导出 GIF (逻辑保持大致不变，更新样式)
  const exportGif = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    recordingRef.current = true;

    const frames: HTMLCanvasElement[] = [];
    const frameCount = isMobile ? 15 : 20;
    const frameDelay = 100;

    for (let i = 0; i < frameCount; i++) {
      if (!recordingRef.current) break;

      const frameCanvas = captureFrame();
      if (frameCanvas) {
        const cardCanvas = await createCardCanvas(frameCanvas, true);
        frames.push(cardCanvas);
      }

      setExportProgress(Math.round((i / frameCount) * 50));
      await new Promise(resolve => setTimeout(resolve, frameDelay));
    }

    recordingRef.current = false;

    if (frames.length === 0) {
      setIsExporting(false);
      return;
    }

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: frames[0].width,
      height: frames[0].height,
      workerScript: '/gif.worker.js'
    });

    frames.forEach((frame) => {
      gif.addFrame(frame, { delay: frameDelay, copy: true });
    });

    gif.on('progress', (p: number) => {
      setExportProgress(50 + Math.round(p * 50));
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      if (isMobile) {
        setMobileImageUrl(url);
        setIsExporting(false);
        setExportDone(true);
      } else {
        const link = document.createElement('a');
        link.download = `white-gold-christmas-${Date.now()}.gif`;
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
        const cardCanvas = await createCardCanvas(frameCanvas, false); // 高清
        const dataUrl = cardCanvas.toDataURL('image/png', 1.0);

        if (isMobile) {
          setMobileImageUrl(dataUrl);
          setExportDone(true);
        } else {
          const link = document.createElement('a');
          link.download = `white-gold-christmas-${Date.now()}.png`;
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

  return (
    <>
      <button
        className={`tech-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(true)}
        style={{ padding: '8px 12px', fontSize: '12px' }}
      >
        <TechIcon name="download" size={16} />
        {!isMobile && " EXPORT"}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 5, 10, 0.9)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => !isExporting && setIsOpen(false)}>

          <div className="tech-panel" style={{
            padding: '30px', borderRadius: '12px', width: isMobile ? '85vw' : '400px',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            <h3 style={{
              color: 'var(--tech-gold)', margin: '0 0 20px 0', textAlign: 'center',
              fontFamily: 'Orbitron, sans-serif', letterSpacing: '2px'
            }}>
              DATA EXPORT
            </h3>

            {/* 预览区域 */}
            {showPreview && previewUrl ? (
              <div style={{ textAlign: 'center' }}>
                {exportDone ? (
                  <>
                    <p style={{ color: '#4CAF50', marginBottom: 10 }}>generated successfully</p>
                    <img src={mobileImageUrl!} style={{ width: '100%', border: '1px solid var(--tech-gold)', marginBottom: 20 }} />
                    <p style={{ fontSize: 12, color: '#888' }}>Long press image to save</p>
                    <button className="tech-btn" onClick={() => { setIsOpen(false); setExportDone(false); setShowPreview(false); }} style={{ width: '100%' }}>CLOSE</button>
                  </>
                ) : (
                  <>
                    <img src={previewUrl} style={{ width: '100%', border: '1px solid var(--tech-gold)', marginBottom: 20 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="tech-btn" onClick={() => setShowPreview(false)} disabled={isExporting}>BACK</button>
                      <button className="tech-btn gold" onClick={confirmExport} disabled={isExporting}>
                        {isExporting ? 'SAVING...' : 'SAVE CARD'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* 表单区域 */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>BLESSING (MULTILINE)</label>
                  <textarea
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    style={{
                      width: '100%', height: 80, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--tech-cyan)', color: 'white', padding: 10,
                      fontFamily: 'Ma Shan Zheng, cursive'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>FROM</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--tech-cyan)', color: 'white', padding: 10
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>FORMAT</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className={`tech-btn ${exportType === 'image' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setExportType('image')}
                    >
                      PNG IMAGE
                    </button>
                    <button
                      className={`tech-btn ${exportType === 'gif' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setExportType('gif')}
                    >
                      GIF ANIMATION
                    </button>
                  </div>
                </div>

                <button
                  className="tech-btn purple"
                  style={{ width: '100%', padding: 15 }}
                  onClick={handlePreview}
                  disabled={isExporting}
                >
                  {isExporting ? `PROCESSING ${exportProgress}%` : 'PREVIEW CARD'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
