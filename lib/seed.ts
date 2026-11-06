import type {
  Airport,
  Chauffeur,
  Customer,
  Payment,
  PricingRule,
  PromoCode,
  Ride,
  Settings,
  StoreData,
  TollGate,
  Vehicle,
  VehicleClass,
} from './store';
import { todayStr, uid } from './store';

export const DEMO_CLASSES: VehicleClass[] = [
  { id: 'comfort-mpv', name: 'Comfort MPV', description: 'Spacious family MPV for up to 6 passengers.', distancePrices: { '60': 250, '100': 350, '150': 450, '200': 550, '300': 750, '400': 950 }, hourlyPrices: { '2': 300, '4': 550, '6': 800, '8': 1000, '10': 1200 } },
  { id: 'business-sedan', name: 'Business Sedan', description: 'Executive sedan for business travel.', distancePrices: { '60': 300, '100': 420, '150': 550, '200': 680, '300': 900, '400': 1150 }, hourlyPrices: { '2': 350, '4': 650, '6': 950, '8': 1200, '10': 1450 } },
  { id: 'business-mpv', name: 'Business MPV', description: 'Premium MPV with extra luggage space.', distancePrices: { '60': 350, '100': 480, '150': 620, '200': 780, '300': 1050, '400': 1300 }, hourlyPrices: { '2': 400, '4': 750, '6': 1100, '8': 1400, '10': 1700 } },
  { id: 'premium-suv', name: 'Premium SUV', description: 'Luxury SUV for comfort and presence.', distancePrices: { '60': 400, '100': 550, '150': 700, '200': 900, '300': 1200, '400': 1500 }, hourlyPrices: { '2': 450, '4': 850, '6': 1250, '8': 1600, '10': 1950 } },
  { id: 'business-van', name: 'Business Van', description: 'Group travel for up to 8 passengers.', distancePrices: { '60': 450, '100': 600, '150': 800, '200': 1000, '300': 1350, '400': 1700 }, hourlyPrices: { '2': 500, '4': 950, '6': 1400, '8': 1800, '10': 2200 } },
  { id: 'executive-suv', name: 'Executive SUV', description: 'Flagship SUV, chauffeur-driven in style.', distancePrices: { '60': 550, '100': 750, '150': 950, '200': 1200, '300': 1600, '400': 2000 }, hourlyPrices: { '2': 600, '4': 1150, '6': 1700, '8': 2200, '10': 2700 } },
  { id: 'first-class', name: 'First Class', description: 'Top-tier luxury — the flagship experience.', distancePrices: { '60': 700, '100': 950, '150': 1200, '200': 1500, '300': 2000, '400': 2500 }, hourlyPrices: { '2': 800, '4': 1500, '6': 2200, '8': 2800, '10': 3400 } },
];

export const DEFAULT_SETTINGS: Settings = {
  extraStopFee: 50,
  freeWaitingAirport: 60,
  freeWaitingElse: 15,
  freeCancelHours: 12,
  lateFee50UntilHours: 12,
  lateFee100AfterHours: 3,
  onlineFeePct: 5,
  minNoticeMinutes: 30,
  minHourlyHours: 2,
  quoteValidMinutes: 20,
  vatRegistered: false,
  onlineBooking: true,
};

function demoCustomers(): Customer[] {
  const names: Array<[string, string, string]> = [
    ['Aisha Khan', '+971 50 111 2233', 'aisha@example.com'],
    ['Omar Farouk', '+971 55 222 3344', 'omar@example.com'],
    ['Sara Ahmed', '+971 52 333 4455', 'sara@example.com'],
    ['James Wilson', '+44 7700 900123', 'james@example.com'],
    ['Layla Hassan', '+971 56 444 5566', 'layla@example.com'],
    ['David Chen', '+971 50 555 6677', 'david@example.com'],
    ['Noor Ali', '+971 54 666 7788', 'noor@example.com'],
    ['Emma Brown', '+44 7700 900456', 'emma@example.com'],
  ];
  return names.map(([name, phone, email], i) => ({
    id: uid('cust'),
    name,
    phone,
    email,
    company: '',
    flagged: false,
    createdAt: todayStr(-(i + 1)),
  }));
}

