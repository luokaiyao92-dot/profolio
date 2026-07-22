/**
 * [INPUT]: 依赖 ReactDOM 的 createRoot、App 页面组件与全局样式
 * [OUTPUT]: 启动浏览器端 React 应用并挂载到 #root
 * [POS]: src 的应用入口，只负责初始化，不承载页面业务逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
