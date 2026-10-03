import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createUser,
  getUserData,
  getUsers,
  saveDayData,
  updateUserPrefs,
  verifyUser,
} from './db'
import './styles.css'

const THEMES = {
  forest: {
    name: 'Forest',
    bg: '#0b100d',
    surface: '#141b16',
    raised: '#1a231c',
    text: '#f5f4ef',
    muted: '#8e9a90',
    accent: '#93d59b',
    border: '#263129',
    soft: '#1f2c22',
  },
  teal: {
    name: 'Tide',
    bg: '#071315',
    surface: '#0f2023',
    raised: '#142a2e',
    text: '#eff8f7',
    muted: '#84a5a5',
    accent: '#68d6cf',
    border: '#21373a',
    soft: '#163033',
  },
  terra: {
    name: 'Clay',
    bg: '#15100c',
    surface: '#221914',
    raised: '#2c2019',
    text: '#fff5ee',
    muted: '#b39a8a',
    accent: '#ee9b72',
    border: '#3b2d25',
    soft: '#35241b',
  },
  rose: {
    name: 'Rose',
    bg: '#150d11',
    surface: '#22141b',
    raised: '#2b1922',
    text: '#fff3f7',
    muted: '#b796a3',
    accent: '#ef91b5',
    border: '#3a2630',
    soft: '#341f29',
  },
  black: {
    name: 'Ink',
    bg: '#090909',
    surface: '#131313',
    raised: '#1b1b1b',
    text: '#fafafa',
    muted: '#919191',
    accent: '#f2f2f2',
    border: '#292929',
    soft: '#202020',
  },
}

const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const nowTime = () => new Date().toTimeString().slice(0, 5)
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const emptyDay = () => ({ meals: {}, workouts: [], weight: '' })

function themeVars(theme) {
  return Object.fromEntries(Object.entries(theme).map(([key, value]) => [`--${key}`, value]))
}

function fmtDay(date, long = true) {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString('en-US', long
    ? { weekday: 'long', month: 'long', day: 'numeric' }
    : { month: 'short', day: 'numeric' })
}

function fmtShortDate(date) {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function normalizePhoto(photo) {
  if (!photo) return null
  if (typeof photo === 'string') return { url: photo }
  return {
    ...photo,
    url: photo.url || photo.imageUrl || '',
  }
}

function normalizeMeal(meal, fallbackId, fallbackTime) {
  if (!meal) return null
  const photos = (meal.photos || []).map(normalizePhoto).filter(Boolean)
  const description = meal.description
    || meal.photos?.[0]?.description
    || meal.notes
    || ''
  return {
    id: meal.id || fallbackId || uid(),
    time: meal.time || meal.timestamp || fallbackTime || '',
    description,
    photos,
    createdAt: meal.createdAt || meal.created_at || '',
  }
}

function normalizeDay(day) {
  if (!day) return emptyDay()
  const rawMeals = day.meals || {}
  const meals = {}
  if (Array.isArray(rawMeals)) {
    rawMeals.forEach((meal, i) => {
      const next = normalizeMeal(meal, meal?.id || `legacy-${i}`)
      if (next) meals[next.id] = next
    })
  } else {
    Object.entries(rawMeals).forEach(([key, meal]) => {
      if (!meal || meal.status === 'empty') return
      const next = normalizeMeal(meal, meal.id || key)
      if (next) meals[next.id] = next
    })
  }

  let workouts = []
  if (Array.isArray(day.workouts)) workouts = day.workouts
  else if (Array.isArray(day.workout)) workouts = day.workout
  else if (day.workout?.type) workouts = [day.workout]

  return {
    meals,
    workouts: workouts.filter(Boolean).map((w, i) => ({
      id: w.id || `workout-${i}-${w.time || ''}`,
      type: w.type || 'Workout',
      duration: w.duration || '',
      time: w.time || '',
      source: w.source || (w.fromHealth ? 'Apple Health' : 'Manual'),
    })),
    weight: day.weight ? String(day.weight) : '',
  }
}

function mealPhotoSrc(meal) {
  const photo = meal?.photos?.[0]
  if (!photo) return ''
  if (photo.url) return photo.url
  if (photo.base64) return `data:${photo.mediaType || 'image/jpeg'};base64,${photo.base64}`
  return ''
}

async function fileToPhoto(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })

  const maxSide = 1600
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const compressed = canvas.toDataURL('image/jpeg', 0.82)
  return {
    base64: compressed.split(',')[1],
    mediaType: 'image/jpeg',
  }
}

