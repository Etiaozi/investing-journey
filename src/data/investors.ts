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
  link?: string;
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
        link: "https://www.amazon.com/Snowball-Warren-Buffett-Business-Life/dp/0553384619",
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
        link: "https://www.amazon.com/Poor-Charlies-Almanack-Wit-Wisdom/dp/1578645018",
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
  {
    id: "benjamin-graham",
    name: "本杰明·格雷厄姆",
    nameEn: "Benjamin Graham",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Benjamin_Graham.JPG",
    bio: "价值投资之父，巴菲特的老师，《证券分析》和《聪明的投资者》的作者。",
    bioEn: "Father of value investing, Warren Buffett's teacher, author of \"Security Analysis\" and \"The Intelligent Investor\".",
    tags: ["价值投资之父", "证券分析", "安全边际"],
    shareholderLetters: [],
    books: [
      {
        id: "graham-book-the-intelligent-investor",
        title: "聪明的投资者",
        titleEn: "The Intelligent Investor",
        author: "本杰明·格雷厄姆",
        authorEn: "Benjamin Graham",
        publicationYear: 1949,
        cover: "https://upload.wikimedia.org/wikipedia/en/5/5a/The_Intelligent_Investor.jpg",
        description: "巴菲特称之为\"有史以来最伟大的投资著作\"，奠定了价值投资的理论基础。",
        descriptionEn: "Warren Buffett called it \"the greatest book on investing ever written\", laying the theoretical foundation for value investing.",
        link: "https://www.amazon.com/Intelligent-Investor-Definitive-Finance-Classics/dp/0060555661",
        coreViews: [
          "投资是建立在透彻分析基础上的，确保本金安全和满意回报的操作",
          "市场先生是你的仆人，不是你的向导",
          "安全边际是投资成功的基石",
        ],
        investmentAdvice: [
          "区分投资和投机",
          "利用市场先生的情绪，而不是被它左右",
          "始终坚持安全边际原则",
        ],
      },
      {
        id: "graham-book-security-analysis",
        title: "证券分析",
        titleEn: "Security Analysis",
        author: "本杰明·格雷厄姆、戴维·多德",
        authorEn: "Benjamin Graham, David Dodd",
        publicationYear: 1934,
        cover: "https://upload.wikimedia.org/wikipedia/en/4/4d/Security_Analysis.jpg",
        description: "价值投资的圣经，系统阐述了证券分析的理论和方法。",
        descriptionEn: "The Bible of value investing, systematically explaining the theory and methods of security analysis.",
        link: "https://www.amazon.com/Security-Analysis-6th-Benjamin-Graham/dp/0071592539",
        coreViews: [
          "证券分析的目的是评估证券的内在价值",
          "区分成长股和价值股",
          "强调财务报表分析的重要性",
        ],
        investmentAdvice: [
          "仔细分析企业的财务报表",
          "关注企业的长期竞争力",
          "不要为成长支付过高的溢价",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "peter-lynch",
    name: "彼得·林奇",
    nameEn: "Peter Lynch",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Peter_Lynch_2012.jpg",
    bio: "富达麦哲伦基金前经理，13年投资回报率达29%，被誉为\"史上最成功的基金经理\"。",
    bioEn: "Former manager of Fidelity Magellan Fund, with a 29% annual return over 13 years, known as \"the most successful fund manager in history\".",
    tags: ["成长投资", "基金管理", "普通人投资"],
    shareholderLetters: [],
    books: [
      {
        id: "lynch-book-one-up-on-wall-street",
        title: "彼得·林奇的成功投资",
        titleEn: "One Up On Wall Street: How to Use What You Already Know to Make Money in the Market",
        author: "彼得·林奇、约翰·罗瑟查尔德",
        authorEn: "Peter Lynch, John Rothchild",
        publicationYear: 1989,
        cover: "https://upload.wikimedia.org/wikipedia/en/9/9f/One_Up_On_Wall_Street.jpg",
        description: "彼得·林奇的经典著作，告诉普通人如何利用自己的优势在股市中赚钱。",
        descriptionEn: "Peter Lynch's classic book, teaching ordinary people how to use their advantages to make money in the stock market.",
        link: "https://www.amazon.com/One-Up-Wall-Street-Already/dp/0743200403",
        coreViews: [
          "普通人在投资上有自己的优势，能发现专业投资者忽略的机会",
          "投资你熟悉的公司",
          "长期持有优秀的成长股",
        ],
        investmentAdvice: [
          "在日常生活中寻找投资机会",
          "投资你真正理解的公司",
          "不要试图预测市场，专注于公司基本面",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "george-soros",
    name: "乔治·索罗斯",
    nameEn: "George Soros",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/20/George_Soros_2012.jpg",
    bio: "量子基金创始人，著名的金融大鳄，以狙击英镑和亚洲金融危机闻名。",
    bioEn: "Founder of the Quantum Fund, famous financial tycoon known for shorting the British pound and the Asian financial crisis.",
    tags: ["对冲基金", "反身性理论", "宏观投资"],
    shareholderLetters: [],
    books: [
      {
        id: "soros-book-the-alchemy-of-finance",
        title: "金融炼金术",
        titleEn: "The Alchemy of Finance",
        author: "乔治·索罗斯",
        authorEn: "George Soros",
        publicationYear: 1987,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/3b/The_Alchemy_of_Finance.jpg",
        description: "索罗斯阐述反身性理论的经典著作，揭示了金融市场的运作规律。",
        descriptionEn: "Soros' classic work explaining the theory of reflexivity, revealing the workings of financial markets.",
        link: "https://www.amazon.com/Alchemy-Finance-George-Soros/dp/0471138144",
        coreViews: [
          "反身性理论：市场参与者的思维和市场实际情况相互影响",
          "市场总是错的",
          "金融市场的历史是一部基于假象和谎言的连续剧",
        ],
        investmentAdvice: [
          "理解市场的反身性，不要盲目相信市场有效",
          "在市场转折时大胆行动",
          "控制风险，使用杠杆要谨慎",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "john-templeton",
    name: "约翰·邓普顿",
    nameEn: "John Templeton",
    avatar: "https://upload.wikimedia.org/wikipedia/en/9/96/John_Templeton.jpg",
    bio: "邓普顿基金创始人，全球投资之父，被誉为\"20世纪最伟大的投资者之一\"。",
    bioEn: "Founder of Templeton Funds, father of global investing, known as \"one of the greatest investors of the 20th century\".",
    tags: ["全球投资", "逆向投资", "价值投资"],
    shareholderLetters: [],
    books: [
      {
        id: "templeton-book-the-templeton-plan",
        title: "邓普顿教你逆向投资",
        titleEn: "The Templeton Plan: 21 Steps to Personal Success and Real Happiness",
        author: "约翰·邓普顿",
        authorEn: "John Templeton",
        publicationYear: 1993,
        cover: "https://upload.wikimedia.org/wikipedia/en/1/1a/The_Templeton_Plan.jpg",
        description: "邓普顿分享他的投资智慧和人生哲学，强调逆向投资的重要性。",
        descriptionEn: "Templeton shares his investment wisdom and life philosophy, emphasizing the importance of contrarian investing.",
        link: "https://www.amazon.com/Templeton-Plan-Steps-Personal-Happiness/dp/0060923459",
        coreViews: [
          "在别人贪婪时恐惧，在别人恐惧时贪婪",
          "全球分散投资，不要把鸡蛋放在一个篮子里",
          "投资是一场马拉松，不是短跑",
        ],
        investmentAdvice: [
          "寻找市场上被忽视的机会",
          "在市场悲观时买入，在市场乐观时卖出",
          "保持长期投资的视野",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "philip-fisher",
    name: "菲利普·费雪",
    nameEn: "Philip Fisher",
    avatar: "https://upload.wikimedia.org/wikipedia/en/8/8e/Philip_Fisher.jpg",
    bio: "成长投资之父，巴菲特的另一位老师，《怎样选择成长股》的作者。",
    bioEn: "Father of growth investing, another teacher of Warren Buffett, author of \"Common Stocks and Uncommon Profits\".",
    tags: ["成长投资", "长期投资", "企业调研"],
    shareholderLetters: [],
    books: [
      {
        id: "fisher-book-common-stocks",
        title: "怎样选择成长股",
        titleEn: "Common Stocks and Uncommon Profits",
        author: "菲利普·费雪",
        authorEn: "Philip Fisher",
        publicationYear: 1958,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/3f/Common_Stocks_and_Uncommon_Profits.jpg",
        description: "成长投资的经典著作，巴菲特说他85%是格雷厄姆，15%是费雪。",
        descriptionEn: "A classic work on growth investing. Warren Buffett said he was 85% Graham and 15% Fisher.",
        link: "https://www.amazon.com/Common-Stocks-Uncommon-Profits-Wiley/dp/0471119541",
        coreViews: [
          "投资优秀的成长企业，长期持有",
          "注重企业的管理层质量",
          "深入调研企业，而不是只看财务报表",
        ],
        investmentAdvice: [
          "寻找拥有长期竞争优势的企业",
          "调研企业的管理层、供应商、客户",
          "长期持有，不要因为短期波动而卖出",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "seth-klaman",
    name: "塞斯·卡拉曼",
    nameEn: "Seth Klarman",
    avatar: "https://upload.wikimedia.org/wikipedia/en/1/1d/Seth_Klarman.jpg",
    bio: "Baupost Group创始人，《安全边际》的作者，被誉为\"年轻的巴菲特\"。",
    bioEn: "Founder of Baupost Group, author of \"Margin of Safety\", known as the \"young Warren Buffett\".",
    tags: ["价值投资", "安全边际", "对冲基金"],
    shareholderLetters: [],
    books: [
      {
        id: "klaman-book-margin-of-safety",
        title: "安全边际",
        titleEn: "Margin of Safety: Risk-Averse Value Investing Strategies for the Thoughtful Investor",
        author: "塞斯·卡拉曼",
        authorEn: "Seth Klarman",
        publicationYear: 1991,
        cover: "https://upload.wikimedia.org/wikipedia/en/5/5a/Margin_of_Safety.jpg",
        description: "价值投资的经典之作，现已绝版，二手书价格高达数千美元。",
        descriptionEn: "A classic work on value investing, now out of print, with used copies selling for thousands of dollars.",
        link: "https://www.amazon.com/Margin-Safety-Risk-Averse-Investing-Strategies/dp/0887305105",
        coreViews: [
          "安全边际是投资最重要的原则",
          "市场是无效的，会出现定价错误",
          "投资的第一要务是避免损失",
        ],
        investmentAdvice: [
          "始终坚持安全边际原则",
          "利用市场的无效性寻找定价错误",
          "保持耐心，等待好的投资机会",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "howard-marks",
    name: "霍华德·马克斯",
    nameEn: "Howard Marks",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Howard_Marks_2019.jpg",
    bio: "橡树资本创始人，以《投资最重要的事》和致客户备忘录闻名。",
    bioEn: "Founder of Oaktree Capital, known for \"The Most Important Thing\" and his client memos.",
    tags: ["价值投资", "周期思维", "风险控制"],
    shareholderLetters: [],
    books: [
      {
        id: "marks-book-most-important-thing",
        title: "投资最重要的事",
        titleEn: "The Most Important Thing: Uncommon Sense for the Thoughtful Investor",
        author: "霍华德·马克斯",
        authorEn: "Howard Marks",
        publicationYear: 2011,
        cover: "https://upload.wikimedia.org/wikipedia/en/3/3d/The_Most_Important_Thing.jpg",
        description: "汇集了马克斯最重要的投资智慧，强调周期和风险控制。",
        descriptionEn: "A collection of Marks' most important investment wisdom, emphasizing cycles and risk control.",
        link: "https://www.amazon.com/Most-Important-Thing-Uncommon-Thoughtful/dp/0231153688",
        coreViews: [
          "理解市场周期，在周期的不同阶段采取不同的策略",
          "投资的关键是理解风险，而不是避免风险",
          "第二层次思维：比别人想得更深一层",
        ],
        investmentAdvice: [
          "培养第二层次思维",
          "理解市场周期，不要在牛市顶部买入，熊市底部卖出",
          "注重风险控制，不要过度杠杆",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "ray-dalio",
    name: "瑞·达利欧",
    nameEn: "Ray Dalio",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Ray_Dalio_2018.jpg",
    bio: "桥水基金创始人，全球最大的对冲基金，《原则》的作者。",
    bioEn: "Founder of Bridgewater Associates, the world's largest hedge fund, author of \"Principles\".",
    tags: ["对冲基金", "宏观投资", "原则"],
    shareholderLetters: [],
    books: [
      {
        id: "dalio-book-principles",
        title: "原则",
        titleEn: "Principles: Life and Work",
        author: "瑞·达利欧",
        authorEn: "Ray Dalio",
        publicationYear: 2017,
        cover: "https://upload.wikimedia.org/wikipedia/en/8/8a/Principles_by_Ray_Dalio.jpg",
        description: "达利欧分享他的人生和工作原则，包括投资和管理的智慧。",
        descriptionEn: "Dalio shares his life and work principles, including investment and management wisdom.",
        link: "https://www.amazon.com/Principles-Life-Work-Ray-Dalio/dp/1501124021",
        coreViews: [
          "痛苦+反思=进步",
          "用原则来指导决策，而不是凭感觉",
          "理解现实，而不是按照自己的想法去期待现实",
        ],
        investmentAdvice: [
          "建立自己的投资原则",
          "分散投资，降低风险",
          "保持开放的心态，接受不同的观点",
        ],
      },
    ],
    articles: [],
  },
  {
    id: "john-bogle",
    name: "约翰·博格",
    nameEn: "John Bogle",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/5/53/John_Bogle_2017.jpg",
    bio: "先锋集团创始人，指数基金之父，《共同基金常识》的作者。",
    bioEn: "Founder of Vanguard Group, father of index funds, author of \"Common Sense on Mutual Funds\".",
    tags: ["指数基金", "被动投资", "低成本投资"],
    shareholderLetters: [],
    books: [
      {
        id: "bogle-book-common-sense",
        title: "共同基金常识",
        titleEn: "Common Sense on Mutual Funds: New Imperatives for the Intelligent Investor",
        author: "约翰·博格",
        authorEn: "John Bogle",
        publicationYear: 1999,
        cover: "https://upload.wikimedia.org/wikipedia/en/7/7f/Common_Sense_on_Mutual_Funds.jpg",
        description: "指数基金投资的经典之作，倡导低成本、被动投资。",
        descriptionEn: "A classic work on index fund investing, advocating low-cost, passive investing.",
        link: "https://www.amazon.com/Common-Sense-Mutual-Funds-Imperatives/dp/0470138136",
        coreViews: [
          "指数基金是普通投资者最好的选择",
          "成本很重要，低成本长期复利效应巨大",
          "不要试图打败市场，而是要跟上市场",
        ],
        investmentAdvice: [
          "投资低成本的指数基金",
          "长期持有，不要频繁交易",
          "不要被市场情绪左右，保持理性",
        ],
      },
    ],
    articles: [],
  },
];
