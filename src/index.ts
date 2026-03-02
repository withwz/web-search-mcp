#!/usr/bin/env node

/**
 * Web Search MCP Server
 *
 * 本地网页搜索与抓取 MCP 服务
 * - 无需 API Key
 * - 支持国内网络环境
 * - 支持多种搜索引擎
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { searchWeb, searchEngineOptions } from "./tools/search.js";
import { fetchUrl } from "./tools/fetch.js";
import { extractContent } from "./tools/extract.js";

// 创建 MCP 服务器
const server = new Server(
  {
    name: "web-search-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // 网页搜索
      {
        name: "web_search",
        description: `搜索网页内容。支持多个搜索引擎：${Object.keys(searchEngineOptions).join(", ")}。无需 API Key，直接返回搜索结果。`,
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "搜索关键词",
            },
            engine: {
              type: "string",
              enum: Object.keys(searchEngineOptions),
              description: "搜索引擎选择，默认 bing",
              default: "bing",
            },
            count: {
              type: "number",
              description: "返回结果数量，默认 5",
              default: 5,
            },
          },
          required: ["query"],
        },
      },
      // 网页抓取
      {
        name: "fetch_url",
        description: "抓取指定 URL 的网页内容，并转换为 Markdown 格式。支持国内网站，无需翻墙。",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "要抓取的网页 URL",
            },
            selector: {
              type: "string",
              description: "可选的 CSS 选择器，用于提取特定内容",
            },
          },
          required: ["url"],
        },
      },
      // 内容提取
      {
        name: "extract_content",
        description: "从 HTML 内容中提取主要文本、标题、描述等信息。",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "要提取内容的网页 URL",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "web_search": {
        const { query, engine = "bing", count = 5 } = args as {
          query: string;
          engine?: string;
          count?: number;
        };

        if (!query || typeof query !== "string") {
          throw new Error("搜索关键词不能为空");
        }

        const results = await searchWeb(query, engine, count);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "fetch_url": {
        const { url, selector } = args as {
          url: string;
          selector?: string;
        };

        if (!url || typeof url !== "string") {
          throw new Error("URL 不能为空");
        }

        const content = await fetchUrl(url, selector);
        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      }

      case "extract_content": {
        const { url } = args as { url: string };

        if (!url || typeof url !== "string") {
          throw new Error("URL 不能为空");
        }

        const content = await extractContent(url);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(content, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `错误: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Web Search MCP Server 已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});
