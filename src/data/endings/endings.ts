import type { Ending } from '../../domain/types/game'

export const endings: Ending[] = [
  {
    id: 'cycle-master',
    title: '周期洞察型职业投资人',
    badge: '顶级盈利',
    description:
      '你已摆脱新手思维，能够根据宏观周期、市场结构和行业轮动做出系统决策，并用仓位管理控制回撤。',
    unlockedLessons: ['全球周期投资手册', '全周期复盘案例库', '职业投资人认知标签'],
  },
  {
    id: 'global-allocator',
    title: '全球配置型资产管理人',
    badge: '顶级配置',
    description:
      '你能在不同市场之间切换风险暴露，既不迷信单一市场，也不忽视地域风格差异。',
    unlockedLessons: ['全球市场配置地图', '跨市场风险预算模板'],
  },
  {
    id: 'steady-compounder',
    title: '稳健复利型长期赢家',
    badge: '优质盈利',
    description:
      '你不追求短期暴利，而是依靠分散、风控和周期匹配积累长期复利，是更容易长期存活的投资人类型。',
    unlockedLessons: ['新手稳健投资方法论', '复利思维清单', '低风险配置模板'],
  },
  {
    id: 'growth-winner',
    title: '高波动成长型胜利者',
    badge: '进攻盈利',
    description:
      '你抓住了成长周期，但过程波动较大。收益证明了进攻能力，回撤提醒你仍需完善风控。',
    unlockedLessons: ['成长资产仓位管理', '高波动组合复盘'],
  },
  {
    id: 'sector-rotator',
    title: '板块轮动高手',
    badge: '轮动优势',
    description:
      '你对行业景气变化较敏感，能够在资源、成长、防御之间切换，但仍要继续提升跨市场判断。',
    unlockedLessons: ['行业轮动框架', '景气度观察清单'],
  },
  {
    id: 'learning-investor',
    title: '学习成长型投资人',
    badge: '成长结局',
    description:
      '你前期犯过错，但后续明显改善。长期投资不怕犯错，怕的是不复盘、不修正。',
    unlockedLessons: ['亏损复盘方法', '从错误到体系的训练路径'],
  },
  {
    id: 'market-follower',
    title: '随波逐流的市场参与者',
    badge: '普通结局',
    description:
      '你没有遭遇重大失败，但投资逻辑还不够稳定。收益更多来自市场整体环境，而不是主动把握周期。',
    unlockedLessons: ['散户常见踩坑清单', '基础周期认知课程'],
  },
  {
    id: 'cash-king',
    title: '极致风控的现金为王玩家',
    badge: '特殊结局',
    description:
      '你几乎规避了所有市场风险，但也错失了多数周期红利。你很懂敬畏市场，但还需要学习适度进攻。',
    unlockedLessons: ['低风险资产配置指南', '市场风险识别课程'],
  },
  {
    id: 'inverse-cycle-loser',
    title: '逆周期配置的长期亏损者',
    badge: '亏损结局',
    description:
      '你多次在错误周期重仓错误方向，亏损不是来自单一年份，而是投资框架长期错位。',
    unlockedLessons: ['宏观周期纠错课', '逆周期风险案例'],
  },
  {
    id: 'drawdown-bearer',
    title: '高收益幻觉的回撤承受者',
    badge: '回撤警示',
    description:
      '你曾经赚到过钱，但没有守住收益。高收益如果伴随无法承受的回撤，就不是成熟策略。',
    unlockedLessons: ['最大回撤管理', '从收益率到风险调整收益'],
  },
  {
    id: 'all-in-liquidated',
    title: '重仓梭哈的提前清仓者',
    badge: '提前清仓',
    description:
      '你因为长期重仓和集中押注触发提前清仓。长期投资第一课，是先活下来。',
    unlockedLessons: ['重仓风险纠错课', '组合分散基础课'],
  },
  {
    id: 'risk-event-liquidated',
    title: '黑天鹅裸奔的风险失控者',
    badge: '提前清仓',
    description:
      '风险事件并非凭空击败你，真正的问题是事件发生前组合已经缺少分散和现金缓冲。',
    unlockedLessons: ['尾部风险识别', '风险事件前的仓位保护'],
  },
  {
    id: 'cycle-leek',
    title: '追涨杀跌的周期韭菜',
    badge: '失败结局',
    description:
      '你多次忽视宏观周期和板块景气，重仓追逐错误方向，说明还没有建立可持续的投资体系。',
    unlockedLessons: ['逆周期操作纠错案例', '回撤控制基础课'],
  },
  {
    id: 'lucky-winner',
    title: '侥幸盈利的风险玩家',
    badge: '遗憾盈利',
    description:
      '你虽然获得正收益，但多次重仓和低认知操作说明盈利不可复制。下一次遇到极端市场可能会很危险。',
    unlockedLessons: ['新手禁忌操作手册', '风控纠错课程'],
  },
]
