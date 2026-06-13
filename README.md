# 🌿 NepConnect - AI-Powered Local Marketplace

**NepConnect** is a hyperlocal marketplace and farmer tools platform built with **Next.js 15**, React 19, TypeScript, Tailwind CSS v4, **Supabase**, and **Google Gemini AI**.

---

## 🚀 Features

### 🏪 Marketplace
- **Browse Listings** — Search, filter by category, view on interactive map
- **Map Radius Filter** — Show listings within 5/10/25/50 km of your location
- **Add Listing** — Take/upload photos, AI auto-generates title, description & condition
- **Favorites / Wishlist** — ❤️ Save listings, view saved items
- **In-App Chat** — Real-time messaging between buyers and sellers (Supabase Realtime)
- **User Ratings & Reviews** — Rate sellers after transactions, build trust
- **AI Price Suggestions** — Gemini suggests a fair price based on item details
- **AI Condition Report** — Auto-detects New / Like New / Good / Fair / For Parts
- **Verified Badge** — AI-verified listings get a trust badge

### 🔐 Authentication
- JWT-based login/signup with cookies
- Email verification via Nodemailer
- Guest browsing mode
- Dashboard with stats & listing management

### 🌾 Farmer Hub
- **Weather Widget** — Current conditions + 4-day forecast for Nepal
- **Crop Doctor** — Take a photo of a leaf, AI diagnoses diseases + treatment steps
- **Crop Guide** — Search crops, get sun/water/soil pH/season data
- **Planting Calendar** — When to plant & harvest 14+ Nepali crops
- **Crop Rotation Advisor** — AI suggests rotation plan for soil health
- **Market Prices** — Current mandi/wholesale prices for 50+ crops in Nepal
- **Nepali Voice Input** — Speech-to-Text in Nepali (no typing needed)
- **SMS Alerts** — Subscribe to weather, planting & market alerts via SMS
- **Text-to-Speech** — Listen to weather, crop details, and diagnoses in Nepali

### 📱 PWA / Offline
- **Progressive Web App** — Install on home screen
- **Service Worker** — Offline page caching & background sync
- **Push Notifications** — Real-time alerts for messages, favorites & reviews

### 🔔 Notifications
- Real-time notifications for:
  - New messages
  - Listing favorites
  - New reviews
  - Price drops
- Notification bell with unread count badge
- Mark all read, delete individual notifications

### 🗣️ Localization
- Full Nepali (नेपाली) / English toggle
- Nepali voice input & text-to-speech
- Persistent language preference (localStorage)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript / JavaScript |
| **Styling** | Tailwind CSS v4 + CSS Variables |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | JWT (jose) + bcryptjs |
| **AI** | Google Gemini 2.0 Flash |
| **Maps** | Leaflet + React-Leaflet |
| **Icons** | Lucide React |
| **Email** | Nodemailer |
| **Fonts** | Inter + Nunito |
| **PWA** | Service Worker + Web Manifest |

---

## 📁 Project Structure

```
nepconnect/
├── public/
│   ├── sw.js                    # Service Worker (offline + push)
│   ├── manifest.json            # PWA manifest
│   └── icon-{192,512}.png       # App icons
├── src/
│   ├── app/
│   │   ├── page.js              # Homepage (marketplace)
│   │   ├── layout.js            # Root layout (PWA + fonts + navbar)
│   │   ├── globals.css          # Design system + dark mode
│   │   ├── add-listing/         # Post a new item
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── dashboard/           # User dashboard
│   │   ├── saved/               # Wishlist / favorites
│   │   ├── notifications/       # Notification center
│   │   ├── market-prices/       # Crop market prices
│   │   ├── offline/             # Offline fallback page
│   │   ├── farmer/              # Farmer Hub (weather, crops, doctor)
│   │   ├── product/[id]/        # Product detail (reviews, chat, favorites)
│   │   ├── api/
│   │   │   ├── analyze/         # AI listing analysis
│   │   │   ├── diagnose/        # AI crop disease diagnosis
│   │   │   ├── price-suggest/   # AI price suggestion
│   │   │   ├── crop-rotation/   # AI rotation advisor
│   │   │   ├── weather/         # Weather data
│   │   │   ├── market-prices/   # Static market price data
│   │   │   ├── sms-alert/       # SMS sending endpoint
│   │   │   ├── me/              # Current user
│   │   │   └── verify-email/    # Email verification
│   │   └── actions/auth.ts      # Server actions
│   ├── components/
│   │   ├── Navbar.jsx           # Top nav + bottom nav (mobile)
│   │   ├── ui/
│   │   │   ├── Rating.jsx       # Star rating component
│   │   │   ├── ReviewCard.jsx   # Review display + form
│   │   │   ├── FavoriteButton.jsx # ❤️ toggle button
│   │   │   ├── InboxDrawer.jsx  # In-app chat drawer
│   │   │   ├── RadiusFilter.jsx # Map radius filter (GPS)
│   │   │   ├── PriceSuggestion.jsx # AI price suggestion
│   │   │   ├── NepaliVoiceInput.jsx # Speech-to-text in Nepali
│   │   │   ├── SMSAlertSubscribe.jsx # SMS subscription form
│   │   │   └── PWAInstallPrompt.jsx # Install app prompt
│   │   ├── farmer/
│   │   │   ├── WeatherWidget.jsx
│   │   │   ├── CropDoctor.jsx
│   │   │   ├── CropGuide.jsx
│   │   │   ├── PlantingCalendar.jsx
│   │   │   └── CropRotationAdvisor.jsx
│   │   └── (Map components...)
│   ├── hooks/
│   │   ├── useWeather.js
│   │   ├── useCrops.js
│   │   └── useDiagnosis.js
│   └── lib/
│       ├── supabase.js          # Database client + helpers
│       ├── LanguageContext.js    # Nepali/English toggle
│       ├── supabase-schema.sql  # Full database schema
│       ├── email.ts             # Email sending
│       └── speak.js             # Text-to-speech (Nepali)
```

---

## 🗄️ Database Schema

Run `src/lib/supabase-schema.sql` in your Supabase SQL editor to create all required tables:

- `listings` — Marketplace items
- `reviews` — User ratings & reviews
- `favorites` — Saved/wishlisted items
- `notifications` — Push & in-app notifications
- `conversations` — Chat threads
- `messages` — Chat messages
- `market_prices` — Crop price records

---

## 🔧 Setup

1. **Clone & install**
```bash
git clone https://github.com/akash0526/nepconnect.git
cd nepconnect
npm install
```

2. **Environment variables** (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
FROM_EMAIL=noreply@nepconnect.com
# Optional for SMS:
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+977...
```

3. **Run database schema** — Paste `src/lib/supabase-schema.sql` in Supabase SQL editor

4. **Run dev server**
```bash
npm run dev
```

---

## 💡 Key Design Decisions

- **Mobile-first** — Bottom nav, touch-friendly, safe area insets for notched devices
- **Dark mode** — CSS variables with `prefers-color-scheme`
- **Works offline** — SW caches pages, graceful offline fallback
- **Real-time** — Supabase Realtime for messages & notifications
- **Nepali-first** — Default language is Nepali, voice input in Nepali
- **Accessible** — Text-to-speech for low-literacy users in rural areas
- **AI-everywhere** — Gemini handles listing descriptions, price suggestions, crop diagnoses, rotation advice

---

## 📝 License

MIT