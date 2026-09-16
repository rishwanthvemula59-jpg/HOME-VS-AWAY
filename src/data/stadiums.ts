import type { StadiumConfig } from '../types/stats';

export const STADIUMS_CONFIG: StadiumConfig[] = [
  {
    id: 'rcb',
    franchise: 'Royal Challengers Bengaluru',
    venue: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru, Karnataka',
    homeEffect: 11,
    primaryColor: '#e11d48', // Crimson Red
    secondaryColor: '#1e293b', // Slate Charcoal
    accentHex: '#fbbf24', // Gold
    badgeType: 'lion-crown',
    badgeBg: '#881337',
    badgeFg: '#fde047',
    established: 1969,
    capacity: '32,000',
  },
  {
    id: 'csk',
    franchise: 'Chennai Super Kings',
    venue: 'MA Chidambaram Stadium',
    city: 'Chennai, Tamil Nadu',
    homeEffect: 9,
    primaryColor: '#facc15', // Whistle Yellow
    secondaryColor: '#1d4ed8', // Cobalt
    accentHex: '#f59e0b', // Deep Amber
    badgeType: 'whistle-shield',
    badgeBg: '#ca8a04',
    badgeFg: '#ffffff',
    established: 1916,
    capacity: '38,000',
  },
  {
    id: 'mi',
    franchise: 'Mumbai Indians',
    venue: 'Wankhede Stadium',
    city: 'Mumbai, Maharashtra',
    homeEffect: 6,
    primaryColor: '#0284c7', // Wankhede Blue
    secondaryColor: '#f59e0b', // Gold
    accentHex: '#38bdf8', // Sky
    badgeType: 'vortex-ring',
    badgeBg: '#0369a1',
    badgeFg: '#fef08a',
    established: 1974,
    capacity: '33,000',
  },
  {
    id: 'lsg',
    franchise: 'Lucknow Super Giants',
    venue: 'BRSABV Ekana Cricket Stadium',
    city: 'Lucknow, Uttar Pradesh',
    homeEffect: 5,
    primaryColor: '#06b6d4', // Cyan
    secondaryColor: '#0f172a', // Navy
    accentHex: '#f97316', // Orange
    badgeType: 'wing-falcon',
    badgeBg: '#0891b2',
    badgeFg: '#ffffff',
    established: 2017,
    capacity: '50,000',
  },
  {
    id: 'gt',
    franchise: 'Gujarat Titans',
    venue: 'Narendra Modi Stadium',
    city: 'Ahmedabad, Gujarat',
    homeEffect: 4,
    primaryColor: '#1e3a8a', // Deep Blue
    secondaryColor: '#d97706', // Rose Gold
    accentHex: '#60a5fa',
    badgeType: 'chevron-titan',
    badgeBg: '#172554',
    badgeFg: '#fbbf24',
    established: 1982,
    capacity: '132,000',
  },
  {
    id: 'srh',
    franchise: 'Sunrisers Hyderabad',
    venue: 'Rajiv Gandhi Intl Stadium',
    city: 'Hyderabad, Telangana',
    homeEffect: 3,
    primaryColor: '#f97316', // Solar Orange
    secondaryColor: '#18181b', // Black
    accentHex: '#fbbf24',
    badgeType: 'solar-eagle',
    badgeBg: '#ea580c',
    badgeFg: '#ffffff',
    established: 2003,
    capacity: '55,000',
  },
  {
    id: 'kkr',
    franchise: 'Kolkata Knight Riders',
    venue: 'Eden Gardens',
    city: 'Kolkata, West Bengal',
    homeEffect: 2,
    primaryColor: '#7c3aed', // Royal Purple
    secondaryColor: '#eab308', // Knight Gold
    accentHex: '#a855f7',
    badgeType: 'flame-knight',
    badgeBg: '#581c87',
    badgeFg: '#fde047',
    established: 1864,
    capacity: '66,000',
  },
  {
    id: 'dc',
    franchise: 'Delhi Capitals',
    venue: 'Arun Jaitley Stadium',
    city: 'New Delhi, Delhi',
    homeEffect: 1,
    primaryColor: '#2563eb', // Capital Blue
    secondaryColor: '#dc2626', // Red
    accentHex: '#93c5fd',
    badgeType: 'rampart-tiger',
    badgeBg: '#1d4ed8',
    badgeFg: '#fca5a5',
    established: 1883,
    capacity: '41,800',
  },
  {
    id: 'rr',
    franchise: 'Rajasthan Royals',
    venue: 'Sawai Mansingh Stadium',
    city: 'Jaipur, Rajasthan',
    homeEffect: 0,
    primaryColor: '#ec4899', // Royal Pink
    secondaryColor: '#1e40af', // Royal Blue
    accentHex: '#f472b6',
    badgeType: 'royal-palace',
    badgeBg: '#db2777',
    badgeFg: '#ffffff',
    established: 1969,
    capacity: '30,000',
  },
  {
    id: 'pbks',
    franchise: 'Punjab Kings',
    venue: 'Maharaja Yadavindra Singh Stadium',
    city: 'Mullanpur, Punjab',
    homeEffect: -2,
    primaryColor: '#ef4444', // Scarlet Red
    secondaryColor: '#64748b', // Silver Grey
    accentHex: '#fb7185',
    badgeType: 'crossed-daggers',
    badgeBg: '#b91c1c',
    badgeFg: '#e2e8f0',
    established: 2024,
    capacity: '38,000',
  },
];
