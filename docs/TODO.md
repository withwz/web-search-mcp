# 开发计划

## 已完成

- [x] 项目初始化
- [x] TypeScript 配置
- [x] MCP 服务器框架
- [x] 网页搜索工具 (web_search)
- [x] 网页抓取工具 (fetch_url)
- [x] 内容提取工具 (extract_content)

## 进行中

- [ ] 安装依赖并测试编译
- [ ] 集成到 Claude MCP 配置

## 计划中

### Phase 1: 基础功能完善
- [ ] 测试各搜索引擎解析
- [ ] 优化 HTML 转 Markdown
- [ ] 添加错误处理和重试机制
- [ ] 添加请求超时配置

### Phase 2: 增强功能
- [ ] 添加 Puppeteer 支持
  - 处理 JavaScript 渲染的页面
  - 支持SPA应用
- [ ] 添加缓存机制
  - 内存缓存
  - 文件缓存
- [ ] 添加代理支持
  - HTTP/HTTPS 代理
  - SOCKS5 代理

### Phase 3: 搜索增强
- [ ] 添加更多搜索引擎
  - Google（需要代理）
  - 头条搜索
  - 360搜索
- [ ] 搜索结果去重
- [ ] 搜索结果排序和过滤
- [ ] 添加图片搜索

### Phase 4: 内容处理
- [ ] 添加正文提取算法
  - Readability 算法
  - 自适应正文识别
- [ ] 添加 PDF 支持
- [ ] 添加 RSS/Atom 订阅支持

## 技术选型

### 当前使用
- `@modelcontextprotocol/sdk` - MCP SDK
- 原生 `fetch` - HTTP 请求
- 正则表达式 - HTML 解析

### 考虑引入
- `cheerio` - 更好的 HTML 解析
- `puppeteer` - 动态页面处理
- `node-cache` - 缓存管理
- `@mozilla/readability` - 正文提取

## 已知问题

1. 搜索结果解析可能不准确（不同搜索引擎页面结构变化）
2. SPA 应用无法获取动态内容
3. 部分网站可能有反爬机制

## 解决方案

1. 定期更新解析规则
2. 添加 Puppeteer 支持
3. 添加请求头随机化和延迟
