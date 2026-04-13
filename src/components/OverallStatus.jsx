import './OverallStatus.css'

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

export default function OverallStatus({ data }) {
  const members = [...new Set(data.map(d => d['이름']))]
  const totalGoals = data.length
  const achievedGoals = data.filter(d => d['달성률'] >= 100).length
  const avgRate = Math.round(data.reduce((sum, d) => sum + d['달성률'], 0) / data.length)

  const memberStats = members
    .map(name => {
      const rows = data.filter(d => d['이름'] === name)
      const avg = Math.round(rows.reduce((s, d) => s + d['달성률'], 0) / rows.length)
      const achieved = rows.filter(d => d['달성률'] >= 100).length
      return { name, avg, achieved, total: rows.length }
    })
    .sort((a, b) => b.avg - a.avg)

  // Category aggregation
  const categories = [...new Set(data.map(d => d['카테고리']))]
  const categoryStats = categories.map(cat => {
    const rows = data.filter(d => d['카테고리'] === cat)
    const avg = Math.round(rows.reduce((s, d) => s + d['달성률'], 0) / rows.length)
    return { cat, avg, count: rows.length }
  }).sort((a, b) => b.avg - a.avg)

  return (
    <div className="tab-content">
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card card">
          <div className="card-value">{members.length}<span className="card-unit">명</span></div>
          <div className="card-label">팀원 수</div>
        </div>
        <div className="summary-card card">
          <div className="card-value">{totalGoals}<span className="card-unit">개</span></div>
          <div className="card-label">전체 목표</div>
        </div>
        <div className="summary-card card">
          <div className="card-value" style={{ color: 'var(--success)' }}>
            {achievedGoals}<span className="card-unit">개</span>
          </div>
          <div className="card-label">달성 목표</div>
          <div className="card-sub">{Math.round((achievedGoals / totalGoals) * 100)}% 달성</div>
        </div>
        <div className="summary-card card">
          <div className="card-value" style={{ color: getStatusColor(avgRate) }}>
            {avgRate}<span className="card-unit">%</span>
          </div>
          <div className="card-label">평균 달성률</div>
          <div className={`card-sub ${getStatusClass(avgRate)}-text`}>{getStatusText(avgRate)}</div>
        </div>
      </div>

      {/* Member Overview */}
      <div className="card">
        <h2 className="section-title">팀원별 달성률 현황</h2>
        <div className="member-list">
          {memberStats.map((m, idx) => (
            <div key={m.name} className="member-row">
              <div className="member-rank" style={{ color: idx < 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                #{idx + 1}
              </div>
              <div className="member-name-col">{m.name}</div>
              <div className="member-bar-col">
                <div className="progress-bar-wrapper">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${Math.min(m.avg, 100)}%`,
                      backgroundColor: getStatusColor(m.avg),
                    }}
                  />
                </div>
              </div>
              <div className="member-pct" style={{ color: getStatusColor(m.avg) }}>
                {m.avg}%
              </div>
              <div className="member-count">
                {m.achieved}/{m.total} 달성
              </div>
              <div>
                <span className={`status-badge ${getStatusClass(m.avg)}`}>
                  {getStatusText(m.avg)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Stats */}
      <div className="card">
        <h2 className="section-title">카테고리별 평균 달성률</h2>
        <div className="category-grid">
          {categoryStats.map(({ cat, avg, count }) => (
            <div key={cat} className="category-card">
              <div className="category-header">
                <span className="category-badge">{cat}</span>
                <span className="category-count">{count}개 목표</span>
              </div>
              <div className="category-rate" style={{ color: getStatusColor(avg) }}>{avg}%</div>
              <div className="progress-bar-wrapper" style={{ marginTop: 8 }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(avg, 100)}%`,
                    backgroundColor: getStatusColor(avg),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Table */}
      <div className="card">
        <h2 className="section-title">전체 목표 상세 현황</h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>목표명</th>
                <th>카테고리</th>
                <th style={{ textAlign: 'right' }}>목표값</th>
                <th style={{ textAlign: 'right' }}>실적값</th>
                <th>단위</th>
                <th>기간</th>
                <th>달성률</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td className="name-cell">{row['이름']}</td>
                  <td>{row['목표명']}</td>
                  <td><span className="category-badge">{row['카테고리']}</span></td>
                  <td className="number-cell">{row['목표값'].toLocaleString()}</td>
                  <td className="number-cell">{row['실적값'].toLocaleString()}</td>
                  <td>{row['단위']}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{row['기간']}</td>
                  <td>
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
                  <td>
                    <span className={`status-badge ${getStatusClass(row['달성률'])}`}>
                      {getStatusText(row['달성률'])}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
