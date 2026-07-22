# Kaiyao Portfolio

罗凯尧的个人作品集基础版本，使用 React、Vite、GSAP 与原生 CSS 构建，面向 PC 端展示并保留可编辑文字与独立媒体占位图层。

## 本地运行

```bash
npm install
npm run dev
```

浏览器访问 `http://127.0.0.1:4173/`。

## 生产构建

```bash
npm run build
```

构建产物生成在 `dist/`，该目录不提交到 Git。

## 当前交互

- Hero 双背景聚光揭示与平滑鼠标追踪
- K / Y / * 字形悬停泡泡反馈
- 第二屏标题变速打字与正文逐字滚动揭示
- 六张生活照片卡片的错峰弹入与悬停推开
- 可编辑文字自动保存到浏览器本地存储

## 后续替换素材

- Hero 图片入口位于 `src/App.jsx` 的 `HERO_BASE_IMAGE` 与 `HERO_REVEAL_IMAGE`
- 生活照片占位层位于 `LifePhotoCard` 组件的 `.life-card-photo`
- 透明泡泡与邮票齿孔素材位于 `assets/`

## 技术栈

- React 19.2.6
- Vite 8.0.13
- GSAP 3.15.0
- 原生 CSS
