import React, { useState, useRef, useCallback } from 'react';
import GIF from 'gif.js';

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
  const [greeting, setGreeting] = useState('Merry Christmas');
  const [fromName, setFromName] = useState('');
  const recordingRef = useRef(false);

  // 获取 canvas 元素
  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    if (canvasRef.current) return canvasRef.current;
    return document.querySelector('canvas');
  }, [canvasRef]);

  // 截取当前画面
  const captureFrame = useCallback((): HTMLCanvasElement | null => {
    const canvas = getCanvas();
    if (!canvas) return null;
    
    // 创建一个新的 canvas 来复制当前帧
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = canvas.width;
    frameCanvas.height = canvas.height;
    const ctx = frameCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0);
    }
    return frameCanvas;
  }, [getCanvas]);

  // 创建贺卡 Canvas（用于 GIF 帧）
  const createCardCanvas = useCallback((frameCanvas: HTMLCanvasElement, forGif: boolean = false): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // GIF 用较小尺寸，图片用高分辨率
      const scale = forGif ? 1 : 2;
      const w = forGif ? 600 : 1200;
      const h = forGif ? 800 : 1600;
      canvas.width = w * scale;
      canvas.height = h * scale;
      ctx.scale(scale, scale);
      
      // 金色渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#0a0a15');
      gradient.addColorStop(0.3, '#0f1525');
      gradient.addColorStop(0.7, '#0a1020');
      gradient.addColorStop(1, '#050510');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      
      // 金色外边框
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = forGif ? 3 : 6;
      ctx.strokeRect(15, 15, w - 30, h - 30);
      
      // 内边框
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = forGif ? 1 : 2;
      ctx.strokeRect(25, 25, w - 50, h - 50);
      
      // 顶部装饰线
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 45);
      ctx.lineTo(w - 60, 45);
      ctx.stroke();
      
      // 圣诞树区域
      const padding = forGif ? 30 : 60;
      const treeX = padding;
      const treeY = forGif ? 60 : 100;
      const treeWidth = w - padding * 2;
      const treeHeight = forGif ? 520 : 1050;
      
      // 绘制图片背景框
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(treeX - 2, treeY - 2, treeWidth + 4, treeHeight + 4);
      
      // 绘制圣诞树图片 - 保持比例居中裁剪
      const imgAspect = frameCanvas.width / frameCanvas.height;
      const boxAspect = treeWidth / treeHeight;
      
      let sx = 0, sy = 0, sw = frameCanvas.width, sh = frameCanvas.height;
      
      if (imgAspect > boxAspect) {
        sw = frameCanvas.height * boxAspect;
        sx = (frameCanvas.width - sw) / 2;
      } else {
        sh = frameCanvas.width / boxAspect;
        sy = (frameCanvas.height - sh) / 2;
      }
      
      ctx.drawImage(frameCanvas, sx, sy, sw, sh, treeX, treeY, treeWidth, treeHeight);
      
      // 图片边框
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = forGif ? 2 : 3;
      ctx.strokeRect(treeX, treeY, treeWidth, treeHeight);
      
      // 祝福语
      ctx.fillStyle = '#FFD700';
      ctx.font = `bold ${forGif ? 36 : 72}px "Playfair Display", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = forGif ? 15 : 30;
      ctx.fillText(greeting, w / 2, forGif ? 620 : 1230);
      ctx.shadowBlur = 0;
      
      // 自定义文字
      if (particleText) {
        ctx.fillStyle = treeColor;
        ctx.font = `${forGif ? 18 : 36}px "Noto Serif SC", serif`;
        ctx.shadowColor = treeColor;
        ctx.shadowBlur = forGif ? 8 : 15;
        ctx.fillText(`"${particleText}"`, w / 2, forGif ? 660 : 1300);
        ctx.shadowBlur = 0;
      }
      
      // 发送者
      if (fromName) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.font = `italic ${forGif ? 16 : 32}px Georgia, serif`;
        const fromY = particleText ? (forGif ? 700 : 1380) : (forGif ? 670 : 1320);
        ctx.fillText(`— ${fromName}`, w / 2, fromY);
      }
      
      // 底部装饰线
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, forGif ? 755 : 1500);
      ctx.lineTo(w - 60, forGif ? 755 : 1500);
      ctx.stroke();
      
      // 年份
      ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.font = `${forGif ? 12 : 24}px sans-serif`;
      ctx.fillText('2025', w / 2, forGif ? 780 : 1550);
      
      // 装饰星星
      const drawStar = (x: number, y: number, size: number, opacity: number = 1) => {
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const px = x + Math.cos(angle) * size;
          const py = y + Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };
      
      const starSize = forGif ? 6 : 12;
      const margin = forGif ? 30 : 55;
      drawStar(margin, margin, starSize);
      drawStar(w - margin, margin, starSize);
      drawStar(margin, h - margin, starSize);
      drawStar(w - margin, h - margin, starSize);
      
      resolve(canvas);
    });
  }, [greeting, fromName, particleText, treeColor]);

  // 导出图片
  const exportImage = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const frameCanvas = captureFrame();
    if (!frameCanvas) {
      setIsExporting(false);
      return;
    }
    
    setExportProgress(50);
    const cardCanvas = await createCardCanvas(frameCanvas, false);
    
    setExportProgress(100);
    const link = document.createElement('a');
    link.download = `christmas-card-${Date.now()}.png`;
    link.href = cardCanvas.toDataURL('image/png', 1.0);
    link.click();
    
    setIsExporting(false);
  }, [captureFrame, createCardCanvas]);

  // 导出 GIF
  const exportGif = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    recordingRef.current = true;
    
    const frames: HTMLCanvasElement[] = [];
    const frameCount = 30; // 30帧，约2秒
    const frameDelay = 66; // ~15fps
    
    // 录制帧
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
    
    // 创建 GIF
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: frames[0].width,
      height: frames[0].height,
      workerScript: '/node_modules/gif.js/dist/gif.worker.js'
    });
    
    // 添加帧
    frames.forEach((frame) => {
      gif.addFrame(frame, { delay: frameDelay, copy: true });
    });
    
    gif.on('progress', (p: number) => {
      setExportProgress(50 + Math.round(p * 50));
    });
    
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `christmas-card-${Date.now()}.gif`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    });
    
    gif.render();
  }, [captureFrame, createCardCanvas]);

  const handleExport = () => {
    if (exportType === 'image') {
      exportImage();
    } else {
      exportGif();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(255,215,0,0.15)',
          border: '1px solid #FFD700',
          color: '#FFD700',
          fontFamily: 'sans-serif',
          fontSize: '10px',
          fontWeight: '500',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          borderRadius: '6px',
          letterSpacing: '1px'
        }}
      >
        导出贺卡
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => !isExporting && setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'rgba(20,20,40,0.95)',
              padding: '30px',
              borderRadius: '12px',
              border: '2px solid #FFD700',
              minWidth: '350px',
              maxWidth: '400px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#FFD700', margin: '0 0 20px 0', textAlign: 'center', fontFamily: 'serif' }}>
              ✨ 导出圣诞贺卡 ✨
            </h3>

            {/* 祝福语 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '5px' }}>祝福语</label>
              <input
                type="text"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Merry Christmas"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 署名 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '5px' }}>署名（可选）</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="From: Your Name"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 导出类型 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#888', fontSize: '11px', display: 'block', marginBottom: '8px' }}>导出格式</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setExportType('image')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: exportType === 'image' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${exportType === 'image' ? '#FFD700' : '#444'}`,
                    borderRadius: '4px',
                    color: exportType === 'image' ? '#FFD700' : '#888',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📷 图片
                </button>
                <button
                  onClick={() => setExportType('gif')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: exportType === 'gif' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${exportType === 'gif' ? '#FFD700' : '#444'}`,
                    borderRadius: '4px',
                    color: exportType === 'gif' ? '#FFD700' : '#888',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🎬 动图
                </button>
              </div>
            </div>

            {/* 进度条 */}
            {isExporting && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${exportProgress}%`,
                    height: '100%',
                    backgroundColor: '#FFD700',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ color: '#888', fontSize: '10px', textAlign: 'center', marginTop: '5px' }}>
                  {exportType === 'gif' ? '正在录制动画...' : '正在生成...'} {exportProgress}%
                </p>
              </div>
            )}

            {/* 导出按钮 */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isExporting ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.2)',
                border: '2px solid #FFD700',
                borderRadius: '6px',
                color: '#FFD700',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: isExporting ? 'wait' : 'pointer',
                letterSpacing: '2px'
              }}
            >
              {isExporting ? '正在生成...' : '生成贺卡'}
            </button>

            <p style={{ color: '#555', fontSize: '10px', textAlign: 'center', marginTop: '15px' }}>
              {exportType === 'gif' ? '动图将录制约2秒的动画' : '请先将圣诞树调整到满意的状态再导出'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
