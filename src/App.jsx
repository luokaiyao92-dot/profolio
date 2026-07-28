/**
 * [INPUT]: 依赖 React 的 useEffect/useRef/useState，依赖 HeroIntro 的封面状态边界、LiquidHover 的 WebGL 背景扰动，依赖 BounceCards、ScrollReveal 与 TextType 的 GSAP 动效，以及风筝草地 Hero、泡泡和五张生活图片素材
 * [OUTPUT]: 对外提供 App 单页作品集组件、Fluid Reveal 入口、可随指针流动的风筝草地 Hero、K/Y/* 分字形悬停泡泡语义，以及介绍、项目拼贴与精选作品区
 * [POS]: src 的核心画布编排器，以“封面解锁→四段式作品集”状态流组织品牌入口、个人介绍、不对称项目网格与尾部精选作品
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react';
import BounceCards from './BounceCards.jsx';
import HeroIntro from './HeroIntro.jsx';
import LiquidHover from './LiquidHover.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import TextType from './TextType.jsx';
import './HeroIntro.css';
import heroBubbleImage from '../assets/hero-iridescent-bubble.png';
import heroSkyKite from '../assets/hero-sky-kite.png';
import lifeCardDefault01 from '../assets/life-card-default-01.jpg';
import lifeCardDefault02 from '../assets/life-card-default-02.jpg';
import lifeCardDefault03 from '../assets/life-card-default-03.jpg';
import lifeCardDefault04 from '../assets/life-card-default-04.jpg';
import lifeCardDefault05 from '../assets/life-card-default-05.jpg';

const LIFE_CARD_TRANSFORMS = [
  'translateY(-3px) rotate(-0.4deg)',
  'translateY(-7px) rotate(1.4deg)',
  'translateY(4px) rotate(0.5deg)',
  'translateY(1px) rotate(-1.8deg)',
  'translateY(-4px) rotate(1.2deg)',
  'translateY(5px) rotate(1.7deg)',
];

const LIFE_CARD_MEDIA = [
  { defaultImage: lifeCardDefault01, hoverImage: null, alt: '蓝色天空中的飞机与建筑剪影' },
  { defaultImage: lifeCardDefault02, hoverImage: null, alt: '橙红色山丘与天空' },
  { defaultImage: lifeCardDefault03, hoverImage: null, alt: '紫色调生活记录与雕塑' },
  { defaultImage: lifeCardDefault04, hoverImage: null, alt: '绿色调城市建筑' },
  { defaultImage: lifeCardDefault05, hoverImage: null, alt: '暖橙色天空中的飞机与建筑剪影' },
  { defaultImage: lifeCardDefault01, hoverImage: null, alt: '蓝色天空中的飞机与建筑剪影' },
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

function PortfolioMedia({ name, className = '', src, alt }) {
  return (
    <figure className={`portfolio-media ${className}`} data-layer={`Media / ${name}`}>
      <img src={src} alt={alt} decoding="async" />
    </figure>
  );
}

function LifePhotoCard({ index, defaultImage, hoverImage, alt, className = '', style, onMouseEnter, onMouseLeave }) {
  const layerId = String(index).padStart(2, '0');

  return (
    <article
      className={`life-card ${hoverImage ? 'has-hover-image' : ''} ${className}`.trim()}
      data-layer={`Card / Life Photo ${layerId}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="life-card-frame" data-layer={`Frame / Life Photo ${layerId}`} aria-hidden="true" />
      <div
        className="life-card-photo"
        data-layer={`Photo Clip / Life Photo ${layerId}`}
        role="img"
        aria-label={alt}
      >
        <div
          className={`life-card-photo-layer life-card-photo-default ${defaultImage ? 'has-image' : 'is-placeholder'}`}
          data-layer={`Photo Default / Life Photo ${layerId}`}
        >
          {defaultImage && <img src={defaultImage} alt="" loading="lazy" decoding="async" />}
        </div>
        <div
          className={`life-card-photo-layer life-card-photo-hover ${hoverImage ? 'has-image' : 'is-placeholder'}`}
          data-layer={`Photo Hover Original / Life Photo ${layerId}`}
          aria-hidden="true"
        >
          {hoverImage && <img src={hoverImage} alt="" loading="lazy" decoding="async" />}
        </div>
      </div>
    </article>
  );
}

function NavItem({ children, name, href }) {
  return <a className="nav-item" data-layer={`Button / Nav / ${name}`} href={href}>{children}</a>;
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

function InteractiveHero({ liquidEnabled }) {
  return (
    <section className="hero-section" data-layer="Section / Interactive Hero">
      <div
        className="hero-background"
        role="img"
        aria-label="蓝天白云、花田、蝴蝶与彩色风筝"
        data-layer="Media / Liquid Hero Background"
      >
        <img className="hero-background-fallback" src={heroSkyKite} alt="" />
        {liquidEnabled && (
          <LiquidHover imageSrc={heroSkyKite} resolution={10} cursorSize={50} intensity={50} />
        )}
      </div>
      <div className="hero-content page-shell">
        <header className="hero-header" data-layer="Navigation / Primary">
          <EditableText name="hero-brand" as="h2" className="hero-brand">{editables.brand}</EditableText>
          <EditableText name="hero-motto" className="hero-motto">{editables.motto}</EditableText>
          <div className="hero-nav">
            <NavItem name="Work" href="#work">WORK</NavItem>
            <NavItem name="Contact" href="#contact">CONTACT</NavItem>
            <NavItem name="Resume" href="#about">RESUME</NavItem>
            <NavItem name="Music" href="#about">音乐关闭</NavItem>
            <NavItem name="Language" href="#about">EN</NavItem>
          </div>
        </header>

        <EditableText name="hero-bio" className="hero-bio hero-anim hero-fade">{editables.bio}</EditableText>
        <HeroSignature />
        <EditableText name="hero-idea" className="hero-idea hero-anim hero-fade">{editables.idea}</EditableText>
      </div>
    </section>
  );
}

function App() {
  const [isIntroVisible, setIsIntroVisible] = useState(true);

  return (
    <>
      {isIntroVisible && <HeroIntro onComplete={() => setIsIntroVisible(false)} />}
      <main className="portfolio-canvas" data-layer="Page / Kaiyao Portfolio" aria-hidden={isIntroVisible || undefined}>
      <InteractiveHero liquidEnabled={!isIntroVisible} />

      <section id="about" className="about-section page-shell" data-layer="Section / About">
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
        <PortfolioMedia name="Portrait Artwork" className="portrait-art" src={lifeCardDefault03} alt="紫色调人物与雕塑艺术作品" />
        <BounceCards
          className="life-card-strip"
          animationDelay={0.12}
          animationStagger={0.09}
          easeType="elastic.out(1, 0.55)"
          transformStyles={LIFE_CARD_TRANSFORMS}
          hoverPush={56}
          enableHover
        >
          {LIFE_CARD_MEDIA.map((media, index) => (
            <LifePhotoCard key={index} index={index + 1} {...media} />
          ))}
        </BounceCards>
      </section>

      <section id="work" className="project-section page-shell" data-layer="Section / Project Layout">
        <EditableText name="project-section-note" className="section-note">{editables.idea}</EditableText>
        <div className="project-layout" data-layer="Auto Layout / Project Mosaic">
          <div className="project-left-stack" data-layer="Auto Layout / Project Left Stack">
            <PortfolioMedia name="Project Card Large" className="project-image project-large angled" src={lifeCardDefault01} alt="蓝色天空与飞机项目视觉" />
            <PortfolioMedia name="Project Card Small" className="project-image project-small" src={lifeCardDefault02} alt="橙红山丘项目视觉" />
          </div>
          <div className="project-copy" data-layer="Group / Project Copy">
            <EditableText name="project-title" as="h2">{editables.projectTitle}</EditableText>
            <EditableText name="project-copy" className="project-description">{editables.projectCopy}</EditableText>
          </div>
          <div className="project-right-stack" data-layer="Auto Layout / Project Right Stack">
            <PortfolioMedia name="Project Card Top" className="project-image" src={lifeCardDefault04} alt="绿色城市建筑项目视觉" />
            <PortfolioMedia name="Project Card Bottom" className="project-image" src={lifeCardDefault05} alt="暖橙天空项目视觉" />
          </div>
        </div>
      </section>

      <section id="contact" className="featured-section page-shell" data-layer="Section / Featured Artwork">
        <EditableText name="featured-note" className="section-note">{editables.idea}</EditableText>
        <PortfolioMedia name="Featured Artwork" className="featured-art" src={lifeCardDefault03} alt="紫色调精选人物艺术作品" />
      </section>
      </main>
    </>
  );
}

export default App;
