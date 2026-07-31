import { useEffect, useRef, useState } from 'react';
import featuredArtwork from '../assets/featured-artwork.png';

const CARD_DATA = [
  {
    icon: '✦',
    title: '起步探索',
    titleEn: 'Starting Out',
    description: '从零开始，找到属于自己的方向，迈出第一步是最难也最珍贵的时刻。',
    color: '#d4d4d4',
    textColor: '#1a1a1a',
  },
  {
    icon: '◎',
    title: '成长突破',
    titleEn: 'Growing Fast',
    description: '快速迭代、不断试错，在不确定性中找到确定性，把可能性变成现实。',
    color: '#8b2020',
    textColor: '#fff',
  },
  {
    icon: '◈',
    title: '沉淀输出',
    titleEn: 'Creating Value',
    description: '将经验转化为作品，用创造影响他人，让每一步都有迹可循。',
    color: '#2a2a2a',
    textColor: '#fff',
  },
];

export default function FeaturedArtwork() {
  const sectionRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / viewportHeight));

      let newPhase = 0;
      if (progress < 0.15) {
        newPhase = 0;
      } else if (progress < 0.35) {
        newPhase = 1;
      } else if (progress < 0.5) {
        newPhase = 2;
      } else if (progress < 0.65) {
        newPhase = 3;
      } else if (progress < 0.85) {
        newPhase = 4;
      } else {
        newPhase = 5;
      }

      let newScale = 1;
      if (progress < 0.35) {
        newScale = 1 - (progress / 0.35) * 0.2;
      } else {
        newScale = 0.8;
      }

      setPhase(newPhase);
      setScale(newScale);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const imageVisible = phase >= 0;
  const titleVisible = phase >= 2;
  const splitRevealed = phase >= 3;
  const flipRevealed = phase >= 4;

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="featured-section page-shell" 
      data-layer="Section / Featured Artwork"
      data-phase={phase}
    >
      <h2 
        className={`featured-title ${titleVisible ? 'is-visible' : ''}`}
        data-layer="Text / Featured Title"
      >
        人生的每个节点
      </h2>

      <div className="featured-artwork-container">
        {/* Single image (phases 0-2) */}
        <div 
          className={`featured-art-single ${imageVisible && !splitRevealed ? 'is-visible' : ''}`}
          style={{ transform: `scale(${scale})` }}
        >
          <img src={featuredArtwork} alt="人生的每个节点插画" />
        </div>

        {/* Split into 3 cards (phases 3+) */}
        <div 
          className={`featured-art-split ${splitRevealed ? 'is-visible' : ''}`}
          style={{ transform: `scale(${scale})` }}
        >
          {CARD_DATA.map((card, index) => (
            <div 
              key={index}
              className={`featured-art-card ${flipRevealed ? 'is-flipped' : ''}`}
              style={{ 
                transitionDelay: `${index * 0.05}s`,
                '--card-color': card.color,
                '--card-text-color': card.textColor,
                '--card-rotation': `${(index - 1) * 4}deg`,
              }}
            >
              <div className="card-front">
                <span className="card-icon">{card.icon}</span>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
              <div className="card-back">
                <span>人生的每个节点</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
