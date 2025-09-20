# Pitchfork Protocol - Web3 DApp

## Overview

Pitchfork Protocol is a modern Web3 decentralized application built with React, TypeScript, and Vite. The project describes itself as "A Tool for Humanity" and features a cosmic-themed dark interface designed for blockchain interactions. The application provides wallet connectivity features and appears to be focused on decentralized protocol interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router DOM for client-side navigation with a catch-all 404 route
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - Custom cosmic theme with purple-to-pink gradients
  - Radix UI components for accessible, headless UI primitives
  - shadcn/ui component library for pre-built, customizable components

### State Management
- **Global State**: React Context API for Web3 wallet state management
- **Server State**: TanStack Query (React Query) for server state and caching
- **Form Handling**: React Hook Form with Zod resolvers for validation

### Web3 Integration
- **Ethereum Library**: Ethers.js v6 for blockchain interactions
- **Wallet Connection**: Custom Web3Context providing wallet connectivity, account management, and network detection
- **Supported Networks**: Ethereum Mainnet, Polygon, BSC, and various testnets
- **Features**: Account connection/disconnection, network switching, address formatting

### UI Component System
- **Design System**: Cosmic-themed dark mode with custom CSS variables
- **Component Library**: Comprehensive set of Radix UI primitives wrapped in custom styled components
- **Accessibility**: Focus on ARIA compliance and keyboard navigation through Radix UI
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

### Development Experience
- **TypeScript Configuration**: Relaxed linting rules for rapid development
- **Code Quality**: ESLint with React hooks and TypeScript rules
- **Hot Reloading**: Vite's fast refresh for development
- **Path Aliases**: Configured for clean imports (`@/` prefix)

### Theming and Styling
- **Color Scheme**: Dark cosmic theme with purple (#a855f7) to pink (#e879f9) gradients
- **CSS Variables**: Custom properties for consistent theming
- **Animation**: Glow effects and smooth transitions for enhanced user experience
- **Typography**: Focus on readability with muted text colors and proper contrast

### Project Structure
- **Component Organization**: UI components separated into reusable units
- **Context Providers**: Centralized state management for Web3 functionality
- **Hook Abstraction**: Custom hooks for Web3 interactions and utilities
- **Asset Management**: Public assets for SEO and branding

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Router for SPA functionality
- **Build Tools**: Vite with TypeScript support and SWC for fast compilation
- **Styling**: Tailwind CSS with PostCSS for processing

### UI and Component Libraries
- **Radix UI**: Complete set of accessible, unstyled UI primitives including dialogs, dropdowns, tooltips, and form controls
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating variant-based component APIs
- **CMDK**: Command palette component for enhanced user interactions

### Web3 and Blockchain
- **Ethers.js**: Primary library for Ethereum blockchain interactions, wallet connections, and smart contract communication
- **No specific network dependencies**: Designed to work across multiple EVM-compatible chains

### Development and Quality Tools
- **TypeScript**: Static type checking with relaxed configuration for development speed
- **ESLint**: Code linting with React and TypeScript rules
- **React Hook Form**: Form state management with validation
- **TanStack Query**: Server state management and caching

### Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **Next Themes**: Theme switching capabilities (dark/light mode support)

### Optional Integrations
- **Embla Carousel**: Carousel/slider functionality
- **Sonner**: Toast notification system
- **Input OTP**: One-time password input components

Note: The application is configured to potentially integrate with databases through Drizzle ORM in the future, though no database is currently configured.