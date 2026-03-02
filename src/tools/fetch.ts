/**
 * 网页抓取工具
 *
 * 抓取指定 URL 的内容并转换为 Markdown
 */

// 通用请求头
const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

/**
 * 解码 HTML 实体
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }

  // 处理数字实体
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));

  return result;
}

/**
 * HTML 转 Markdown
 */
function htmlToMarkdown(html: string, url: string): string {
  // 移除不需要的部分
  let text = html;

  // 移除 script、style、nav、footer、header 等
  const removePatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    /<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi,
    /<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi,
    /<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi,
    /<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi,
    /<!--[\s\S]*?-->/g,
  ];

  for (const pattern of removePatterns) {
    text = text.replace(pattern, "");
  }

  // 提取 title
  const titleMatch = text.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : "";

  // 提取 meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const description = descMatch ? decodeHtmlEntities(descMatch[1]) : "";

  // 处理常见标签
  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  text = text.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  text = text.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  text = text.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<hr\s*\/?>/gi, "\n---\n");

  // 列表
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  text = text.replace(/<[ou]l[^>]*>([\s\S]*?)<\/[ou]l>/gi, "$1");

  // 链接
  text = text.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // 图片
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, "![$2]($1)");
  text = text.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, "![$1]($2)");
  text = text.replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, "![]($1)");

  // 强调
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // 代码
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "\n```\n$1\n```\n");

  // 引用
  text = text.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n");

  // 表格
  text = text.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, "\n$1\n");
  text = text.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, "$1\n");
  text = text.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, "| $1 ");
  text = text.replace(/<\/thead>/gi, "\n|---|---|\n");

  // 移除剩余的 HTML 标签
  text = text.replace(/<[^>]+>/g, " ");

  // 解码 HTML 实体
  text = decodeHtmlEntities(text);

  // 清理多余空白
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s+/g, "\n");
  text = text.replace(/\s+\n/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n");

  // 构建结果
  let result = "";
  if (title) result += `# ${title}\n\n`;
  if (description) result += `> ${description}\n\n`;
  result += `来源: ${url}\n\n`;
  result += `---\n\n`;
  result += text.trim();

  return result;
}

/**
 * 抓取网页内容
 */
export async function fetchUrl(url: string, selector?: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 如果指定了选择器，尝试提取特定内容
    if (selector) {
      // 简单的选择器匹配（仅支持 class 和 id）
      const selectorPattern = selector.startsWith("#")
        ? new RegExp(`id=["']${selector.slice(1)}["'][^>]*>([\\s\\S]*?)<\\/\\w+>`, "i")
        : selector.startsWith(".")
        ? new RegExp(`class=["'][^"']*${selector.slice(1)}[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\w+>`, "i")
        : new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, "i");

      const match = html.match(selectorPattern);
      if (match) {
        return htmlToMarkdown(match[1], url);
      }
    }

    return htmlToMarkdown(html, url);
  } catch (error) {
    throw new Error(`抓取失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
