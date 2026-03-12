export interface Article {
  id: string;
  title: string;
  date: string;
  source: string;
  content: string;
  coreViews: string[];
  investmentAdvice: string[];
}

export interface Investor {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  bio: string;
  tags: string[];
  articles: Article[];
}

export const investors: Investor[] = [
  {
    id: "warren-buffett",
    name: "沃伦·巴菲特",
    nameEn: "Warren Buffett",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Warren_Buffett_2023.jpg",
    bio: "伯克希尔·哈撒韦公司CEO，全球最著名的价值投资者，被誉为\"股神\"。",
    tags: ["价值投资", "长期持有", "安全边际"],
    articles: [
      {
        id: "buffett-1",
        title: "巴菲特2024年致股东信核心观点",
        date: "2024-02-24",
        source: "伯克希尔·哈撒韦年报",
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
    tags: ["多元思维模型", "逆向思考", "生活智慧"],
    articles: [
      {
        id: "munger-1",
        title: "芒格的人类误判心理学",
        date: "2023-05-05",
        source: "穷查理宝典",
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
