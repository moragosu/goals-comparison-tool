import { useState } from 'react'
import './IndividualView.css'

function getStatusColor(rate) {
  if (rate >= 100) return 'var(--success)'
  if (rate >= 80) return 'var(--warning)'
  return 'var(--danger)'
}

function getStatusClass(rate) {
  if (rate >= 100) return 'status-achieved'
  if (rate >= 80) return 'status-progress'
  return 'status-behind'
}

function getStatusText(rate) {
  if (rate >= 100) return '달성'
  if (rate >= 80) return '진행중'
  return '미달'
}

export default function IndividualView({ data }) {
  const members = [...new Set(data.map(d => d['이름']))]
  const [selected, setSelected] = useState(members[0] || '')

  const memberData = data.filter(d => d['이름'] === selected)
  const avgRate = memberData.length
    ? Math.round(memberData.reduce((s, d) => s + d['달성률'], 0) / memberData.length)
    : 0
  const achievedCount = memberData.filter(d => d['달성률'] >= 100).length
  const maxGoal = memberData.reduce((max, d) => (d['달성률'] > max['달성률'] ? d : max), memberData[0] || {})
  const minGoal = memberData.reduce((min, d) => (d['달성률'] < min['달성률'] ? d : min), memberData[0] || {})

  // Rank this member among all
  const memberAvgs = members.map(name => {
    const rows = data.filter(d => d['이름'] === name)
    return { name, avg: Math.round(rows.reduce((s, d) => s + d['달성률'], 0) / rows.length) }
  }).sort((a, b) => b.avg - a.avg)
  const rank = memberAvgs.findIndex(m => m.name === selected) + 1

  // Team avg for comparison
  const teamAvg = Math.round(data.reduce((s, d) => s + d['달성률'], 0) / data.length)

  const sortedGoals = [...memberData].sort((a, b) => b['달성률'] - a['달성률'])

  return (
    <div className="tab-content">
      {/* Member Selector */}
      <div className="card member-selector-card">
        <label className="selector-label" htmlFor="member-select">팀원 선택</label>
        <div className="selector-row">
          {members.map(name => (
            <button
              key={name}
              className={`member-chip ${selected === name ? 'active' : ''}`}
              onClick={() => setSelected(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Stats */}
      <div className="individual-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon rank-icon">#{rank}</div>
          <div className="stat-label">팀 내 순위</div>
          <div className="stat-sub">{members.length}명 중</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: getStatusColor(avgRate), fontSize: '1.8rem', fontWeight: 700 }}>
            {avgRate}%
          </div>
          <div className="stat-label">개인 평균 달성률</div>
          <div className="stat-sub" style={{ color: avgRate >= teamAvg ? 'var(--success)' : 'var(--danger)' }}>
            팀 평균 대비 {avgRate >= teamAvg ? '+' : ''}{avgRate - teamAvg}%p
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)', fontSize: '1.8rem', fontWeight: 700 }}>
            {achievedCount}<span style={{ fontSize: '1rem' }}>개</span>
          </div>
          <div className="stat-label">달성 목표</div>
          <div className="stat-sub">{memberData.length}개 중</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
            {maxGoal['목표명'] || '-'}
          </div>
          <div className="stat-label">최고 달성 목표</div>
          <div className="stat-sub" style={{ color: 'var(--success)' }}>
            {maxGoal['달성률']}%
          </div>
        </div>
      </div>

      {/* Goal Progress Cards */}
      <div className="card">
        <h2 className="section-title">{selected}님의 목표별 달성 현황</h2>
        <div className="goal-cards-grid">
          {sortedGoals.map((row, idx) => (
            <div key={idx} className="goal-card">
              <div className="goal-card-header">
                <div className="goal-name">{row['목표명']}</div>
                <span className={`status-badge ${getStatusClass(row['달성률'])}`}>
                  {getStatusText(row['달성률'])}
                </span>
              </div>
              <div className="goal-meta">
                <span className="category-badge">{row['카테고리']}</span>
                <span className="goal-period">{row['기간']}</span>
              </div>
              <div className="goal-numbers">
                <div className="goal-number-item">
                  <span className="goal-number-label">목표</span>
                  <span className="goal-number-val">{row['목표값'].toLocaleString()} {row['단위']}</span>
                </div>
                <div className="goal-number-item">
                  <span className="goal-number-label">실적</span>
                  <span className="goal-number-val" style={{ color: getStatusColor(row['달성률']) }}>
                    {row['실적값'].toLocaleString()} {row['단위']}
                  </span>
                </div>
              </div>
              <div className="goal-progress-row">
                <div className="progress-bar-wrapper">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(row['달성률'], 100)}%`,
                      backgroundColor: getStatusColor(row['달성률']),
                    }}
                  />
                </div>
                <span
                  className="goal-pct"
                  style={{ color: getStatusColor(row['달성률']) }}
                >
                  {row['달성률']}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team comparison for this member's goals */}
      <div className="card">
        <h2 className="section-title">{selected}님 vs 팀 평균 비교</h2>
        <div className="comparison-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>목표명</th>
                <th>카테고리</th>
                <th style={{ textAlign: 'right' }}>개인 달성률</th>
                <th style={{ textAlign: 'right' }}>팀 평균 달성률</th>
                <th style={{ textAlign: 'right' }}>차이</th>
              </tr>
            </thead>
            <tbody>
              {memberData.map((row, idx) => {
                const goalName = row['목표명']
                const goalRows = data.filter(d => d['목표명'] === goalName)
                const goalTeamAvg = Math.round(goalRows.reduce((s, d) => s + d['달성률'], 0) / goalRows.length)
                const diff = row['달성률'] - goalTeamAvg
                return (
                  <tr key={idx}>
                    <td className="name-cell">{goalName}</td>
                    <td><span className="category-badge">{row['카테고리']}</span></td>
                    <td className="number-cell" style={{ color: getStatusColor(row['달성률']), fontWeight: 600 }}>
                      {row['달성률']}%
                    </td>
                    <td className="number-cell" style={{ color: 'var(--text-secondary)' }}>
                      {goalTeamAvg}%
                    </td>
                    <td
                      className="number-cell"
                      style={{ color: diff >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}
                    >
                      {diff >= 0 ? '+' : ''}{diff}%p
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
