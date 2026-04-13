import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import OverallStatus from './components/OverallStatus'
import IndividualView from './components/IndividualView'
import GoalComparison from './components/GoalComparison'
import './App.css'

const TABS = [
  { id: 'overall', label: '전체현황' },
  { id: 'individual', label: '개인별' },
  { id: 'comparison', label: '목표명 비교' },
]

function App() {
  const [activeTab, setActiveTab] = useState('overall')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/goals.csv')
      .then(res => {
        if (!res.ok) throw new Error('goals.csv 파일을 불러올 수 없습니다.')
        return res.text()
      })
      .then(csv => {
        const result = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: h => h.trim(),
          transform: v => v.trim(),
        })
        const processed = result.data.map(row => ({
          ...row,
          목표값: parseFloat(row['목표값']),
          실적값: parseFloat(row['실적값']),
          달성률: Math.round((parseFloat(row['실적값']) / parseFloat(row['목표값'])) * 100),
        }))
        setData(processed)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>데이터를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app-error">
        <div className="error-icon">!</div>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-title-group">
            <h1 className="header-title">파트원 목표 비교 대시보드</h1>
            <p className="header-subtitle">팀 목표 달성 현황을 한눈에 파악하세요</p>
          </div>
          <div className="header-meta">
            <span className="meta-badge">총 {[...new Set(data.map(d => d['이름']))].length}명</span>
            <span className="meta-badge">목표 {data.length}개</span>
          </div>
        </div>
      </header>

      <nav className="tab-nav">
        <div className="tab-nav-inner">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="app-main">
        {activeTab === 'overall' && <OverallStatus data={data} />}
        {activeTab === 'individual' && <IndividualView data={data} />}
        {activeTab === 'comparison' && <GoalComparison data={data} />}
      </main>

      <footer className="app-footer">
        <p>goals.csv 파일을 교체하면 데이터가 자동으로 반영됩니다.</p>
      </footer>
    </div>
  )
}

export default App
