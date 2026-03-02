# Web Search MCP

本地网页搜索与抓取 MCP 服务，无需 API Key。

## 快速开始

```bash
npm install
npm run build
```

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

## 工具

### web_search
搜索网页。参数：`query`(必需), `engine`(bing/baidu/sogou/duckduckgo), `count`(默认5)

### fetch_url
抓取网页转 Markdown。参数：`url`(必需), `selector`(可选)

### extract_content
提取结构化内容。参数：`url`(必需)

## 项目结构

```
src/
├── index.ts        # MCP 入口
└── tools/
    ├── search.ts   # 搜索
    ├── fetch.ts    # 抓取
    └── extract.ts  # 提取
```
