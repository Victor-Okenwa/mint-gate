# Directory Map

```
mint-gate/
├── app/                              # Next.js App Router pages & layouts
│   ├── layout.tsx                    # Root layout
│   ├── layoutProvider.tsx            # Client-side layout provider
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles
│   ├── favicon.ico
│   ├── fonts/
│   │   └── SpaceGrotesk-Regular.ttf
│   ├── community/
│   │   └── [name]/
│   │       └── page.tsx              # Dynamic community detail page
│   └── dashboard/
│       ├── layout.tsx                # Dashboard layout (sidebar, nav)
│       ├── page.tsx                  # Dashboard home
│       └── create-community/
│           └── page.tsx              # Community creation form
│
├── components/                       # Shared React components
│   ├── ConnectWallet.tsx             # Wallet connection UI
│   ├── navigation.tsx                # Navigation bar
│   ├── providers/
│   │   ├── app-provider.tsx          # App-level context provider
│   │   └── theme-provider.tsx        # Theme (dark/light) provider
│   └── ui/                           # Reusable UI primitives (shadcn/ui)
│       ├── action-button.tsx
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── loading-swap.tsx
│       ├── number-input.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── contracts/                        # On-chain contract constants
│   └── constants.ts
│
├── hooks/                            # Custom React hooks
│   └── use-mobile.tsx                # Mobile breakpoint detection
│
├── lib/                              # Core logic & utilities
│   ├── utils.ts                      # General utility functions
│   ├── mock-data.ts                  # Mock/seed data for development
│   └── ckb/                          # CKB blockchain integration
│       ├── community.ts              # Community cell building & queries
│       ├── hash.ts                   # Hashing helpers
│       └── udt.ts                    # User Defined Token logic
│
├── public/                           # Static assets
│   ├── ccc-logo.svg
│   ├── ccc-logo-withtext.svg
│   ├── github.svg
│   ├── x-logo.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── utils/                            # Standalone utility modules
│   └── stringUtils.ts                # String manipulation helpers
│
├── temp/                             # Temporary/scratch files
│
├── .eslintrc.json                    # ESLint configuration
├── .gitignore
├── components.json                   # shadcn/ui component config
├── next.config.mjs                   # Next.js configuration
├── next-env.d.ts                     # Next.js TypeScript declarations
├── package.json                      # Dependencies & scripts
├── pnpm-lock.yaml                    # pnpm lockfile
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md
```
