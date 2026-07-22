/**
 * [INPUT]: 依赖 React 的状态、计时器与 IntersectionObserver，依赖 GSAP 提供光标呼吸，接收标题文本、输入节奏与可编辑键
 * [OUTPUT]: 对外提供 TextType 可见时启动的变速打字组件，支持单次或循环文本、减少动态偏好与本地可编辑持久化
 * [POS]: src 的标题动效适配层，将 React Bits 打字行为限制在文本内容层，避免编辑操作与光标装饰互相污染
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './TextType.css';

function readEditableText(storageKey, fallbackText) {
  if (typeof window === 'undefined' || !storageKey) return fallbackText;

  const savedText = window.localStorage.getItem(storageKey);
  if (!savedText) return fallbackText;

  const textLayer = document.createElement('div');
  textLayer.innerHTML = savedText;
  return textLayer.textContent || fallbackText;
}

export default function TextType({
  text,
  as: Component = 'div',
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = '',
  contentClassName = '',
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = '|',
  cursorClassName = '',
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  editableName,
  ...props
}) {
  const fallbackText = Array.isArray(text) ? text[0] || '' : text;
  const storageKey = editableName ? `ky-portfolio-${editableName}` : '';
  const [editableText, setEditableText] = useState(() => readEditableText(storageKey, fallbackText));
  const sourceText = editableName ? editableText : text;
  const textArray = useMemo(() => (Array.isArray(sourceText) ? sourceText : [sourceText]), [sourceText]);
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [displayedText, setDisplayedText] = useState(reducedMotion ? textArray[0] : '');
  const [currentCharIndex, setCurrentCharIndex] = useState(reducedMotion ? textArray[0].length : 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible || reducedMotion);
  const [isEditing, setIsEditing] = useState(false);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    return Math.random() * (variableSpeed.max - variableSpeed.min) + variableSpeed.min;
  }, [typingSpeed, variableSpeed]);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current || reducedMotion) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [reducedMotion, startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(cursorRef.current, { opacity: 1 }, {
        opacity: 0.15,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }, containerRef);
    return () => context.revert();
  }, [cursorBlinkDuration, showCursor]);

  useEffect(() => {
    if (!isVisible || isEditing || reducedMotion) return undefined;

    const currentText = textArray[currentTextIndex] || '';
    const processedText = reverseMode ? Array.from(currentText).reverse().join('') : currentText;
    let timeout;

    if (isDeleting) {
      if (displayedText === '') {
        setIsDeleting(false);
        onSentenceComplete?.(currentText, currentTextIndex);
        if (currentTextIndex === textArray.length - 1 && !loop) return undefined;
        setCurrentTextIndex((index) => (index + 1) % textArray.length);
        setCurrentCharIndex(0);
      } else {
        timeout = window.setTimeout(() => setDisplayedText((value) => value.slice(0, -1)), deletingSpeed);
      }
    } else if (currentCharIndex < processedText.length) {
      const delay = currentCharIndex === 0 && displayedText === '' ? initialDelay : getRandomSpeed();
      timeout = window.setTimeout(() => {
        setDisplayedText((value) => value + processedText[currentCharIndex]);
        setCurrentCharIndex((index) => index + 1);
      }, delay);
    } else {
      onSentenceComplete?.(currentText, currentTextIndex);
      if (loop || currentTextIndex < textArray.length - 1) {
        timeout = window.setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    }

    return () => window.clearTimeout(timeout);
  }, [currentCharIndex, currentTextIndex, deletingSpeed, displayedText, getRandomSpeed, initialDelay, isDeleting, isEditing, isVisible, loop, onSentenceComplete, pauseDuration, reducedMotion, reverseMode, textArray]);

  const beginEditing = () => {
    if (!editableName) return;
    const completeText = textArray[currentTextIndex] || '';
    setIsEditing(true);
    setIsDeleting(false);
    setDisplayedText(completeText);
    setCurrentCharIndex(completeText.length);
  };

  const saveEditing = (event) => {
    if (!editableName) return;
    const nextText = event.currentTarget.innerText;
    window.localStorage.setItem(storageKey, nextText);
    setEditableText(nextText);
    setDisplayedText(nextText);
    setCurrentCharIndex(nextText.length);
    setIsEditing(false);
  };

  const currentColor = textColors.length ? textColors[currentTextIndex % textColors.length] : 'inherit';
  const shouldHideCursor = hideCursorWhileTyping && (currentCharIndex < (textArray[currentTextIndex] || '').length || isDeleting);

  return createElement(
    Component,
    {
      ref: containerRef,
      className: `text-type ${className}`.trim(),
      'data-layer': 'Motion / About Title Text Type',
      ...props,
    },
    <span
      className={`text-type__content ${contentClassName}`.trim()}
      style={{ color: currentColor }}
      data-layer={`Text / ${editableName || 'text-type'}`}
      contentEditable={Boolean(editableName)}
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={beginEditing}
      onBlur={saveEditing}
    >
      {displayedText}
    </span>,
    showCursor && (
      <span
        ref={cursorRef}
        className={`text-type__cursor ${cursorClassName} ${shouldHideCursor ? 'text-type__cursor--hidden' : ''}`.trim()}
        aria-hidden="true"
      >
        {cursorCharacter}
      </span>
    ),
  );
}
