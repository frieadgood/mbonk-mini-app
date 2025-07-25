# MemeCoin Trading - Telegram Mini App

A modern, mobile-first meme coin trading platform built as a Telegram Mini App with DeFi functionality.

## 🚀 Quick Start

```bash
npm install && npm run dev
```

## 📱 Features

### Core Functionality
- **Home Page**: Project token info + trending top 10 meme coins
- **Watchlist**: Track your favorite meme coins
- **Trade Page**: Real-time K-line charts with multiple timeframes
- **Rank Page**: User rankings by win rate, volume, and trades
- **Wallet Page**: Phantom-inspired wallet with send/buy/export features

### UI/UX
- **Dark Theme**: Black & deep blue color scheme
- **Mobile-First**: Optimized for 390×844 mobile screens
- **Responsive Design**: Works on desktop (1440×900) and mobile
- **Bottom Navigation**: Native mobile app feel
- **Slide-out User Menu**: Right-to-left sheet with user info

### Technical Features
- **Next.js 14**: App Router with TypeScript
- **Wallet Integration**: Privy.io for secure wallet connections
- **Real-time Charts**: Recharts + KlineCharts for candlestick data
- **Modern UI**: shadcn/ui components with Tailwind CSS
- **Performance**: Lighthouse Desktop ≥90, Mobile ≥85

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts + KlineCharts Pro
- **Wallet**: Privy.io SDK
- **State**: React hooks (TODO: Add Zustand)
- **Icons**: Lucide React

## 📦 Installation

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd white-label-mini-app
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Required Environment Variables
```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.memecoin.app
NEXT_PUBLIC_WS_URL=wss://ws.memecoin.app

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your_infura_key
```

### Optional Configuration
- Google Analytics
- Mixpanel tracking
- Sentry error tracking
- Feature flags

## 🎯 Project Goals

- **Target Audience**: Web3 investors (20-30 years old)
- **KPI**: ≥1,000 wallet connections in first month
- **Focus**: Mobile-first Telegram mini app experience
- **Style**: DeFi, tech, futuristic (inspired by Binance/OKX)

## 🏗️ Architecture

```
src/
├── app/              # Next.js 14 App Router pages
│   ├── globals.css   # Global styles with dark theme
│   ├── layout.tsx    # Root layout with navigation
│   ├── page.tsx      # Home page with trending tokens
│   ├── watchlist/    # Watchlist page
│   ├── trade/        # Trading page with charts
│   ├── rank/         # Rankings page
│   └── wallet/       # Wallet page
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   ├── top-navigation.tsx
│   └── bottom-navigation.tsx
├── lib/             # Utilities and helpers
│   └── utils.ts     # Common utility functions
└── types/           # TypeScript type definitions
    └── index.ts     # App-wide types
```

## 📝 Development

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check code quality
```

### Code Quality
- ESLint configuration with Next.js rules
- TypeScript strict mode
- Consistent code formatting
- Mobile-first responsive design

## 🔮 TODO Features

### High Priority
- [ ] **Real API Integration**: Replace mock data with live APIs
- [ ] **Wallet Connection**: Implement Privy.io wallet integration
- [ ] **Live Charts**: Connect to real-time price data
- [ ] **Trading Logic**: Implement actual buy/sell functionality
- [ ] **User Authentication**: Add Telegram user authentication

### Medium Priority
- [ ] **Push Notifications**: Trading alerts and price updates
- [ ] **Advanced Charts**: Add technical indicators
- [ ] **Portfolio Tracking**: P&L calculation and history
- [ ] **Social Features**: User profiles and following
- [ ] **Search Function**: Token search and filtering

### Low Priority
- [ ] **Dark/Light Theme Toggle**: User preference
- [ ] **Multi-language Support**: i18n implementation
- [ ] **Telegram Bot Integration**: Deep linking and sharing
- [ ] **Analytics Dashboard**: User behavior tracking
- [ ] **Referral System**: User acquisition program

## 📊 Performance Targets

- **Lighthouse Desktop**: ≥90
- **Lighthouse Mobile**: ≥85
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1

## 🔐 Security

- No hardcoded API keys
- Secure wallet connection via Privy.io
- Environment variable validation
- Input sanitization
- HTTPS enforcement

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (Recommended)
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables** in your deployment platform

## 📈 Analytics & Monitoring

- **Google Analytics**: Page views and user behavior
- **Mixpanel**: Event tracking and funnels
- **Sentry**: Error tracking and performance monitoring
- **Vercel Analytics**: Core Web Vitals and performance

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, create an issue in the repository or contact the development team.

---

**Built with ❤️ for the Web3 community**
