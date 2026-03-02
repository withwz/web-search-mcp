/**
 * 内容提取工具
 *
 * 从网页中提取结构化内容：标题、描述、关键词、正文等
 */

// 通用请求头
const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
};

/**
 * 提取结果类型
 */
export interface ExtractedContent {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  author: string;
  publishDate: string;
  mainContent: string;
  images: Array<{ src: string; alt: string }>;
  links: Array<{ text: string; href: string }>;
}

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
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.split(entity).join(char);
  }

  // 处理数字实体
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  return result;
}

/**
 * 清理 HTML 标签
 */
function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * 提取网页结构化内容
 */
export async function extractContent(url: string): Promise<ExtractedContent> {
  const response = await fetch(url, {
    headers,
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  // 提取标题
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? stripHtml(titleMatch[1]) : "";

  // 提取 meta description
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? stripHtml(descMatch[1]) : "";

  // 提取 keywords
  const keywordsMatch =
    html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']keywords["']/i);
  const keywords = keywordsMatch
    ? stripHtml(keywordsMatch[1])
        .split(/[,，;；]/)
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  // 提取 author
  const authorMatch =
    html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']*)["']/i);
  const author = authorMatch ? stripHtml(authorMatch[1]) : "";

  // 提取发布日期
  const dateMatch =
    html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*name=["']publish-date["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*name=["']date["'][^>]*content=["']([^"']*)["']/i);
  const publishDate = dateMatch ? stripHtml(dateMatch[1]) : "";

  // 提取正文内容（简单实现：获取 article 或 main 标签内容）
  let mainContent = "";
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const contentMatch = html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);

  if (articleMatch) {
    mainContent = stripHtml(articleMatch[1]);
  } else if (mainMatch) {
    mainContent = stripHtml(mainMatch[1]);
  } else if (contentMatch) {
    mainContent = stripHtml(contentMatch[1]);
  }

  // 限制正文长度
  if (mainContent.length > 2000) {
    mainContent = mainContent.substring(0, 2000) + "...";
  }

  // 提取图片
  const images: Array<{ src: string; alt: string }> = [];
  const imgRegex = /<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    if (images.length >= 10) break;
    const src = imgMatch[1];
    const alt = imgMatch[2];
    // 过滤掉小图标和占位图
    if (!src.includes("icon") && !src.includes("logo") && !src.includes("avatar")) {
      images.push({ src, alt });
    }
  }

  // 提取链接
  const links: Array<{ text: string; href: string }> = [];
  const linkRegex = /<a[^>]*href=["'](https?:\/\/[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    if (links.length >= 20) break;
    const href = linkMatch[1];
    const text = stripHtml(linkMatch[2]);
    // 过滤空链接和导航链接
    if (text.length > 3 && !href.includes("javascript:")) {
      links.push({ text, href });
    }
  }

  return {
    url,
    title,
    description,
    keywords,
    author,
    publishDate,
    mainContent,
    images,
    links,
  };
}
