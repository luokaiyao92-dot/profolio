# src/
> L2 | 父级: ../CLAUDE.md

App.jsx: 可编辑作品集画布，以双背景图、Canvas 软遮罩和 RAF 平滑追踪构成交互式 Hero，将 K/Y/a/*/TM 拆为独立命名图层，以透明泡泡反馈 K→Create、Y→Taste、*→Timing，并组合 TextType 标题、ScrollReveal 正文与 BounceCards 六卡片构成第二屏。
BounceCards.jsx: React Bits 动效适配层，以 IntersectionObserver 触发 GSAP 弹性错峰入场，并在悬停时推开兄弟卡片、扶正当前卡片，不接管卡片内容结构。
BounceCards.css: BounceCards 行为样式，限定定位、指针、合成层与减少动态偏好，不覆盖邮票视觉系统。
main.jsx: React 应用启动边界，将 App 挂载到 Vite 提供的根节点并加载全局视觉系统。
ScrollReveal.jsx: React Bits 中文适配层，以 GSAP ScrollTrigger 驱动第二屏正文逐字旋转、透明度与模糊揭示，并保留 contentEditable 与本地持久化。
ScrollReveal.css: ScrollReveal 行为样式，提供逐字合成层、排版继承和减少动态偏好降级，不重复定义正文视觉参数。
TextType.jsx: React Bits 标题适配层，以 IntersectionObserver 启动单次变速打字并用 GSAP 驱动光标，编辑时切换到完整文本且沿用本地持久化。
TextType.css: TextType 行为样式，提供稳定标题占位、编辑反馈和绿色呼吸光标，不重复定义 Konstant Grotesk 排版。
styles.css: 全站设计令牌、1700px 版心、暗色画布、K/Y/* 上层遮挡式泡泡悬停与 Konstant Grotesk 字标、Hero 入场动效，以及第二屏全版心卡片横铺、SVG Alpha 透明齿孔和精确投影规则。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
