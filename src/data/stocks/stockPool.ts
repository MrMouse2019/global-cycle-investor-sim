import type { MarketId, SectorId, Stock, StockRecommendationInput } from '../../domain/types/game'

const stock = (
  id: string,
  name: string,
  marketId: MarketId,
  sectorId: SectorId,
  style: Stock['style'],
  expectedReturn: number,
  volatility: number,
  popularity: number,
  description: string,
): Stock => ({
  id,
  name,
  marketId,
  sectorId,
  style,
  expectedReturn,
  volatility,
  popularity,
  description,
})

export const stockPool: Stock[] = [
  stock('us-technology-nvidia', '英伟达', 'us', 'technology', 'leader', 0.22, 0.42, 100, 'AI 算力龙头，高成长也伴随高估值波动。'),
  stock('us-technology-apple', '苹果', 'us', 'technology', 'leader', 0.1, 0.22, 98, '全球消费电子和生态系统龙头，现金流稳定。'),
  stock('us-technology-microsoft', '微软', 'us', 'technology', 'leader', 0.12, 0.24, 97, '云计算与软件平台代表，成长和防御属性兼具。'),
  stock('us-technology-alphabet', '谷歌', 'us', 'technology', 'growth', 0.11, 0.27, 92, '搜索、广告和 AI 业务驱动的大型科技公司。'),
  stock('us-technology-amd', 'AMD', 'us', 'technology', 'growth', 0.15, 0.36, 86, '芯片周期弹性较强，业绩波动高于平台型公司。'),
  stock('us-technology-adobe', 'Adobe', 'us', 'technology', 'defensive', 0.08, 0.23, 75, '软件订阅模式稳定，估值受利率影响明显。'),
  stock('us-consumer-amazon', '亚马逊', 'us', 'consumer', 'growth', 0.13, 0.3, 95, '电商与云业务双轮驱动，利润率周期性改善。'),
  stock('us-consumer-tesla', '特斯拉', 'us', 'consumer', 'growth', 0.16, 0.45, 90, '电动车与智能化代表，竞争和估值波动较大。'),
  stock('us-consumer-costco', '好市多', 'us', 'consumer', 'defensive', 0.08, 0.17, 82, '会员制零售龙头，防御属性强。'),
  stock('us-consumer-mcdonalds', '麦当劳', 'us', 'consumer', 'defensive', 0.06, 0.15, 78, '全球餐饮连锁龙头，现金流稳定。'),
  stock('us-financials-jpmorgan', '摩根大通', 'us', 'financials', 'leader', 0.08, 0.21, 85, '美国大型银行代表，受利率与信用周期影响。'),
  stock('us-financials-berkshire', '伯克希尔', 'us', 'financials', 'defensive', 0.07, 0.16, 84, '保险与多元控股组合，回撤通常低于高成长资产。'),
  stock('us-healthcare-eli-lilly', '礼来', 'us', 'healthcare', 'growth', 0.14, 0.26, 88, '创新药龙头，药品周期带来成长弹性。'),
  stock('us-healthcare-johnson', '强生', 'us', 'healthcare', 'defensive', 0.05, 0.13, 72, '医疗健康防御代表，增长较稳。'),
  stock('us-new-energy-first-solar', 'First Solar', 'us', 'new-energy', 'cyclical', 0.11, 0.34, 68, '光伏制造代表，政策和利率敏感。'),
  stock('us-metals-freeport', '自由港麦克莫兰', 'us', 'metals', 'cyclical', 0.1, 0.32, 70, '铜矿周期代表，受全球需求和商品价格影响。'),
  stock('a-share-consumer-kweichow-moutai', '贵州茅台', 'a-share', 'consumer', 'leader', 0.09, 0.22, 100, '高端白酒龙头，品牌壁垒强但估值和消费周期会波动。'),
  stock('a-share-consumer-wuliangye', '五粮液', 'a-share', 'consumer', 'leader', 0.08, 0.25, 94, '白酒行业代表，顺周期消费修复弹性较强。'),
  stock('a-share-consumer-yili', '伊利股份', 'a-share', 'consumer', 'defensive', 0.06, 0.18, 90, '大众消费龙头，需求稳定、成长弹性较温和。'),
  stock('a-share-consumer-haitian', '海天味业', 'a-share', 'consumer', 'defensive', 0.06, 0.2, 78, '调味品代表，利润率和渠道周期影响估值。'),
  stock('a-share-technology-foxconn', '工业富联', 'a-share', 'technology', 'growth', 0.12, 0.3, 82, '电子制造与 AI 服务器链条代表。'),
  stock('a-share-technology-zte', '中兴通讯', 'a-share', 'technology', 'growth', 0.09, 0.29, 76, '通信设备代表，受产业周期与政策影响。'),
  stock('a-share-technology-iflytek', '科大讯飞', 'a-share', 'technology', 'growth', 0.11, 0.36, 74, 'AI 应用代表，主题弹性强、业绩兑现要求高。'),
  stock('a-share-technology-naura', '北方华创', 'a-share', 'technology', 'leader', 0.14, 0.35, 88, '半导体设备龙头，国产替代与景气周期共振。'),
  stock('a-share-new-energy-catl', '宁德时代', 'a-share', 'new-energy', 'leader', 0.13, 0.34, 96, '动力电池龙头，成长空间大但行业竞争激烈。'),
  stock('a-share-new-energy-longi', '隆基绿能', 'a-share', 'new-energy', 'cyclical', 0.08, 0.38, 80, '光伏制造代表，价格周期和产能周期影响显著。'),
  stock('a-share-new-energy-byd', '比亚迪', 'a-share', 'new-energy', 'leader', 0.12, 0.31, 95, '新能源汽车龙头，消费和制造属性兼具。'),
  stock('a-share-healthcare-hengrui', '恒瑞医药', 'a-share', 'healthcare', 'growth', 0.08, 0.24, 83, '创新药代表，政策和研发周期影响明显。'),
  stock('a-share-healthcare-mindray', '迈瑞医疗', 'a-share', 'healthcare', 'leader', 0.09, 0.22, 88, '医疗器械龙头，全球化带来长期成长。'),
  stock('a-share-financials-cmb', '招商银行', 'a-share', 'financials', 'leader', 0.06, 0.19, 89, '零售银行代表，受息差和信用周期影响。'),
  stock('a-share-financials-pingan', '中国平安', 'a-share', 'financials', 'turnaround', 0.05, 0.22, 80, '保险金融代表，估值修复取决于资产端和负债端改善。'),
  stock('a-share-metals-zijin', '紫金矿业', 'a-share', 'metals', 'cyclical', 0.11, 0.31, 85, '黄金和铜矿龙头，商品价格驱动明显。'),
  stock('a-share-metals-chalco', '中国铝业', 'a-share', 'metals', 'cyclical', 0.07, 0.3, 66, '有色周期代表，盈利受铝价和成本影响。'),
  stock('a-share-defense-avic', '中航沈飞', 'a-share', 'defense', 'leader', 0.09, 0.27, 75, '军工装备代表，订单节奏影响估值。'),
  stock('a-share-defense-ziyan', '中航光电', 'a-share', 'defense', 'growth', 0.08, 0.25, 70, '军工电子连接器代表，成长与订单节奏相关。'),
  stock('a-share-agriculture-muyuan', '牧原股份', 'a-share', 'agriculture', 'cyclical', 0.08, 0.33, 76, '生猪养殖龙头，猪周期带来明显波动。'),
  stock('a-share-agriculture-haid', '海大集团', 'a-share', 'agriculture', 'defensive', 0.07, 0.21, 71, '饲料和养殖服务代表，周期波动相对温和。'),
  stock('h-share-consumer-meituan', '美团-W', 'h-share', 'consumer', 'growth', 0.12, 0.35, 92, '本地生活平台代表，增长和竞争格局共同驱动估值。'),
  stock('h-share-consumer-anta', '安踏体育', 'h-share', 'consumer', 'growth', 0.09, 0.26, 78, '运动消费龙头，品牌矩阵和消费景气相关。'),
  stock('h-share-technology-tencent', '腾讯控股', 'h-share', 'technology', 'leader', 0.1, 0.25, 98, '互联网平台龙头，游戏、广告和金融科技多元驱动。'),
  stock('h-share-technology-smic', '中芯国际', 'h-share', 'technology', 'growth', 0.09, 0.34, 82, '晶圆代工代表，产业政策与景气周期影响显著。'),
  stock('h-share-technology-xiaomi', '小米集团-W', 'h-share', 'technology', 'growth', 0.1, 0.31, 84, '智能终端与汽车业务带来成长弹性。'),
  stock('h-share-financials-hsbc', '汇丰控股', 'h-share', 'financials', 'leader', 0.07, 0.18, 80, '国际银行代表，利率和信用环境影响盈利。'),
  stock('h-share-financials-aia', '友邦保险', 'h-share', 'financials', 'defensive', 0.06, 0.2, 76, '亚洲保险龙头，长期保障需求稳定。'),
  stock('h-share-healthcare-wuxi', '药明生物', 'h-share', 'healthcare', 'growth', 0.08, 0.36, 74, 'CXO 代表，订单和政策预期带来高波动。'),
  stock('h-share-healthcare-cspc', '石药集团', 'h-share', 'healthcare', 'defensive', 0.06, 0.22, 62, '制药代表，创新药转型影响估值。'),
  stock('h-share-new-energy-gcl', '协鑫科技', 'h-share', 'new-energy', 'cyclical', 0.08, 0.38, 66, '光伏材料代表，价格周期波动明显。'),
  stock('h-share-metals-jiangxi-copper', '江西铜业股份', 'h-share', 'metals', 'cyclical', 0.08, 0.29, 63, '铜周期代表，受全球制造需求影响。'),
  stock('h-share-defense-casic', '中航科工', 'h-share', 'defense', 'leader', 0.07, 0.24, 58, '军工央企代表，订单和政策预期较关键。'),
  stock('h-share-agriculture-wh-group', '万洲国际', 'h-share', 'agriculture', 'defensive', 0.05, 0.19, 60, '肉制品代表，消费稳定但利润受成本影响。'),
  stock('japan-technology-sony', '索尼', 'japan', 'technology', 'leader', 0.08, 0.23, 86, '消费电子、游戏与影像龙头，业务多元。'),
  stock('japan-technology-tokyo-electron', '东京电子', 'japan', 'technology', 'growth', 0.11, 0.31, 88, '半导体设备代表，芯片资本开支周期敏感。'),
  stock('japan-technology-keyence', '基恩士', 'japan', 'technology', 'leader', 0.09, 0.22, 80, '工业自动化龙头，高利润率但估值较高。'),
  stock('japan-consumer-fast-retailing', '迅销', 'japan', 'consumer', 'leader', 0.08, 0.21, 82, '优衣库母公司，全球消费品牌代表。'),
  stock('japan-consumer-shiseido', '资生堂', 'japan', 'consumer', 'turnaround', 0.06, 0.27, 65, '化妆品代表，受中国消费和旅游恢复影响。'),
  stock('japan-financials-mufg', '三菱日联金融', 'japan', 'financials', 'leader', 0.07, 0.2, 78, '日本大型银行，受利率正常化影响。'),
  stock('japan-financials-sumitomo', '三井住友金融', 'japan', 'financials', 'leader', 0.07, 0.19, 72, '银行金融代表，盈利受息差改善驱动。'),
  stock('japan-healthcare-takeda', '武田制药', 'japan', 'healthcare', 'defensive', 0.05, 0.16, 68, '制药龙头，防御属性较强。'),
  stock('japan-new-energy-panasonic', '松下控股', 'japan', 'new-energy', 'cyclical', 0.06, 0.24, 66, '电池与制造代表，受新能源周期影响。'),
  stock('japan-metals-nippon-steel', '日本制铁', 'japan', 'metals', 'cyclical', 0.07, 0.26, 62, '钢铁周期代表，需求和成本影响盈利。'),
  stock('japan-defense-mitsubishi-heavy', '三菱重工', 'japan', 'defense', 'leader', 0.08, 0.23, 76, '防务和工业设备代表，政策订单支撑较强。'),
  stock('japan-agriculture-kubota', '久保田', 'japan', 'agriculture', 'defensive', 0.05, 0.18, 60, '农业机械代表，全球农业资本开支相关。'),
  stock('taiwan-technology-tsmc', '台积电', 'taiwan', 'technology', 'leader', 0.12, 0.28, 100, '全球晶圆代工龙头，AI 与半导体周期核心资产。'),
  stock('taiwan-technology-mediatek', '联发科', 'taiwan', 'technology', 'growth', 0.1, 0.3, 82, '手机和边缘芯片代表，消费电子周期敏感。'),
  stock('taiwan-technology-hon-hai', '鸿海', 'taiwan', 'technology', 'leader', 0.07, 0.22, 80, '电子制造龙头，AI 服务器带来新弹性。'),
  stock('taiwan-technology-asus', '华硕', 'taiwan', 'technology', 'cyclical', 0.07, 0.27, 62, 'PC 与硬件代表，消费电子周期明显。'),
  stock('taiwan-consumer-uni-president', '统一企业', 'taiwan', 'consumer', 'defensive', 0.05, 0.15, 62, '食品消费代表，防御属性较强。'),
  stock('taiwan-consumer-hotai', '和泰车', 'taiwan', 'consumer', 'leader', 0.06, 0.18, 58, '汽车销售代表，消费和车市景气相关。'),
  stock('taiwan-financials-cathay', '国泰金控', 'taiwan', 'financials', 'leader', 0.05, 0.19, 60, '金融控股代表，利率和资本市场影响明显。'),
  stock('taiwan-financials-fubon', '富邦金控', 'taiwan', 'financials', 'leader', 0.05, 0.18, 58, '保险与银行综合金融代表。'),
  stock('taiwan-healthcare-medigen', '高端疫苗', 'taiwan', 'healthcare', 'turnaround', 0.05, 0.38, 42, '生技题材代表，研发和政策不确定性高。'),
  stock('taiwan-new-energy-delta', '台达电', 'taiwan', 'new-energy', 'leader', 0.09, 0.24, 78, '电源和节能系统龙头，AI 电源需求驱动。'),
  stock('taiwan-metals-china-steel', '中钢', 'taiwan', 'metals', 'cyclical', 0.04, 0.22, 50, '钢铁周期代表，需求复苏时弹性更明显。'),
  stock('taiwan-defense-aerospace', '汉翔航空', 'taiwan', 'defense', 'cyclical', 0.06, 0.26, 54, '航空与防务代表，订单节奏影响估值。'),
  stock('korea-technology-samsung', '三星电子', 'korea', 'technology', 'leader', 0.1, 0.27, 98, '存储、手机与半导体制造龙头，周期属性明显。'),
  stock('korea-technology-sk-hynix', 'SK海力士', 'korea', 'technology', 'growth', 0.13, 0.34, 92, '存储芯片代表，AI 服务器需求带来高弹性。'),
  stock('korea-consumer-coupang', 'Coupang', 'korea', 'consumer', 'growth', 0.09, 0.32, 72, '韩国电商平台代表，利润改善驱动估值。'),
  stock('korea-consumer-amorepacific', '爱茉莉太平洋', 'korea', 'consumer', 'turnaround', 0.05, 0.28, 58, '美妆消费代表，受亚洲消费景气影响。'),
  stock('korea-financials-kb', 'KB金融集团', 'korea', 'financials', 'leader', 0.06, 0.2, 62, '韩国银行代表，息差和信用周期驱动。'),
  stock('korea-financials-shinhan', '新韩金融', 'korea', 'financials', 'defensive', 0.05, 0.19, 58, '综合金融代表，波动低于出口周期资产。'),
  stock('korea-new-energy-lg-energy', 'LG新能源', 'korea', 'new-energy', 'leader', 0.1, 0.35, 84, '动力电池代表，行业价格竞争影响较大。'),
  stock('korea-new-energy-posco-future', '浦项未来M', 'korea', 'new-energy', 'cyclical', 0.09, 0.37, 70, '电池材料代表，新能源链条周期波动强。'),
  stock('korea-metals-posco', '浦项制铁', 'korea', 'metals', 'cyclical', 0.06, 0.25, 66, '钢铁龙头，全球制造需求影响盈利。'),
  stock('korea-healthcare-samsung-biologics', '三星生物制剂', 'korea', 'healthcare', 'growth', 0.09, 0.24, 76, '生物制药代工龙头，防御和成长兼具。'),
  stock('korea-defense-hanwha-aerospace', '韩华航空航天', 'korea', 'defense', 'growth', 0.1, 0.29, 72, '防务出口代表，订单弹性较大。'),
  stock('korea-agriculture-cj-cheiljedang', 'CJ第一制糖', 'korea', 'agriculture', 'defensive', 0.05, 0.18, 56, '食品和生物业务代表，抗周期属性较好。'),
  stock('us-defense-lockheed', '洛克希德马丁', 'us', 'defense', 'defensive', 0.06, 0.18, 74, '全球防务龙头，订单稳定但成长弹性有限。'),
  stock('us-agriculture-deere', '迪尔股份', 'us', 'agriculture', 'cyclical', 0.07, 0.24, 66, '农业机械龙头，农产品价格和资本开支驱动。'),
  stock('h-share-consumer-li-ning', '李宁', 'h-share', 'consumer', 'turnaround', 0.06, 0.32, 64, '运动服饰代表，品牌周期和库存周期影响明显。'),
  stock('japan-consumer-toyota', '丰田汽车', 'japan', 'consumer', 'leader', 0.07, 0.2, 84, '全球汽车龙头，汇率和销量周期影响收益。'),
  stock('a-share-technology-luxshare', '立讯精密', 'a-share', 'technology', 'growth', 0.09, 0.28, 80, '消费电子制造龙头，产业链需求影响明显。'),
  stock('a-share-consumer-midea', '美的集团', 'a-share', 'consumer', 'leader', 0.07, 0.18, 86, '家电龙头，现金流稳健且全球化推进。'),
  stock('a-share-financials-citic', '中信证券', 'a-share', 'financials', 'cyclical', 0.07, 0.26, 74, '券商龙头，资本市场景气度决定弹性。'),
  stock('h-share-financials-hkex', '港交所', 'h-share', 'financials', 'leader', 0.08, 0.25, 82, '交易所代表，受市场成交和融资周期影响。'),
  stock('taiwan-healthcare-lotus', '美时化学制药', 'taiwan', 'healthcare', 'growth', 0.07, 0.25, 50, '仿制药和特色药代表，成长弹性中等。'),
  stock('taiwan-agriculture-test-rite', '特力', 'taiwan', 'agriculture', 'defensive', 0.04, 0.16, 40, '家居零售与农业消费相关防御资产。'),
  stock('korea-consumer-hyundai', '现代汽车', 'korea', 'consumer', 'cyclical', 0.07, 0.25, 76, '汽车出口代表，受全球需求和汇率影响。'),
  stock('korea-technology-lg-electronics', 'LG电子', 'korea', 'technology', 'cyclical', 0.07, 0.27, 68, '家电和电子硬件代表，消费电子周期明显。'),
  stock('us-healthcare-unitedhealth', '联合健康', 'us', 'healthcare', 'defensive', 0.07, 0.17, 80, '管理式医疗龙头，防御属性较强但受政策影响。'),
  stock('h-share-new-energy-byd-electronic', '比亚迪电子', 'h-share', 'new-energy', 'growth', 0.08, 0.29, 64, '新能源车和智能终端供应链代表，成长与订单周期相关。'),
]

