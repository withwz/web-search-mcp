# 项目背景与问题记录

## 项目初衷

在使用 Claude Code 时，我们需要让 Claude 具备联网能力，以便：
- 读取网页内容
- 抓取正文
- 进行搜索和总结

### 遇到的问题

#### 1. web_reader 配额限制

**问题描述：**
现有的 `web_reader` MCP 服务有配额限制，每周/每月请求次数有限。

**错误信息：**
```
MCP error -429: {"error":{"code":"1310","message":"Weekly/Monthly Limit Exhausted. Your limit will reset at 2026-03-07 20:32:43"}}
```

**影响：** 配额用尽后无法继续使用，需要等待重置。

#### 2. firecrawl 需要 API Key

**问题描述：**
按照网上教程配置的 `firecrawl-mcp` 并不是真正的"本地模式"，仍然需要 API Key。

**错误信息：**
```
Either FIRECRAWL_API_KEY or FIRECRAWL_API_URL must be provided
```

**影响：** 需要注册账号并获取 API Key，增加使用门槛。

#### 3. @modelcontextprotocol/server-fetch 不存在

**问题描述：**
官方文档提到的 `@modelcontextprotocol/server-fetch` 包在 npm 上不存在或名称不对。

**错误信息：**
```
npm error 404  '@modelcontextprotocol/server-fetch@*' is not in this registry.
```

**影响：** 无法使用官方推荐的 fetch 服务。

### 解决方案

我们自己开发一个 **Web Search MCP** 服务，具备：
- 无需 API Key
- 不依赖翻墙
- 支持国内网络环境
- 功能完整（搜索、抓取、提取）

## 会话关联说明

如果你在另一个 Claude Code 会话中使用这个项目，请先阅读以下文件：

### 必读文件
1. `/Users/a0000/mcp/web-search-mcp/docs/README.md` - 项目说明
2. `/Users/a0000/mcp/web-search-mcp/docs/TODO.md` - 开发计划和进度
3. `/Users/a0000/mcp/web-search-mcp/docs/BACKGROUND.md` - 本文件，背景和问题

### 项目路径
```
/Users/a0000/mcp/web-search-mcp/
```

### 快速启动命令
```bash
# 进入项目目录
cd /Users/a0000/mcp/web-search-mcp

# 安装依赖
npm install

# 构建
npm run build

# 测试运行
node dist/index.js
```

### MCP 配置
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

配置文件位置：
- `~/Library/Application Support/Claude/claude_desktop_config.json` (Claude Desktop)
- `~/.claude.json` (Claude Code CLI)

## 当前状态

- [x] 项目结构创建完成
- [x] 基础代码编写完成
- [ ] 依赖安装和编译测试
- [ ] 集成到 Claude MCP
- [ ] 功能测试

## 下一步

1. 在新会话中执行 `npm install` 安装依赖
2. 执行 `npm run build` 编译项目
3. 更新 MCP 配置
4. 重启 Claude Code
5. 测试功能
