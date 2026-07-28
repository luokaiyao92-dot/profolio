/**
 * [INPUT]: 依赖 React 的 useEffect/useState、BlobReveal 的 Originkit WebGL Shader，以及用户提供的图一封面和图二目标纹理
 * [OUTPUT]: 对外提供 HeroIntro 全屏入口组件，支持鼠标、触控与键盘触发从图一到图二的液态 Blob 揭示
 * [POS]: src 的首屏状态边界，管理“静态封面→GPU 纹理过渡→真实 Hero”状态流，不侵入下层页面布局与交互
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { lazy, Suspense, useEffect, useState } from 'react';
import heroFolderGate from '../assets/hero-folder-gate.png';
import heroRevealTarget from '../assets/hero-sky-kite.png';

const blobRevealModule = import('./BlobReveal.jsx');
const BlobReveal = lazy(() => blobRevealModule);

export default function HeroIntro({ onComplete }) {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const targetImage = new Image();
    targetImage.src = heroRevealTarget;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const dismiss = () => {
    if (phase !== 'idle') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
      return;
    }

    setPhase('revealing');
  };

  return (
    <button
      type="button"
      className={`hero-intro hero-intro-${phase}`}
      aria-label="进入 Kaiyao 作品集"
      onClick={dismiss}
    >
      <img className="hero-intro-image" src={heroFolderGate} alt="点阵双手托起 Kaiyao portfolio 文件夹" />
      {phase === 'revealing' && (
        <Suspense fallback={null}>
          <BlobReveal
            image={heroRevealTarget}
            active
            fit="cover"
            blobCount={20}
            duration={2}
            onComplete={onComplete}
          />
        </Suspense>
      )}
    </button>
  );
}
