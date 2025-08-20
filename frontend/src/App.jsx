
import React, { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

async function api(path, opts) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type':'application/json' }, ...opts })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export default function App() {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState('')
  const [adding, setAdding] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const eventRef = useRef(null)

  const fetchUsers = async () => setUsers(await api('/api/users'))
  const fetchLeaderboard = async () => setLeaderboard(await api('/api/leaderboard'))

  useEffect(() => {
    fetchUsers()
    fetchLeaderboard()

    // Live updates via SSE (fallback to polling if blocked)
    try {
      const ev = new EventSource(`${API_BASE}/api/events`)
      ev.onmessage = (e) => {
        const data = JSON.parse(e.data)
        setLeaderboard(data.map((u, i) => ({ rank: i+1, ...u })))
      }
      ev.onerror = () => { ev.close() }
      eventRef.current = ev
    } catch (e) {
      const id = setInterval(fetchLeaderboard, 3000)
      return () => clearInterval(id)
    }

    return () => {
      if (eventRef.current) eventRef.current.close()
    }
  }, [])

  const handleAdd = async () => {
    if (!adding.trim()) return
    await api('/api/users', { method: 'POST', body: JSON.stringify({ name: adding.trim() }) })
    setAdding('')
    fetchUsers()
  }

  const handleClaim = async () => {
    if (!selected) return
    const res = await api(`/api/claim/${selected}`, { method: 'POST' })
    setLastResult({ name: res.user.name, points: res.points })
    fetchUsers()
    // leaderboard will auto-refresh via SSE
  }

  return (
    <div style={{ maxWidth: 840, margin: '24px auto', padding: 16, fontFamily: 'system-ui, Arial' }}>
      <h1>Leaderboard (Round 1 Task)</h1>
      <p>Select a user and press <b>Claim</b> to add 1–10 random points. Add new users as needed. Leaderboard updates live.</p>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
          <h3>User Actions</h3>
          <label>Choose User</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 8, marginBottom: 12 }}>
            <option value="">-- Select --</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.totalPoints})</option>)}
          </select>

          <button onClick={handleClaim} style={{ padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}>Claim</button>

          {lastResult && (
            <div style={{ marginTop: 12, padding: 12, background: '#f7f7f7', borderRadius: 8 }}>
              <b>{lastResult.name}</b> gained <b>{lastResult.points}</b> points!
            </div>
          )}

          <hr style={{ margin: '16px 0' }} />

          <h4>Add New User</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={adding} onChange={e => setAdding(e.target.value)} placeholder="Enter name" style={{ flex: 1, padding: 8 }} />
            <button onClick={handleAdd} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}>Add</button>
          </div>
        </div>

        <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
          <h3>Leaderboard</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Rank</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: 8 }}>Name</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: 8 }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(row => (
                <tr key={row._id}>
                  <td style={{ padding: 8 }}>{row.rank}</td>
                  <td style={{ padding: 8 }}>{row.name}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{row.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer style={{ marginTop: 24, fontSize: 12, color: '#555' }}>
        <p>Set <code>VITE_API_BASE</code> to your deployed backend URL for Netlify/Vercel.</p>
      </footer>
    </div>
  )
}
