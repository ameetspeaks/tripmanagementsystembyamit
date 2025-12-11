# Trip Management System

A comprehensive logistics and transportation management system built with React, TypeScript, and Supabase.

## 🚀 Features

- **Trip Management**: Create and manage transportation trips with detailed tracking
- **Driver Management**: Manage driver information and consent status
- **Vehicle Fleet**: Track vehicles, types, and maintenance
- **Location Management**: Handle origin/destination locations and lanes
- **Real-time Tracking**: SIM-based GPS tracking integration with Telenity
- **Shipment Mapping**: Link shipments to trips with detailed tracking
- **User Authentication**: Secure authentication with role-based access

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Maps**: Google Maps API
- **Tracking**: Telenity API integration
- **Deployment**: Vercel/Netlify

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Telenity API credentials (for tracking)

## 🚀 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ameetspeaks/tripmanagementsystembyamit.git
   cd tripmanagementsystembyamit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Telenity API Credentials (Base64 encoded)
AUTHORIZATION_TOKEN=base64_username_password
CONSENT_AUTH_TOKEN=base64_client_id_secret
```

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Redeploy after adding variables

3. **Deploy**
   ```bash
   git push origin main
   ```

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   - Configure environment variables in Netlify dashboard

### Option 3: Manual Build & Deploy

```bash
# Build the project
npm run build

# Deploy the dist folder to any static hosting service
# Examples: GitHub Pages, AWS S3, Firebase Hosting
```

## 📊 Database Setup

The project uses Supabase. Run the SQL migrations in `supabase/migrations/` in order:

1. `2025-12-11_0001_customers.sql`
2. `2025-12-11_0002_profiles.sql`
3. `2025-12-11_0003_drivers.sql`
4. ... (run all migrations)

## 🔑 API Integrations

- **Telenity**: SIM-based GPS tracking and consent management
- **Google Maps**: Location services and route visualization
- **Supabase**: Database, authentication, and real-time subscriptions

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run refresh-tokens` - Refresh Telenity API tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.
