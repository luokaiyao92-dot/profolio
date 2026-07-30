/**
 * [INPUT]: 依赖 React 的 useLayoutEffect/useRef，依赖 GSAP ScrollTrigger，依赖 BounceCards 的邮票卡片容器与 App.jsx 传入的生活卡片 children
 * [OUTPUT]: 对外提供 CapabilityReveal 组件，以第二屏唯一后续滚动进度依次撕离六张邮票，并分三阶段揭示渠道、能力与 AI 工作方式
 * [POS]: src 的第二屏叙事动效边界，位于正文高亮之后、项目区之前；不拥有图片素材和首屏转场，仅编排邮票退出与业务信息显现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Children, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BounceCards from './BounceCards.jsx';
import './CapabilityReveal.css';

gsap.registerPlugin(ScrollTrigger);

const TEAR_DIRECTIONS = [-1, 1, -1, 1, -1, 1];
const TEAR_ROTATIONS = [-24, 19, -16, 22, -20, 18];

export default function CapabilityReveal({ children, transformStyles }) {
  const scopeRef = useRef(null);

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    const aboutSection = scope?.closest('.about-section');
    if (!scope || !aboutSection) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      const cards = gsap.utils.toArray('.tear-card-visual', scope);
      const groups = gsap.utils.toArray('.capability-group', scope);

      if (reducedMotion) {
        gsap.set(cards, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set(groups, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(groups, { autoAlpha: 0, y: 24 });
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: aboutSection,
          start: () => `top+=${window.innerHeight} top`,
          end: () => `top+=${window.innerHeight * 2.4} top`,
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            scope.dataset.tearProgress = progress.toFixed(3);
            scope.style.pointerEvents = progress > 0.015 ? 'none' : 'auto';
          },
        },
      });

      cards.forEach((card, index) => {
        const direction = TEAR_DIRECTIONS[index];
        timeline.to(card, {
          x: () => direction * (window.innerWidth * (0.48 + index * 0.035)),
          y: () => -window.innerHeight * (0.24 + (index % 3) * 0.08),
          rotation: TEAR_ROTATIONS[index],
          autoAlpha: 0,
          duration: 1,
        }, index * 0.62);

        if (index === 1 || index === 3 || index === 5) {
          timeline.to(groups[(index - 1) / 2], {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
          }, index * 0.62 + 0.28);
        }
      });
    }, scope);

    return () => {
      context.revert();
      scope.style.removeProperty('pointer-events');
      delete scope.dataset.tearProgress;
    };
  }, []);

  return (
    <div ref={scopeRef} className="capability-sequence" data-layer="Motion / Tear Cards to Capabilities">
      <div className="capability-reveal" aria-label="个人能力与工作方式">
        <section className="capability-group capability-group-channels">
          <p className="capability-kicker">擅长渠道</p>
          <h3>小红书 · 抖音<br />微信公众号</h3>
        </section>
        <section className="capability-group capability-group-skills">
          <p className="capability-kicker">能力项</p>
          <h3>拆解业务 · 洞察痛点 · 数据分析<br />设计策略 · 挖掘潜在用户</h3>
        </section>
        <section className="capability-group capability-group-method">
          <p className="capability-kicker">工作方式</p>
          <h3>让 AI 融入工作的每一个环节。</h3>
          <p>整体融入，而不是只在某一个环节简单叠加。</p>
        </section>
      </div>
      <BounceCards
        className="life-card-strip"
        entranceMotion={false}
        transformStyles={transformStyles}
        hoverPush={56}
        enableHover
      >
        {Children.map(children, (child, index) => (
          <div className={`tear-card-shell tear-card-shell-${index + 1}`}>
            <div className="tear-card-visual">{child}</div>
          </div>
        ))}
      </BounceCards>
    </div>
  );
}
