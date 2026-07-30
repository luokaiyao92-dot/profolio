/**
 * [INPUT]: 依赖 React 的 useLayoutEffect/useRef，依赖 GSAP 与 ScrollTrigger，将导航、封装后的 Hero 舞台和品牌主张区作为同一场景的 children
 * [OUTPUT]: 对外提供 HeroMotion 场景边界，负责字体就绪后的首屏入场，并用唯一整屏 transitionProgress 将完整 Hero 舞台以顶部中心为锚点缩至 70%、固定导航收至屏宽 60%，使两者在主张区完全覆盖后停止变化
 * [POS]: src 的首屏到第二屏运动编排器，位于 App 业务内容和具体视觉样式之间；不拥有文案、素材、内部文字揭示或悬停业务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EASE = 'power4.out';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value, start, end) => clamp((value - start) / (end - start));
const mix = (start, end, progress) => start + (end - start) * progress;
const easeInOutCubic = (value) => (value < 0.5
  ? 4 * value * value * value
  : 1 - ((-2 * value + 2) ** 3) / 2);

export default function HeroMotion({ children }) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    let context;
    let cancelled = false;

    const prepareMotion = async () => {
      if (document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, 900)),
        ]);
      }
      if (cancelled || !scopeRef.current) return;

      context = gsap.context(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile = window.matchMedia('(max-width: 560px)').matches;
        const allEntranceTargets = [
          '.hero-background-stage',
          '.hero-signature-line',
          '.hero-bio',
          '.hero-card-deck',
          '.hero-nav',
          '.hero-idea',
        ];

        if (reducedMotion) {
          gsap.set(allEntranceTargets, { opacity: 1, x: 0, y: 0, yPercent: 0, scale: 1 });
          gsap.set(['.hero-stage', '.about-transition-layer'], { opacity: 1, x: 0, y: 0, scale: 1 });
          gsap.set('.statement-background', { opacity: 1 });
          scopeRef.current.dataset.motionState = 'ready';
          return;
        }

        const timing = mobile
          ? { background: 0.12, title: 0.2, bio: 0.48, utility: 0.64, end: 1.02 }
          : { background: 0.15, title: 0.3, bio: 0.65, utility: 0.85, end: 1.45 };
        gsap.set('.hero-signature-line', {
          clipPath: 'inset(100% 0 0 0)',
          opacity: 0,
          yPercent: mobile ? 44 : 52,
        });
        const timeline = gsap.timeline({
          defaults: { ease: EASE },
          onStart: () => { scopeRef.current.dataset.motionState = 'running'; },
          onComplete: () => { scopeRef.current.dataset.motionState = 'ready'; },
        });

        timeline
          .to('.hero-background-stage', {
            opacity: 1,
            scale: 1,
            duration: mobile ? 0.28 : 0.35,
          }, timing.background)
          .to('.hero-signature-line', {
            clipPath: 'inset(0% 0 0 0)',
            opacity: 1,
            yPercent: 0,
            duration: mobile ? 0.62 : 0.82,
            onComplete: () => {
              gsap.set('.hero-signature-line', { clearProps: 'clipPath,transform' });
            },
          }, timing.title)
          .to('.hero-bio', {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.46 : 0.72,
          }, timing.bio)
          .to('.hero-card-deck', {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.36 : 0.58,
          }, timing.utility - (mobile ? 0.02 : 0.03))
          .to('.hero-nav', {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.3 : 0.5,
          }, timing.utility + (mobile ? 0.04 : 0.05))
          .to('.hero-idea', {
            opacity: 1,
            y: 0,
            duration: mobile ? 0.28 : 0.48,
          }, timing.utility + (mobile ? 0.08 : 0.09));

        timeline.call(() => {
          scopeRef.current.dataset.timelineEnd = String(timing.end);
        }, null, timing.end);

        const heroStage = scopeRef.current.querySelector('.hero-stage');
        const heroHeader = scopeRef.current.querySelector('.hero-header');
        const statement = scopeRef.current.querySelector('.about-transition-layer');
        const statementBackground = scopeRef.current.querySelector('.statement-background');
        const setStatementY = gsap.quickSetter(statement, 'y', 'px');
        const setStatementOpacity = gsap.quickSetter(statement, 'opacity');
        const setBackgroundOpacity = gsap.quickSetter(statementBackground, 'opacity');
        const statementDistance = mobile ? 56 : 96;

        gsap.set(heroStage, { transformOrigin: '50% 0%' });
        gsap.set(statement, { y: statementDistance, opacity: 0 });
        gsap.set(statementBackground, { opacity: 0 });
        let statementActivated = false;

        ScrollTrigger.create({
          trigger: scopeRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const smoothProgress = easeInOutCubic(progress);
            const statementEnter = easeInOutCubic(range(progress, 0.25, mobile ? 0.68 : 0.75));
            const backgroundEnter = easeInOutCubic(range(progress, mobile ? 0.32 : 0.38, mobile ? 0.72 : 0.86));
            const fullNavigationWidth = Math.min(
              1700,
              window.innerWidth - (window.innerWidth <= 900 ? 40 : 104),
            );
            const compactNavigationWidth = window.innerWidth * 0.6;

            heroStage.style.transform = `scale(${mix(1, 0.7, smoothProgress)})`;
            heroHeader.style.width = `${mix(fullNavigationWidth, compactNavigationWidth, smoothProgress)}px`;
            setStatementY(mix(statementDistance, 0, statementEnter));
            setStatementOpacity(statementEnter);
            setBackgroundOpacity(backgroundEnter);
            heroStage.style.pointerEvents = progress >= 0.7 ? 'none' : 'auto';
            scopeRef.current.style.setProperty('--transition-progress', progress.toFixed(4));
            if (!statementActivated && progress >= 0.6) {
              statementActivated = true;
              window.dispatchEvent(new CustomEvent('portfolio:statement-ready'));
            }
          },
        });
      }, scopeRef);
    };

    prepareMotion();

    return () => {
      cancelled = true;
      context?.revert();
      scopeRef.current?.style.removeProperty('--transition-progress');
      const heroStage = scopeRef.current?.querySelector('.hero-stage');
      const heroHeader = scopeRef.current?.querySelector('.hero-header');
      heroStage?.style.removeProperty('pointer-events');
      heroStage?.style.removeProperty('transform');
      heroHeader?.style.removeProperty('width');
    };
  }, []);

  return (
    <div
      ref={scopeRef}
      className="transition-scene hero-motion"
      data-layer="Scene / Hero to Statement"
      data-motion-state="waiting-fonts"
    >
      {children}
    </div>
  );
}
