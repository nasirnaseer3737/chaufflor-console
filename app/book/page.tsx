'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { StoreData } from '../../lib/store';
import { loadStore } from '../../lib/store';
import { seedStore } from '../../lib/seed';
import BookingForm from '../../components/BookingForm';

export default function BookPage() {
  const [data, setData] = useState<StoreData | null>(null);
  useEffect(() => {
    setData(loadStore(seedStore));
  }, []);
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
        </nav>
      </header>
      <main className="wrap">
        <h1>Book a chauffeur</h1>
        <p className="muted">
          Fill in the trip, see a live AED price estimate, and confirm. Your booking is stored only
          in this browser and appears in the admin console&apos;s Rides list.
        </p>
        {data ? (
          <BookingForm data={data} onCreated={(next) => setData(next)} />
        ) : (
          <p className="muted">Loading demo data…</p>
        )}
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Policies</h3>
          <ul className="small">
            <li>Extra stop AED 50 · Free waiting 60 min at airports / 15 min elsewhere</li>
            <li>Free cancellation until 12h before pickup · 50% from 12h to 3h before · 100% after</li>
            <li>Quote valid 20 minutes · Minimum booking notice 30 minutes</li>
          </ul>
        </div>
      </main>
      <footer>Demo only — not affiliated with the real Chaufflor.</footer>
    </>
  );
}
