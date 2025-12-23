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
  { name: 'ma-shan-zheng', family: '"Ma Shan Zheng", cursive', label: '马善政' },
  { name: 'zhi-mang-xing', family: '"Zhi Mang Xing", cursive', label: '志莽行书' },
  { name: 'long-cang', family: '"Long Cang", cursive', label: '龙苍' },
  { name: 'great-vibes', family: '"Great Vibes", cursive', label: 'Great Vibes' },
  { name: 'dancing-script', family: '"Dancing Script", cursive', label: 'Dancing' },
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

  // 创建贺卡 Canvas（赛博夜色版）
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

        // 1. 背景：深空渐变
        const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
        bgGradient.addColorStop(0, '#020205'); // 极深蓝黑
        bgGradient.addColorStop(0.5, '#050510'); // 深科技蓝
        bgGradient.addColorStop(1, '#0a0a1a'); // 底部微亮
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, w, h);

        // 添加星空噪点 (简化版)
        for (let i = 0; i < 100; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
          const x = Math.random() * w;
          const y = Math.random() * h;
          const r = Math.random() * 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. 边框：赛博霓虹
        const borderWidth = forGif ? 10 : 20;
        const innerMargin = forGif ? 10 : 20;

        // 边框发光
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 243, 255, 0.4)';

        ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)'; // Tech Cyan
        ctx.lineWidth = 2;

        // 绘制内框
        ctx.strokeRect(borderWidth + innerMargin, borderWidth + innerMargin, w - (borderWidth + innerMargin) * 2, h - (borderWidth + innerMargin) * 2);

        ctx.shadowBlur = 0; // 重置阴影

        // 装饰角落
        const cornerSize = 40;
        ctx.strokeStyle = '#bc13fe'; // Tech Purple
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(188, 19, 254, 0.6)';

        // 左上角 L
        ctx.beginPath();
        ctx.moveTo(borderWidth, borderWidth + cornerSize);
        ctx.lineTo(borderWidth, borderWidth);
        ctx.lineTo(borderWidth + cornerSize, borderWidth);
        ctx.stroke();

        // 右下角 
        ctx.beginPath();
        ctx.moveTo(w - borderWidth, h - borderWidth - cornerSize);
        ctx.lineTo(w - borderWidth, h - borderWidth);
        ctx.lineTo(w - borderWidth - cornerSize, h - borderWidth);
        ctx.stroke();

        ctx.shadowBlur = 0;

        // 3. 顶部文字 (Title) - 霓虹发光文字
        const titleY = forGif ? 60 : 100;
        ctx.textAlign = 'center';

        // 标题字体
        ctx.font = `400 ${forGif ? 28 : 48}px "Orbitron", sans-serif`;

        // 外发光
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFD700'; // 金色
        ctx.fillText('MAGIC CHRISTMAS', w / 2, titleY);

        ctx.shadowBlur = 0;

        // 4. 圣诞树区域 (无裁剪，直接融合)
        const treeY = forGif ? 80 : 140;
        const treeH = forGif ? 400 : 700;
        const treeW = w;

        const imgAspect = frameCanvas.width / frameCanvas.height;
        // 目标区域
        const targetW = treeW; // 全宽
        const targetH = treeW / imgAspect;

        // 居中绘制
        const drawX = (w - targetW) / 2;
        const drawY = treeY + (treeH - targetH) / 2;

        // 设置混合模式为 lighten 或 screen 可以去除纯黑背景，但为了保持树的颜色，直接绘制通常最好
        // 我们的背景已经是深色，所以直接绘制即可，树的黑底会融入背景
        // 稍微做一点边缘羽化效果很难在 canvas 原生 API 做，但因为背景相近，直接画就行
        ctx.drawImage(frameCanvas, 0, 0, frameCanvas.width, frameCanvas.height, drawX, drawY, targetW, targetH);


        // 5. 祝福语 (多行支持)
        const textYStart = drawY + targetH + (forGif ? 30 : 50);

        // 使用选中的字体
        const fontSize = forGif ? 30 : 50;
        ctx.font = `400 ${fontSize}px ${selectedFont.family}`;

        // 文字样式：发光白/浅金
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;

        const lines = greeting.split('\n');
        const lineHeight = fontSize * 1.5;

        lines.forEach((line, index) => {
          ctx.fillText(line, w / 2, textYStart + index * lineHeight);
        });

        ctx.shadowBlur = 0;

        // 6. 粒子文字 (如果有)
        if (particleText) {
          const ptY = textYStart + lines.length * lineHeight + (forGif ? 10 : 15);
          ctx.font = `400 ${forGif ? 16 : 24}px monospace`;
          ctx.fillStyle = '#00f3ff'; // Cyan
          ctx.shadowColor = 'rgba(0, 243, 255, 0.6)';
          ctx.shadowBlur = 5;
          ctx.fillText(`[ ${particleText} ]`, w / 2, ptY);
          ctx.shadowBlur = 0;
        }

        // 7. 署名
        if (fromName) {
          const fromY = h - (forGif ? 30 : 50);
          ctx.font = `400 ${forGif ? 18 : 32}px "Great Vibes", cursive`;
          ctx.fillStyle = '#B8860B'; // 暗金色
          ctx.fillText(`By ${fromName}`, w / 2, fromY);
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
        link.download = `cyber-christmas-${Date.now()}.gif`;
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
          link.download = `cyber-christmas-${Date.now()}.png`;
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
          backgroundColor: 'rgba(5, 5, 10, 0.95)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => !isExporting && setIsOpen(false)}>

          <div className="tech-panel" style={{
            padding: '24px', borderRadius: '12px', width: isMobile ? '90vw' : '400px',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>

            <h3 style={{
              color: 'var(--tech-gold)', margin: '0 0 20px 0', textAlign: 'center',
              fontFamily: 'Orbitron, sans-serif', letterSpacing: '2px'
            }}>
              贺卡导出终端
            </h3>

            {/* 预览区域 */}
            {showPreview && previewUrl ? (
              <div style={{ textAlign: 'center' }}>
                {exportDone ? (
                  <>
                    <p style={{ color: '#4CAF50', marginBottom: 10 }}>生成成功</p>
                    <img src={mobileImageUrl!} style={{ width: '100%', border: '1px solid var(--tech-cyan)', marginBottom: 20, borderRadius: '8px' }} />
                    <p style={{ fontSize: 12, color: '#888' }}>长按图片保存到相册</p>
                    <button className="tech-btn" onClick={() => { setIsOpen(false); setExportDone(false); setShowPreview(false); }} style={{ width: '100%' }}>关闭</button>
                  </>
                ) : (
                  <>
                    <img src={previewUrl} style={{ width: '100%', border: '1px solid var(--tech-cyan)', marginBottom: 20, borderRadius: '8px' }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="tech-btn" onClick={() => setShowPreview(false)} disabled={isExporting}>返回</button>
                      <button className="tech-btn gold" onClick={confirmExport} disabled={isExporting}>
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
                  <label style={{ display: 'block', color: 'var(--tech-cyan)', fontSize: 10, marginBottom: 5 }}>祝福语字体</label>
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
                          fontFamily: font.family
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
                      border: '1px solid var(--tech-cyan)', color: 'white', padding: 10,
                      fontFamily: selectedFont.family, // 实时预览字体
                      fontSize: '16px',
                      borderRadius: '4px'
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
                      border: '1px solid var(--tech-cyan)', color: 'white', padding: 10,
                      borderRadius: '4px'
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
                  className="tech-btn purple"
                  style={{ width: '100%', padding: 15 }}
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
