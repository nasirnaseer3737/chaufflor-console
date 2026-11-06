'use client';
import { useMemo, useState } from 'react';
import type { PaymentMethod, Ride, StoreData, TripType } from '../lib/store';
import { createRide, estimatePrice, saveStore } from '../lib/store';

const TRIP_TYPES: TripType[] = [
  'Airport pickup',
  'Airport drop-off',
  'Transfer',
  'By the hour',
  'City tour',
  'Business',
  'Wedding',
];
const PAYMENTS: PaymentMethod[] = [
  'Cash',
  'Card terminal',
  'Online link',
  'Bank transfer',
  'Corporate invoice',
];

export default function BookingForm({
  data,
  onCreated,
}: {
  data: StoreData;
  onCreated: (data: StoreData, ride: Ride) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tripType, setTripType] = useState<TripType>('Airport pickup');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [passengers, setPassengers] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card terminal');
  const [nameBoard, setNameBoard] = useState('');
  const [notes, setNotes] = useState('');
  const [vehicleClass, setVehicleClass] = useState(data.classes[0]?.id ?? '');
  const [distanceKm, setDistanceKm] = useState(60);
  const [hours, setHours] = useState(2);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Ride | null>(null);

  const price = useMemo(
    () =>
      estimatePrice(data.classes, vehicleClass, tripType, distanceKm, hours, paymentMethod, data.settings),
    [data, vehicleClass, tripType, distanceKm, hours, paymentMethod],
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !pickup.trim() || !dropoff.trim() || !date || !time) {
      setError('Please fill in name, phone, pickup, drop-off, date and time.');
      return;
    }
    setError('');
    const { data: next, ride } = createRide(data, {
      customerName: name.trim(),
      phone: phone.trim(),
      tripType,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      date,
      time,
      passengers,
      luggage,
      paymentMethod,
      nameBoard: nameBoard.trim(),
      notes: notes.trim(),
      vehicleClass,
      distanceKm,
      hours,
    });
    saveStore(next);
    setDone(ride);
    onCreated(next, ride);
  }

  if (done) {
    return (
      <div className="card">
        <h2>Booking confirmed — demo only</h2>
        <p>
          Reference: <b>{done.ref}</b>
        </p>
        <p>
          {done.customerName} · {done.tripType} · {done.date} at {done.time}
          <br />
          {done.pickup} → {done.dropoff}
          <br />
          Vehicle class: {data.classes.find((c) => c.id === done.vehicleClass)?.name} · Estimated price:{' '}
          <b>AED {done.price}</b>
        </p>
        <p className="muted small">
          This is a demo booking stored only in this browser. No real driver, payment or dispatch
          happens. In the admin console this ride now appears under Rides as unassigned.
        </p>
        <button className="btn ghost" onClick={() => setDone(null)}>
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 style={{ marginTop: 0 }}>Book a chauffeur</h2>
      {error && <div className="alert bad">{error}</div>}
      <div className="formgrid">
        <div>
          <label>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Demo Guest" />
        </div>
        <div>
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
        </div>
        <div>
          <label>Trip type</label>
          <select value={tripType} onChange={(e) => setTripType(e.target.value as TripType)}>
            {TRIP_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Vehicle class</label>
          <select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)}>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Pickup</label>
          <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="e.g. Dubai International (DXB) Terminal 3" />
        </div>
        <div>
          <label>Drop-off</label>
          <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="e.g. Downtown Dubai" />
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        {tripType === 'By the hour' ? (
          <div>
            <label>Hours (2–10)</label>
            <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
              {[2, 4, 6, 8, 10].map((h) => (
                <option key={h} value={h}>
                  {h} hours
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label>Estimated distance (km)</label>
            <select value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))}>
              {[60, 100, 150, 200, 300, 400].map((d) => (
                <option key={d} value={d}>
                  {d} km
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Passengers</label>
          <input type="number" min={1} max={12} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} />
        </div>
        <div>
          <label>Luggage</label>
          <input type="number" min={0} max={20} value={luggage} onChange={(e) => setLuggage(Number(e.target.value))} />
        </div>
        <div>
          <label>Payment method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {PAYMENTS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Name board (optional)</label>
          <input value={nameBoard} onChange={(e) => setNameBoard(e.target.value)} placeholder="Name shown at airport pickup" />
        </div>
      </div>
      <label>Notes</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Flight number, special requests…" />
      <div className="alert ok">
        Live price estimate: <b>AED {price}</b>
        {paymentMethod === 'Online link' ? ` (includes ${data.settings.onlineFeePct}% online-link fee)` : ''}
        <span className="muted"> · Quote valid {data.settings.quoteValidMinutes} minutes · Extra stop AED {data.settings.extraStopFee}</span>
      </div>
      <button className="btn" type="submit">
        Confirm booking
      </button>
      <p className="muted small" style={{ marginTop: 12 }}>
        Demo only: confirming stores the booking in this browser&apos;s localStorage. No payment is
        charged and no driver is dispatched.
      </p>
    </form>
  );
}
