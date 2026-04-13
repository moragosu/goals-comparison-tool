import { useState } from 'react'
import './GoalComparison.css'

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

export default function GoalComparison({ data }) {
  const goalNames = [...new Set(data.map(d => d['목표명']))]
  const [selectedGoal, setSelectedGoal] = useState(goalNames[0] || '')

  const goalRows = data
    .filter(d => d['목표명'] === selectedGoal)
    .sort((a, b) => b['달성률'] - a['달성률'])

  const avgRate = goalRows.length
    ? Math.round(goalRows.reduce((s, d) => s + d['달성률'], 0) / goalRows.length)
    : 0
  const maxRate = goalRows.length ? Math.max(...goalRows.map(d => d['달성률'])) : 0
  const minRate = goalRows.length ? Math.min(...goalRows.map(d => d['달성률'])) : 0
  const achievedCount = goalRows.filter(d => d['달성률'] >= 100).length

  const topMember = goalRows[0]
  const sampleRow = goalRows[0] || {}

  // All goals summary for the overview matrix
  const allGoalStats = goalNames.map(name => {
    const rows = data.filter(d => d['목표명'] === name)
    const avg = Math.round(rows.reduce((s, d) => s + d['달성률'], 0) / rows.length)
    const achieved = rows.filter(d => d['달성률'] >= 100).length
    return { name, avg, achieved, total: rows.length, cat: rows[0]?.['카테고리'] || '' }
  })

  const members = [...new Set(data.map(d => d['이름']))]

  return (
    <div className="tab-content">
      {/* Goal Selector */}
      <div className="card goal-selector-card">
        <p className="selector-label">목표 선택</p>
        <div className="goal-chips">
          {goalNames.map(name => (
            <button
              key={name}
              className={`goal-chip ${selectedGoal === name ? 'active' : ''}`}
              onClick={() => setSelectedGoal(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Goal Stats Cards */}
      <div className="summary-cards">
        <div className="summary-card card">
          <div className="card-value" style={{ color: getStatusColor(avgRate) }}>
            {avgRate}<span style={{ fontSize: '1rem', fontWeight: 500 }}>%</span>
          </div>
          <div className="card-label">목표 평균 달성률</div>
        </div>
        <div className="summary-card card">
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {achievedCount}<span style={{ fontSize: '1rem', fontWeight: 500 }}>명</span>
          </div>
          <div className="card-label">달성 인원</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{goalRows.length}명 중</div>
        </div>
        <div className="summary-card card">
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {maxRate}<span style={{ fontSize: '1rem', fontWeight: 500 }}>%</span>
          </div>
          <div className="card-label">최고 달성률</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{topMember?.['이름']}</div>
        </div>
        <div className="summary-card card">
          <div className="card-value" style={{ color: getStatusColor(minRate) }}>
            {minRate}<span style={{ fontSize: '1rem', fontWeight: 500 }}>%</span>
          </div>
          <div className="card-label">최저 달성률</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {goalRows[goalRows.length - 1]?.['이름']}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card">
        <h2 className="section-title">
          {selectedGoal} — 팀원별 달성률 비교
          {sampleRow['카테고리'] && (
            <span className="category-badge" style={{ marginLeft: 10 }}>{sampleRow['카테고리']}</span>
          )}
        </h2>
        <div className="bar-chart">
          {goalRows.map((row, idx) => (
            <div key={row['이름']} className="bar-row">
              <div className="bar-member-name">{row['이름']}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${Math.min(row['달성률'], 100)}%`,
                    backgroundColor: getStatusColor(row['달성률']),
                  }}
                >
                  {row['달성률'] >= 20 && (
                    <span className="bar-label-inside">{row['달성률']}%</span>
                  )}
                </div>
                {row['달성률'] < 20 && (
                  <span className="bar-label-outside" style={{ color: getStatusColor(row['달성률']) }}>
                    {row['달성률']}%
                  </span>
                )}
              </div>
              <div className="bar-values">
                <span>{row['실적값'].toLocaleString()} / {row['목표값'].toLocaleString()} {row['단위']}</span>
              </div>
              <span className={`status-badge ${getStatusClass(row['달성률'])}`}>
                {getStatusText(row['달성률'])}
              </span>
            </div>
          ))}
          {/* Average line marker */}
          <div className="avg-line-info">
            <span className="avg-marker-dot" />
            팀 평균 달성률: <strong>{avgRate}%</strong>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="card">
        <h2 className="section-title">목표명별 팀원 순위표</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>순위</th>
                <th>이름</th>
                <th style={{ textAlign: 'right' }}>목표값</th>
                <th style={{ textAlign: 'right' }}>실적값</th>
                <th>단위</th>
                <th style={{ textAlign: 'right' }}>달성률</th>
                <th style={{ textAlign: 'right' }}>팀 평균 대비</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {goalRows.map((row, idx) => {
                const diff = row['달성률'] - avgRate
                return (
                  <tr key={row['이름']} className={idx === 0 ? 'top-row' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      {idx === 0 ? (
                        <span className="rank-crown">🥇</span>
                      ) : idx === 1 ? (
                        <span className="rank-medal">🥈</span>
                      ) : idx === 2 ? (
                        <span className="rank-medal">🥉</span>
                      ) : (
                        <span className="rank-num">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="name-cell">{row['이름']}</td>
                    <td className="number-cell">{row['목표값'].toLocaleString()}</td>
                    <td className="number-cell">{row['실적값'].toLocaleString()}</td>
                    <td>{row['단위']}</td>
                    <td className="number-cell">
                      <div className="table-progress">
                        <div className="mini-progress-wrapper">
                          <div
                            className="mini-progress-fill"
                            style={{
                              width: `${Math.min(row['달성률'], 100)}%`,
                              backgroundColor: getStatusColor(row['달성률']),
                            }}
                          />
                        </div>
                        <span style={{ color: getStatusColor(row['달성률']), fontWeight: 600 }}>
                          {row['달성률']}%
                        </span>
                      </div>
                    </td>
                    <td
                      className="number-cell"
                      style={{ color: diff >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}
                    >
                      {diff >= 0 ? '+' : ''}{diff}%p
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(row['달성률'])}`}>
                        {getStatusText(row['달성률'])}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overview Matrix: all goals × all members */}
      <div className="card">
        <h2 className="section-title">전체 목표명 × 팀원 달성률 매트릭스</h2>
        <div className="table-wrapper">
          <table className="data-table matrix-table">
            <thead>
              <tr>
                <th>목표명</th>
                <th>카테고리</th>
                {members.map(name => (
                  <th key={name} style={{ textAlign: 'center' }}>{name}</th>
                ))}
                <th style={{ textAlign: 'center' }}>팀 평균</th>
              </tr>
            </thead>
            <tbody>
              {allGoalStats.map(({ name: goalName, avg: gAvg, cat }) => {
                const rows = data.filter(d => d['목표명'] === goalName)
                return (
                  <tr key={goalName} className={goalName === selectedGoal ? 'selected-row' : ''}>
                    <td className="name-cell">{goalName}</td>
                    <td><span className="category-badge">{cat}</span></td>
                    {members.map(memberName => {
                      const row = rows.find(d => d['이름'] === memberName)
                      if (!row) return <td key={memberName} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>-</td>
                      return (
                        <td key={memberName} style={{ textAlign: 'center' }}>
                          <span
                            className={`matrix-cell ${getStatusClass(row['달성률'])}`}
                          >
                            {row['달성률']}%
                          </span>
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: getStatusColor(gAvg) }}>{gAvg}%</span>
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
