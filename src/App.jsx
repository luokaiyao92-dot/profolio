/**
 * [INPUT]: 依赖 React 的 useEffect/useRef/useState，依赖 HeroMotion 的统一首屏时间线、LiquidHover 的 WebGL 背景扰动，依赖 BounceCards、ScrollReveal 的逐词滚动高亮与 TextType 的 GSAP 动效，以及风筝草地 Hero、五套字形悬停素材、四张固定 Hero 卡片图和生活图片素材
 * [OUTPUT]: 对外提供 App 单页作品集组件、左侧带 KYao 品牌且导航选项独立居中的全宽首屏 Tab、封装背景与前景内容的独立 Hero 舞台、K/Y/a/T/M 带语义文字的独立图形反馈、四张固定图片倾斜 Hero 卡片，并组织首屏、介绍、项目拼贴与精选作品区
 * [POS]: src 的核心画布编排器，以“四段式作品集”状态流组织品牌入口、个人介绍、不对称项目网格与尾部精选作品；首屏运动职责委托给 HeroMotion
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useEffect, useRef, useState } from 'react';
import BounceCards from './BounceCards.jsx';
import HeroMotion from './HeroMotion.jsx';
import LiquidHover from './LiquidHover.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import TextType from './TextType.jsx';
import heroCreateFlower from '../assets/hero-create-flower.png';
import heroHoverArrow from '../assets/hero-hover-arrow.png';
import heroHoverGreen from '../assets/hero-hover-green.png';
import heroHoverOrange from '../assets/hero-hover-orange.png';
import heroSkyKite from '../assets/hero-sky-kite.png';
import heroCardFishingCharacter from '../assets/hero-card-fishing-character.png';
import heroCardLightbulbCharacter from '../assets/hero-card-lightbulb-character.png';
import heroCardPineappleCharacter from '../assets/hero-card-pineapple-character.jpg';
import heroCardPinkCharacter from '../assets/hero-card-pink-character.png';
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

const HERO_HOVER_MEDIA = {
  k: { src: heroCreateFlower, label: null },
  y: { src: heroHoverArrow, label: 'Thinking' },
  a: { src: heroHoverOrange, label: 'Taste' },
  t: { src: heroHoverGreen, label: 'A bit of fun' },
  m: { src: heroHoverGreen, label: 'A bit of fun' },
};

const HERO_CARD_MEDIA = [
  { src: heroCardFishingCharacter, alt: '在湖边钓鱼的白色卡通角色' },
  { src: heroCardLightbulbCharacter, alt: '砖墙工作室中的灯泡角色' },
  { src: heroCardPineappleCharacter, alt: '火焰与鱼群环绕的菠萝角色' },
  { src: heroCardPinkCharacter, alt: '站在旧集装箱前的粉色卡通角色' },
];

const editables = {
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
  const [hoverArt, setHoverArt] = useState(null);
  const hoverItem = hoverArt ? HERO_HOVER_MEDIA[hoverArt.key] : null;

  const revealArt = (key, event) => {
    const signatureBounds = signatureRef.current?.getBoundingClientRect();
    const glyphBounds = event.currentTarget.getBoundingClientRect();
    if (!signatureBounds) return;

    setHoverArt({
      key,
      x: glyphBounds.left - signatureBounds.left + glyphBounds.width / 2,
      y: glyphBounds.top - signatureBounds.top + glyphBounds.height / 2,
    });
  };

  const hideArt = (key) => {
    setHoverArt((current) => current?.key === key ? null : current);
  };

  return (
    <div ref={signatureRef} className="hero-signature" data-layer="Text Group / Hero Signature">
      <div className="hero-signature-mask">
        <div className="hero-signature-line">
      <h1 className="hero-wordmark" data-layer="Text Group / KYa Wordmark">
        <EditableText
          name="hero-glyph-k"
          as="span"
          className="hero-glyph hero-glyph-k"
          onMouseEnter={(event) => revealArt('k', event)}
          onMouseLeave={() => hideArt('k')}
        >K</EditableText>
        <EditableText
          name="hero-glyph-y"
          as="span"
          className="hero-glyph hero-glyph-y"
          onMouseEnter={(event) => revealArt('y', event)}
          onMouseLeave={() => hideArt('y')}
        >Y</EditableText>
        <EditableText
          name="hero-glyph-a"
          as="span"
          className="hero-glyph hero-glyph-a"
          onMouseEnter={(event) => revealArt('a', event)}
          onMouseLeave={() => hideArt('a')}
        >a</EditableText>
      </h1>
      <EditableText name="hero-asterisk" as="span" className="hero-asterisk">*</EditableText>
      <sup className="hero-trademark" data-layer="Text Group / Trademark">
        <EditableText
          name="hero-glyph-t"
          as="span"
          className="hero-glyph hero-glyph-t"
          onMouseEnter={(event) => revealArt('t', event)}
          onMouseLeave={() => hideArt('t')}
        >T</EditableText>
        <EditableText
          name="hero-glyph-m"
          as="span"
          className="hero-glyph hero-glyph-m"
          onMouseEnter={(event) => revealArt('m', event)}
          onMouseLeave={() => hideArt('m')}
        >M</EditableText>
      </sup>
        </div>
      </div>

      <div
        className={`hero-hover-art ${hoverItem ? 'is-asset' : ''} ${hoverArt ? 'is-visible' : ''}`}
        style={{ '--hover-x': `${hoverArt?.x || 0}px`, '--hover-y': `${hoverArt?.y || 0}px` }}
        data-layer="Interaction / Hero Glyph Art"
        data-hover-key={hoverArt?.key || ''}
        aria-hidden={!hoverArt}
      >
        {hoverItem && <img src={hoverItem.src} alt="" />}
        {hoverItem?.label && <span>{hoverItem.label}</span>}
      </div>
    </div>
  );
}

function HeroCardDeck() {
  return (
    <div className="hero-card-deck" data-layer="Card Group / Hero Artwork Deck">
      {HERO_CARD_MEDIA.map((card, index) => (
        <article
          className={`hero-upload-card hero-upload-card-${index + 1}`}
          key={index}
          tabIndex={0}
          aria-label={`查看作品卡片 ${index + 1}`}
        >
          {index === 0 && <span className="hero-card-sticker hero-card-sticker-left">UX Designer</span>}
          {index === 3 && <span className="hero-card-sticker hero-card-sticker-right">Don't let people think</span>}
          <div className="hero-upload-preview has-image">
            <img src={card.src} alt={card.alt} />
          </div>
        </article>
      ))}
    </div>
  );
}

function HeroNavigation() {
  return (
    <header className="hero-header page-shell" data-layer="Navigation / Primary">
      <div className="hero-nav">
        <a className="hero-nav-brand" href="#top" aria-label="返回首页">KYao</a>
        <nav className="hero-nav-items" aria-label="主要导航">
          <NavItem name="Work" href="#work">WORK</NavItem>
          <NavItem name="Contact" href="#contact">CONTACT</NavItem>
          <NavItem name="Resume" href="#about">RESUME</NavItem>
          <NavItem name="Music" href="#about">音乐关闭</NavItem>
          <NavItem name="Language" href="#about">EN</NavItem>
        </nav>
      </div>
    </header>
  );
}

function InteractiveHero() {
  return (
    <section id="top" className="hero-section" data-layer="Section / Interactive Hero">
      <div className="hero-stage" data-layer="Group / Hero Stage">
        <div
          className="hero-background"
          role="img"
          aria-label="蓝天白云、花田、蝴蝶与彩色风筝"
          data-layer="Media / Liquid Hero Background"
        >
          <div className="hero-background-stage">
            <img className="hero-background-fallback" src={heroSkyKite} alt="" />
            <LiquidHover imageSrc={heroSkyKite} resolution={10} cursorSize={50} intensity={50} />
          </div>
        </div>
        <div className="hero-content page-shell">
          <div className="hero-scroll-content">
            <EditableText name="hero-bio" className="hero-bio">{editables.bio}</EditableText>
            <HeroSignature />
            <HeroCardDeck />
            <EditableText name="hero-idea" className="hero-idea">{editables.idea}</EditableText>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutStatement() {
  return (
    <section id="about" className="about-section page-shell" data-layer="Section / About">
      <div className="statement-background" aria-hidden="true" />
      <div className="about-transition-layer">
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
            activationEvent="portfolio:statement-ready"
          />
          <ScrollReveal
            editableName="about-copy"
            containerClassName="about-lead"
            textClassName="editable-text"
            dimColor="rgba(255, 255, 255, 0.15)"
            highlightColor="#FFFFFF"
            splitBy="words"
            scrollStart="top center"
            scrollEnd="bottom center"
            scrub
          >
            {editables.introCopy}
          </ScrollReveal>
        </div>
        <PortfolioMedia name="Portrait Artwork" className="portrait-art" src={lifeCardDefault03} alt="紫色调人物与雕塑艺术作品" />
        <BounceCards
          className="life-card-strip"
          entranceMotion={false}
          transformStyles={LIFE_CARD_TRANSFORMS}
          hoverPush={56}
          enableHover
        >
          {LIFE_CARD_MEDIA.map((media, index) => (
            <LifePhotoCard key={index} index={index + 1} {...media} />
          ))}
        </BounceCards>
      </div>
    </section>
  );
}

function App() {
  return (
    <main className="portfolio-canvas" data-layer="Page / Kaiyao Portfolio">
      <HeroMotion>
        <HeroNavigation />
        <InteractiveHero />
        <AboutStatement />
      </HeroMotion>

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
  );
}

export default App;
