# Kaiyao Portfolio

罗凯尧的个人作品集，使用 React、Vite、Three.js、GSAP 与原生 CSS 构建，包含 GPU 首屏转场、流体背景和覆盖式章节滚动。

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

- 点阵双手入口点击后，以 GPU 液态融化动效揭示 Hero
- 风筝草地 Hero 响应鼠标划过产生流体扭曲
- Hero 固定在视口底层，后续章节向上滚动覆盖首屏
- K / Y / * 字形悬停泡泡反馈
- 第二屏标题变速打字与正文逐字滚动揭示
- 六张生活照片卡片的错峰弹入与悬停推开
- 可编辑文字自动保存到浏览器本地存储

## 后续替换素材

- 生活照片映射位于 `src/App.jsx` 的 `LIFE_CARD_MEDIA`；每张卡片分别提供 `defaultImage` 与 `hoverImage` 两个入口
- 透明泡泡与邮票齿孔素材位于 `assets/`

## 技术栈

- React 19.2.6
- Vite 8.0.13
- Three.js 0.185.1
- GSAP 3.15.0
- 原生 CSS