function IconButton({ children, onClick, title }) {
  return <button className="icon-button" onClick={onClick} title={title}>{children}</button>
}

function Sheet({ children, onClose, wide = false }) {
  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <div className={`sheet ${wide ? 'sheet-wide' : ''}`} onMouseDown={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        {children}
      </div>
    </div>
  )
}

function MealEditor({ meal, onClose, onSave, onDelete }) {
  const fileRef = useRef(null)
  const [description, setDescription] = useState(meal?.description || '')
  const [time, setTime] = useState(meal?.time || nowTime())
  const [photos, setPhotos] = useState(meal?.photos || [])
  const [processing, setProcessing] = useState(false)
  const preview = mealPhotoSrc({ photos })

  const choosePhoto = async (file) => {
    if (!file) return
    setProcessing(true)
    try {
      const photo = await fileToPhoto(file)
      setPhotos([photo])
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-heading">
        <div>
          <div className="eyebrow">MEAL</div>
          <h2>{meal ? 'Edit meal' : 'Add meal'}</h2>
        </div>
        <IconButton onClick={onClose}>×</IconButton>
      </div>

      <button className={`photo-picker ${preview ? 'has-photo' : ''}`} onClick={() => fileRef.current?.click()}>
        {preview ? <img src={preview} alt="Meal" /> : (
          <div className="photo-empty">
            <span className="photo-plus">＋</span>
            <strong>{processing ? 'Preparing photo…' : 'Add a photo'}</strong>
            <span>Camera or photo library</span>
          </div>
        )}
      </button>
      <input
        ref={fileRef}
        hidden
        type="file"
        accept="image/*"
        capture="environment"
        onChange={e => choosePhoto(e.target.files?.[0])}
      />

      <label className="field-label">Time</label>
      <input className="field" type="time" value={time} onChange={e => setTime(e.target.value)} />

      <label className="field-label">Small description</label>
      <textarea
        className="field textarea"
        rows="3"
        maxLength="180"
        placeholder="e.g. Pasta with ragù"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <div className="sheet-actions">
        {meal && <button className="button button-danger" onClick={onDelete}>Delete</button>}
        <button
          className="button button-primary"
          disabled={processing || photos.length === 0}
          onClick={() => onSave({
            id: meal?.id || uid(),
            time,
            description: description.trim(),
            photos,
            createdAt: meal?.createdAt || new Date().toISOString(),
          })}
        >
          Save meal
        </button>
      </div>
    </Sheet>
  )
}

function WeightEditor({ value, onClose, onSave }) {
  const [weight, setWeight] = useState(value || '')
  return (
    <Sheet onClose={onClose}>
      <div className="sheet-heading">
        <div><div className="eyebrow">WEIGHT</div><h2>Daily weight</h2></div>
        <IconButton onClick={onClose}>×</IconButton>
      </div>
      <p className="sheet-copy">Apple Health can fill this automatically. Manual entry is here as a fallback.</p>
      <div className="weight-entry">
        <input className="field weight-field" type="number" inputMode="decimal" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} autoFocus />
        <span>kg</span>
      </div>
      <button className="button button-primary full" onClick={() => onSave(weight)}>Save weight</button>
    </Sheet>
  )
}