function demoChauffeurs(): Chauffeur[] {
  return [
    { id: uid('drv'), name: 'Bilal Hussain', phone: '+971 50 100 2001', status: 'Off duty', licenceExpiry: todayStr(180), documentExpiry: todayStr(90), cashHeld: 0 },
    { id: uid('drv'), name: 'Karim Haddad', phone: '+971 50 100 2002', status: 'On duty', licenceExpiry: todayStr(25), documentExpiry: todayStr(200), cashHeld: 0 },
    { id: uid('drv'), name: 'Tariq Aziz', phone: '+971 50 100 2003', status: 'Off duty', licenceExpiry: todayStr(300), documentExpiry: todayStr(12), cashHeld: 0 },
  ];
}

function demoVehicles(chauffeurs: Chauffeur[]): Vehicle[] {
  const rows: Array<[string, string, string]> = [
    ['Comfort MPV', 'comfort-mpv', 'DXB-1001'],
    ['Business Sedan', 'business-sedan', 'DXB-1002'],
    ['Business Sedan', 'business-sedan', 'DXB-1003'],
    ['Business Sedan', 'business-sedan', 'DXB-1004'],
    ['First Class', 'first-class', 'DXB-1005'],
    ['Executive SUV', 'executive-suv', 'DXB-1006'],
    ['Premium SUV', 'premium-suv', 'DXB-1007'],
    ['Business Van', 'business-van', 'DXB-1008'],
    ['Business MPV', 'business-mpv', 'DXB-1009'],
  ];
  return rows.map(([name, classId, plate], i) => ({
    id: uid('veh'),
    name: `${name} ${i + 1}`,
    classId,
    plate,
    mulkiyaExpiry: i === 1 ? todayStr(-10) : todayStr(120 + i * 20),
    insuranceExpiry: i === 3 ? todayStr(-5) : todayStr(150 + i * 15),
    rtaExpiry: todayStr(200 + i * 10),
    status: 'Active',
    defaultChauffeurId: i === 0 ? chauffeurs[0].id : null,
  }));
}

function demoRides(customers: Customer[], chauffeurs: Chauffeur[]): Ride[] {
  const c = (i: number) => customers[i % customers.length];
  const mk = (
    ref: string,
    ci: number,
    trip: Ride['tripType'],
    pickup: string,
    dropoff: string,
    day: number,
    time: string,
    cls: string,
    price: number,
    status: Ride['status'],
    chauffeur: Chauffeur | null,
    distanceKm = 60,
    hours = 2,
  ): Ride => ({
    id: uid('ride'),
    ref,
    customerName: c(ci).name,
    phone: c(ci).phone,
    tripType: trip,
    pickup,
    dropoff,
    date: todayStr(day),
    time,
    passengers: 2,
    luggage: 2,
    paymentMethod: 'Card terminal',
    nameBoard: '',
    notes: 'Demo booking — invented data only.',
    vehicleClass: cls,
    distanceKm,
    hours,
    price,
    status,
    chauffeurId: chauffeur ? chauffeur.id : null,
    createdAt: todayStr(day - 1),
  });
  return [
    mk('CH-2026-1001', 0, 'Airport pickup', 'Dubai International (DXB) Terminal 3', 'Downtown Dubai', 0, '18:30', 'comfort-mpv', 250, 'Upcoming', null),
    mk('CH-2026-1002', 1, 'Transfer', 'Dubai Marina', 'Abu Dhabi Corniche', 1, '09:00', 'business-sedan', 420, 'Upcoming', null, 150),
    mk('CH-2026-1003', 2, 'By the hour', 'Palm Jumeirah', 'Palm Jumeirah', 1, '14:00', 'premium-suv', 850, 'Upcoming', null, 60, 4),
    mk('CH-2026-1004', 3, 'Airport drop-off', 'JBR, Dubai', 'Dubai International (DXB) Terminal 1', 2, '07:00', 'business-mpv', 480, 'Upcoming', null, 100),
    mk('CH-2026-1005', 4, 'Airport pickup', 'Zayed International (AUH)', 'Yas Island', 0, '20:15', 'executive-suv', 750, 'Live', chauffeurs[1]),
    mk('CH-2026-1006', 5, 'Transfer', 'Business Bay', 'Dubai Airport Free Zone', -2, '10:00', 'comfort-mpv', 250, 'Completed', chauffeurs[0]),
    mk('CH-2026-1007', 6, 'City tour', 'Burj Khalifa', 'Dubai Old Town', -5, '15:00', 'comfort-mpv', 550, 'Completed', chauffeurs[0], 60, 4),
    mk('CH-2026-1008', 7, 'Business', 'DIFC', 'Dubai World Trade Centre', -3, '11:00', 'first-class', 700, 'Cancelled', null),
    mk('CH-2026-1009', 0, 'Wedding', 'Al Barari', 'Atlantis, The Palm', 3, '17:00', 'first-class', 1500, 'Upcoming', null, 100),
    mk('CH-2026-1010', 1, 'Airport pickup', 'Sharjah International (SHJ)', 'Al Majaz Waterfront', -10, '19:00', 'premium-suv', 550, 'Completed', chauffeurs[2], 100),
  ];
}

