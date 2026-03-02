/**
 * 网页搜索工具
 *
 * 支持多个搜索引擎，通过解析搜索结果页面获取结果
 * 无需 API Key，直接抓取搜索页面
 */

// 搜索引擎配置
export const searchEngineOptions: Record<string, {
  name: string;
  searchUrl: string;
  resultSelector: string;
  titleSelector: string;
  linkSelector: string;
  snippetSelector: string;
}> = {
  bing: {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q=",
    resultSelector: "#b_results > li.b_algo",
    titleSelector: "h2",
    linkSelector: "h2 > a",
    snippetSelector: ".b_caption p",
  },
  baidu: {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd=",
    resultSelector: "#content_left .result",
    titleSelector: "h3",
    linkSelector: "h3 > a",
    snippetSelector: ".c-abstract, .content-right_8Zs40",
  },
  sogou: {
    name: "搜狗",
    searchUrl: "https://www.sogou.com/web?query=",
    resultSelector: ".results .vrwrap",
    titleSelector: "h3",
    linkSelector: "h3 > a",
    snippetSelector: ".str-text-info",
  },
  duckduckgo: {
    name: "DuckDuckGo",
    searchUrl: "https://html.duckduckgo.com/html/?q=",
    resultSelector: ".result",
    titleSelector: ".result__a",
    linkSelector: ".result__a",
    snippetSelector: ".result__snippet",
  },
};

// 搜索结果类型
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  engine: string;
}

// 通用请求头
const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
};

/**
 * 从 HTML 中提取文本内容
 */
function extractText(html: string, selector: string): string {
  // 简单的正则匹配提取文本
  const tagMatch = html.match(new RegExp(`<[^>]*class="[^"]*${selector.replace(".", "")}[^"]*"[^>]*>([^<]*)<`, "i"));
  if (tagMatch) return tagMatch[1].trim();

  // 直接提取标签内容
  const textMatch = html.match(new RegExp(`${selector}[^>]*>([^<]+)<`, "i"));
  return textMatch ? textMatch[1].trim() : "";
}

/**
 * 从 HTML 中提取链接
 */
function extractLink(html: string, baseUrl: string): string {
  const hrefMatch = html.match(/href="([^"]*)"/i);
  if (!hrefMatch) return "";

  let url = hrefMatch[1];

  // 处理相对链接
  if (url.startsWith("/")) {
    const urlObj = new URL(baseUrl);
    url = `${urlObj.protocol}//${urlObj.host}${url}`;
  }

  // 跳过 JavaScript 链接
  if (url.startsWith("javascript:") || url.startsWith("#")) {
    return "";
  }

  return url;
}

/**
 * 清理 HTML 标签
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * 执行网页搜索
 */
export async function searchWeb(
  query: string,
  engine: string = "bing",
  count: number = 5
): Promise<{ query: string; engine: string; results: SearchResult[] }> {
  const engineConfig = searchEngineOptions[engine];

  if (!engineConfig) {
    throw new Error(`不支持的搜索引擎: ${engine}。支持的引擎: ${Object.keys(searchEngineOptions).join(", ")}`);
  }

  const searchUrl = engineConfig.searchUrl + encodeURIComponent(query);

  try {
    const response = await fetch(searchUrl, {
      headers,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const results: SearchResult[] = [];

    // 简单的结果解析（基于正则表达式）
    // 这里使用通用的模式匹配，实际使用时可能需要针对不同引擎调整

    // 匹配搜索结果项
    const resultPatterns: Record<string, RegExp> = {
      bing: /<li class="b_algo"[^>]*>([\s\S]*?)<\/li>/gi,
      baidu: /<div class="result[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi,
      sogou: /<div class="vrwrap"[^>]*>([\s\S]*?)<\/div>/gi,
      duckduckgo: /<div class="result[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    };

    const pattern = resultPatterns[engine];
    if (!pattern) {
      throw new Error(`未实现 ${engine} 的结果解析`);
    }

    let match;
    while ((match = pattern.exec(html)) !== null && results.length < count) {
      const block = match[1];

      // 提取标题
      const titleMatch = block.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
      const title = titleMatch ? stripHtml(titleMatch[1]) : "";

      // 提取链接
      const linkMatch = block.match(/href="(https?:\/\/[^"]+)"/i);
      const url = linkMatch ? linkMatch[1] : "";

      // 提取摘要
      const snippetPatterns = [
        /<p[^>]*class="[^"]*b_caption[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
        /<p[^>]*>([\s\S]*?)<\/p>/i,
        /<span[^>]*class="[^"]*(?:abstract|snippet)[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
      ];

      let snippet = "";
      for (const sp of snippetPatterns) {
        const snippetMatch = block.match(sp);
        if (snippetMatch) {
          snippet = stripHtml(snippetMatch[1]);
          if (snippet.length > 20) break;
        }
      }

      // 过滤无效结果
      if (title && url && !url.includes("javascript:")) {
        results.push({
          title,
          url,
          snippet: snippet.substring(0, 300),
          engine: engineConfig.name,
        });
      }
    }

    return {
      query,
      engine: engineConfig.name,
      results: results.slice(0, count),
    };
  } catch (error) {
    throw new Error(`搜索失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
