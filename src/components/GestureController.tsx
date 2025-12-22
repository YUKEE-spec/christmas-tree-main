import React, { useRef, useEffect } from 'react';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

// 手势控制器Props
interface GestureControllerProps {
  onGesture: (gesture: 'CHAOS' | 'FORMED') => void;
  onMove: (speed: number) => void;
  onStatus: (status: string) => void;
  debugMode: boolean;
  onToggleLights: () => void;
  onToggleGifts: () => void;
  onTogglePhotos: () => void;
  onNextColor: () => void;
  onToggleDebug: () => void;
}

// 检测是否为移动设备
const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

// 手势控制器组件
export const GestureController: React.FC<GestureControllerProps> = ({ 
  onGesture, 
  onMove, 
  onStatus, 
  debugMode, 
  onToggleLights, 
  onToggleGifts, 
  onTogglePhotos, 
  onNextColor, 
  onToggleDebug 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastGestureRef = useRef<string>('');
  const gestureTimeoutRef = useRef<number | null>(null);
  const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
  const debugModeRef = useRef(debugMode);
  const frameCountRef = useRef(0);
  
  // 使用 ref 存储回调函数，避免 useEffect 重新执行
  const callbacksRef = useRef({
    onGesture,
    onMove,
    onStatus,
    onToggleLights,
    onToggleGifts,
    onTogglePhotos,
    onNextColor,
    onToggleDebug
  });
  
  // 更新 ref 中的回调
  useEffect(() => {
    callbacksRef.current = {
      onGesture,
      onMove,
      onStatus,
      onToggleLights,
      onToggleGifts,
      onTogglePhotos,
      onNextColor,
      onToggleDebug
    };
  }, [onGesture, onMove, onStatus, onToggleLights, onToggleGifts, onTogglePhotos, onNextColor, onToggleDebug]);
  
  // 更新 debugMode ref
  useEffect(() => {
    debugModeRef.current = debugMode;
  }, [debugMode]);

  useEffect(() => {
    let requestRef: number;
    let isMounted = true;

    const setup = async () => {
      // 延迟1秒，让浏览器有时间释放内存
      callbacksRef.current.onStatus("正在准备魔法...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isMounted) return;
      
      callbacksRef.current.onStatus("正在加载魔法模型...");
      
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        
        if (!isMounted) return;
        callbacksRef.current.onStatus("魔法准备中...");
        
        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            // 使用本地模型文件，发布时会一起部署
            modelAssetPath: "/models/gesture_recognizer.task",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        if (!isMounted) return;
        callbacksRef.current.onStatus("正在请求摄像头...");
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // 移动端使用前置摄像头，降低分辨率
          const constraints = isMobile 
            ? { video: { facingMode: 'user', width: { ideal: 240 }, height: { ideal: 180 } } }
            : { video: { width: { ideal: 320 }, height: { ideal: 240 } } };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current && isMounted) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {
              // 忽略 play() 被中断的错误
            });
            // 显示完整的手势提示
            callbacksRef.current.onStatus("✋消失 ✊魔法 👍点灯 👎礼物 ✌️照片 ☝️换色");
            predictWebcam();
          }
        } else {
            callbacksRef.current.onStatus("错误：摄像头不可用");
        }
      } catch (err: any) {
        console.error("手势识别加载失败:", err);
        if (isMounted) {
          if (err.name === 'NotAllowedError') {
            callbacksRef.current.onStatus("请允许使用摄像头");
          } else {
            callbacksRef.current.onStatus(`加载失败：请关闭其他应用后重试`);
          }
        }
      }
    };

    const predictWebcam = () => {
      if (gestureRecognizerRef.current && videoRef.current && canvasRef.current) {
        if (videoRef.current.videoWidth > 0) {
          // 移动端降低检测频率（每3帧检测一次）
          frameCountRef.current++;
          if (isMobile && frameCountRef.current % 3 !== 0) {
            requestRef = requestAnimationFrame(predictWebcam);
            return;
          }
          
          const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, Date.now());
          const ctx = canvasRef.current.getContext("2d");
          
          // 使用 ref 获取最新的 debugMode 值
          const currentDebugMode = debugModeRef.current;
          
          if (ctx && currentDebugMode) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              canvasRef.current.width = videoRef.current.videoWidth; 
              canvasRef.current.height = videoRef.current.videoHeight;
              if (results.landmarks) {
                for (const landmarks of results.landmarks) {
                  const drawingUtils = new DrawingUtils(ctx);
                  drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: "#FFD700", lineWidth: 2 });
                  drawingUtils.drawLandmarks(landmarks, { color: "#FF0000", lineWidth: 1 });
                }
              }
          } else if (ctx && !currentDebugMode) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          if (results.gestures.length > 0) {
            const name = results.gestures[0][0].categoryName; 
            const score = results.gestures[0][0].score;
            const gestureNames: Record<string, string> = {
              'Open_Palm': '✋ 张开手掌 → 消失',
              'Closed_Fist': '✊ 握拳 → 圣诞魔法',
              'Pointing_Up': '☝️ 指向上方 → 换颜色',
              'Thumb_Up': '👍 竖起大拇指 → 点灯',
              'Thumb_Down': '👎 大拇指向下 → 挂礼物',
              'Victory': '✌️ 胜利手势 → 切换照片',
              'ILoveYou': '🤟 我爱你 → 切换调试'
            };
            
            // 移动端使用更高的置信度阈值
            const threshold = isMobile ? 0.6 : 0.5;
            
            if (score > threshold) {
              // 防止重复触发：同一手势需要间隔
              if (name !== lastGestureRef.current) {
                lastGestureRef.current = name;
                
                // 核心控制手势
                if (name === "Open_Palm") callbacksRef.current.onGesture("CHAOS");
                if (name === "Closed_Fist") callbacksRef.current.onGesture("FORMED");
                
                // 功能切换手势
                if (name === "Thumb_Up") callbacksRef.current.onToggleLights();
                if (name === "Thumb_Down") callbacksRef.current.onToggleGifts();
                if (name === "Victory") callbacksRef.current.onTogglePhotos();
                if (name === "Pointing_Up") callbacksRef.current.onNextColor();
                if (name === "ILoveYou") callbacksRef.current.onToggleDebug();
                
                if (currentDebugMode) callbacksRef.current.onStatus(`识别到: ${gestureNames[name] || name}`);
                
                // 设置冷却时间（移动端更长）
                if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
                gestureTimeoutRef.current = window.setTimeout(() => {
                  lastGestureRef.current = '';
                }, isMobile ? 1200 : 800);
              }
            }
            
            // 移动端不使用手势控制旋转
            if (!isMobile && results.landmarks.length > 0) {
              const speed = (0.5 - results.landmarks[0][0].x) * 0.15;
              callbacksRef.current.onMove(Math.abs(speed) > 0.01 ? speed : 0);
            }
          } else { 
            callbacksRef.current.onMove(0); 
            if (currentDebugMode) callbacksRef.current.onStatus("等待手势..."); 
          }
        }
        requestRef = requestAnimationFrame(predictWebcam);
      }
    };

    setup();

    return () => {
      isMounted = false;
      cancelAnimationFrame(requestRef);
      if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
      // 清理摄像头流
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      // 清理手势识别器
      if (gestureRecognizerRef.current) {
        gestureRecognizerRef.current.close();
        gestureRecognizerRef.current = null;
      }
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 移动端视频预览更小
  const videoSize = isMobile ? '120px' : '320px';

  return (
    <>
      <video 
        ref={videoRef} 
        style={{ 
          opacity: debugMode ? 0.6 : 0, 
          position: 'fixed', 
          top: isMobile ? 'auto' : 0,
          bottom: isMobile ? '120px' : 'auto',
          right: isMobile ? '10px' : 0, 
          width: debugMode ? videoSize : '1px', 
          zIndex: debugMode ? 100 : -1, 
          pointerEvents: 'none', 
          transform: 'scaleX(-1)',
          borderRadius: isMobile ? '8px' : 0
        }} 
        playsInline 
        muted 
        autoPlay 
      />
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          top: isMobile ? 'auto' : 0,
          bottom: isMobile ? '120px' : 'auto',
          right: isMobile ? '10px' : 0, 
          width: debugMode ? videoSize : '1px', 
          height: debugMode ? 'auto' : '1px', 
          zIndex: debugMode ? 101 : -1, 
          pointerEvents: 'none', 
          transform: 'scaleX(-1)',
          borderRadius: isMobile ? '8px' : 0
        }} 
      />
    </>
  );
};