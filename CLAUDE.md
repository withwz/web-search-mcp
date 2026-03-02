# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Web Search MCP 是一个本地网页搜索与抓取 MCP 服务，专为国内网络环境优化，无需 API Key。

## 开发命令

```bash
npm install        # 安装依赖
npm run build      # TypeScript 编译 (输出到 dist/)
npm start          # 运行编译后的服务
npm run dev        # 编译并运行
```

## 架构

```
src/
├── index.ts           # MCP 服务器入口，定义和注册所有工具
└── tools/
    ├── search.ts      # web_search - 多引擎搜索 (bing/baidu/sogou/duckduckgo)
    ├── fetch.ts       # fetch_url - 网页抓取并转 Markdown
    └── extract.ts     # extract_content - 提取结构化内容 (标题/描述/关键词/正文/图片/链接)
```

### 工具实现模式

每个工具导出一个异步函数，MCP 服务器在 `src/index.ts` 中统一注册：
- `searchWeb(query, engine, count)` - 返回搜索结果数组
- `fetchUrl(url, selector?)` - 返回 Markdown 格式内容
- `extractContent(url)` - 返回结构化内容对象

### HTML 解析方式

当前使用正则表达式进行 HTML 解析（无需额外依赖）。如需更复杂的解析，考虑引入 `cheerio`。

## MCP 配置

```json
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["/Users/a0000/mcp/web-search-mcp/dist/index.js"]
    }
  }
}
```

## 已知限制

1. 搜索结果解析依赖正则，搜索引擎页面结构变化可能导致解析失败
2. SPA 应用无法获取动态渲染内容（需要 Puppeteer 支持）
3. 部分网站有反爬机制
