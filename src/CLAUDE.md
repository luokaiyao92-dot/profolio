# src/
> L2 | 父级: ../CLAUDE.md

App.jsx: 可编辑作品集画布，管理 HeroIntro 封面状态，封面交接完成后才挂载 LiquidHover 并以真实风筝草地图片作为 100dvh Hero 背景，同时承载 K/Y/a/*/TM 独立命名图层和 K→Create、Y→Taste、*→Timing 透明泡泡反馈。
HeroIntro.jsx: 首屏状态边界，以点阵双手图作为全屏按钮，在页面加载时并行预取独立 BlobReveal 代码块与风筝草地纹理，点击后立即执行 2 秒 GPU 液态揭示并交接给同图背景的真实 Hero。
HeroIntro.css: HeroIntro 层级样式，限定全屏封面、WebGL Canvas 覆盖层和揭示期间的输入锁定，不重复实现 Shader 图形。
BlobReveal.jsx: Originkit WebGL 过渡渲染器，以 Three.js ShaderMaterial、20 个柔和混合 SDF Blob 和 GSAP uProgress 补间从中心扩张图二纹理，并在卸载时释放 GPU 资源。
LiquidHover.jsx: Originkit WebGL 背景渲染器，以低分辨率流体速度场、散度与压力迭代驱动风筝草地纹理随鼠标划过产生液态扭曲，保持 Hero 前景 UI 独立稳定并由静态图片兜底。
BounceCards.jsx: React Bits 动效适配层，以 IntersectionObserver 触发 GSAP 弹性错峰入场，并在悬停时推开兄弟卡片、扶正当前卡片，不接管卡片内容结构。
BounceCards.css: BounceCards 行为样式，限定定位、指针、合成层与减少动态偏好，不覆盖邮票视觉系统。
main.jsx: React 应用启动边界，将 App 挂载到 Vite 提供的根节点并加载全局视觉系统。
ScrollReveal.jsx: React Bits 中文适配层，以 GSAP ScrollTrigger 驱动第二屏正文逐字旋转、透明度与模糊揭示，并保留 contentEditable 与本地持久化。
ScrollReveal.css: ScrollReveal 行为样式，提供逐字合成层、排版继承和减少动态偏好降级，不重复定义正文视觉参数。
TextType.jsx: React Bits 标题适配层，以 IntersectionObserver 启动单次变速打字并用 GSAP 驱动光标，编辑时切换到完整文本且沿用本地持久化。
TextType.css: TextType 行为样式，提供稳定标题占位、编辑反馈和绿色呼吸光标，不重复定义 Konstant Grotesk 排版。
styles.css: 全站设计令牌、1700px 版心、保持原图亮度且无黑色遮罩的 sticky 流体 Hero、后续黑色章节向上覆盖首屏的滚动层级、静态兜底、K/Y/* 泡泡悬停与字标入场，以及真实媒体裁切、不对称项目网格和移动端重排规则。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
