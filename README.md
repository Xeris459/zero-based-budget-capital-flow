# 💼 Capital Flow - Zero-Based Budgeting

> **Master your finances with intelligent, visual budgeting** — A modern desktop app for complete financial control.

[![Nuxt](https://img.shields.io/badge/Nuxt-v4-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-v3-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB?style=flat&logo=tauri)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.77+-CE3262?style=flat&logo=rust)](https://www.rust-lang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 What is Capital Flow?

Capital Flow is a **powerful, zero-based budgeting desktop application** designed for users who want complete control over their finances. Built with modern web technologies and Rust, it combines a beautiful user interface with robust backend performance.

### ✨ Key Capabilities

| Feature                         | Description                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| 💰 **Multi-Account Management** | Track unlimited accounts with real-time balance flows         |
| 📊 **Visual Dashboards**        | Interactive charts and KPI metrics for instant insights       |
| 💳 **Smart Transactions**       | Categorized transaction tracking with ledger views            |
| 📈 **Budget Planner**           | Yearly grid planning with monthly allocations                 |
| 🔐 **Biometric Security**       | Fingerprint/face recognition with encrypted data storage      |
| 🖥️ **Desktop Native**           | True desktop app with offline functionality and local storage |
| ⚡ **Lightning Fast**           | Optimized Rust backend with instant data access               |

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Node.js 18.x or higher
✓ pnpm 10.x or higher
✓ Rust 1.77.2+ (for desktop builds)
```

### 5-Minute Setup

```bash
# 1. Clone & Install
git clone <repository-url>
cd zero-based-budget
pnpm install

# 2. Start Development
pnpm dev              # Web dev server (http://localhost:3000)
# or
pnpm tauri:dev        # Desktop app with Rust backend

# 3. Run Tests
pnpm test             # Run test suite
```

---

## Features & Pages

### 🏠 Dashboard - Financial Command Center

Get a complete overview of your financial health at a glance.

- **Account Summary** - Real-time balance across all accounts
- **Budget Trend Charts** - Visualize spending patterns over time
- **Income Overview** - Track earning sources
- **KPI Ribbon** - Key metrics: Total Income, Expenses, Net Flow
- **Zero-Based Status** - Check if you've allocated 100% of income
- **Interactive Charts** - Doughnut charts for category breakdown

### 💳 Accounts - Multi-Account Management

Effortlessly manage multiple accounts in one place.

- ➕ Add/edit accounts with custom names
- 🔄 Bank flow visualization
- 📊 Full ledger and transaction history
- 💸 Transfer money between accounts
- 📈 Account-level trend analysis

### 📝 Transactions - Complete Transaction Tracking

Record, categorize, and analyze every transaction.

- 📋 Detailed transaction ledger
- 🏷️ Category assignment and filtering
- 🔍 Search and filter capabilities
- 📅 Date-based sorting
- 💡 Smart transaction insights

### 📅 Planner - Budget Planning

Plan your budget with an intuitive yearly grid interface.

- 📊 Yearly budget grid view
- 📍 Monthly allocations per category
- 🎯 Category-based planning
- 📈 Plan vs. actual comparison
- 🔄 Easy adjustments and recalculation

### 🔐 Security - Bank-Grade Protection

Your financial data is protected with enterprise security.

- 🔑 **Biometric Authentication** - Fingerprint & Face recognition
- 🔐 **AES Encryption** - Secure data storage
- 🛡️ **Lock Screen** - Quick security lock
- 💾 **Local Storage** - No cloud, 100% offline
- ⏱️ **Session Management** - Auto-lock on inactivity

### ⚙️ Settings - Customization

Tailor the app to your preferences.

- 🎨 Theme & appearance options
- 📱 Sidebar toggle (desktop/mobile)
- 🔔 Notification preferences
- 💾 Data import/export
- 🔄 Sync settings

---

## 📋 Commands Reference

### 🛠️ Development Commands

```bash
# Start Nuxt development server (Web)
pnpm dev                    # → http://localhost:3000

# Start Tauri development (Desktop)
pnpm tauri:dev              # → Desktop app with hot-reload

# Run all tests
pnpm test                   # Single run
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage report
```

### 🔨 Build & Production

```bash
# Build web application
pnpm build                  # Optimized SPA build

# Preview production build
pnpm preview                # Test production locally

# Build desktop application
pnpm tauri:build            # Compile for your OS
                            # → src-tauri/target/release/
```

### 📊 Code Quality

```bash
# Run tests with coverage
pnpm test:coverage

# Type checking
vue-tsc --noEmit            # TypeScript validation
```

---

## Configuration Files

| File                        | Purpose                                          |
| --------------------------- | ------------------------------------------------ |
| `nuxt.config.ts`            | Nuxt 4 settings (SSR off, hash routing, modules) |
| `tailwind.config.js`        | Tailwind theme & utilities                       |
| `tsconfig.json`             | TypeScript strict mode configuration             |
| `vitest.config.ts`          | Test runner & coverage setup                     |
| `src-tauri/Cargo.toml`      | Rust dependencies                                |
| `src-tauri/tauri.conf.json` | Desktop app config (window, permissions)         |

---

## 💡 Development Best Practices

### Frontend

✅ **Vue 3 Composition API** with TypeScript  
✅ **Type-safe** with `<script setup lang="ts">`  
✅ **Pinia stores** for global state  
✅ **Tailwind CSS** for all styling  
✅ **Component tests** with Vitest

### Backend (Rust)

✅ **Type-safe** Rust with strict error handling  
✅ **Async runtime** with Tauri  
✅ **SQLite** for data persistence  
✅ **r2d2** connection pooling

### Code Quality

```bash
# TypeScript type checking
vue-tsc --noEmit

# Run tests before commits
pnpm test

# Coverage report
pnpm test:coverage
```

---

## 🤝 Contributing

1. **Clone & Install**

   ```bash
   git clone <repo>
   cd zero-based-budget
   pnpm install
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feat/your-feature
   ```

3. **Follow Best Practices**
   - Use Vue 3 Composition API
   - Write tests for new features
   - Maintain TypeScript strict mode
   - Follow Tailwind CSS conventions

4. **Test Before Submitting**

   ```bash
   pnpm test
   pnpm build
   pnpm tauri:build
   ```

5. **Submit Pull Request**
   - Clear commit messages
   - Reference any related issues
   - Include test coverage

---

## 🐛 Troubleshooting

### Web Dev Server Issues

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Tauri Build Problems

```bash
# Clean Rust build
cargo clean
pnpm tauri:build
```

### Database Errors

- Ensure SQLite is properly initialized
- Check `src-tauri/src/db/manager.rs`
- Verify r2d2 connection pool configuration

---

## 📚 Resources & Documentation

| Resource         | Link                                 |
| ---------------- | ------------------------------------ |
| **Nuxt 4**       | https://nuxt.com/docs                |
| **Vue 3**        | https://vuejs.org/guide/             |
| **Tauri**        | https://tauri.app/docs               |
| **Rust**         | https://www.rust-lang.org/learn      |
| **Pinia**        | https://pinia.vuejs.org/             |
| **Tailwind CSS** | https://tailwindcss.com/docs         |
| **TypeScript**   | https://www.typescriptlang.org/docs/ |
| **Vitest**       | https://vitest.dev/guide/            |

---

## 📄 License

[TBD - Add your license]

---

## 🙌 Support & Community

- 📖 Read the [Nuxt Documentation](https://nuxt.com/)
- 🦀 Learn [Rust Basics](https://doc.rust-lang.org/book/)
- 💬 Ask questions on GitHub Discussions
- 🐛 Report bugs on GitHub Issues

---

<div align="center">

**Made with ❤️ for financial freedom**

[⭐ Star this project](#) · [🐛 Report Bug](#) · [💡 Request Feature](#)

</div>
