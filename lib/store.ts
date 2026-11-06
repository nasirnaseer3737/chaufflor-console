export type TripType =
  | 'Airport pickup'
  | 'Airport drop-off'
  | 'Transfer'
  | 'By the hour'
  | 'City tour'
  | 'Business'
  | 'Wedding';

export type RideStatus = 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
export type PaymentMethod =
  | 'Cash'
  | 'Card terminal'
  | 'Online link'
  | 'Bank transfer'
  | 'Corporate invoice';
export type PaymentStatus = 'Pending' | 'Collected' | 'Reconciled';

export interface Ride {
  id: string;
  ref: string;
  customerName: string;
  phone: string;
  tripType: TripType;
  pickup: string;
  dropoff: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  passengers: number;
  luggage: number;
  paymentMethod: PaymentMethod;
  nameBoard: string;
  notes: string;
  vehicleClass: string;
  distanceKm: number;
  hours: number;
  price: number;
  status: RideStatus;
  chauffeurId: string | null;
  createdAt: string;
}

export interface Chauffeur {
  id: string;
  name: string;
  phone: string;
  status: 'On duty' | 'Off duty' | 'On a ride' | 'Online';
  licenceExpiry: string;
  documentExpiry: string;
  cashHeld: number;
}

export interface Vehicle {
  id: string;
  name: string;
  classId: string;
  plate: string;
  mulkiyaExpiry: string;
  insuranceExpiry: string;
  rtaExpiry: string;
  status: 'Active' | 'Maintenance';
  defaultChauffeurId: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  flagged: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  rideRef: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export interface VehicleClass {
  id: string;
  name: string;
  description: string;
  distancePrices: Record<string, number>; // keys: 60,100,150,200,300,400
  hourlyPrices: Record<string, number>; // keys: 2,4,6,8,10
}

export interface PricingRule {
  id: string;
  title: string;
  description: string;
  amount: string;
}

export interface TollGate {
  id: string;
  name: string;
  city: 'Dubai' | 'Abu Dhabi';
  type: 'Salik' | 'Darb';
  verified: boolean;
}

export interface AirportTerminal {
  name: string;
  meetingPoint: string;
  fee: number;
  cost: number;
}

export interface Airport {
  id: string;
  code: string;
  name: string;
  terminals: AirportTerminal[];
}

export interface PromoCode {
  id: string;
  code: string;
  discountPct: number;
  active: boolean;
  redemptions: number;
}

export interface Campaign {
  id: string;
  title: string;
  message: string;
  status: 'Draft' | 'Sent';
  createdAt: string;
}

export interface MessageEntry {
  id: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  to: string;
  subject: string;
  status: 'Sent' | 'Failed' | 'Log mode';
  date: string;
}

export interface Settings {
  extraStopFee: number;
  freeWaitingAirport: number;
  freeWaitingElse: number;
  freeCancelHours: number;
  lateFee50UntilHours: number;
  lateFee100AfterHours: number;
  onlineFeePct: number;
  minNoticeMinutes: number;
  minHourlyHours: number;
  quoteValidMinutes: number;
  vatRegistered: boolean;
  onlineBooking: boolean;
}

export interface StoreData {
  rides: Ride[];
  customers: Customer[];
  chauffeurs: Chauffeur[];
  vehicles: Vehicle[];
  payments: Payment[];
  classes: VehicleClass[];
  pricingRules: PricingRule[];
  tollGates: TollGate[];
  airports: Airport[];
  promos: PromoCode[];
  campaigns: Campaign[];
  messages: MessageEntry[];
  settings: Settings;
  adminHash: string | null;
}

export const STORAGE_KEY = 'chaufflor-demo-v1';
export const SESSION_KEY = 'chaufflor-demo-session';

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function generateRef(existing: string[]): string {
  let ref = '';
  do {
    ref = `CH-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  } while (existing.includes(ref));
  return ref;
}

/** Demo-only hash (not production security). Never use for real passwords. */
export function demoHash(password: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const salted = `chaufflor-demo::${password}`;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`;
}

function nearestBand(prices: Record<string, number>, value: number): number {
  const keys = Object.keys(prices)
    .map(Number)
    .sort((a, b) => a - b);
  for (const k of keys) {
    if (value <= k) return prices[String(k)];
  }
  return prices[String(keys[keys.length - 1])];
}

export function estimatePrice(
  classes: VehicleClass[],
  classId: string,
  tripType: TripType,
  distanceKm: number,
  hours: number,
  paymentMethod: PaymentMethod,
  settings: Settings,
): number {
  const cls = classes.find((c) => c.id === classId) ?? classes[0];
  if (!cls) return 0;
  let base = 0;
  if (tripType === 'By the hour') {
    base = nearestBand(cls.hourlyPrices, hours || settings.minHourlyHours);
  } else {
    base = nearestBand(cls.distancePrices, distanceKm || 60);
  }
  if (paymentMethod === 'Online link') {
    base = Math.round(base * (1 + settings.onlineFeePct / 100));
  }
  return base;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadStore(seed: () => StoreData): StoreData {
  if (!isBrowser()) return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    const parsed = JSON.parse(raw) as StoreData;
    if (!parsed || !Array.isArray(parsed.rides) || !Array.isArray(parsed.classes)) {
      const data = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return parsed;
  } catch {
    return seed();
  }
}

export function saveStore(data: StoreData): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private mode etc.) — in-memory use continues.
  }
}

