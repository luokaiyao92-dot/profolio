# src/
> L2 | 父级: ../CLAUDE.md

App.jsx: 可编辑作品集画布，以 HeroMotion 将独立固定导航、封装背景与全部前景内容的 100dvh Hero 舞台和 AboutStatement 品牌主张区组合为连续转场场景；Hero 舞台继续承载 LiquidHover、K/Y/a/T/M 独立悬停映射与四张倾斜卡片，第二屏只保留文字主张与邮票卡片，不再渲染装饰肖像。
CapabilityReveal.jsx: 第二屏后续滚动叙事边界，在正文高亮完成后的 1.4 个视口进度区间内依次向两侧上方撕离六张邮票，并按渠道、能力、AI 工作方式三组顺序揭示业务信息；以外层 Hover/内层撕离分层消除 transform 竞争，完成后保留约半屏稳定阅读距离，反向滚动可还原，减少动态模式直接呈现最终信息。
CapabilityReveal.css: CapabilityReveal 局部排版与合成层，定义三组信息的桌面三列/移动端单列布局、邮票 Hover 外壳与撕离内层的层级契约，以及减少动态最终态，不重复邮票卡片皮肤。
HeroMotion.jsx: Hero 到品牌主张区的运动编排边界，在字体就绪或 900ms 安全上限后建立首屏入场，并以唯一 ScrollTrigger 的 1 个完整视口进度将 Hero 舞台按顶部中心锚点从 100% 缩至 70%、固定导航等高收至屏宽 60%，让两者终点与品牌主张区完全覆盖 Hero 的时刻同步；减少动态模式保留正常文档流与完整导航宽度。
ClickSpark.jsx: React Bits 全站点击反馈层，以 DPR 适配的固定 Canvas 绘制白色八向火花，仅在活跃火花存在时请求动画帧，并尊重减少动态效果偏好。
HeroIntro.jsx: 保留的可选开场组件，以点阵双手图作为全屏按钮并通过 BlobReveal 执行 GPU 液态揭示；当前默认首屏为安静直达内容，不挂载该阻塞式封面。
HeroIntro.css: HeroIntro 层级样式，限定全屏封面、WebGL Canvas 覆盖层和揭示期间的输入锁定，不重复实现 Shader 图形。
BlobReveal.jsx: Originkit WebGL 过渡渲染器，以 Three.js ShaderMaterial、20 个柔和混合 SDF Blob 和 GSAP uProgress 补间从中心扩张图二纹理，并在卸载时释放 GPU 资源。
LiquidHover.jsx: Originkit WebGL 背景渲染器，以低分辨率流体速度场、散度与压力迭代驱动风筝草地纹理随鼠标划过产生液态扭曲，保持 Hero 前景 UI 独立稳定并由静态图片兜底。
BounceCards.jsx: React Bits 动效适配层，支持按场景关闭 IntersectionObserver 弹性入场，并在悬停时推开兄弟卡片、扶正当前卡片；品牌主张转场关闭独立入场以避免动画竞争。
BounceCards.css: BounceCards 行为样式，限定定位、指针、合成层与减少动态偏好，不覆盖邮票视觉系统。
main.jsx: React 应用启动边界，以 ClickSpark 包裹 App 后挂载到 Vite 根节点并加载全局视觉系统。
ScrollReveal.jsx: Originkit Scroll Text Highlight 中文适配层，以 Intl.Segmenter 感知中文词组，并用单一 GSAP ScrollTrigger 在 `top center` 到 `bottom center` 区间将第二屏正文从 15% 白色逐词点亮为纯白；保留 contentEditable、本地持久化与减少动态降级。
ScrollReveal.css: ScrollReveal 行为样式，提供逐词颜色合成层、排版继承和减少动态偏好纯白最终态，不重复定义正文视觉参数。
TextType.jsx: React Bits 标题适配层，可通过 IntersectionObserver 或一次性语义事件启动变速打字并用 GSAP 驱动光标；品牌主张标题只消费 HeroMotion 在进度 0.6 发出的激活事件，编辑时切换到完整文本且沿用本地持久化。
TextType.css: TextType 行为样式，提供稳定标题占位、编辑反馈和绿色呼吸光标，不重复定义 Konstant Grotesk 排版。
styles.css: 全站设计令牌、1700px 版心、品牌和选项互不干扰且可在转场中等高收至屏宽 60% 的固定胶囊导航、独立黑色页面底板、带响应式外间距与圆角裁切的 sticky 流体 Hero 舞台、无装饰肖像且正文以 24px/2 倍行距阿里巴巴普惠体横贯页面安全宽度的整屏品牌主张层、K/Y/a/T/M 透明悬停图形、悬停时上升 24px/扶正/提升层级的四张白描边固定图片卡片、真实媒体裁切、不对称项目网格，以及移动端与减少动态降级。

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
