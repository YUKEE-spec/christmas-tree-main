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
  { name: 'bodoni-moda', family: '"Bodoni Moda", serif', label: 'Bodoni (时尚)' },
  { name: 'ma-shan-zheng', family: '"Ma Shan Zheng", cursive', label: '马善政' },
  { name: 'zhi-mang-xing', family: '"Zhi Mang Xing", cursive', label: '志莽行书' },
  { name: 'long-cang', family: '"Long Cang", cursive', label: '龙苍' },
  { name: 'great-vibes', family: '"Great Vibes", cursive', label: 'Great Vibes' },
  { name: 'parisienne', family: '"Parisienne", cursive', label: 'Parisienne' },
];

export const ExportCard: React.FC<ExportCardProps> = ({ canvasRef, treeColor, particleText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'image' | 'gif'>('image');
  const [greeting, setGreeting] = useState('Merry Christmas\n& Happy New Year');
  const [fromName, setFromName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // 字体选择状态
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONT_OPTIONS[0]);

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

  // 创建贺卡 Canvas（冠军红黑版）
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

        // 1. 背景：极致深黑
        ctx.fillStyle = '#050608';
        ctx.fillRect(0, 0, w, h);

        // 2. 边框：锐利红框 (不发光，强调线条感)
        const borderWidth = forGif ? 15 : 25;

        ctx.strokeStyle = '#D31120'; // Champion Red
        ctx.lineWidth = 2;
        ctx.strokeRect(borderWidth, borderWidth, w - borderWidth * 2, h - borderWidth * 2);

        // 3. 顶部大标题 (MAGAZINE STYLE)
        const titleY = forGif ? 100 : 160;
        ctx.textAlign = 'center';

        // 标题字体: Bodoni Moda, 巨大, 高对比度
        ctx.font = `700 ${forGif ? 56 : 96}px "Bodoni Moda", serif`;
        ctx.fillStyle = '#D31120'; // Red Title

        // 稍微错位一点做重影效果增加时尚感
        ctx.globalAlpha = 0.3;
        ctx.fillText('MOMENT', w / 2 + 3, titleY + 3);
        ctx.globalAlpha = 1.0;
        ctx.fillText('MOMENT', w / 2, titleY);

        // 副标题
        ctx.font = `500 ${forGif ? 12 : 18}px "Inter", sans-serif`;
        ctx.fillStyle = '#F0E68C'; // Champagne Gold
        ctx.letterSpacing = '4px';
        ctx.fillText('CHRISTMAS EDITION', w / 2, titleY - (forGif ? 50 : 80));
        ctx.letterSpacing = '0px'; // Reset


        // 4. 圣诞树区域 (方形裁切，像杂志内页插图)
        const treeY = forGif ? 130 : 220;
        const treeH = forGif ? 380 : 650;
        const treeW = w;

        const imgAspect = frameCanvas.width / frameCanvas.height;
        // 目标区域
        const targetW = treeW;
        const targetH = treeW / imgAspect;

        // 居中绘制
        const drawX = (w - targetW) / 2;
        const drawY = treeY + (treeH - targetH) / 2;

        ctx.drawImage(frameCanvas, 0, 0, frameCanvas.width, frameCanvas.height, drawX, drawY, targetW, targetH);


        // 5. 祝福语 (覆盖在图上或下方，视设计而定，这里放在下方，大字报风格)
        const textYStart = drawY + targetH + (forGif ? 40 : 60);

        // 使用选中的字体
        const fontSize = forGif ? 32 : 56;
        ctx.font = `400 ${fontSize}px ${selectedFont.family}`;

        // 文字样式：亮金/白
        ctx.fillStyle = '#ffffff';

        const lines = greeting.split('\n');
        const lineHeight = fontSize * 1.4;

        lines.forEach((line, index) => {
          ctx.fillText(line, w / 2, textYStart + index * lineHeight);
        });


        // 6. 粒子文字 (水印风格)
        if (particleText) {
          const ptY = textYStart + lines.length * lineHeight + (forGif ? 20 : 30);
          ctx.font = `700 ${forGif ? 24 : 40}px "Bodoni Moda", serif`;
          ctx.fillStyle = '#D31120'; // Red
          ctx.fillText(`${particleText.toUpperCase()}`, w / 2, ptY);
        }

        // 7. 署名 & 底部装饰
        const bottomY = h - (forGif ? 30 : 50);

        // 底部红线
        ctx.beginPath();
        ctx.moveTo(w / 2 - 50, bottomY - 30);
        ctx.lineTo(w / 2 + 50, bottomY - 30);
        ctx.strokeStyle = '#D31120';
        ctx.lineWidth = 3;
        ctx.stroke();

        if (fromName) {
          ctx.font = `500 ${forGif ? 14 : 24}px "Inter", sans-serif`;
          ctx.fillStyle = '#888';
          ctx.fillText(`CAPTURED BY ${fromName.toUpperCase()}`, w / 2, bottomY);
        }

        resolve(canvas);
      });
    });
  }, [greeting, fromName, particleText, treeColor, selectedFont]); // 依赖 selectedFont

  // 生成预览
  const handlePreview = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(10);

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

  // 导出 GIF
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
        link.download = `champion-moment-${Date.now()}.gif`;
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
          link.download = `champion-moment-${Date.now()}.png`;
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
        {!isMobile && " 导出贺卡"}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 6, 8, 0.98)', backdropFilter: 'blur(0px)', // High opacity background
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => !isExporting && setIsOpen(false)}>

          <div className="tech-panel" style={{
            padding: '24px', borderRadius: '4px', width: isMobile ? '90vw' : '400px', // Sharper radius
            maxHeight: '90vh', overflowY: 'auto',
            border: '1px solid var(--tech-cyan)', // Red border
            background: '#0a0a0e'
          }} onClick={e => e.stopPropagation()}>

            <h3 style={{
              color: 'var(--tech-cyan)', margin: '0 0 20px 0', textAlign: 'center',
              fontFamily: 'Bodoni Moda, serif', letterSpacing: '1px', fontSize: '24px', fontWeight: '700'
            }}>
              CHAMPION MOMENT
            </h3>

            {/* 预览区域 */}
            {showPreview && previewUrl ? (
              <div style={{ textAlign: 'center' }}>
                {exportDone ? (
                  <>
                    <p style={{ color: '#D31120', marginBottom: 10, fontWeight: '600' }}>生成成功</p>
                    <img src={mobileImageUrl!} style={{ width: '100%', border: '4px solid #fff', marginBottom: 20 }} />
                    <p style={{ fontSize: 12, color: '#888' }}>长按图片保存到相册</p>
                    <button className="tech-btn" onClick={() => { setIsOpen(false); setExportDone(false); setShowPreview(false); }} style={{ width: '100%' }}>关闭</button>
                  </>
                ) : (
                  <>
                    <img src={previewUrl} style={{ width: '100%', border: '4px solid #fff', marginBottom: 20 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="tech-btn" onClick={() => setShowPreview(false)} disabled={isExporting}>返回</button>
                      <button className="tech-btn" style={{ borderColor: '#fff', color: '#fff' }} onClick={confirmExport} disabled={isExporting}>
                        {isExporting ? '保存中...' : '保存贺卡'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* 表单区域 */}
                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>字体选择</label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px'
                  }}>
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setSelectedFont(font)}
                        className={`tech-btn ${selectedFont.name === font.name ? 'active' : ''}`}
                        style={{
                          fontSize: '10px',
                          padding: '6px 2px',
                          fontFamily: font.family,
                          background: selectedFont.name === font.name ? '#D31120' : 'transparent',
                          color: selectedFont.name === font.name ? '#fff' : '#D31120',
                          border: '1px solid #D31120'
                        }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>祝福语 (支持多行)</label>
                  <textarea
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    style={{
                      width: '100%', height: 70, background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333', color: 'white', padding: 10,
                      fontFamily: selectedFont.family, // 实时预览字体
                      fontSize: '16px',
                      borderRadius: '0px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>署名</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.05)',
                      border: '1px solid #333', color: 'white', padding: 10,
                      borderRadius: '0px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>导出格式</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className={`tech-btn ${exportType === 'image' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setExportType('image')}
                    >
                      高清图片
                    </button>
                    <button
                      className={`tech-btn ${exportType === 'gif' ? 'active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setExportType('gif')}
                    >
                      动态 GIF
                    </button>
                  </div>
                </div>

                <button
                  className="tech-btn"
                  style={{ width: '100%', padding: 15, background: '#D31120', color: '#fff', border: 'none' }}
                  onClick={handlePreview}
                  disabled={isExporting}
                >
                  {isExporting ? `处理中 ${exportProgress}%` : '生成预览'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
