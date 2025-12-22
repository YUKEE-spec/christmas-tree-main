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
      callbacksRef.current.onStatus("正在释放内存...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!isMounted) return;
      
      callbacksRef.current.onStatus("正在加载 AI 模型...");
      
      try {
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");
        
        if (!isMounted) return;
        callbacksRef.current.onStatus("WASM加载完成，正在加载手势模型...");
        
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
        callbacksRef.current.onStatus("模型加载完成，正在请求摄像头...");
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 320 }, 
              height: { ideal: 240 } 
            } 
          });
          if (videoRef.current && isMounted) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {
              // 忽略 play() 被中断的错误
            });
            callbacksRef.current.onStatus("✋散开 ✊聚合 👍彩灯 ✌️照片 ☝️换色");
            predictWebcam();
          }
        } else {
            callbacksRef.current.onStatus("错误：摄像头不可用");
        }
      } catch (err: any) {
        console.error("手势识别加载失败:", err);
        if (isMounted) {
          callbacksRef.current.onStatus(`加载失败：请关闭其他标签页后重试`);
        }
      }
    };

    const predictWebcam = () => {
      if (gestureRecognizerRef.current && videoRef.current && canvasRef.current) {
        if (videoRef.current.videoWidth > 0) {
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
                'Open_Palm': '✋ 张开手掌 → 散开',
                'Closed_Fist': '✊ 握拳 → 聚合',
                'Pointing_Up': '☝️ 指向上方 → 换颜色',
                'Thumb_Up': '👍 竖起大拇指 → 切换彩灯',
                'Thumb_Down': '👎 大拇指向下 → 切换礼物',
                'Victory': '✌️ 胜利手势 → 切换照片',
                'ILoveYou': '🤟 我爱你 → 切换调试'
              };
              
              if (score > 0.5) {
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
                  
                  // 设置冷却时间
                  if (gestureTimeoutRef.current) clearTimeout(gestureTimeoutRef.current);
                  gestureTimeoutRef.current = window.setTimeout(() => {
                    lastGestureRef.current = '';
                  }, 800);
                }
              }
              
              if (results.landmarks.length > 0) {
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

  return (
    <>
      <video 
        ref={videoRef} 
        style={{ 
          opacity: debugMode ? 0.6 : 0, 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          width: debugMode ? '320px' : '1px', 
          zIndex: debugMode ? 100 : -1, 
          pointerEvents: 'none', 
          transform: 'scaleX(-1)' 
        }} 
        playsInline 
        muted 
        autoPlay 
      />
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          width: debugMode ? '320px' : '1px', 
          height: debugMode ? 'auto' : '1px', 
          zIndex: debugMode ? 101 : -1, 
          pointerEvents: 'none', 
          transform: 'scaleX(-1)' 
        }} 
      />
    </>
  );
};