import Link from 'next/link';
import { DEMO_CLASSES } from '../lib/seed';

const SERVICES = [
  ['Airport pickup', 'Meet & greet with a name board, flight-aware waiting.'],
  ['Airport drop-off', 'On-time drop-off with luggage help.'],
  ['Transfer', 'Point-to-point rides across Dubai & Abu Dhabi.'],
  ['By the hour', 'A chauffeur at your disposal for 2–10 hours.'],
  ['City tour', 'Sightseeing at your own pace, no taxi queues.'],
  ['Business', 'Punctual, discreet travel for meetings & events.'],
  ['Wedding', 'Flagship cars for a memorable day.'],
];

export default function Home() {
  return (
    <>
      <header className="topnav">
        <div className="brand">
          CHAUFFLOR<span>-STYLE DEMO</span>
        </div>
        <nav className="navlinks">
          <Link href="/">Home</Link>
          <Link href="/book">Book now</Link>
          <Link href="/admin">Admin console</Link>
          <Link className="btn" href="/book">
            Book a chauffeur
          </Link>
        </nav>
      </header>
      <main className="wrap">
        <section className="hero">
          <div className="kicker">Dubai · Abu Dhabi · Demo</div>
          <h1>
            Luxury chauffeur service, <em>without the stress.</em>
          </h1>
          <p>
            Every journey, chauffeur and dirham — in one calm place. Airport transfers, hourly hire
            and city tours in premium vehicles, driven by professional chauffeurs. This is a demo
            website: no real bookings, payments or drivers.
          </p>
          <p>
            <Link className="btn" href="/book">
              Book now
            </Link>{' '}
            <Link className="btn ghost" href="/admin">
              Open admin console
            </Link>
          </p>
          <div>
            <span className="pill">24/7 demo booking</span>
            <span className="pill">Prices in AED</span>
            <span className="pill">Free waiting 60 min at airports</span>
          </div>
        </section>

        <h2>Services</h2>
        <div className="grid grid3">
          {SERVICES.map(([title, desc]) => (
            <div className="card" key={title}>
              <h3>{title}</h3>
              <p className="muted">{desc}</p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 36 }}>Fleet &amp; indicative prices</h2>
        <p className="muted">
          All-inclusive AED prices. Distance bands 60–400 km; hourly packages 2–10 hours. Tolls are
          included in the price in this demo.
        </p>
        <div className="grid grid2">
          {DEMO_CLASSES.map((c) => (
            <div className="card" key={c.id}>
              <h3>{c.name}</h3>
              <p className="muted">{c.description}</p>
              <p>
                From <span className="price">AED {c.distancePrices['60']}</span>{' '}
                <span className="muted small">per 60 km</span>
              </p>
              <p className="small muted">
                100 km AED {c.distancePrices['100']} · 200 km AED {c.distancePrices['200']} · 400 km
                AED {c.distancePrices['400']} · 2h AED {c.hourlyPrices['2']} · 10h AED{' '}
                {c.hourlyPrices['10']}
              </p>
            </div>
          ))}
        </div>

        <h2 style={{ marginTop: 36 }}>Policies (demo)</h2>
        <div className="card">
          <ul>
            <li>Extra stop: AED 50</li>
            <li>Free waiting: 60 minutes at airports, 15 minutes elsewhere</li>
            <li>Free cancellation until 12 hours before pickup</li>
            <li>50% fee from 12 hours to 3 hours before pickup, 100% after that</li>
            <li>Minimum booking notice: 30 minutes · Minimum hourly booking: 2 hours</li>
            <li>Online payment link fee: 5% · VAT not registered (demo settings)</li>
          </ul>
        </div>
      </main>
      <footer>
        Demo project only — not affiliated with the real Chaufflor, no real payments, drivers or
        dispatch. All data in this demo lives in your browser.
      </footer>
    </>
  );
}
