# Web Search MCP

本地网页搜索与抓取 MCP 服务，专为国内网络环境优化。

## 特点

- **无需 API Key** - 直接抓取搜索结果页面
- **国内网络友好** - 支持 Bing、百度、搜狗等搜索引擎
- **多功能** - 搜索、抓取、内容提取一体化

## 安装

```bash
cd /Users/a0000/mcp/web-search-mcp
npm install
npm run build
```

## 配置

在 Claude MCP 配置文件中添加：

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

## 工具列表

### 1. web_search - 网页搜索

搜索互联网内容。

**参数：**
- `query` (必需): 搜索关键词
- `engine` (可选): 搜索引擎，默认 bing
  - `bing` - Bing 搜索
  - `baidu` - 百度搜索
  - `sogou` - 搜狗搜索
  - `duckduckgo` - DuckDuckGo
- `count` (可选): 返回结果数量，默认 5

**示例：**
```json
{
  "name": "web_search",
  "arguments": {
    "query": "React Native 教程",
    "engine": "bing",
    "count": 5
  }
}
```

### 2. fetch_url - 网页抓取

抓取指定 URL 的内容并转换为 Markdown。

**参数：**
- `url` (必需): 要抓取的网页 URL
- `selector` (可选): CSS 选择器，用于提取特定内容

**示例：**
```json
{
  "name": "fetch_url",
  "arguments": {
    "url": "https://juejin.cn/post/12345"
  }
}
```

### 3. extract_content - 内容提取

从网页中提取结构化内容。

**参数：**
- `url` (必需): 要提取内容的网页 URL

**返回：**
- 标题、描述、关键词
- 作者、发布日期
- 正文摘要
- 图片列表
- 链接列表

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行
npm start
```

## 目录结构

```
web-search-mcp/
├── src/
│   ├── index.ts          # 主入口
│   └── tools/
│       ├── search.ts     # 搜索工具
│       ├── fetch.ts      # 网页抓取
│       └── extract.ts    # 内容提取
├── dist/                 # 编译输出
├── docs/                 # 文档
├── package.json
└── tsconfig.json
```

## 待办事项

- [ ] 添加 Puppeteer 支持（处理动态内容）
- [ ] 添加缓存机制
- [ ] 添加代理支持
- [ ] 优化搜索结果解析
- [ ] 添加更多搜索引擎
