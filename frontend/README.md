# Voice Analytics Dashboard - Frontend

A modern, interactive voice analytics dashboard built with React, TypeScript, and Tailwind CSS, featuring real-time chart editing and Supabase integration.

## 🎨 Features

✨ **Beautiful Dark Theme** - Inspired by superbryn.com aesthetic  
📊 **Interactive Charts** - Line charts and pie charts using Recharts  
✏️ **Live Data Editing** - Modify chart data in real-time  
💾 **Persistent Storage** - Save data to Supabase linked to email  
🔄 **Overwrite Protection** - Warns before overwriting existing data  
📱 **Responsive Design** - Works on all screen sizes  

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Chart library
- **Supabase** - Backend and database

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run this schema:

```sql
-- Create chart_data table
CREATE TABLE chart_data (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  chart_type VARCHAR(50) NOT NULL,
  chart_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, chart_type)
);

-- Create index for faster lookups
CREATE INDEX idx_email_chart_type ON chart_data(email, chart_type);

-- Enable Row Level Security (optional, recommended for production)
ALTER TABLE chart_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production)
CREATE POLICY "Allow all operations" ON chart_data
  FOR ALL USING (true);
```

4. Get your **Project URL** and **Anon Key** from Settings → API

### 3. Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Update with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important:** Without Supabase configuration, the app will run in **demo mode**:
- Dashboard will work normally
- Charts can be edited
- Data changes are local only (not persisted)
- A warning banner will appear at the top

To enable data persistence, you must configure Supabase.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## 📊 Dashboard Features

### 1. Analytics Overview

Four key metrics displayed as cards:
- **Total Calls**: 730 (+12.5%)
- **Avg Duration**: 3:42 (+8.2%)
- **Success Rate**: 61.6% (+3.1%)
- **Voicemail Rate**: 16.4% (-2.4%)

### 2. Call Duration Analysis

Line chart showing:
- Average call duration by time of day
- Total call volume per time slot
- Interactive tooltips with detailed information

### 3. Call Outcome Distribution

Pie chart displaying:
- Successful calls (green)
- Voicemail (blue)
- No Answer (amber)
- Busy (red)
- Failed (gray)

## 🎯 How to Use

### Editing Chart Data

1. **Click "Edit Data"** on any chart
2. **Enter your email** (first time only)
3. **Modify values** in the edit form
4. **Save changes** to persist to Supabase

### Overwrite Protection

If you've saved data before:
- System shows when data was last updated
- Choose to **Load Existing Data** or **Create New Data**
- Prevents accidental data loss

### Data Persistence

- All changes saved to Supabase
- Data linked to your email
- Can be retrieved on any device
- Changes reflect immediately on charts

## 🏭 Production Deployment

### Option 1: Vercel (Recommended)

```bash
npm run build
```

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Option 2: Netlify

```bash
npm run build
```

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

### Option 3: Cloudflare Pages

1. Push to GitHub
2. Connect to Cloudflare Pages
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── EmailModal.tsx      # Email capture modal
│   │   └── EditModal.tsx       # Chart data editor
│   ├── lib/
│   │   └── supabase.ts         # Supabase client & helpers
│   ├── App.tsx                 # Main dashboard component
│   ├── main.tsx                # App entry point
│   ├── index.css               # Global styles
│   └── vite-env.d.ts           # TypeScript definitions
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Design System

### Colors

Based on Tailwind's default palette with custom primary blues:

- **Background**: Dark slate (950, 900)
- **Cards**: Translucent slate-900 with backdrop blur
- **Primary**: Blue (600, 700)
- **Success**: Green (500)
- **Warning**: Amber (500)
- **Error**: Red (500)

### Typography

- **Font**: Inter (from Google Fonts)
- **Headings**: Bold, white
- **Body**: Regular, slate-300/400
- **Labels**: Medium, slate-400

### Components

All components follow a consistent design pattern:
- Rounded corners (lg, xl, 2xl)
- Subtle borders (slate-800)
- Smooth transitions
- Hover states
- Focus rings for accessibility

## 🔧 Development

### Available Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run lint
```

### Code Structure

- **App.tsx**: Main component with state management
- **EmailModal**: Handles email capture with validation
- **EditModal**: Chart data editing with confirmation flows
- **supabase.ts**: Database operations and API calls

### State Management

Using React hooks:
- `useState` for local state
- Props for component communication
- No external state management needed

## 🛡️ Security Notes

**For Production:**

1. Implement proper RLS (Row Level Security) in Supabase
2. Add email validation/authentication
3. Rate limit API calls
4. Sanitize user inputs
5. Use environment variables properly

**Current Setup:**
- Permissive policies for demo purposes
- Email used as simple identifier
- No authentication required

## 🐛 Troubleshooting

**Charts not displaying:**
- Check browser console for errors
- Ensure Recharts is installed
- Verify data structure matches expected format

**Supabase errors:**
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure table schema is created
- Review RLS policies

**Build errors:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npm run lint`

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance

- Lazy loading of components
- Optimized chart rendering
- Minimal bundle size (~200KB gzipped)
- Fast page loads with Vite

---

**Built with:** React, TypeScript, Vite, Tailwind CSS, Recharts, Supabase
