import type { YearScenario } from '../../domain/types/game'

const baseCycle: Omit<YearScenario, 'year' | 'title' | 'eventIds'>[] = [
  {
    macroCycle: 'recovery',
    cycleLabel: '经济复苏',
    policy: 'loose',
    riskPreference: 'medium',
    preferredMarkets: ['a-share', 'h-share', 'korea'],
    preferredSectors: ['consumer', 'technology', 'new-energy'],
    warningSectors: ['financials'],
    teachingHint: '复苏阶段先看政策和需求修复，适合用分散仓位参与成长与消费修复。',
    summary: '经济从低位恢复，政策信号比短期业绩更重要。',
  },
  {
    macroCycle: 'loose',
    cycleLabel: '全球宽松',
    policy: 'loose',
    riskPreference: 'high',
    preferredMarkets: ['us', 'taiwan', 'a-share'],
    preferredSectors: ['technology', 'new-energy', 'healthcare'],
    warningSectors: ['financials', 'agriculture'],
    teachingHint: '宽松周期成长板块弹性较大，但高波动市场不能无脑满仓。',
    summary: '流动性改善，成长资产估值压力缓解。',
  },
  {
    macroCycle: 'overheat',
    cycleLabel: '经济过热',
    policy: 'neutral',
    riskPreference: 'high',
    preferredMarkets: ['us', 'korea', 'taiwan'],
    preferredSectors: ['metals', 'financials', 'technology'],
    warningSectors: ['agriculture'],
    teachingHint: '过热阶段需求强，周期和金融可能接力，但回撤风险也在积累。',
    summary: '增长强劲，市场风险偏好高，但估值开始变贵。',
  },
  {
    macroCycle: 'stagflation',
    cycleLabel: '滞胀下行',
    policy: 'tight',
    riskPreference: 'low',
    preferredMarkets: ['japan', 'h-share'],
    preferredSectors: ['consumer', 'metals', 'agriculture', 'defense'],
    warningSectors: ['technology', 'new-energy'],
    teachingHint: '滞胀阶段不要只盯成长，资源、防御和低波动资产更重要。',
    summary: '通胀压制估值，资金转向防御与实物资产。',
  },
  {
    macroCycle: 'tight',
    cycleLabel: '加息紧缩',
    policy: 'tight',
    riskPreference: 'low',
    preferredMarkets: ['japan'],
    preferredSectors: ['financials', 'defense', 'consumer'],
    warningSectors: ['technology', 'new-energy'],
    teachingHint: '紧缩周期最怕高估值满仓，控制仓位比追求收益更关键。',
    summary: '资金成本上升，高波动资产进入压力测试。',
  },
  {
    macroCycle: 'recession',
    cycleLabel: '通缩衰退',
    policy: 'neutral',
    riskPreference: 'low',
    preferredMarkets: ['japan', 'h-share'],
    preferredSectors: ['consumer', 'healthcare', 'agriculture', 'defense'],
    warningSectors: ['metals', 'new-energy'],
    teachingHint: '衰退期要先活下来，防御板块和仓位控制会保护长期复利。',
    summary: '需求下行，市场更重视确定性和低波动。',
  },
]

const titleByCycle: Record<YearScenario['macroCycle'], string[]> = {
  recovery: ['复苏初期：政策开始托底', '再复苏：低位资产修复', '温和复苏：盈利预期改善'],
  loose: ['宽松扩散：成长资产升温', '再宽松：估值修复窗口', '流动性回潮：风险偏好回升'],
  overheat: ['需求过热：周期资产接力', '后周期震荡：收益分化', '高景气尾声：强弱切换'],
  stagflation: ['通胀扰动：资源与防御占优', '滞胀压力：现金流更稀缺', '成本冲击：防御思维升温'],
  tight: ['紧缩重估：高估值承压', '风险收束：检验体系', '利率高位：回撤压力测试'],
  recession: ['衰退探底：现金流与防御', '需求下行：活下来优先', '盈利收缩：低波动胜出'],
}

const eventRotation = [
  ['policy-support'],
  ['global-rate-cut', 'chip-cycle-up'],
  ['export-recovery'],
  ['inflation-heat'],
  ['valuation-reset', 'liquidity-tight'],
  ['defensive-demand'],
]

export const scenarios: YearScenario[] = Array.from({ length: 20 }, (_, index) => {
  const base = baseCycle[index % baseCycle.length]
  const cycleTitles = titleByCycle[base.macroCycle]
  const round = Math.floor(index / baseCycle.length)
  const title = cycleTitles[round % cycleTitles.length]
  const lateHint = index >= 15 ? '这是长期复利后段，守住前期成果和控制尾部风险比短期冲刺更重要。' : ''

  return {
    ...base,
    year: index + 1,
    title,
    eventIds: eventRotation[index % eventRotation.length],
    teachingHint: lateHint ? `${base.teachingHint}${lateHint}` : base.teachingHint,
  }
})