export function seedStore(): StoreData {
  const customers = demoCustomers();
  const chauffeurs = demoChauffeurs();
  const vehicles = demoVehicles(chauffeurs);
  const rides = demoRides(customers, chauffeurs);
  const payments: Payment[] = rides
    .filter((r) => r.status !== 'Cancelled')
    .slice(0, 4)
    .map((r, i) => ({
      id: uid('pay'),
      rideRef: r.ref,
      amount: r.price,
      method: r.paymentMethod,
      status: i === 0 ? 'Pending' : 'Collected',
      date: r.date,
    }));
  const tollGates: TollGate[] = [
    ...Array.from({ length: 10 }, (_, i) => ({ id: uid('toll'), name: `Salik Gate ${i + 1}`, city: 'Dubai' as const, type: 'Salik' as const, verified: i < 2 })),
    ...Array.from({ length: 6 }, (_, i) => ({ id: uid('toll'), name: `Darb Gate ${i + 1}`, city: 'Abu Dhabi' as const, type: 'Darb' as const, verified: false })),
  ];
  const airports: Airport[] = [
    { id: uid('apt'), code: 'DXB', name: 'Dubai International', terminals: [{ name: 'Terminal 1', meetingPoint: 'Arrivals Hall, Gate A', fee: 25, cost: 15 }, { name: 'Terminal 3', meetingPoint: 'Greet & Go QR Lounge', fee: 25, cost: 15 }] },
    { id: uid('apt'), code: 'DWC', name: 'Al Maktoum International', terminals: [{ name: 'Main Terminal', meetingPoint: 'Arrivals Hall', fee: 25, cost: 15 }] },
    { id: uid('apt'), code: 'AUH', name: 'Zayed International', terminals: [{ name: 'Terminal A', meetingPoint: 'Arrivals, Meeting Point 2', fee: 30, cost: 18 }] },
    { id: uid('apt'), code: 'SHJ', name: 'Sharjah International', terminals: [{ name: 'Main Terminal', meetingPoint: 'Arrivals Hall', fee: 25, cost: 15 }, { name: 'Terminal 2', meetingPoint: 'Arrivals Hall', fee: 25, cost: 15 }] },
  ];
  const pricingRules: PricingRule[] = [
    { id: uid('rule'), title: 'Night surcharge (example)', description: 'Demo rule — applies to pickups between 00:00 and 05:00.', amount: 'AED 50' },
    { id: uid('rule'), title: 'Short-notice rule (example)', description: 'Demo rule — bookings with less than 2 hours notice.', amount: 'AED 75' },
  ];
  const promos: PromoCode[] = [
    { id: uid('promo'), code: 'WELCOME10', discountPct: 10, active: true, redemptions: 0 },
    { id: uid('promo'), code: 'DUBAI20', discountPct: 20, active: false, redemptions: 0 },
  ];
  return {
    rides,
    customers,
    chauffeurs,
    vehicles,
    payments,
    classes: DEMO_CLASSES,
    pricingRules,
    tollGates,
    airports,
    promos,
    campaigns: [],
    messages: [
      { id: uid('msg'), channel: 'WhatsApp', to: customers[0].name, subject: `Booking confirmation ${rides[0].ref}`, status: 'Sent', date: new Date().toISOString() },
      { id: uid('msg'), channel: 'Email', to: customers[1].name, subject: `Booking confirmation ${rides[1].ref}`, status: 'Sent', date: new Date().toISOString() },
    ],
    settings: { ...DEFAULT_SETTINGS },
    adminHash: null,
  };
}