const preferenceSeed = (year: number, marketId: MarketId, sectorId: SectorId) => {
  const text = `${year}-${marketId}-${sectorId}`
  return [...text].reduce((total, char, index) => total + char.charCodeAt(0) * (index + 3), 0)
}

function rankStock(stock: Stock, input: StockRecommendationInput) {
  const marketMatch = stock.marketId === input.marketId ? 80 : input.scenario.preferredMarkets.includes(stock.marketId) ? 24 : 0
  const sectorMatch = stock.sectorId === input.sectorId ? 90 : input.scenario.preferredSectors.includes(stock.sectorId) ? 26 : 0
  const warningPenalty = input.scenario.warningSectors.includes(stock.sectorId) ? 36 : 0
  const styleBonus = stock.style === 'leader' ? 14 : stock.style === 'growth' ? 8 : stock.style === 'defensive' ? 4 : 0
  return marketMatch + sectorMatch + stock.popularity * 0.8 + styleBonus - warningPenalty
}

export function recommendStocks(input: StockRecommendationInput): Stock[] {
  const seed = preferenceSeed(input.year, input.marketId, input.sectorId)
  const ranked = [...stockPool].sort((left, right) => {
    const scoreDelta = rankStock(right, input) - rankStock(left, input)
    if (Math.abs(scoreDelta) > 0.01) return scoreDelta
    const leftNoise = (preferenceSeed(seed + left.popularity, left.marketId, left.sectorId) % 17) / 100
    const rightNoise = (preferenceSeed(seed + right.popularity, right.marketId, right.sectorId) % 17) / 100
    return rightNoise - leftNoise
  })

  const exactMatches = ranked.filter((stock) => stock.marketId === input.marketId && stock.sectorId === input.sectorId)
  const adjacentMatches = ranked.filter(
    (stock) =>
      (stock.marketId === input.marketId || stock.sectorId === input.sectorId) &&
      !exactMatches.includes(stock),
  )
  const cycleMatches = ranked.filter(
    (stock) =>
      (input.scenario.preferredMarkets.includes(stock.marketId) ||
        input.scenario.preferredSectors.includes(stock.sectorId)) &&
      !exactMatches.includes(stock) &&
      !adjacentMatches.includes(stock),
  )

  return [...exactMatches, ...adjacentMatches, ...cycleMatches, ...ranked]
    .filter((stock, index, stocks) => stocks.findIndex((item) => item.id === stock.id) === index)
    .slice(0, 6)
}
