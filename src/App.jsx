/**
 * [INPUT]: 依赖 React 的 useEffect/useRef/useState，依赖 BounceCards、ScrollReveal 与 TextType 的 GSAP 动效，依赖 hero-iridescent-bubble.png 的透明泡泡素材，依赖 styles.css 的分层画布与交互视觉系统
 * [OUTPUT]: 对外提供 App 单页作品集组件、双图层聚光 Hero、K/Y/* 分字形悬停泡泡语义、第二屏可编辑打字标题与逐字揭示正文、横铺版心的六张生活照片卡片
 * [POS]: src 的核心画布编排器，以交互式 Hero 建立视觉入口并组织介绍、项目拼贴与尾部作品结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react';
import BounceCards from './BounceCards.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import TextType from './TextType.jsx';
import heroBubbleImage from '../assets/hero-iridescent-bubble.png';

const HERO_BASE_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';
const HERO_REVEAL_IMAGE = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';
const SPOTLIGHT_RADIUS = 260;
const LIFE_CARD_TRANSFORMS = [
  'translateY(-3px) rotate(-0.4deg)',
  'translateY(-7px) rotate(1.4deg)',
  'translateY(4px) rotate(0.5deg)',
  'translateY(1px) rotate(-1.8deg)',
  'translateY(-4px) rotate(1.2deg)',
  'translateY(5px) rotate(1.7deg)',
];

const editables = {
  brand: <>Design&amp;<br />Creation</>,
  motto: '让工具成为',
  bio: '我是罗凯尧,有设计经验 8 年, 擅长 Sass 产品以及擅长打破固有框架重新搭建适合产品的设计框架,在生活中,我也一直不定期的进行设计类的 side project,维持设计思维的活跃度,与松弛感.',
  idea: <>我带来<br />工具心的使用方式以及思考.</>,
  introTitle: 'I’m Kaiyao',
  introCopy: '身处于在 AI 时代是幸运和困惑的,AI 为我装上了加速器,但是也阻碍了我前行的步伐',
  projectTitle: 'Projenct',
  projectCopy: '身处于在 AI 时代是幸运和困惑的,AI 为我装上了加速器,但是也阻碍了我前行的步伐',
};

function EditableText({ name, as: Tag = 'p', className = '', children, onMouseEnter, onMouseLeave }) {
  const ref = useRef(null);
  const storageKey = `ky-portfolio-${name}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && ref.current) ref.current.innerHTML = saved;
  }, [storageKey]);

  return (
    <Tag
      ref={ref}
      className={`editable-text ${className}`}
      data-layer={`Text / ${name}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onBlur={(event) => localStorage.setItem(storageKey, event.currentTarget.innerHTML)}
    >
      {children}
    </Tag>
  );
}

function MediaPlaceholder({ name, className = '', tone = 'gray', label }) {
  return (
    <div className={`media-layer media-${tone} ${className}`} data-layer={`Media / ${name}`} role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

function LifePhotoCard({ index, className = '', style, onMouseEnter, onMouseLeave }) {
  const layerId = String(index).padStart(2, '0');

  return (
    <article
      className={`life-card ${className}`.trim()}
      data-layer={`Card / Life Photo ${layerId}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="life-card-frame" data-layer={`Frame / Life Photo ${layerId}`} aria-hidden="true" />
      <div
        className="life-card-photo"
        data-layer={`Photo Placeholder / Life Photo ${layerId}`}
        role="img"
        aria-label={`生活照片 ${layerId} 占位图层`}
      />
    </article>
  );
}

function NavItem({ children, name }) {
  return <button className="nav-item" data-layer={`Button / Nav / ${name}`}>{children}</button>;
}

function HeroSignature() {
  const signatureRef = useRef(null);
  const [hoverBubble, setHoverBubble] = useState(null);

  const revealBubble = (key, label, event) => {
    const signatureBounds = signatureRef.current?.getBoundingClientRect();
    const glyphBounds = event.currentTarget.getBoundingClientRect();
    if (!signatureBounds) return;

    setHoverBubble({
      key,
      label,
      x: glyphBounds.left - signatureBounds.left + glyphBounds.width / 2,
      y: glyphBounds.top - signatureBounds.top + glyphBounds.height / 2,
    });
  };

  const hideBubble = (key) => {
    setHoverBubble((current) => current?.key === key ? null : current);
  };

  return (
    <div ref={signatureRef} className="hero-signature" data-layer="Text Group / Hero Signature">
      <h1 className="hero-wordmark hero-anim hero-reveal" data-layer="Text Group / KYa Wordmark">
        <EditableText
          name="hero-glyph-k"
          as="span"
          className="hero-glyph hero-glyph-k"
          onMouseEnter={(event) => revealBubble('k', 'Create', event)}
          onMouseLeave={() => hideBubble('k')}
        >K</EditableText>
        <EditableText
          name="hero-glyph-y"
          as="span"
          className="hero-glyph hero-glyph-y"
          onMouseEnter={(event) => revealBubble('y', 'Taste', event)}
          onMouseLeave={() => hideBubble('y')}
        >Y</EditableText>
        <EditableText name="hero-glyph-a" as="span" className="hero-glyph-a">a</EditableText>
      </h1>
      <EditableText
        name="hero-asterisk"
        as="span"
        className="hero-asterisk hero-glyph hero-anim hero-reveal"
        onMouseEnter={(event) => revealBubble('asterisk', 'Timing', event)}
        onMouseLeave={() => hideBubble('asterisk')}
      >*</EditableText>
      <EditableText name="hero-trademark" as="sup" className="hero-anim hero-reveal">TM</EditableText>

      <div
        className={`hero-hover-bubble ${hoverBubble ? 'is-visible' : ''}`}
        style={{ '--bubble-x': `${hoverBubble?.x || 0}px`, '--bubble-y': `${hoverBubble?.y || 0}px` }}
        data-layer="Interaction / Hero Glyph Bubble"
        aria-hidden={!hoverBubble}
      >
        <img src={heroBubbleImage} alt="" />
        <span>{hoverBubble?.label}</span>
      </div>
    </div>
  );
}

function RevealLayer({ image, cursorX, cursorY }) {
  const canvasRef = useRef(null);
  const revealRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !reveal || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_RADIUS);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.6, 'rgba(255,255,255,.75)');
    gradient.addColorStop(0.75, 'rgba(255,255,255,.4)');
    gradient.addColorStop(0.88, 'rgba(255,255,255,.12)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(cursorX, cursorY, SPOTLIGHT_RADIUS, 0, Math.PI * 2);
    context.fill();

    const mask = `url(${canvas.toDataURL()})`;
    reveal.style.maskImage = mask;
    reveal.style.webkitMaskImage = mask;
  }, [cursorX, cursorY]);

  return (
    <div className="hero-reveal-layer" data-layer="Media / Hero Reveal">
      <canvas ref={canvasRef} className="hero-mask-canvas" aria-hidden="true" />
      <div
        ref={revealRef}
        className="hero-reveal-image"
        style={{ backgroundImage: `url(${image})` }}
        aria-hidden="true"
      />
    </div>
  );
}

function InteractiveHero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const handleMouseMove = (event) => {
      mouse.current = { x: event.clientX, y: event.clientY };
      if (smooth.current.x < -900) smooth.current = { ...mouse.current };
    };

    const animate = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ ...smooth.current });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="hero-section" data-layer="Section / Interactive Hero">
      <div
        className="hero-base-image hero-zoom"
        data-layer="Media / Hero Base"
        style={{ backgroundImage: `url(${HERO_BASE_IMAGE})` }}
        role="img"
        aria-label="深色岩层与自然地貌背景"
      />
      <RevealLayer image={HERO_REVEAL_IMAGE} cursorX={cursorPos.x} cursorY={cursorPos.y} />
      <div className="hero-overlay" data-layer="Decoration / Hero Gradient" />

      <div className="hero-content page-shell">
        <header className="hero-header" data-layer="Navigation / Primary">
          <EditableText name="hero-brand" as="h2" className="hero-brand">{editables.brand}</EditableText>
          <EditableText name="hero-motto" className="hero-motto">{editables.motto}</EditableText>
          <div className="hero-nav">
            <NavItem name="Work">WORK</NavItem>
            <NavItem name="Contact">CONTACT</NavItem>
            <NavItem name="Resume">REASUM</NavItem>
            <NavItem name="Music">音乐关掉</NavItem>
            <NavItem name="Language">EN</NavItem>
          </div>
        </header>

        <EditableText name="hero-bio" className="hero-bio hero-anim hero-fade">{editables.bio}</EditableText>
        <HeroSignature />
        <EditableText name="hero-idea" className="hero-idea hero-anim hero-fade">{editables.idea}</EditableText>
        <div className="spotlight-hint hero-anim hero-fade" data-layer="Hint / Spotlight" aria-hidden="true">
          <span className="spotlight-dot" />
          MOVE TO REVEAL
        </div>
      </div>
    </section>
  );
}

function App() {
  return (
    <main className="portfolio-canvas" data-layer="Page / Kaiyao Portfolio">
      <InteractiveHero />

      <section className="about-section page-shell" data-layer="Section / About">
        <div className="about-copy-column" data-layer="Group / About Copy">
          <TextType
            text={editables.introTitle}
            as="h2"
            editableName="about-title"
            contentClassName="about-title-content"
            typingSpeed={78}
            initialDelay={220}
            loop={false}
            showCursor
            cursorCharacter="|"
            cursorBlinkDuration={0.62}
            cursorClassName="about-title-cursor"
            variableSpeed={{ min: 54, max: 108 }}
            startOnVisible
          />
          <ScrollReveal
            editableName="about-copy"
            containerClassName="about-lead"
            textClassName="editable-text"
            baseOpacity={0.12}
            baseRotation={2}
            blurStrength={8}
            rotationEnd="bottom 58%"
            wordAnimationEnd="bottom 52%"
          >
            {editables.introCopy}
          </ScrollReveal>
        </div>
        <MediaPlaceholder name="Particle Fish Artwork" className="fish-art" tone="particles" label="Particle artwork placeholder" />
        <BounceCards
          className="life-card-strip"
          animationDelay={0.12}
          animationStagger={0.09}
          easeType="elastic.out(1, 0.55)"
          transformStyles={LIFE_CARD_TRANSFORMS}
          hoverPush={56}
          enableHover
        >
          {Array.from({ length: 6 }, (_, index) => <LifePhotoCard key={index} index={index + 1} />)}
        </BounceCards>
      </section>

      <section className="project-section page-shell" data-layer="Section / Project Layout">
        <EditableText name="project-section-note" className="section-note">{editables.idea}</EditableText>
        <div className="project-layout" data-layer="Auto Layout / Project Mosaic">
          <div className="project-left-stack" data-layer="Auto Layout / Project Left Stack">
            <MediaPlaceholder name="Project Card Large" className="project-image project-large angled" tone="gray" label="Project image placeholder" />
            <MediaPlaceholder name="Project Card Small" className="project-image project-small" tone="gray" label="Project image placeholder" />
          </div>
          <div className="project-copy" data-layer="Group / Project Copy">
            <EditableText name="project-title" as="h2">{editables.projectTitle}</EditableText>
            <EditableText name="project-copy" className="project-description">{editables.projectCopy}</EditableText>
          </div>
          <div className="project-right-stack" data-layer="Auto Layout / Project Right Stack">
            <MediaPlaceholder name="Project Card Top" className="project-image" tone="gray" label="Project image placeholder" />
            <MediaPlaceholder name="Project Card Bottom" className="project-image" tone="gray" label="Project image placeholder" />
          </div>
        </div>
      </section>

      <section className="featured-section page-shell" data-layer="Section / Featured Artwork">
        <EditableText name="featured-note" className="section-note">{editables.idea}</EditableText>
        <MediaPlaceholder name="Featured Sticker Artwork" className="featured-art" tone="sticker" label="Featured artwork placeholder" />
      </section>
    </main>
  );
}

export default App;
