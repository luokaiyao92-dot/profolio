/**
 * [INPUT]: 依赖 React 的 Children/cloneElement/useLayoutEffect/useRef，依赖 GSAP 的弹性补间能力，接收现有 LifePhotoCard 子组件、基础 transform 列表与可选入场开关
 * [OUTPUT]: 对外提供 BounceCards 动效容器，可按场景关闭独立弹性入场，并在悬停时推开相邻卡片、扶正当前卡片
 * [POS]: src 的卡片动效适配层，不创建图片内容，只增强 App.jsx 已拆分的卡片结构并保持透明齿孔与照片图层契约
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Children, cloneElement, isValidElement, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

function removeRotation(transform) {
  return /rotate\([\s\S]*?\)/.test(transform)
    ? transform.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)')
    : `${transform === 'none' ? '' : transform} rotate(0deg)`.trim();
}

function addHorizontalPush(transform, offset) {
  return `${transform === 'none' ? '' : transform} translateX(${offset}px)`.trim();
}

export default function BounceCards({
  className = '',
  children,
  animationDelay = 0.12,
  animationStagger = 0.09,
  easeType = 'elastic.out(1, 0.55)',
  entranceMotion = true,
  transformStyles = [],
  hoverPush = 56,
  enableHover = true,
}) {
  const containerRef = useRef(null);
  const cards = Children.toArray(children);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let observer;
    const context = gsap.context(() => {
      const targets = gsap.utils.toArray('.bounce-card-item', container);

      if (!entranceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(targets, { scale: 1 });
        return;
      }

      gsap.set(targets, { scale: 0, transformOrigin: '50% 50%' });
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;

        gsap.to(targets, {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
          duration: 0.8,
          overwrite: 'auto',
        });
        observer.disconnect();
      }, { threshold: 0.3 });
      observer.observe(container);
    }, container);

    return () => {
      observer?.disconnect();
      context.revert();
    };
  }, [animationDelay, animationStagger, cards.length, easeType, entranceMotion]);

  const animateHover = (hoveredIndex) => {
    if (!enableHover || !containerRef.current) return;

    cards.forEach((_, index) => {
      const target = containerRef.current.querySelector(`.bounce-card-${index}`);
      if (!target) return;

      gsap.killTweensOf(target);
      const baseTransform = transformStyles[index] || 'none';
      const transform = index === hoveredIndex
        ? `${removeRotation(baseTransform)} scale(1.06)`
        : addHorizontalPush(baseTransform, index < hoveredIndex ? -hoverPush : hoverPush);

      gsap.to(target, {
        transform,
        duration: 0.42,
        ease: 'back.out(1.4)',
        delay: Math.abs(hoveredIndex - index) * 0.035,
        overwrite: 'auto',
      });
    });
  };

  const resetCards = () => {
    if (!enableHover || !containerRef.current) return;

    cards.forEach((_, index) => {
      const target = containerRef.current.querySelector(`.bounce-card-${index}`);
      if (!target) return;

      gsap.killTweensOf(target);
      gsap.to(target, {
        transform: transformStyles[index] || 'none',
        duration: 0.42,
        ease: 'back.out(1.4)',
        overwrite: 'auto',
      });
    });
  };

  return (
    <div
      ref={containerRef}
      className={`bounce-cards-container ${className}`}
      data-layer="Motion / Bounce Life Photo Cards"
    >
      {cards.map((child, index) => {
        if (!isValidElement(child)) return child;

        return cloneElement(child, {
          className: `${child.props.className || ''} bounce-card-item bounce-card-${index}`.trim(),
          style: { ...child.props.style, transform: transformStyles[index] || 'none' },
          onMouseEnter: () => animateHover(index),
          onMouseLeave: resetCards,
        });
      })}
    </div>
  );
}
