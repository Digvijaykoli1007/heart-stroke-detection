# 🫀 CardioMonitor+ Frontend

**Modern Clinical Intelligence Dashboard** for cardiac monitoring built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎨 **Medical-Grade UI Design** - Clean, professional interface optimized for clinical workflows
- 📊 **Real-Time Monitoring** - Live BPM tracking with WebSocket support (ready for backend integration)
- 📈 **Interactive Charts** - 24-hour heart rate trends with zone visualization
- 🚨 **Smart Alerts** - Color-coded status system (Normal 🟢, Warning 🟡, Critical 🔴)
- 👥 **Multi-Patient View** - Monitor multiple patients simultaneously
- ⚡ **Performance Optimized** - 60fps animations, optimized re-renders
- ♿ **Accessible** - WCAG 2.1 AA compliant, keyboard navigation
- 📱 **Responsive** - Works on desktop, tablet, and mobile devices

## 🎨 Design Philosophy

**"Clinical Intelligence"** - A sophisticated blend of Swiss design precision and modern medical equipment aesthetics. See [DESIGN_PHILOSOPHY.md](../DESIGN_PHILOSOPHY.md) for complete design system documentation.

### Key Design Elements
- **Typography**: Inter Variable + JetBrains Mono for clinical precision
- **Colors**: Medical blues with trusted grays (no generic purple gradients)
- **Layout**: 8px grid system, data-dense but breathable
- **Motion**: Purposeful animations (heartbeat pulse, data updates)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Badge.tsx
│   │   ├── medical/               # Medical-specific components
│   │   │   ├── BPMDisplay.tsx    # Large BPM number display
│   │   │   ├── StatusIndicator.tsx
│   │   │   └── PatientCard.tsx
│   │   ├── charts/                # Data visualizations
│   │   │   └── BPMLineChart.tsx
│   │   └── layout/                # Layout components
│   │       ├── Header.tsx
│   │       └── DashboardLayout.tsx
│   ├── pages/
│   │   └── Dashboard.tsx          # Main dashboard page
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Global styles + design tokens
├── index.html
├── package.json
├── tailwind.config.js             # Design system config
├── tsconfig.json
└── vite.config.ts
```

## 🎯 Component Library

### Base Components

#### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  View Report
</Button>
```

Variants: `primary` | `secondary` | `ghost` | `danger`

#### Card
```tsx
import { Card, CardHeader } from '@/components/ui/Card';

<Card padding="md" hover>
  <CardHeader title="Patient Details" subtitle="Last updated 2m ago" />
  {/* Card content */}
</Card>
```

#### Badge
```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="normal" size="md" icon={<Icon />}>
  Normal
</Badge>
```

### Medical Components

#### BPMDisplay
Large, animated heart rate display with status indicator.

```tsx
import { BPMDisplay } from '@/components/medical/BPMDisplay';

<BPMDisplay
  bpm={78}
  status="normal"
  lastUpdate={new Date()}
  size="lg"
  showAnimation={true}
/>
```

#### PatientCard
Interactive patient card for monitoring lists.

```tsx
import { PatientCard } from '@/components/medical/PatientCard';

<PatientCard
  patient={patientData}
  isActive={selectedId === patient.id}
  onClick={() => setSelected(patient)}
/>
```

### Chart Components

#### BPMLineChart
Real-time heart rate trend visualization with reference zones.

```tsx
import { BPMLineChart } from '@/components/charts/BPMLineChart';

<BPMLineChart
  data={chartData}
  height={350}
/>
```

## 🎨 Design Tokens

All design tokens are defined in `tailwind.config.js` and CSS variables in `index.css`:

### Colors
```css
--clinical-white: #FAFBFC
--clinical-gray-{50-900}
--med-blue-{50-900}
--status-normal: #10B981 (green)
--status-warning: #F59E0B (amber)
--status-critical: #EF4444 (red)
```

### Spacing
Based on 8px grid system: 0, 4, 8, 12, 16, 24, 32, 48, 64px

### Typography
- **Headings**: font-heading (Söhne/IBM Plex Sans)
- **Body**: font-sans (Inter Variable)
- **Data/Monospace**: font-mono (JetBrains Mono)

## 🔧 Backend Integration

The frontend is ready for backend integration. Update the Vite proxy in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // Your backend URL
      changeOrigin: true,
    },
  },
}
```

### Data Fetching Example
```typescript
// Create src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const fetchPatientData = async (patientId: string) => {
  const { data } = await api.get(`/patients/${patientId}`);
  return data;
};
```

### WebSocket Integration
```typescript
// Create src/services/socket.ts
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('bpm-update', (data) => {
  console.log('New BPM reading:', data);
});
```

## 📊 Mock Data

Currently using mock data for demonstration. Replace with real API calls:

- **Mock patients**: See `src/pages/Dashboard.tsx`
- **Mock chart data**: Generated with sine wave + random variation
- **Real-time simulation**: 3-second interval updates

## 🎯 Next Steps

### Immediate
- [ ] Connect to backend API
- [ ] Implement WebSocket for real-time updates
- [ ] Add authentication/login page
- [ ] Persist user preferences

### Phase 2
- [ ] Patient search functionality
- [ ] Advanced filtering and sorting
- [ ] Export to PDF reports
- [ ] Multi-user role support (Doctor/Admin)

### Phase 3
- [ ] Dark mode support
- [ ] Customizable alert thresholds
- [ ] SMS/Email notification settings
- [ ] Mobile app (React Native)

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## 📝 Customization

### Changing Colors
Edit `tailwind.config.js` and `src/index.css` color variables.

### Adding New Components
Follow the existing pattern in `src/components/`:
- Put reusable UI in `ui/`
- Put domain-specific components in `medical/`
- Keep components focused and composable

### Modifying Layout
Edit `src/components/layout/DashboardLayout.tsx` for global layout changes.

## 🤝 Contributing

1. Follow the design system in [DESIGN_PHILOSOPHY.md](../DESIGN_PHILOSOPHY.md)
2. Use TypeScript strictly (no `any` types)
3. Keep components under 200 lines
4. Write descriptive prop interfaces
5. Test on Chrome, Firefox, Safari

## 📄 License

MIT

## 🙏 Acknowledgments

- Design inspired by Philips IntelliVue medical monitors
- Icons from Lucide React
- Charts powered by Recharts
- Built with Vite + React + TypeScript

---

**Built for doctors, by developers who care about healthcare.** 🏥
