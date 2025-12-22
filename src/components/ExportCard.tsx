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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const recordingRef = useRef(false);
  
  // 检测移动端
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

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

  // 创建贺卡 Canvas（用于 GIF 帧）- 烫金效果版
  const createCardCanvas = useCallback((frameCanvas: HTMLCanvasElement, forGif: boolean = false): Promise<HTMLCanvasElement> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // GIF 用较小尺寸，图片用高分辨率
      const scale = forGif ? 1 : 2;
      const w = forGif ? 600 : 1080;
      const h = forGif ? 750 : 1350;
      canvas.width = w * scale;
      canvas.height = h * scale;
      ctx.scale(scale, scale);
      
      // 深色渐变背景 - 更深邃
      const bgGradient = ctx.createLinearGradient(0, 0, w, h);
      bgGradient.addColorStop(0, '#0a0812');
      bgGradient.addColorStop(0.5, '#0d0a18');
      bgGradient.addColorStop(1, '#08060f');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);
      
      // 烫金边框 - 多层渐变效果
      const borderWidth = forGif ? 4 : 8;
      const goldGradient = ctx.createLinearGradient(0, 0, w, h);
      goldGradient.addColorStop(0, '#D4AF37');
      goldGradient.addColorStop(0.25, '#FFD700');
      goldGradient.addColorStop(0.5, '#FFF8DC');
      goldGradient.addColorStop(0.75, '#FFD700');
      goldGradient.addColorStop(1, '#D4AF37');
      
      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = borderWidth;
      ctx.strokeRect(borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth);
      
      // 内边框 - 细金线
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = forGif ? 1 : 2;
      ctx.strokeRect(borderWidth + 8, borderWidth + 8, w - borderWidth * 2 - 16, h - borderWidth * 2 - 16);
      
      // 顶部装饰 - 烫金花纹线
      const topY = forGif ? 25 : 40;
      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = forGif ? 1 : 2;
      ctx.beginPath();
      ctx.moveTo(50, topY);
      ctx.lineTo(w / 2 - 30, topY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 + 30, topY);
      ctx.lineTo(w - 50, topY);
      ctx.stroke();
      
      // 顶部中央装饰 - 小星星
      ctx.fillStyle = '#FFD700';
      ctx.font = `${forGif ? 14 : 24}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✦', w / 2, topY + 5);
      
      // 圣诞树区域 - 更大更醒目
      const padding = forGif ? 20 : 35;
      const treeY = forGif ? 40 : 60;
      const treeWidth = w - padding * 2;
      const treeHeight = forGif ? 480 : 950;
      
      // 圣诞树图片 - 保持比例居中裁剪
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
      
      // 绘制圣诞树
      ctx.drawImage(frameCanvas, sx, sy, sw, sh, padding, treeY, treeWidth, treeHeight);
      
      // 圣诞树边框 - 烫金效果
      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = forGif ? 2 : 4;
      ctx.strokeRect(padding, treeY, treeWidth, treeHeight);
      
      // 祝福语区域背景 - 渐变遮罩
      const textAreaY = treeY + treeHeight + (forGif ? 10 : 20);
      const textGradient = ctx.createLinearGradient(0, textAreaY - 20, 0, h);
      textGradient.addColorStop(0, 'rgba(10, 8, 18, 0)');
      textGradient.addColorStop(0.3, 'rgba(10, 8, 18, 0.9)');
      textGradient.addColorStop(1, 'rgba(10, 8, 18, 1)');
      ctx.fillStyle = textGradient;
      ctx.fillRect(0, textAreaY - 20, w, h - textAreaY + 20);
      
      // 祝福语 - 烫金文字效果
      ctx.fillStyle = goldGradient;
      ctx.font = `bold ${forGif ? 32 : 56}px "Playfair Display", "Noto Serif SC", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = forGif ? 20 : 40;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText(greeting, w / 2, forGif ? 570 : 1090);
      
      // 二次绘制增强发光
      ctx.shadowBlur = forGif ? 10 : 20;
      ctx.fillText(greeting, w / 2, forGif ? 570 : 1090);
      ctx.shadowBlur = 0;
      
      // 自定义文字
      if (particleText) {
        ctx.fillStyle = treeColor;
        ctx.font = `${forGif ? 16 : 28}px "Noto Serif SC", serif`;
        ctx.shadowColor = treeColor;
        ctx.shadowBlur = forGif ? 10 : 20;
        ctx.fillText(`"${particleText}"`, w / 2, forGif ? 605 : 1145);
        ctx.shadowBlur = 0;
      }
      
      // 发送者 - 斜体金色
      if (fromName) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        ctx.font = `italic ${forGif ? 14 : 26}px Georgia, serif`;
        const fromY = particleText ? (forGif ? 640 : 1200) : (forGif ? 615 : 1165);
        ctx.fillText(`— ${fromName}`, w / 2, fromY);
      }
      
      // 底部装饰线
      const bottomLineY = forGif ? 700 : 1280;
      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = forGif ? 1 : 2;
      ctx.beginPath();
      ctx.moveTo(80, bottomLineY);
      ctx.lineTo(w / 2 - 40, bottomLineY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 + 40, bottomLineY);
      ctx.lineTo(w - 80, bottomLineY);
      ctx.stroke();
      
      // 底部中央年份
      ctx.fillStyle = goldGradient;
      ctx.font = `${forGif ? 12 : 20}px sans-serif`;
      ctx.fillText('✦ 2025 ✦', w / 2, bottomLineY + 5);
      
      // 四角装饰星星 - 烫金效果
      const drawGoldStar = (x: number, y: number, size: number) => {
        ctx.fillStyle = goldGradient;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = size;
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
        ctx.shadowBlur = 0;
      };
      
      const starSize = forGif ? 6 : 10;
      const margin = forGif ? 20 : 30;
      drawGoldStar(margin, margin, starSize);
      drawGoldStar(w - margin, margin, starSize);
      drawGoldStar(margin, h - margin, starSize);
      drawGoldStar(w - margin, h - margin, starSize);
      
      // 额外装饰 - 角落花纹
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.lineWidth = 1;
      const cornerSize = forGif ? 15 : 25;
      
      // 左上角
      ctx.beginPath();
      ctx.moveTo(margin + cornerSize, margin);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin, margin + cornerSize);
      ctx.stroke();
      
      // 右上角
      ctx.beginPath();
      ctx.moveTo(w - margin - cornerSize, margin);
      ctx.lineTo(w - margin, margin);
      ctx.lineTo(w - margin, margin + cornerSize);
      ctx.stroke();
      
      // 左下角
      ctx.beginPath();
      ctx.moveTo(margin + cornerSize, h - margin);
      ctx.lineTo(margin, h - margin);
      ctx.lineTo(margin, h - margin - cornerSize);
      ctx.stroke();
      
      // 右下角
      ctx.beginPath();
      ctx.moveTo(w - margin - cornerSize, h - margin);
      ctx.lineTo(w - margin, h - margin);
      ctx.lineTo(w - margin, h - margin - cornerSize);
      ctx.stroke();
      
      resolve(canvas);
    });
  }, [greeting, fromName, particleText, treeColor]);

  // 生成预览
  const generatePreview = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const frameCanvas = captureFrame();
    if (!frameCanvas) {
      setIsExporting(false);
      return;
    }
    
    setExportProgress(50);
    // 预览用较小尺寸
    const cardCanvas = await createCardCanvas(frameCanvas, true);
    
    setExportProgress(100);
    const url = cardCanvas.toDataURL('image/png', 0.8);
    setPreviewUrl(url);
    setShowPreview(true);
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
      setShowPreview(false);
      setPreviewUrl(null);
      setIsOpen(false);
    });
    
    gif.render();
  }, [captureFrame, createCardCanvas]);

  // 确认导出
  const confirmExport = useCallback(async () => {
    if (exportType === 'image') {
      // 重新生成高清版本
      setIsExporting(true);
      setExportProgress(0);
      
      const frameCanvas = captureFrame();
      if (!frameCanvas) {
        setIsExporting(false);
        alert('无法获取画面，请重试');
        return;
      }
      
      setExportProgress(50);
      const cardCanvas = await createCardCanvas(frameCanvas, false);
      
      setExportProgress(100);
      
      // 移动端使用不同的下载方式
      const dataUrl = cardCanvas.toDataURL('image/png', 1.0);
      
      if (isMobile) {
        // 移动端：打开新窗口显示图片，用户可以长按保存
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>圣诞贺卡</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { margin: 0; padding: 20px; background: #000; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; height: auto; border-radius: 8px; }
                  p { color: #FFD700; font-family: sans-serif; margin-top: 20px; text-align: center; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="圣诞贺卡" />
                <p>长按图片保存到相册 📱</p>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          // 如果无法打开新窗口，尝试直接下载
          const link = document.createElement('a');
          link.download = `christmas-card-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
      } else {
        // 桌面端：直接下载
        const link = document.createElement('a');
        link.download = `christmas-card-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
      
      setIsExporting(false);
      setShowPreview(false);
      setPreviewUrl(null);
      setIsOpen(false);
    } else {
      exportGif();
    }
  }, [captureFrame, createCardCanvas, exportType, exportGif, isMobile]);

  const handlePreview = () => {
    generatePreview();
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: isMobile ? '8px 10px' : '10px 14px',
          backgroundColor: 'rgba(255,215,0,0.15)',
          border: '1px solid #FFD700',
          color: '#FFD700',
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
              padding: isMobile ? '20px' : '30px',
              borderRadius: '12px',
              border: '2px solid #FFD700',
              width: isMobile ? '90vw' : 'auto',
              minWidth: isMobile ? 'auto' : '350px',
              maxWidth: isMobile ? '90vw' : '400px',
              maxHeight: isMobile ? '85vh' : 'auto',
              overflowY: isMobile ? 'auto' : 'visible'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              color: '#FFD700', 
              margin: '0 0 20px 0', 
              textAlign: 'center', 
              fontFamily: 'serif',
              fontSize: isMobile ? '16px' : '18px'
            }}>
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
                  padding: isMobile ? '12px' : '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: isMobile ? '16px' : '14px',
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
                  padding: isMobile ? '12px' : '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: isMobile ? '16px' : '14px',
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
                    padding: isMobile ? '12px' : '10px',
                    backgroundColor: exportType === 'image' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${exportType === 'image' ? '#FFD700' : '#444'}`,
                    borderRadius: '4px',
                    color: exportType === 'image' ? '#FFD700' : '#888',
                    fontSize: '12px',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  📷 图片
                </button>
                <button
                  onClick={() => setExportType('gif')}
                  style={{
                    flex: 1,
                    padding: isMobile ? '12px' : '10px',
                    backgroundColor: exportType === 'gif' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${exportType === 'gif' ? '#FFD700' : '#444'}`,
                    borderRadius: '4px',
                    color: exportType === 'gif' ? '#FFD700' : '#888',
                    fontSize: '12px',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
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

            {/* 预览图片 */}
            {showPreview && previewUrl && (
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: '#888', fontSize: '11px', marginBottom: '8px', textAlign: 'center' }}>贺卡预览</p>
                <div style={{
                  width: '100%',
                  maxHeight: isMobile ? '40vh' : '300px',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,215,0,0.3)'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="贺卡预览" 
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            )}

            {/* 按钮区域 */}
            {!showPreview ? (
              <>
                {/* 预览按钮 */}
                <button
                  onClick={handlePreview}
                  disabled={isExporting}
                  style={{
                    width: '100%',
                    padding: isMobile ? '14px' : '12px',
                    backgroundColor: isExporting ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.2)',
                    border: '2px solid #FFD700',
                    borderRadius: '6px',
                    color: '#FFD700',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: isExporting ? 'wait' : 'pointer',
                    letterSpacing: '2px',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {isExporting ? '正在生成...' : '预览贺卡'}
                </button>
                <p style={{ color: '#555', fontSize: '10px', textAlign: 'center', marginTop: '15px' }}>
                  {exportType === 'gif' ? '动图将录制约2秒的动画' : '点击预览后可确认效果再导出'}
                </p>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                {/* 返回修改按钮 */}
                <button
                  onClick={handleBackToEdit}
                  style={{
                    flex: 1,
                    padding: isMobile ? '14px' : '12px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid #666',
                    borderRadius: '6px',
                    color: '#888',
                    fontSize: '12px',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  返回修改
                </button>
                {/* 确认导出按钮 */}
                <button
                  onClick={confirmExport}
                  disabled={isExporting}
                  style={{
                    flex: 1,
                    padding: isMobile ? '14px' : '12px',
                    backgroundColor: 'rgba(255,215,0,0.2)',
                    border: '2px solid #FFD700',
                    borderRadius: '6px',
                    color: '#FFD700',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: isExporting ? 'wait' : 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {isExporting ? '导出中...' : '确认导出'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