export function resetStore(seed: () => StoreData): StoreData {
  const data = seed();
  saveStore(data);
  return data;
}

export function isSignedIn(): boolean {
  if (!isBrowser()) return false;
  return window.sessionStorage.getItem(SESSION_KEY) === '1';
}

export function setSignedIn(value: boolean): void {
  if (!isBrowser()) return;
  if (value) window.sessionStorage.setItem(SESSION_KEY, '1');
  else window.sessionStorage.removeItem(SESSION_KEY);
}

export function addMessage(
  data: StoreData,
  channel: MessageEntry['channel'],
  to: string,
  subject: string,
): StoreData {
  const entry: MessageEntry = {
    id: uid('msg'),
    channel,
    to,
    subject,
    status: 'Sent',
    date: new Date().toISOString(),
  };
  return { ...data, messages: [entry, ...data.messages] };
}

/** Pure helper used by the smoke check and the UI: create a ride + payment + message. */
export function createRide(
  data: StoreData,
  input: Omit<Ride, 'id' | 'ref' | 'createdAt' | 'price' | 'status' | 'chauffeurId'> & {
    price?: number;
  },
): { data: StoreData; ride: Ride } {
  const price =
    input.price ??
    estimatePrice(
      data.classes,
      input.vehicleClass,
      input.tripType,
      input.distanceKm,
      input.hours,
      input.paymentMethod,
      data.settings,
    );
  const ride: Ride = {
    ...input,
    id: uid('ride'),
    ref: generateRef(data.rides.map((r) => r.ref)),
    createdAt: new Date().toISOString(),
    price,
    status: 'Upcoming',
    chauffeurId: null,
  };
  let next: StoreData = {
    ...data,
    rides: [ride, ...data.rides],
    payments: [
      {
        id: uid('pay'),
        rideRef: ride.ref,
        amount: price,
        method: input.paymentMethod,
        status: 'Pending',
        date: new Date().toISOString().slice(0, 10),
      },
      ...data.payments,
    ],
  };
  next = addMessage(next, 'WhatsApp', input.customerName, `Booking confirmation ${ride.ref}`);
  const exists = next.customers.some(
    (c) => c.phone === input.phone && c.name === input.customerName,
  );
  if (!exists) {
    next = {
      ...next,
      customers: [
        {
          id: uid('cust'),
          name: input.customerName,
          phone: input.phone,
          email: '',
          company: '',
          flagged: false,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...next.customers,
      ],
    };
  }
  return { data: next, ride };
}

export function changeRideStatus(
  data: StoreData,
  rideId: string,
  status: RideStatus,
): StoreData {
  const ride = data.rides.find((r) => r.id === rideId);
  if (!ride) return data;
  const next: StoreData = {
    ...data,
    rides: data.rides.map((r) => (r.id === rideId ? { ...r, status } : r)),
  };
  return addMessage(next, 'Email', ride.customerName, `Ride ${ride.ref} status changed to ${status}`);
}
