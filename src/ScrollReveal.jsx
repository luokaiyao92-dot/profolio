/**
 * [INPUT]: 依赖 React 的 useLayoutEffect/useMemo/useRef/useState，依赖 GSAP ScrollTrigger，将纯文本、滚动容器与揭示参数作为输入
 * [OUTPUT]: 对外提供 ScrollReveal 可编辑逐字滚动揭示组件，在视口滚动中完成旋转、透明度与模糊过渡
 * [POS]: src 的正文动效适配层，为中文内容提供逐字分段并将动画生命周期限制在自身节点，不干扰 BounceCards 等兄弟动效
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

function readEditableText(storageKey, fallbackText) {
  if (typeof window === 'undefined' || !storageKey) return fallbackText;

  const savedText = window.localStorage.getItem(storageKey);
  if (!savedText) return fallbackText;

  const textLayer = document.createElement('div');
  textLayer.innerHTML = savedText;
  return textLayer.textContent || fallbackText;
}

export default function ScrollReveal({
  children,
  editableName,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'bottom 58%',
  wordAnimationEnd = 'bottom 52%',
}) {
  const containerRef = useRef(null);
  const initialText = typeof children === 'string' ? children : '';
  const storageKey = editableName ? `ky-portfolio-${editableName}` : '';
  const [text, setText] = useState(() => readEditableText(storageKey, initialText));

  const splitText = useMemo(() => Array.from(text).map((character, index) => (
    <span className="scroll-reveal-character" key={`${index}-${character}`}>
      {character}
    </span>
  )), [text]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const characters = container.querySelectorAll('.scroll-reveal-character');
    const scroller = scrollContainerRef?.current;
    const scrollSource = scroller ? { scroller } : {};
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(container, { rotate: 0 });
        gsap.set(characters, { opacity: 1, filter: 'blur(0px)' });
        return;
      }

      gsap.fromTo(container, {
        rotate: baseRotation,
        transformOrigin: '0% 50%',
      }, {
        rotate: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          end: rotationEnd,
          scrub: true,
          ...scrollSource,
        },
      });

      gsap.fromTo(characters, {
        opacity: baseOpacity,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          end: wordAnimationEnd,
          scrub: true,
          ...scrollSource,
        },
      });
    }, container);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, rotationEnd, scrollContainerRef, text, wordAnimationEnd]);

  const saveText = (event) => {
    const nextText = event.currentTarget.innerText;
    if (storageKey) window.localStorage.setItem(storageKey, nextText);
    setText(nextText);
  };

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`.trim()}
      data-layer="Motion / About Copy Scroll Reveal"
    >
      <p
        className={`scroll-reveal-text ${textClassName}`.trim()}
        data-layer={`Text / ${editableName || 'scroll-reveal'}`}
        contentEditable={Boolean(editableName)}
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={saveText}
      >
        {splitText}
      </p>
    </div>
  );
}
