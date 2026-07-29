/**
 * [INPUT]: 依赖 React 的 useCallback/useEffect/useRef，以子节点冒泡的 click 事件作为火花触发源
 * [OUTPUT]: 对外提供 ClickSpark 全局点击反馈容器，在不拦截指针的固定 Canvas 上绘制可配置的放射线火花
 * [POS]: src 的全站瞬时反馈层，由 main.jsx 包裹 App；仅在存在活跃火花时请求动画帧，不介入页面业务状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useCallback, useEffect, useRef } from 'react';

function easeProgress(progress, easing) {
  if (easing === 'linear') return progress;
  if (easing === 'ease-in') return progress * progress;
  if (easing === 'ease-in-out') {
    return progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
  }
  return progress * (2 - progress);
}

function ClickSpark({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
  children,
}) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const animationRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * pixelRatio);
    canvas.height = Math.round(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    canvas.getContext('2d')?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    syncMotionPreference();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    mediaQuery.addEventListener('change', syncMotionPreference);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      mediaQuery.removeEventListener('change', syncMotionPreference);
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [resizeCanvas]);

  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sparksRef.current = sparksRef.current.filter((spark) => {
      const elapsed = timestamp - spark.startTime;
      if (elapsed >= duration) return false;

      const eased = easeProgress(elapsed / duration, easing);
      const distance = eased * sparkRadius * extraScale;
      const lineLength = sparkSize * (1 - eased);
      const cos = Math.cos(spark.angle);
      const sin = Math.sin(spark.angle);

      context.strokeStyle = sparkColor;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(spark.x + distance * cos, spark.y + distance * sin);
      context.lineTo(
        spark.x + (distance + lineLength) * cos,
        spark.y + (distance + lineLength) * sin,
      );
      context.stroke();
      return true;
    });

    animationRef.current = sparksRef.current.length
      ? requestAnimationFrame(draw)
      : null;
  }, [duration, easing, extraScale, sparkColor, sparkRadius, sparkSize]);

  const handleClick = (event) => {
    if (reducedMotionRef.current) return;

    const startTime = performance.now();
    const newSparks = Array.from({ length: sparkCount }, (_, index) => ({
      x: event.clientX,
      y: event.clientY,
      angle: (2 * Math.PI * index) / sparkCount,
      startTime,
    }));

    sparksRef.current.push(...newSparks);
    if (animationRef.current === null) animationRef.current = requestAnimationFrame(draw);
  };

  return (
    <div onClick={handleClick} style={{ position: 'relative', minHeight: '100%' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-layer="Interaction / Global Click Spark"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      {children}
    </div>
  );
}

export default ClickSpark;
