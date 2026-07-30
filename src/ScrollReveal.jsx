/**
 * [INPUT]: 依赖 React 的 useLayoutEffect/useMemo/useRef/useState，依赖 GSAP ScrollTrigger，将正文、明暗颜色、分词策略与滚动起止位置作为输入
 * [OUTPUT]: 对外提供 ScrollReveal 可编辑滚动高亮组件，使正文词组随滚动从低对比度逐步点亮为纯白
 * [POS]: src 的正文动效适配层，以中文感知分词和单一 ScrollTrigger 承接 Originkit Scroll Text Highlight，不改变第二屏业务布局
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

function splitText(text, splitBy) {
  if (splitBy === 'characters') return Array.from(text);

  if (typeof Intl?.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  return text.split(/(\s+)/).filter(Boolean);
}

export default function ScrollReveal({
  children,
  editableName,
  containerClassName = '',
  textClassName = '',
  dimColor = 'rgba(255, 255, 255, 0.15)',
  highlightColor = '#FFFFFF',
  splitBy = 'words',
  scrollStart = 'top center',
  scrollEnd = 'bottom center',
  scrub = true,
}) {
  const paragraphRef = useRef(null);
  const initialText = typeof children === 'string' ? children : '';
  const storageKey = editableName ? `ky-portfolio-${editableName}` : '';
  const [text, setText] = useState(() => readEditableText(storageKey, initialText));
  const segments = useMemo(() => splitText(text, splitBy), [splitBy, text]);

  useLayoutEffect(() => {
    const paragraph = paragraphRef.current;
    if (!paragraph) return undefined;

    const targets = paragraph.querySelectorAll('.scroll-highlight-token');
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(targets, { color: highlightColor });
        return;
      }

      gsap.fromTo(targets, {
        color: dimColor,
      }, {
        color: highlightColor,
        stagger: splitBy === 'characters' ? 0.03 : 0.1,
        ease: 'none',
        scrollTrigger: {
          trigger: paragraph,
          start: scrollStart,
          end: scrollEnd,
          scrub,
        },
      });
    }, paragraph);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [dimColor, highlightColor, scrollEnd, scrollStart, scrub, splitBy, text]);

  const saveText = (event) => {
    const nextText = event.currentTarget.innerText;
    if (storageKey) window.localStorage.setItem(storageKey, nextText);
    setText(nextText);
  };

  return (
    <p
      ref={paragraphRef}
      className={`scroll-reveal-text ${containerClassName} ${textClassName}`.trim()}
      data-layer="Motion / About Copy Scroll Highlight"
      contentEditable={Boolean(editableName)}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={saveText}
      style={{ '--scroll-dim-color': dimColor }}
    >
      {segments.map((segment, index) => (/^\s+$/.test(segment) ? segment : (
        <span className="scroll-highlight-token" key={`${index}-${segment}`}>
          {segment}
        </span>
      )))}
    </p>
  );
}
