/**
 * [INPUT]: 依赖 ReactDOM 的 createRoot、App 页面组件、ClickSpark 全局反馈层与全局样式
 * [OUTPUT]: 启动浏览器端 React 应用，将 App 包裹在白色八向点击火花层后挂载到 #root
 * [POS]: src 的应用入口，只负责组合全局交互边界并完成初始化，不承载页面业务逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ClickSpark from './ClickSpark.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClickSpark
      sparkColor="#fff"
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <App />
    </ClickSpark>
  </React.StrictMode>
);
