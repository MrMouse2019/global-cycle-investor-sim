import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnnualBriefPage } from '../../src/pages/AnnualBriefPage'
import { AllocationPage } from '../../src/pages/AllocationPage'

describe('redesigned annual UI', () => {
  it('renders cockpit tabs and collapsed historical background', () => {
    render(<AnnualBriefPage />)

    expect(screen.getByText('年度行情速览')).toBeInTheDocument()
    expect(screen.getByText('一键资产配置')).toBeInTheDocument()
    expect(screen.getByText('年度结算 & 复盘')).toBeInTheDocument()
    expect(screen.getByText('展开完整历史背景')).toBeInTheDocument()
  })

  it('lets players reuse last year allocation when available', () => {
    render(<AllocationPage />)

    expect(screen.getByText('延续去年配置')).toBeInTheDocument()
  })
})
