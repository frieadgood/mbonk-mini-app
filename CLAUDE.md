# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### TypeScript
- Uses strict TypeScript configuration
- Path aliases configured: `@/*` maps to `./src/*`

## Architecture

This is a Next.js 14 application using the App Router architecture with TypeScript and Tailwind CSS.

### Project Structure
- `src/app/` - Next.js App Router pages and layouts
- `src/app/layout.tsx` - Root layout with Geist font configuration
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles with Tailwind CSS

### Key Technologies
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety with strict configuration
- **Tailwind CSS** - Utility-first CSS framework
- **Inter & JetBrains Mono** - DeFi-optimized font family

### Styling
- Uses Tailwind CSS utility classes
- Dark mode support with `dark:` prefixes
- Responsive design with `sm:` breakpoints
- DeFi-optimized fonts: Inter (sans-serif) and JetBrains Mono (monospace)
- Custom font variables: `--font-inter` and `--font-jetbrains-mono`

This is a fresh Next.js project created with `create-next-app` and is ready for white-label customization.