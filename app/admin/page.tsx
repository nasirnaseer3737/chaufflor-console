'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { RideStatus, StoreData } from '../../lib/store';
import {
  addMessage,
  changeRideStatus,
  demoHash,
  isSignedIn,
  loadStore,
  resetStore,
  saveStore,
  setSignedIn,
  todayStr,
} from '../../lib/store';
import { seedStore } from '../../lib/seed';
import BookingForm from '../../components/BookingForm';

type View =
  | 'dashboard'
  | 'rides'
  | 'schedule'
  | 'new-booking'
  | 'customers'
  | 'chauffeurs'
  | 'vehicles'
  | 'payments'
  | 'classes'
  | 'pricing-rules'
  | 'tolls'
  | 'promos'
  | 'airports'
  | 'campaigns'
  | 'messages'
  | 'team'
  | 'settings'
  | 'integrations';

const MENU: Array<[string, Array<[View, string]>]> = [
  ['OVERVIEW', [['dashboard', 'Dashboard'], ['schedule', 'Schedule']]],
  ['OPERATIONS', [['rides', 'Rides'], ['new-booking', 'New booking'], ['customers', 'Customers'], ['messages', 'Message log'], ['campaigns', 'Campaigns']]],
  ['FLEET', [['chauffeurs', 'Chauffeurs'], ['vehicles', 'Vehicles']]],
  ['FINANCE', [['payments', 'Payments']]],
  ['PRICING', [['classes', 'Vehicle classes & pricing'], ['pricing-rules', 'Pricing rules'], ['tolls', 'Toll gates'], ['promos', 'Promo codes']]],
  ['SETTINGS', [['airports', 'Airports'], ['team', 'Team'], ['settings', 'Settings'], ['integrations', 'Integrations']]],
];

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date(todayStr()).getTime();
  return Math.round(diff / 86400000);
}
function expiryPill(dateStr: string) {
  const d = daysUntil(dateStr);
  if (d < 0) return <span className="pill red">Expired</span>;
  if (d <= 30) return <span className="pill amber">Expires in {d}d</span>;
  return <span className="pill green">OK</span>;
}
function classNameOf(data: StoreData, id: string) {
  return data.classes.find((c) => c.id === id)?.name ?? id;
}
function chauffeurNameOf(data: StoreData, id: string | null) {
  if (!id) return 'Unassigned';
  return data.chauffeurs.find((c) => c.id === id)?.name ?? 'Unknown';
}