function WorkoutEditor({ onClose, onSave }) {
  const [type, setType] = useState('')
  const [duration, setDuration] = useState('')
  const [time, setTime] = useState(nowTime())
  return (
    <Sheet onClose={onClose}>
      <div className="sheet-heading">
        <div><div className="eyebrow">ACTIVITY</div><h2>Add activity</h2></div>
        <IconButton onClick={onClose}>×</IconButton>
      </div>
      <p className="sheet-copy">Normally this will sync from Apple Health. Use this if a workout is missing.</p>
      <label className="field-label">Activity</label>
      <input className="field" placeholder="Tennis, strength, swimming…" value={type} onChange={e => setType(e.target.value)} />
      <div className="two-col">
        <div>
          <label className="field-label">Duration (min)</label>
          <input className="field" type="number" inputMode="numeric" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Time</label>
          <input className="field" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
      </div>
      <button className="button button-primary full" disabled={!type.trim()} onClick={() => onSave({ id: uid(), type: type.trim(), duration, time, source: 'Manual' })}>Save activity</button>
    </Sheet>
  )
}

function MealCard({ meal, onClick }) {
  const src = mealPhotoSrc(meal)
  return (
    <button className="meal-card" onClick={onClick}>
      <div className="meal-photo-wrap">
        {src ? <img className="meal-photo" src={src} alt={meal.description || 'Meal'} /> : <div className="meal-photo-placeholder">Meal</div>}
      </div>
      <div className="meal-meta">
        <span className="meal-time">{meal.time || '—'}</span>
        <span className={`meal-description ${meal.description ? '' : 'empty-description'}`}>{meal.description || 'No description'}</span>
      </div>
    </button>
  )
}

