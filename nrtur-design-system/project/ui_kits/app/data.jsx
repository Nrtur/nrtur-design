// Shared fixture data for the in-app UI kit.

const APP_USER = { name: 'Sarah Chen', avatar: 'SC', color: '#3b82f6' };

const APP_PIPELINE = [
  { name: 'Prospecting', color: '#94a3b8', count: 8, value: '$42k', deals: [
    { company: 'Meridian Agency', value: '$8,400',  owner: 'SC', tag: 'Follow up',    tagBg: 'rgba(59,130,246,0.15)', tagFg: '#60a5fa' },
    { company: 'Bloom Creative',  value: '$12,000', owner: 'JK', tag: 'New lead',     tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
    { company: 'Vertex Labs',     value: '$6,200',  owner: 'RL', tag: 'Call booked',  tagBg: 'rgba(139,92,246,0.15)', tagFg: '#a78bfa' },
    { company: 'Northwind Co',    value: '$5,800',  owner: 'MR', tag: 'Cold',         tagBg: 'rgba(255,255,255,0.06)', tagFg: 'var(--fg-5)' },
  ]},
  { name: 'Qualified', color: '#818cf8', count: 5, value: '$81k', deals: [
    { company: 'Pivot Studio',    value: '$22,500', owner: 'SC', tag: 'Proposal sent', tagBg: 'rgba(245,158,11,0.15)', tagFg: '#fbbf24' },
    { company: 'Atlas Consult',   value: '$18,000', owner: 'MR', tag: 'Demo done',     tagBg: 'rgba(99,102,241,0.15)', tagFg: '#818cf8' },
    { company: 'Helios Group',    value: '$26,000', owner: 'JK', tag: 'Negotiating',   tagBg: 'rgba(249,115,22,0.15)', tagFg: '#fb923c' },
  ]},
  { name: 'Proposal', color: '#a78bfa', count: 4, value: '$67k', deals: [
    { company: 'Summit Digital',  value: '$31,000', owner: 'JK', tag: 'Negotiating',   tagBg: 'rgba(249,115,22,0.15)', tagFg: '#fb923c' },
    { company: 'Nova Growth',     value: '$15,500', owner: 'RL', tag: 'Review',        tagBg: 'rgba(236,72,153,0.15)', tagFg: '#f472b6' },
    { company: 'Orbit Labs',      value: '$20,500', owner: 'SC', tag: 'Demo done',     tagBg: 'rgba(99,102,241,0.15)', tagFg: '#818cf8' },
  ]},
  { name: 'Closed Won', color: '#34d399', count: 11, value: '$134k', deals: [
    { company: 'Forge & Co',      value: '$44,000', owner: 'SC', tag: 'Won 🎉', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
    { company: 'Kapoor & Assoc',  value: '$28,000', owner: 'MR', tag: 'Won 🎉', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
    { company: 'Linden Studio',   value: '$18,000', owner: 'RL', tag: 'Won 🎉', tagBg: 'rgba(16,185,129,0.15)', tagFg: '#34d399' },
  ]},
];

const APP_CONTACTS = [
  { name: 'Sarah Chen',       company: 'Meridian Agency', email: 'sarah@meridian.co',  status: 'Active',    value: '$24k', avatar: 'SC', color: '#3b82f6' },
  { name: 'James Whitfield',  company: 'Summit Digital',  email: 'james@summit.io',    status: 'Follow-up', value: '$18k', avatar: 'JW', color: '#8b5cf6' },
  { name: 'Priya Kapoor',     company: 'Kapoor & Assoc',  email: 'priya@kapoor.com',   status: 'Active',    value: '$31k', avatar: 'PK', color: '#10b981' },
  { name: 'Marcus Rodriguez', company: 'Pivot Studio',    email: 'marcus@pivot.studio',status: 'New',       value: '$8k',  avatar: 'MR', color: '#f59e0b' },
  { name: 'Lisa Nakamura',    company: 'Nova Growth',     email: 'lisa@novagrowth.co', status: 'Active',    value: '$42k', avatar: 'LN', color: '#ec4899' },
  { name: 'Tom Barrett',      company: 'Barrett Digital', email: 'tom@barrett.co',     status: 'Follow-up', value: '$14k', avatar: 'TB', color: '#14b8a6' },
  { name: 'Anika Patel',      company: 'Helios Group',    email: 'anika@helios.co',    status: 'New',       value: '$22k', avatar: 'AP', color: '#3b82f6' },
];

const APP_EMAILS = [
  { from: 'Sarah Chen',      subject: 'Re: Proposal for Q3 engagement',   preview: "Love what you've shared — can we jump on a call to finalize the scope?", time: '11:42 AM', unread: true,  avatar: 'SC', color: '#3b82f6' },
  { from: 'James Whitfield', subject: 'Summit Digital contract renewal',  preview: "We're ready to proceed. Need the updated agreement before end of week.",  time: 'Yesterday', unread: false, avatar: 'JW', color: '#8b5cf6' },
  { from: 'Priya Kapoor',    subject: 'Onboarding check-in',              preview: "Team is settled in, starting the data migration tomorrow.",               time: 'Mon',       unread: false, avatar: 'PK', color: '#10b981' },
  { from: 'Marcus Rodriguez',subject: 'Pivot Studio — proposal v2',       preview: "Attached the revised scope with the timeline you asked for.",             time: 'Mon',       unread: true,  avatar: 'MR', color: '#f59e0b' },
  { from: 'Lisa Nakamura',   subject: 'Quick question about API limits',  preview: "Do the limits reset monthly or per billing period? Trying to plan…",      time: 'Fri',       unread: false, avatar: 'LN', color: '#ec4899' },
];

const APP_WORKFLOWS = [
  { trigger: 'New lead created',         steps: ['Assign to rep', 'Send welcome email', 'Create follow-up task in 2 days'], active: true,  runs: 284 },
  { trigger: 'Deal moved to Proposal',   steps: ['Send proposal template', 'Notify team channel', 'Set reminder in 5 days'], active: true,  runs: 91 },
  { trigger: 'Deal inactive 7 days',     steps: ['Send re-engagement email', 'Flag deal for manager review'],                active: false, runs: 47 },
  { trigger: 'Contract signed',          steps: ['Move to Closed Won', 'Send onboarding email', 'Create onboarding tasks'], active: true,  runs: 18 },
];

const APP_METRICS = [
  { label: 'Pipeline Value', value: '$324k', change: '+12%', up: true },
  { label: 'Won This Month', value: '$134k', change: '+31%', up: true },
  { label: 'Avg Deal Size',  value: '$11.5k', change: '+4%', up: true },
  { label: 'Win Rate',       value: '68%',   change: '-2%', up: false },
];

const APP_ACTIVITY = [
  { name: 'S. Chen', action: 'Moved deal to Proposal',  time: '2m ago',  color: '#3b82f6' },
  { name: 'J. Kim',  action: 'Sent proposal to Forge',  time: '14m ago', color: '#8b5cf6' },
  { name: 'R. Lee',  action: 'Closed Kapoor & Assoc',   time: '1h ago',  color: '#10b981' },
  { name: 'M. Rios', action: 'Added 3 new contacts',    time: '2h ago',  color: '#f59e0b' },
  { name: 'S. Chen', action: 'Automated email sent',    time: '3h ago',  color: '#ec4899' },
  { name: 'J. Kim',  action: 'Created new pipeline',    time: '5h ago',  color: '#14b8a6' },
];

Object.assign(window, { APP_USER, APP_PIPELINE, APP_CONTACTS, APP_EMAILS, APP_WORKFLOWS, APP_METRICS, APP_ACTIVITY });