export default function AdminPage() {
  const [data, setData] = useState<StoreData | null>(null);
  const [signedIn, setSignedInState] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [authError, setAuthError] = useState('');
  // filters
  const [rideFilter, setRideFilter] = useState('All');
  const [rideSearch, setRideSearch] = useState('');
  // add-forms (shared simple state)
  const [fName, setFName] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fExtra, setFExtra] = useState('');
  const [fExtra2, setFExtra2] = useState('');
  const [fExtra3, setFExtra3] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [team, setTeam] = useState<Array<{ name: string; role: string }>>([{ name: 'Demo Admin', role: 'Super admin' }]);

  useEffect(() => {
    setData(loadStore(seedStore));
    setSignedInState(isSignedIn());
    try {
      const raw = window.localStorage.getItem('chaufflor-demo-team');
      if (raw) setTeam(JSON.parse(raw) as Array<{ name: string; role: string }>);
    } catch { /* ignore */ }
  }, []);

  function update(next: StoreData) {
    saveStore(next);
    setData(next);
  }
  function clearForms() {
    setFName(''); setFPhone(''); setFEmail(''); setFExtra(''); setFExtra2(''); setFExtra3('');
  }

  const today = todayStr();
  const month = today.slice(0, 7);
  const last30 = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  if (!data) return <main className="wrap"><p className="muted">Loading demo console…</p></main>;

  // ---- First-run admin creation ----
  if (!data.adminHash) {
    return (
      <main className="wrap" style={{ maxWidth: 560 }}>
        <h1>Chaufflor-Style Demo Console</h1>
        <div className="alert">
          <b>DEMO ONLY.</b> This admin is stored only in this browser&apos;s localStorage. It is not
          production security, it is not affiliated with the real Chaufflor, and no password is
          stored in the repo. There is no default password — you create your own.
        </div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            if (pw.length < 12) { setAuthError('Password must be at least 12 characters.'); return; }
            if (pw !== pw2) { setAuthError('Passwords do not match.'); return; }
            const next = { ...data, adminHash: demoHash(pw) };
            update(next);
            setSignedIn(true);
            setSignedInState(true);
            setAuthError('');
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create Administrator</h2>
          {authError && <div className="alert bad">{authError}</div>}
          <label>New admin password (minimum 12 characters)</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <label>Confirm password</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          <button className="btn" type="submit" style={{ marginTop: 14 }}>
            Create Administrator &amp; Sign In
          </button>
          <p className="muted small">
            Only a demo hash is kept in this browser. If you forget it, use Reset demo data in
            Settings to start over.
          </p>
        </form>
        <p><Link href="/">← Back to public site</Link></p>
      </main>
    );
  }

  // ---- Login ----
  if (!signedIn) {
    return (
      <main className="wrap" style={{ maxWidth: 560 }}>
        <h1>Chaufflor-Style Demo Console</h1>
        <div className="alert"><b>DEMO ONLY</b> — sign in with the admin password you created on first run.</div>
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            if (demoHash(loginPw) === data.adminHash) {
              setSignedIn(true);
              setSignedInState(true);
              setAuthError('');
            } else {
              setAuthError('Incorrect password. Try again, or reset demo data in Settings after signing in — or clear this browser\'s demo storage to recreate the admin.');
            }
          }}
        >
          <h2 style={{ marginTop: 0 }}>Sign in · Demo Console</h2>
          {authError && <div className="alert bad">{authError}</div>}
          <label>Admin password</label>
          <input type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
          <button className="btn" type="submit" style={{ marginTop: 14 }}>
            Sign in
          </button>
        </form>
        <p><Link href="/">← Back to public site</Link></p>
      </main>
    );
  }

  // ---- Dashboard figures ----
  const ridesToday = data.rides.filter((r) => r.date === today && r.status !== 'Cancelled').length;
  const needChauffeur = data.rides.filter((r) => r.status === 'Upcoming' && !r.chauffeurId);
  const completed30 = data.rides.filter((r) => r.status === 'Completed' && r.date >= last30);
  const revenueMonth = data.rides
    .filter((r) => r.status === 'Completed' && r.date.startsWith(month))
    .reduce((s, r) => s + r.price, 0);
  const last30Rides = data.rides.filter((r) => r.date >= last30);
  const cancelRate = last30Rides.length
    ? Math.round((last30Rides.filter((r) => r.status === 'Cancelled').length / last30Rides.length) * 100)
    : 0;
  const cashHeld = data.chauffeurs.reduce((s, c) => s + c.cashHeld, 0);
  const expiring = [
    ...data.vehicles.flatMap((v) => [
      { label: `${v.name} Mulkiya`, date: v.mulkiyaExpiry },
      { label: `${v.name} insurance`, date: v.insuranceExpiry },
    ]),
    ...data.chauffeurs.map((c) => ({ label: `${c.name} document`, date: c.documentExpiry })),
  ].filter((x) => daysUntil(x.date) <= 30);
  const mix = new Map<string, number>();
  last30Rides.forEach((r) => mix.set(r.tripType, (mix.get(r.tripType) ?? 0) + 1));

  const filteredRides = data.rides.filter((r) => {
    const q = rideSearch.trim().toLowerCase();
    if (q && !`${r.ref} ${r.customerName}`.toLowerCase().includes(q)) return false;
    if (rideFilter === 'Upcoming') return r.status === 'Upcoming';
    if (rideFilter === 'Needs chauffeur') return r.status === 'Upcoming' && !r.chauffeurId;
    if (rideFilter === 'Today') return r.date === today;
    if (rideFilter === 'Live') return r.status === 'Live';
    if (rideFilter === 'Past') return r.status === 'Completed' || r.status === 'Cancelled';
    return true;
  });

  const groupedByDate = new Map<string, typeof data.rides>();
  [...data.rides]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((r) => {
      const arr = groupedByDate.get(r.date) ?? [];
      arr.push(r);
      groupedByDate.set(r.date, arr);
    });

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="brand">
          CHAUFFLOR<span>-STYLE</span> <span className="muted small">DEMO</span>
        </div>
        <p className="muted small">Demo Admin — Super admin</p>
        <Link className="btn ghost small" href="/">
          View public site
        </Link>
        {MENU.map(([group, items]) => (
          <div key={group}>
            <h4>{group}</h4>
            {items.map(([v, label]) => (
              <button key={v} className={view === v ? 'active' : ''} onClick={() => { setView(v); setFormMsg(''); clearForms(); }}>
                {label}
              </button>
            ))}
          </div>
        ))}
        <button
          style={{ marginTop: 20, border: '1px solid var(--line)', borderRadius: 9 }}
          onClick={() => { setSignedIn(false); setSignedInState(false); }}
        >
          Sign out
        </button>
      </aside>

      <main className="main">
        <div className="topbar">
          <h1 style={{ margin: 0 }}>{MENU.flatMap(([, items]) => items).find(([v]) => v === view)?.[1] ?? 'Dashboard'}</h1>
          <span className="pill amber">DEMO — no real dispatch or payments</span>
        </div>

        {view === 'dashboard' && (
          <>
            <div className="kpis">
              <div className="kpi"><b>{ridesToday}</b><span>Rides today</span></div>
              <div className="kpi"><b>{needChauffeur.length}</b><span>Need a chauffeur</span></div>
              <div className="kpi"><b>AED {revenueMonth}</b><span>Revenue this month (completed)</span></div>
              <div className="kpi"><b>{completed30.length}</b><span>Completed, last 30 days</span></div>
              <div className="kpi"><b>{cancelRate}%</b><span>Cancel rate, last 30 days</span></div>
              <div className="kpi"><b>AED {cashHeld}</b><span>Cash held by chauffeurs</span></div>
            </div>
            {needChauffeur.length > 0 && (
              <div className="alert">
                <b>{needChauffeur.length} upcoming ride(s) still need a chauffeur:</b>{' '}
                {needChauffeur.map((r) => r.ref).join(', ')} — assign one in Rides.
              </div>
            )}
            {expiring.length > 0 && (
              <div className="alert bad">
                <b>{expiring.length} document(s) expiring within 30 days or expired:</b>{' '}
                {expiring.map((x) => `${x.label} (${x.date})`).join(' · ')}
              </div>
            )}
            <div className="grid grid2">
              <div className="card">
                <h3>Last 30 days — service mix</h3>
                {last30Rides.length === 0 && <p className="muted">No rides in the last 30 days.</p>}
                {[...mix.entries()].map(([k, v]) => (
                  <p key={k}>
                    {k}: {v} ({Math.round((v / Math.max(last30Rides.length, 1)) * 100)}%)
                  </p>
                ))}
                <p className="muted small">Total in period: {last30Rides.length} rides.</p>
              </div>
              <div className="card">
                <h3>At a glance</h3>
                <p>Customers: {data.customers.length} · Chauffeurs: {data.chauffeurs.length} · Vehicles: {data.vehicles.length} · Payments: {data.payments.length}</p>
                <p>Live now: {data.rides.filter((r) => r.status === 'Live').length} ride(s) · On duty chauffeurs: {data.chauffeurs.filter((c) => c.status === 'On duty' || c.status === 'Online').length}</p>
                <p className="muted small">All figures are computed live from the browser store and update when rides change.</p>
              </div>
            </div>
          </>
        )}

        {view === 'rides' && (
          <>
            <div className="toolbar">
              <select value={rideFilter} onChange={(e) => setRideFilter(e.target.value)}>
                {['All', 'Upcoming', 'Needs chauffeur', 'Today', 'Live', 'Past'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <input placeholder="Search by reference or name…" value={rideSearch} onChange={(e) => setRideSearch(e.target.value)} />
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Ref</th><th>Customer / trip</th><th>When</th><th>Class / price</th><th>Chauffeur</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredRides.map((r) => (
                    <tr key={r.id}>
                      <td><b>{r.ref}</b></td>
                      <td>{r.customerName}<br /><span className="muted small">{r.tripType} · {r.pickup} → {r.dropoff}</span></td>
                      <td>{r.date}<br />{r.time}</td>
                      <td>{classNameOf(data, r.vehicleClass)}<br />AED {r.price}</td>
                      <td>
                        <select
                          value={r.chauffeurId ?? ''}
                          onChange={(e) => {
                            const next = { ...data, rides: data.rides.map((x) => (x.id === r.id ? { ...x, chauffeurId: e.target.value || null } : x)) };
                            update(addMessage(next, 'Email', r.customerName, `Chauffeur assigned to ${r.ref}`));
                          }}
                        >
                          <option value="">Unassigned</option>
                          {data.chauffeurs.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) => update(changeRideStatus(data, r.id, e.target.value as RideStatus))}
                        >
                          {(['Upcoming', 'Live', 'Completed', 'Cancelled'] as RideStatus[]).map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredRides.length === 0 && <tr><td colSpan={6} className="muted">No rides match this filter.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'schedule' && (
          <div className="grid">
            {[...groupedByDate.entries()].map(([date, rides]) => (
              <div className="card" key={date}>
                <h3>{date}{date === today ? ' — Today' : ''}</h3>
                {rides.map((r) => (
                  <p key={r.id}>
                    {r.time} · <b>{r.ref}</b> · {r.customerName} · {r.tripType} · {chauffeurNameOf(data, r.chauffeurId)} · <span className="pill">{r.status}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === 'new-booking' && <BookingForm data={data} onCreated={(next) => setData(next)} />}

        {view === 'customers' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim() || !fPhone.trim()) { setFormMsg('Name and phone are required.'); return; }
                update({ ...data, customers: [{ id: `cust-${Date.now()}`, name: fName.trim(), phone: fPhone.trim(), email: fEmail.trim(), company: '', flagged: false, createdAt: today }, ...data.customers] });
                setFormMsg(`Customer ${fName.trim()} added.`); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add customer</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Name</label><input value={fName} onChange={(e) => setFName(e.target.value)} /></div>
                <div><label>Phone</label><input value={fPhone} onChange={(e) => setFPhone(e.target.value)} /></div>
                <div><label>Email</label><input value={fEmail} onChange={(e) => setFEmail(e.target.value)} /></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add customer</button>
            </form>
            <div className="card" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Bookings (in demo store)</th></tr></thead>
                <tbody>
                  {data.customers.map((c) => (
                    <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.email || '—'}</td><td>{data.rides.filter((r) => r.customerName === c.name).length}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'chauffeurs' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim()) { setFormMsg('Name is required.'); return; }
                update({ ...data, chauffeurs: [{ id: `drv-${Date.now()}`, name: fName.trim(), phone: fPhone.trim(), status: 'Off duty', licenceExpiry: fExtra || today, documentExpiry: fExtra2 || today, cashHeld: 0 }, ...data.chauffeurs] });
                setFormMsg(`Chauffeur ${fName.trim()} added.`); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add chauffeur</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Name</label><input value={fName} onChange={(e) => setFName(e.target.value)} /></div>
                <div><label>Phone</label><input value={fPhone} onChange={(e) => setFPhone(e.target.value)} /></div>
                <div><label>Licence expiry</label><input type="date" value={fExtra} onChange={(e) => setFExtra(e.target.value)} /></div>
                <div><label>Document expiry</label><input type="date" value={fExtra2} onChange={(e) => setFExtra2(e.target.value)} /></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add chauffeur</button>
            </form>
            <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Name</th><th>Phone</th><th>Duty status</th><th>Licence</th><th>Document</th><th>Cash held</th></tr></thead>
                <tbody>
                  {data.chauffeurs.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td><td>{c.phone}</td>
                      <td>
                        <select value={c.status} onChange={(e) => update({ ...data, chauffeurs: data.chauffeurs.map((x) => (x.id === c.id ? { ...x, status: e.target.value as typeof c.status } : x)) })}>
                          {['On duty', 'Off duty', 'On a ride', 'Online'].map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>{c.licenceExpiry} {expiryPill(c.licenceExpiry)}</td>
                      <td>{c.documentExpiry} {expiryPill(c.documentExpiry)}</td>
                      <td>AED {c.cashHeld}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'vehicles' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim() || !fPhone.trim()) { setFormMsg('Vehicle name and plate are required.'); return; }
                update({ ...data, vehicles: [{ id: `veh-${Date.now()}`, name: fName.trim(), classId: data.classes[0].id, plate: fPhone.trim(), mulkiyaExpiry: fExtra || today, insuranceExpiry: fExtra2 || today, rtaExpiry: fExtra3 || today, status: 'Active', defaultChauffeurId: null }, ...data.vehicles] });
                setFormMsg(`Vehicle ${fName.trim()} added.`); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add vehicle</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Vehicle name</label><input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Business Sedan 4" /></div>
                <div><label>Plate</label><input value={fPhone} onChange={(e) => setFPhone(e.target.value)} placeholder="DXB-1010" /></div>
                <div><label>Mulkiya expiry</label><input type="date" value={fExtra} onChange={(e) => setFExtra(e.target.value)} /></div>
                <div><label>Insurance expiry</label><input type="date" value={fExtra2} onChange={(e) => setFExtra2(e.target.value)} /></div>
                <div><label>RTA expiry</label><input type="date" value={fExtra3} onChange={(e) => setFExtra3(e.target.value)} /></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add vehicle</button>
            </form>
            <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Vehicle</th><th>Class</th><th>Plate</th><th>Mulkiya</th><th>Insurance</th><th>RTA</th><th>Status</th></tr></thead>
                <tbody>
                  {data.vehicles.map((v) => (
                    <tr key={v.id}>
                      <td>{v.name}</td><td>{classNameOf(data, v.classId)}</td><td>{v.plate}</td>
                      <td>{v.mulkiyaExpiry} {expiryPill(v.mulkiyaExpiry)}</td>
                      <td>{v.insuranceExpiry} {expiryPill(v.insuranceExpiry)}</td>
                      <td>{v.rtaExpiry} {expiryPill(v.rtaExpiry)}</td>
                      <td>{v.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'payments' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Ride ref</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.rideRef}</td><td>AED {p.amount}</td><td>{p.method}</td><td>{p.date}</td><td>{p.status}</td>
                    <td>
                      {p.status !== 'Reconciled' && (
                        <button className="btn small" onClick={() => update({ ...data, payments: data.payments.map((x) => (x.id === p.id ? { ...x, status: 'Reconciled' } : x)) })}>
                          Mark reconciled
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.payments.length === 0 && <tr><td colSpan={6} className="muted">No payments yet.</td></tr>}
              </tbody>
            </table>
            <p className="muted small">Methods supported in this demo: Cash, Card terminal, Online link, Bank transfer, Corporate invoice. No real money moves.</p>
          </div>
        )}

        {view === 'classes' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Class</th><th>60 km</th><th>100 km</th><th>200 km</th><th>400 km</th><th>2h</th><th>10h</th></tr></thead>
              <tbody>
                {data.classes.map((c) => (
                  <tr key={c.id}>
                    <td><b>{c.name}</b><br /><span className="muted small">{c.description}</span></td>
                    <td>AED {c.distancePrices['60']}</td><td>AED {c.distancePrices['100']}</td><td>AED {c.distancePrices['200']}</td><td>AED {c.distancePrices['400']}</td>
                    <td>AED {c.hourlyPrices['2']}</td><td>AED {c.hourlyPrices['10']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted small">Full bands in the demo: distance 60 / 100 / 150 / 200 / 300 / 400 km; hourly 2 / 4 / 6 / 8 / 10 hours.</p>
          </div>
        )}

        {view === 'pricing-rules' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim()) { setFormMsg('Title is required.'); return; }
                update({ ...data, pricingRules: [{ id: `rule-${Date.now()}`, title: fName.trim(), description: fExtra, amount: fExtra2 || 'AED 0' }, ...data.pricingRules] });
                setFormMsg('Pricing rule added.'); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add pricing rule</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Title</label><input value={fName} onChange={(e) => setFName(e.target.value)} /></div>
                <div><label>Amount</label><input value={fExtra2} onChange={(e) => setFExtra2(e.target.value)} placeholder="AED 50" /></div>
              </div>
              <label>Description</label><textarea value={fExtra} onChange={(e) => setFExtra(e.target.value)} />
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add rule</button>
            </form>
            <div className="grid" style={{ marginTop: 16 }}>
              {data.pricingRules.map((r) => (
                <div className="card" key={r.id}><h3>{r.title}</h3><p className="muted">{r.description}</p><p><b>{r.amount}</b></p></div>
              ))}
              {data.pricingRules.length === 0 && <p className="muted">No pricing rules configured.</p>}
            </div>
          </>
        )}

        {view === 'tolls' && (
          <div className="card">
            <table>
              <thead><tr><th>Gate</th><th>City</th><th>Type</th><th>Map position</th></tr></thead>
              <tbody>
                {data.tollGates.map((t) => (
                  <tr key={t.id}><td>{t.name}</td><td>{t.city}</td><td>{t.type}</td><td>{t.verified ? <span className="pill green">Verified</span> : <span className="pill amber">Unverified</span>}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="muted small">Demo list: 10 Salik (Dubai) + 6 Darb (Abu Dhabi) gates. Tolls are included in demo quotes.</p>
          </div>
        )}

        {view === 'promos' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim()) { setFormMsg('Code is required.'); return; }
                update({ ...data, promos: [{ id: `promo-${Date.now()}`, code: fName.trim().toUpperCase(), discountPct: Number(fExtra) || 0, active: true, redemptions: 0 }, ...data.promos] });
                setFormMsg('Promo code added.'); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add promo code</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Code</label><input value={fName} onChange={(e) => setFName(e.target.value)} placeholder="WELCOME10" /></div>
                <div><label>Discount %</label><input type="number" min={0} max={100} value={fExtra} onChange={(e) => setFExtra(e.target.value)} /></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add promo code</button>
            </form>
            <div className="card" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>Code</th><th>Discount</th><th>Active</th><th>Redemptions</th></tr></thead>
                <tbody>
                  {data.promos.map((p) => (
                    <tr key={p.id}><td><b>{p.code}</b></td><td>{p.discountPct}%</td><td>{p.active ? <span className="pill green">Live</span> : <span className="pill">Inactive</span>}</td><td>{p.redemptions}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === 'airports' && (
          <div className="grid">
            {data.airports.map((a) => (
              <div className="card" key={a.id}>
                <h3>{a.code} — {a.name}</h3>
                {a.terminals.map((t) => (
                  <p key={t.name}><b>{t.name}</b> · Meeting point: {t.meetingPoint} · Customer fee AED {t.fee} · Internal cost AED {t.cost}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === 'campaigns' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim()) { setFormMsg('Title is required.'); return; }
                update({ ...data, campaigns: [{ id: `camp-${Date.now()}`, title: fName.trim(), message: fExtra, status: 'Draft', createdAt: today }, ...data.campaigns] });
                setFormMsg('Campaign draft added.'); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>New campaign</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <label>Title</label><input value={fName} onChange={(e) => setFName(e.target.value)} />
              <label>Message</label><textarea value={fExtra} onChange={(e) => setFExtra(e.target.value)} />
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Save draft</button>
            </form>
            <div className="grid" style={{ marginTop: 16 }}>
              {data.campaigns.map((c) => (
                <div className="card" key={c.id}>
                  <h3>{c.title}</h3><p className="muted">{c.message}</p>
                  <p><span className="pill">{c.status}</span> · {c.createdAt}</p>
                  {c.status === 'Draft' && (
                    <button className="btn small" onClick={() => update({ ...data, campaigns: data.campaigns.map((x) => (x.id === c.id ? { ...x, status: 'Sent' } : x)) })}>
                      Mark as sent (demo)
                    </button>
                  )}
                </div>
              ))}
              {data.campaigns.length === 0 && <p className="muted">No campaigns yet.</p>}
            </div>
          </>
        )}

        {view === 'messages' && (
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Channel</th><th>To</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {data.messages.map((m) => (
                  <tr key={m.id}><td>{m.channel}</td><td>{m.to}</td><td>{m.subject}</td><td>{m.status}</td><td>{new Date(m.date).toLocaleString()}</td></tr>
                ))}
                {data.messages.length === 0 && <tr><td colSpan={5} className="muted">No messages yet.</td></tr>}
              </tbody>
            </table>
            <p className="muted small">Entries are added automatically when a booking is created, a chauffeur is assigned, or a ride status changes. No real messages are sent.</p>
          </div>
        )}

        {view === 'team' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                if (!fName.trim()) { setFormMsg('Name is required.'); return; }
                const nextTeam = [...team, { name: fName.trim(), role: fExtra || 'Operations' }];
                setTeam(nextTeam);
                try { window.localStorage.setItem('chaufflor-demo-team', JSON.stringify(nextTeam)); } catch { /* ignore */ }
                setFormMsg('Team member added (demo, this browser only).'); clearForms();
              }}
            >
              <h3 style={{ marginTop: 0 }}>Add team member</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Name</label><input value={fName} onChange={(e) => setFName(e.target.value)} /></div>
                <div><label>Role</label><select value={fExtra} onChange={(e) => setFExtra(e.target.value)}><option value="">Select role</option>{['Super admin', 'Admin', 'Operations', 'Finance'].map((r) => <option key={r}>{r}</option>)}</select></div>
              </div>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Add member</button>
            </form>
            <div className="card" style={{ marginTop: 16 }}>
              <table>
                <thead><tr><th>Name</th><th>Role</th></tr></thead>
                <tbody>
                  {team.map((t, i) => (<tr key={i}><td>{t.name}</td><td>{t.role}</td></tr>))}
                </tbody>
              </table>
              <p className="muted small">Roles: Super admin (full access), Admin, Operations (dispatch), Finance (payments).</p>
            </div>
          </>
        )}

        {view === 'settings' && (
          <>
            <form
              className="card"
              onSubmit={(e) => {
                e.preventDefault();
                update(data);
                setFormMsg('Settings saved to this browser.');
              }}
            >
              <h3 style={{ marginTop: 0 }}>Policies &amp; settings</h3>
              {formMsg && <div className="alert ok">{formMsg}</div>}
              <div className="formgrid">
                <div><label>Extra stop fee (AED)</label><input type="number" value={data.settings.extraStopFee} onChange={(e) => setData({ ...data, settings: { ...data.settings, extraStopFee: Number(e.target.value) } })} /></div>
                <div><label>Free waiting — airports (min)</label><input type="number" value={data.settings.freeWaitingAirport} onChange={(e) => setData({ ...data, settings: { ...data.settings, freeWaitingAirport: Number(e.target.value) } })} /></div>
                <div><label>Free waiting — elsewhere (min)</label><input type="number" value={data.settings.freeWaitingElse} onChange={(e) => setData({ ...data, settings: { ...data.settings, freeWaitingElse: Number(e.target.value) } })} /></div>
                <div><label>Free cancellation until (hours before)</label><input type="number" value={data.settings.freeCancelHours} onChange={(e) => setData({ ...data, settings: { ...data.settings, freeCancelHours: Number(e.target.value) } })} /></div>
                <div><label>Online payment link fee (%)</label><input type="number" value={data.settings.onlineFeePct} onChange={(e) => setData({ ...data, settings: { ...data.settings, onlineFeePct: Number(e.target.value) } })} /></div>
                <div><label>Minimum booking notice (min)</label><input type="number" value={data.settings.minNoticeMinutes} onChange={(e) => setData({ ...data, settings: { ...data.settings, minNoticeMinutes: Number(e.target.value) } })} /></div>
                <div><label>Minimum hourly booking (hours)</label><input type="number" value={data.settings.minHourlyHours} onChange={(e) => setData({ ...data, settings: { ...data.settings, minHourlyHours: Number(e.target.value) } })} /></div>
                <div><label>Quote valid (minutes)</label><input type="number" value={data.settings.quoteValidMinutes} onChange={(e) => setData({ ...data, settings: { ...data.settings, quoteValidMinutes: Number(e.target.value) } })} /></div>
              </div>
              <p className="muted small">
                Cancellation fees (demo): free until {data.settings.freeCancelHours}h before, 50% from {data.settings.freeCancelHours}h to 3h before, 100% after. VAT not registered in this demo.
              </p>
              <button className="btn" type="submit" style={{ marginTop: 12 }}>Save settings</button>
            </form>
            <div className="card" style={{ marginTop: 16 }}>
              <h3>Reset demo data</h3>
              <p className="muted small">Restores the invented seed data and clears the demo admin, so the Create Administrator form appears again.</p>
              <button
                className="btn ghost"
                onClick={() => {
                  const fresh = resetStore(seedStore);
                  setSignedIn(false);
                  setSignedInState(false);
                  setData(fresh);
                }}
              >
                Reset demo data
              </button>
            </div>
          </>
        )}

        {view === 'integrations' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Integrations — status only</h3>
            <p className="muted small">No real API keys are stored or entered anywhere in this demo. Do not paste real secrets into a demo.</p>
            <table>
              <thead><tr><th>Integration</th><th>Purpose</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ['Google Maps', 'Routes & places for quotes and address search', 'Connected (demo)'],
                  ['Firebase — Push', 'Push notifications', 'Connected (demo)'],
                  ['Firebase — Live tracking', 'Live chauffeur positions', 'Connected (demo)'],
                  ['WhatsApp Cloud API', 'Sign-in codes & booking messages', 'Connected (demo)'],
                  ['Email (SMTP)', 'Booking emails', 'Connected (demo)'],
                  ['Website booking', 'Public booking form', 'Connected (demo)'],
                  ['Flight tracking', 'Live flight times', 'Not connected'],
                  ['SMS codes', 'SMS sign-in codes', 'Not connected'],
                ].map(([name, purpose, status]) => (
                  <tr key={name}><td><b>{name}</b></td><td>{purpose}</td><td>{status.includes('Not') ? <span className="pill">Not connected</span> : <span className="pill green">{status}</span>}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
