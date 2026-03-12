export interface ShareholderLetter {
  id: string;
  year: number;
  titleEn: string;
  titleZh: string;
  contentEn: string;
  contentZh: string;
  date: string;
  source: string;
  coreViews: string[];
  investmentAdvice: string[];
}

export type ArticleType = "interview" | "news" | "event" | "speech" | "book-excerpt" | "other";

export interface Article {
  id: string;
  title: string;
  titleEn?: string;
  date: string;
  source: string;
  type: ArticleType;
  tags: string[];
  content: string;
  contentEn?: string;
  coreViews: string[];
  investmentAdvice: string[];
}

export interface Book {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  authorEn: string;
  publicationYear: number;
  cover?: string;
  description: string;
  descriptionEn?: string;
  coreViews: string[];
  investmentAdvice: string[];
}

export interface Investor {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  bio: string;
  bioEn?: string;
  tags: string[];
  shareholderLetters: ShareholderLetter[];
  articles: Article[];
  books: Book[];
}

export const investors: Investor[] = [
  {
    id: "warren-buffett",
    name: "沃伦·巴菲特",
    nameEn: "Warren Buffett",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Warren_Buffett_2023.jpg",
    bio: "伯克希尔·哈撒韦公司CEO，全球最著名的价值投资者，被誉为\"股神\"。",
    bioEn: "CEO of Berkshire Hathaway, the world's most famous value investor, known as the \"Oracle of Omaha\".",
    tags: ["价值投资", "长期持有", "安全边际"],
    shareholderLetters: [
      {
        id: "buffett-letter-2024",
        year: 2024,
        titleEn: "Warren Buffett's Letter to Shareholders 2024",
        titleZh: "巴菲特2024年致股东信",
        date: "2024-02-24",
        source: "Berkshire Hathaway Annual Report",
        contentEn: "In this letter, Warren Buffett reviews Berkshire Hathaway's performance over the past year and emphasizes the long-term philosophy of value investing...",
        contentZh: "在这封信中，沃伦·巴菲特回顾了伯克希尔·哈撒韦公司过去一年的表现，强调了价值投资的长期理念...",
        coreViews: [
          "股票投资本质是购买企业的一部分所有权",
          "市场短期是投票机，长期是称重机",
          "安全边际是价值投资的核心",
        ],
        investmentAdvice: [
          "长期持有优秀企业，不要频繁交易",
          "关注企业的内在价值，而非短期股价波动",
          "只投资自己真正理解的企业",
        ],
      },
    ],
    books: [
      {
        id: "buffett-book-the-snowball",
        title: "滚雪球：巴菲特和他的财富人生",
        titleEn: "The Snowball: Warren Buffett and the Business of Life",
        author: "艾丽斯·施罗德",
        authorEn: "Alice Schroeder",
        publicationYear: 2008,
        cover: "https://upload.wikimedia.org/wikipedia/en/7/7d/The_Snowball_cover.jpg",
        description: "这本书是巴菲特唯一授权的官方传记，全面展现了他的投资生涯和人生智慧。",
        descriptionEn: "This is the only authorized biography of Warren Buffett, comprehensively showcasing his investment career and life wisdom.",
        coreViews: [
          "人生就像滚雪球，重要的是找到很湿的雪和很长的坡",
          "投资的关键在于复利的力量",
          "选择优秀的企业并长期持有",
        ],
        investmentAdvice: [
          "找到自己的\"长坡\"，让财富持续复利增长",
          "选择与优秀的人和企业为伍",
          "保持耐心，不要急于求成",
        ],
      },
    ],
    articles: [
      {
        id: "buffett-1",
        title: "巴菲特2024年致股东信核心观点",
        titleEn: "Key Insights from Warren Buffett's 2024 Letter to Shareholders",
        date: "2024-02-24",
        source: "伯克希尔·哈撒韦年报",
        type: "book-excerpt",
        tags: ["股东信", "价值投资"],
        content: "巴菲特在2024年致股东信中回顾了公司过去一年的表现，强调了价值投资的长期理念...",
        coreViews: [
          "股票投资本质是购买企业的一部分所有权",
          "市场短期是投票机，长期是称重机",
          "安全边际是价值投资的核心",
        ],
        investmentAdvice: [
          "长期持有优秀企业，不要频繁交易",
          "关注企业的内在价值，而非短期股价波动",
          "只投资自己真正理解的企业",
        ],
      },
    ],
  },
  {
    id: "charlie-munger",
    name: "查理·芒格",
    nameEn: "Charlie Munger",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Charlie_Munger_2018.jpg",
    bio: "巴菲特的黄金搭档，伯克希尔·哈撒韦副主席，以多元思维模型和逆向思考著称。",
    bioEn: "Warren Buffett's right-hand man, Vice Chairman of Berkshire Hathaway, known for his multidisciplinary mental models and reverse thinking.",
    tags: ["多元思维模型", "逆向思考", "生活智慧"],
    shareholderLetters: [],
    books: [
      {
        id: "munger-book-poor-charlies-almanack",
        title: "穷查理宝典：查理·芒格的智慧箴言录",
        titleEn: "Poor Charlie's Almanack: The Wit and Wisdom of Charles T. Munger",
        author: "彼得·考夫曼",
        authorEn: "Peter D. Kaufman",
        publicationYear: 2005,
        cover: "https://upload.wikimedia.org/wikipedia/en/8/8d/Poor_Charlie%27s_Almanack.jpg",
        description: "这本书汇集了查理·芒格最重要的演讲和文章，展示了他的多元思维模型和人生智慧。",
        descriptionEn: "This book collects Charlie Munger's most important speeches and articles, showcasing his multidisciplinary mental models and life wisdom.",
        coreViews: [
          "多元思维模型是做出正确决策的关键",
          "逆向思考：如果我知道我会死在哪里，我就永远不去那里",
          "保持客观和理性，避免意识形态偏见",
        ],
        investmentAdvice: [
          "掌握多学科的基础知识，建立多元思维模型",
          "用逆向思考避免常见的错误",
          "保持耐心，等待好的投资机会",
        ],
      },
    ],
    articles: [
      {
        id: "munger-1",
        title: "芒格的人类误判心理学",
        titleEn: "Munger's Psychology of Human Misjudgment",
        date: "2023-05-05",
        source: "穷查理宝典",
        type: "book-excerpt",
        tags: ["心理学", "认知偏差"],
        content: "芒格总结了25种人类误判心理学倾向，帮助投资者避免认知偏差...",
        coreViews: [
          "人类的决策经常受到各种心理偏差的影响",
          "了解这些偏差可以帮助我们做出更理性的决策",
          "多元思维模型是避免认知偏差的有效方法",
        ],
        investmentAdvice: [
          "用逆向思考：如果我知道我会死在哪里，我就永远不去那里",
          "掌握多学科的基础知识，建立多元思维模型",
          "避免强烈的意识形态，保持开放的心态",
        ],
      },
    ],
  },
];