function ActivityList({ workouts, onAdd }) {
  return (
    <section className="activity-section">
      <div className="section-title-row">
        <div>
          <div className="eyebrow">ACTIVITY</div>
          <h3>Movement</h3>
        </div>
        <button className="text-button" onClick={onAdd}>+ Add manually</button>
      </div>
      {workouts.length === 0 ? (
        <div className="empty-inline">No activity synced today.</div>
      ) : (
        <div className="activity-list">
          {workouts.map(workout => (
            <div className="activity-row" key={workout.id}>
              <div className="activity-mark">↗</div>
              <div className="activity-main">
                <strong>{workout.type}</strong>
                <span>{[workout.time, workout.duration ? `${workout.duration} min` : ''].filter(Boolean).join(' · ')}</span>
              </div>
              <span className="source-badge">{workout.source || 'Apple Health'}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TodayView({ day, onAddMeal, onEditMeal, onEditWeight, onAddWorkout }) {
  const meals = Object.values(day.meals || {}).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  return (
    <>
      <section className="day-intro">
        <div>
          <div className="eyebrow">TODAY</div>
          <h1>{fmtDay(todayKey())}</h1>
        </div>
        <button className="weight-pill" onClick={onEditWeight}>
          <span>{day.weight ? `${day.weight} kg` : 'Add weight'}</span>
          <small>{day.weight ? 'Health / manual' : 'Apple Health ready'}</small>
        </button>
      </section>

      <button className="add-meal-button" onClick={onAddMeal}><span>＋</span> Add meal</button>

      <section className="meal-feed">
        {meals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-symbol">○</div>
            <h3>Your day starts here.</h3>
            <p>Add a photo when you eat. A short description is enough.</p>
          </div>
        ) : meals.map(meal => <MealCard key={meal.id} meal={meal} onClick={() => onEditMeal(meal)} />)}
      </section>

      <ActivityList workouts={day.workouts || []} onAdd={onAddWorkout} />
    </>
  )
}

function DayJournal({ date, day, onOpen }) {
  const meals = Object.values(day.meals || {}).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  return (
    <button className="history-day" onClick={() => onOpen(date)}>
      <div className="history-day-head">
        <div>
          <strong>{fmtShortDate(date)}</strong>
          <span>{meals.length} {meals.length === 1 ? 'meal' : 'meals'}{day.workouts?.length ? ` · ${day.workouts.length} activity` : ''}</span>
        </div>
        {day.weight && <span className="history-weight">{day.weight} kg</span>}
      </div>
      {meals.length > 0 && (
        <div className="history-photo-strip">
          {meals.slice(0, 4).map(meal => {
            const src = mealPhotoSrc(meal)
            return src ? <img key={meal.id} src={src} alt="" /> : <div key={meal.id} className="history-photo-empty" />
          })}
        </div>
      )}
    </button>
  )
}

function HistoryView({ history, onOpenDay, onExport }) {
  const dates = Object.keys(history)
    .filter(date => {
      const d = history[date]
      return Object.keys(d.meals || {}).length || d.weight || d.workouts?.length
    })
    .sort((a, b) => b.localeCompare(a))

  return (
    <>
      <section className="history-heading">
        <div><div className="eyebrow">JOURNAL</div><h1>History</h1></div>
        <button className="button button-secondary compact" onClick={onExport}>Export PDF</button>
      </section>
      <div className="history-list">
        {dates.length === 0 ? <div className="empty-state"><h3>No journal yet.</h3><p>Your logged days will appear here.</p></div> : dates.map(date => <DayJournal key={date} date={date} day={history[date]} onOpen={onOpenDay} />)}
      </div>
    </>
  )
}

function DayDetail({ date, day, onBack, onEditMeal, onAddMeal, onEditWeight, onAddWorkout }) {
  const meals = Object.values(day.meals || {}).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  return (
    <>
      <div className="detail-topbar">
        <button className="text-button" onClick={onBack}>← History</button>
        <button className="weight-pill small" onClick={onEditWeight}>{day.weight ? `${day.weight} kg` : 'Add weight'}</button>
      </div>
      <section className="day-intro compact-intro">
        <div><div className="eyebrow">DAY</div><h1>{fmtDay(date)}</h1></div>
      </section>
      <button className="add-meal-button" onClick={onAddMeal}><span>＋</span> Add meal</button>
      <section className="meal-feed">
        {meals.map(meal => <MealCard key={meal.id} meal={meal} onClick={() => onEditMeal(meal)} />)}
      </section>
      <ActivityList workouts={day.workouts || []} onAdd={onAddWorkout} />
    </>
  )
}

function ExportSheet({ history, onClose, userName }) {
  const dates = Object.keys(history).sort()
  const latest = dates.at(-1) || todayKey()
  const sevenDaysAgo = new Date(`${latest}T12:00:00`)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const defaultFrom = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(latest)

  const quickRange = (days) => {
    const end = new Date(`${latest}T12:00:00`)
    const start = new Date(end)
    start.setDate(start.getDate() - (days - 1))
    const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    setFrom(key(start)); setTo(key(end))
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-heading">
        <div><div className="eyebrow">SHARE</div><h2>Nutritionist PDF</h2></div>
        <IconButton onClick={onClose}>×</IconButton>
      </div>
      <p className="sheet-copy">A clean report with meal photos, descriptions, weight and activity.</p>
      <div className="range-chips">
        <button onClick={() => quickRange(7)}>Last 7 days</button>
        <button onClick={() => quickRange(14)}>Last 14 days</button>
        <button onClick={() => quickRange(30)}>Last 30 days</button>
      </div>
      <div className="two-col">
        <div><label className="field-label">From</label><input className="field" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
        <div><label className="field-label">To</label><input className="field" type="date" value={to} onChange={e => setTo(e.target.value)} /></div>
      </div>
      <button className="button button-primary full" onClick={() => buildPDF(history, from, to, userName)}>Generate PDF</button>
    </Sheet>
  )
}

function SettingsSheet({ user, themeId, onTheme, onLogout, onClose }) {
  const [copied, setCopied] = useState(false)
  const copyId = async () => {
    await navigator.clipboard?.writeText(user.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <Sheet onClose={onClose}>
      <div className="sheet-heading">
        <div><div className="eyebrow">TRACKY</div><h2>Settings</h2></div>
        <IconButton onClick={onClose}>×</IconButton>
      </div>

      <div className="settings-block">
        <h3>Theme</h3>
        <div className="theme-grid">
          {Object.entries(THEMES).map(([id, theme]) => (
            <button key={id} className={`theme-choice ${themeId === id ? 'selected' : ''}`} onClick={() => onTheme(id)}>
              <span className="theme-dot" style={{ background: theme.accent, boxShadow: `0 0 0 5px ${theme.surface}` }} />
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-block">
        <h3>Apple Health sync</h3>
        <p>Use an iOS Shortcut automation to send your latest weight and workouts to Tracky. The app does not need to be open.</p>
        <div className="sync-id-row">
          <div><small>Your Tracky user ID</small><code>{user.id}</code></div>
          <button className="text-button" onClick={copyId}>{copied ? 'Copied' : 'Copy'}</button>
        </div>
        <p className="tiny-copy">Endpoint: <code>/api/health</code>. The Shortcut should include your user ID and the private sync token configured on Vercel.</p>
      </div>

      <button className="button button-secondary full" onClick={onLogout}>Log out</button>
    </Sheet>
  )
}

function AuthScreen({ onLogin }) {
  const [users, setUsers] = useState([])
  const [mode, setMode] = useState('pick')
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { getUsers().then(setUsers) }, [])

  const login = async () => {
    setError('')
    const user = await verifyUser(selected.id, pin)
    if (!user) return setError('Wrong PIN')
    onLogin(user)
  }

  const create = async () => {
    setError('')
    if (!name.trim()) return setError('Enter your name')
    if (!/^\d{4}$/.test(pin)) return setError('Use a 4-digit PIN')
    try {
      const user = await createUser({ name: name.trim(), pin, skin: 'forest' })
      onLogin(user)
    } catch (e) { setError(e.message || 'Could not create user') }
  }

  if (mode === 'login' && selected) return (
    <div className="auth-shell">
      <div className="auth-card">
        <button className="text-button auth-back" onClick={() => { setMode('pick'); setPin(''); setError('') }}>← Back</button>
        <div className="brand large">Tracky<span>.</span></div>
        <h1>Hi, {selected.name}.</h1>
        <p>Enter your PIN to open your journal.</p>
        <input className="field pin-field" inputMode="numeric" maxLength="4" placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} onKeyDown={e => e.key === 'Enter' && login()} autoFocus />
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary full" onClick={login}>Open Tracky</button>
      </div>
    </div>
  )

  if (mode === 'create') return (
    <div className="auth-shell">
      <div className="auth-card">
        <button className="text-button auth-back" onClick={() => { setMode('pick'); setError('') }}>← Back</button>
        <div className="brand large">Tracky<span>.</span></div>
        <h1>Create your journal.</h1>
        <input className="field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
        <input className="field pin-field" inputMode="numeric" maxLength="4" placeholder="4-digit PIN" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} />
        {error && <div className="form-error">{error}</div>}
        <button className="button button-primary full" onClick={create}>Create journal</button>
      </div>
    </div>
  )

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand large">Tracky<span>.</span></div>
        <h1>Your food journal.</h1>
        <p>Meals, weight and movement. Nothing more than you need.</p>
        <div className="user-list">
          {users.map(user => <button key={user.id} className="user-choice" onClick={() => { setSelected(user); setMode('login') }}><span>{user.name.slice(0, 1).toUpperCase()}</span>{user.name}</button>)}
        </div>
        <button className="button button-secondary full" onClick={() => setMode('create')}>Create new journal</button>
      </div>
    </div>
  )
}

function buildPDF(history, from, to, userName) {
  const selected = Object.entries(history)
    .filter(([date]) => date >= from && date <= to)
    .sort(([a], [b]) => a.localeCompare(b))

  const weights = selected.map(([, day]) => parseFloat(day.weight)).filter(Number.isFinite)
  const mealCount = selected.reduce((sum, [, day]) => sum + Object.keys(day.meals || {}).length, 0)
  const workoutCount = selected.reduce((sum, [, day]) => sum + (day.workouts?.length || 0), 0)
  const avgWeight = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : null

  const dayHtml = selected.map(([date, day]) => {
    const meals = Object.values(day.meals || {}).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    const mealsHtml = meals.map(meal => {
      const src = mealPhotoSrc(meal)
      return `<div class="meal">
        ${src ? `<img src="${src}" alt="" />` : ''}
        <div class="meal-text"><strong>${meal.time || ''}</strong><span>${escapeHtml(meal.description || 'No description')}</span></div>
      </div>`
    }).join('')
    const activities = (day.workouts || []).map(w => `<div class="activity"><strong>${escapeHtml(w.type)}</strong><span>${[w.time, w.duration ? `${w.duration} min` : ''].filter(Boolean).join(' · ')}</span></div>`).join('')
    return `<section class="day">
      <div class="day-head"><h2>${fmtDay(date)}</h2>${day.weight ? `<div class="weight">${escapeHtml(day.weight)} kg</div>` : ''}</div>
      ${mealsHtml || '<p class="muted">No meals logged.</p>'}
      ${activities ? `<div class="activity-block"><h3>Activity</h3>${activities}</div>` : ''}
    </section>`
  }).join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Tracky — ${escapeHtml(userName)}</title><style>
    *{box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#1b1b1b;margin:0;padding:48px;background:white}.page{max-width:820px;margin:auto}.brand{font-size:34px;font-weight:850;letter-spacing:-1.5px}.brand span{color:#568b5c}.sub{color:#777;margin-top:6px}.summary{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0 40px}.stat{border:1px solid #ddd;border-radius:12px;padding:12px 16px;min-width:120px}.stat b{font-size:20px;display:block}.stat span{font-size:10px;color:#777;text-transform:uppercase;letter-spacing:.8px}.actions{margin:20px 0 30px}.actions button{border:0;border-radius:8px;padding:10px 16px;background:#1f3823;color:white}.day{padding:26px 0;border-top:1px solid #ddd;page-break-inside:avoid}.day-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.day-head h2{font-size:18px;margin:0}.weight{font-weight:700}.meal{display:grid;grid-template-columns:170px 1fr;gap:16px;align-items:center;margin:0 0 16px}.meal img{width:170px;height:122px;object-fit:cover;border-radius:10px}.meal-text{display:flex;flex-direction:column;gap:5px}.meal-text strong{font-size:12px;color:#777}.meal-text span{font-size:14px}.activity-block{margin-top:16px;background:#f6f7f4;border-radius:10px;padding:14px}.activity-block h3{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#777;margin:0 0 8px}.activity{display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:5px 0}.activity span,.muted{color:#777}@media print{body{padding:24px}.actions{display:none}.day{page-break-inside:avoid}}
  </style></head><body><div class="page">
    <div class="brand">Tracky<span>.</span></div>
    <div class="sub">Food, weight & activity journal · ${escapeHtml(userName)} · ${fmtShortDate(from)} – ${fmtShortDate(to)}</div>
    <div class="summary">
      <div class="stat"><b>${selected.length}</b><span>days</span></div>
      <div class="stat"><b>${mealCount}</b><span>meals</span></div>
      <div class="stat"><b>${workoutCount}</b><span>activities</span></div>
      ${avgWeight ? `<div class="stat"><b>${avgWeight} kg</b><span>avg weight</span></div>` : ''}
    </div>
    <div class="actions"><button onclick="window.print()">Print / Save PDF</button></div>
    ${dayHtml || '<p class="muted">No entries in this range.</p>'}
  </div></body></html>`

  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close() }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]))
}

function App({ user, onLogout }) {
  const [tab, setTab] = useState('today')
  const [history, setHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const [themeId, setThemeId] = useState(THEMES[user.skin] ? user.skin : 'forest')
  const [mealEditor, setMealEditor] = useState(null)
  const [weightEditor, setWeightEditor] = useState(null)
  const [workoutEditor, setWorkoutEditor] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [detailDate, setDetailDate] = useState(null)

  const theme = THEMES[themeId]
  const today = todayKey()
  const activeDate = detailDate || today
  const activeDay = history[activeDate] || emptyDay()

  useEffect(() => {
    let alive = true
    getUserData(user.id).then(data => {
      if (!alive) return
      const normalized = Object.fromEntries(Object.entries(data || {}).map(([date, day]) => [date, normalizeDay(day)]))
      setHistory(normalized)
      setLoading(false)
    })
    return () => { alive = false }
  }, [user.id])

  const persistDay = async (date, nextDay) => {
    const normalized = normalizeDay(nextDay)
    setHistory(prev => ({ ...prev, [date]: normalized }))
    const saved = await saveDayData(user.id, date, normalized)
    if (saved) setHistory(prev => ({ ...prev, [date]: normalizeDay(saved) }))
  }

  const saveMeal = async (meal) => {
    const base = history[activeDate] || emptyDay()
    const next = { ...base, meals: { ...(base.meals || {}), [meal.id]: meal } }
    setMealEditor(null)
    await persistDay(activeDate, next)
  }

  const deleteMeal = async () => {
    if (!mealEditor?.meal) return
    const base = history[activeDate] || emptyDay()
    const meals = { ...(base.meals || {}) }
    delete meals[mealEditor.meal.id]
    setMealEditor(null)
    await persistDay(activeDate, { ...base, meals })
  }

  const saveWeight = async (weight) => {
    const base = history[activeDate] || emptyDay()
    setWeightEditor(null)
    await persistDay(activeDate, { ...base, weight: String(weight || '') })
  }

  const saveWorkout = async (workout) => {
    const base = history[activeDate] || emptyDay()
    setWorkoutEditor(null)
    await persistDay(activeDate, { ...base, workouts: [...(base.workouts || []), workout] })
  }

  const changeTheme = async (id) => {
    setThemeId(id)
    await updateUserPrefs(user.id, { lang: user.lang || 'en', skin: id })
  }

  const pageTitle = useMemo(() => tab === 'today' ? 'Today' : 'History', [tab])

  if (loading) return <div className="app-shell loading-shell" style={themeVars(theme)}><div className="brand">Tracky<span>.</span></div><div className="loading-line" /></div>

  return (
    <div className="app-shell" style={themeVars(theme)} data-page={pageTitle}>
      <header className="topbar">
        <div className="brand">Tracky<span>.</span></div>
        <IconButton onClick={() => setShowSettings(true)} title="Settings">•••</IconButton>
      </header>

      <main className="content">
        {tab === 'today' && !detailDate && (
          <TodayView
            day={history[today] || emptyDay()}
            onAddMeal={() => setMealEditor({ meal: null })}
            onEditMeal={meal => setMealEditor({ meal })}
            onEditWeight={() => setWeightEditor({})}
            onAddWorkout={() => setWorkoutEditor({})}
          />
        )}
        {tab === 'history' && !detailDate && <HistoryView history={history} onOpenDay={setDetailDate} onExport={() => setShowExport(true)} />}
        {detailDate && (
          <DayDetail
            date={detailDate}
            day={history[detailDate] || emptyDay()}
            onBack={() => setDetailDate(null)}
            onAddMeal={() => setMealEditor({ meal: null })}
            onEditMeal={meal => setMealEditor({ meal })}
            onEditWeight={() => setWeightEditor({})}
            onAddWorkout={() => setWorkoutEditor({})}
          />
        )}
      </main>

      <nav className="bottom-nav">
        <button className={tab === 'today' && !detailDate ? 'active' : ''} onClick={() => { setTab('today'); setDetailDate(null) }}><span>○</span>Today</button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => { setTab('history'); setDetailDate(null) }}><span>▦</span>History</button>
      </nav>

      {mealEditor && <MealEditor meal={mealEditor.meal} onClose={() => setMealEditor(null)} onSave={saveMeal} onDelete={deleteMeal} />}
      {weightEditor && <WeightEditor value={activeDay.weight} onClose={() => setWeightEditor(null)} onSave={saveWeight} />}
      {workoutEditor && <WorkoutEditor onClose={() => setWorkoutEditor(null)} onSave={saveWorkout} />}
      {showSettings && <SettingsSheet user={user} themeId={themeId} onTheme={changeTheme} onLogout={onLogout} onClose={() => setShowSettings(false)} />}
      {showExport && <ExportSheet history={history} userName={user.name} onClose={() => setShowExport(false)} />}
    </div>
  )
}

export default function Root() {
  const [user, setUser] = useState(null)
  if (!user) return <div style={themeVars(THEMES.forest)}><AuthScreen onLogin={setUser} /></div>
  return <App user={user} onLogout={() => setUser(null)} />
}
