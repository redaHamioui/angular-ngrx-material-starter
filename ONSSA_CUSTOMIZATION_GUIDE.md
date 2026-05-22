# ONSSA-Engine: Customization Guide for Angular + NgRx Starter

Based on the starter project customization checklist, here's the step-by-step process to transform `angular-ngrx-material-starter` into **ONSSA-Engine**.

---

## Phase 0: Customization Checklist

### Step 1: Update Project Prefix (anms → onsa)

**Search & Replace across entire project:**

```bash
# Using VS Code or similar IDE
# Find: anms
# Replace: onsa
# Replace All
```

**Files affected:**
- `src/app/**/*.ts` (components, services, modules)
- `src/app/**/*.html` (templates)
- `src/app/**/*.scss` (style imports)
- `.angular.json` (build config)
- `package.json`

**Example transformations:**
```
anms-app → onsa-app
anms-dashboard → onsa-dashboard
anms.menu.clinical → onsa.menu.clinical
[appAnms] → [appOnsa]
anmsAppContainer → onsaAppContainer
```

---

### Step 2: Update package.json

```json
{
  "name": "onssa-engine",
  "version": "2.0.0",
  "description": "Sovereign Veterinary Clinical Management System - Offline-First",
  "license": "CONFIDENTIEL",
  "scripts": {
    "ng": "ng",
    "start": "ng serve --open",
    "start:prod": "npm run build:prod && npm run server",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "lint": "eslint --color -c .eslintrc --ext .ts .",
    "test": "npm run lint && ng test --configuration=test",
    "watch": "ng test --configuration=test --browsers ChromeHeadless --watch --reporters dots",
    "e2e": "ng e2e",
    "e2e:ci": "ng e2e",
    "ci": "npm run format:test && npm run lint && ng test --configuration=test --browsers ChromeHeadless --code-coverage && npm run build:prod",
    "format:write": "prettier projects/**/*.{ts,json,md,scss} --write",
    "format:test": "prettier projects/**/*.{ts,json,md,scss} --list-different",
    "release": "standard-version && git push --follow-tags origin master",
    "analyze": "npm run build:prod -- --stats-json && webpack-bundle-analyzer ./dist/onssa-engine/stats.json",
    "server": "node ./projects/server/server.js"
  }
}
```

---

### Step 3: Remove Deploy Context Path

**Edit: `package.json` (ci script)**

**Before:**
```json
"ci": "npm run format:test && npm run lint && ng test --configuration=test --browsers ChromeTravisCi --code-coverage && npm run build:prod -- --deploy-url /angular-ngrx-material-starter/ --base-href /angular-ngrx-material-starter"
```

**After:**
```json
"ci": "npm run format:test && npm run lint && ng test --configuration=test --browsers ChromeHeadless --code-coverage && npm run build:prod"
```

**Edit: `.angular.json` (build options)**

```json
{
  "projects": {
    "onssa-engine": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/onssa-engine",
            "index": "projects/onssa-engine/src/index.html",
            "main": "projects/onssa-engine/src/main.ts",
            "polyfills": "projects/onssa-engine/src/polyfills.ts",
            "tsConfig": "projects/onssa-engine/tsconfig.app.json",
            "inlineStyleLanguage": "scss",
            "assets": [
              "projects/onssa-engine/src/favicon.ico",
              "projects/onssa-engine/src/assets"
            ],
            "styles": [
              "projects/onssa-engine/src/styles.scss"
            ],
            "scripts": []
          }
        },
        "configurations": {
          "production": {
            "budgets": [
              {
                "type": "bundle",
                "name": "main",
                "baseline": "500kb",
                "maximumWarning": "750kb",
                "maximumError": "1mb"
              }
            ],
            "outputHashing": "all"
          }
        }
      }
    }
  }
}
```

---

### Step 4: Update Environment Files

**Edit: `projects/onssa-engine/src/environments/environment.ts`**

```typescript
export const environment = {
  production: false,
  appName: 'ONSSA-Engine',
  appVersion: '2.0.0',
  i18nPrefix: 'onsa',
  
  // Clinic configuration
  clinicId: 'ONSSA-CLINIC-DEV',
  clinicName: 'ONSSA Veterinary Clinic (Dev)',
  
  // Feature flags
  features: {
    offlineMode: true,
    multiClinic: false,
    cloudSync: false,
    encryption: true,
    auditLogging: true
  },
  
  // Storage config
  storage: {
    maxConsultations: 10000,
    maxBackupSize: 50000000, // 50MB
    autoBackupInterval: 604800000 // 7 days in ms
  },
  
  // API (not used - offline only)
  apiUrl: 'http://localhost:3000/api',
  apiEndpoints: {
    consultations: '/consultations',
    stock: '/stock',
    invoices: '/invoices'
  }
};
```

**Edit: `projects/onssa-engine/src/environments/environment.prod.ts`**

```typescript
export const environment = {
  production: true,
  appName: 'ONSSA-Engine',
  appVersion: '2.0.0',
  i18nPrefix: 'onsa',
  
  clinicId: 'ONSSA-CLINIC-PROD',
  clinicName: 'ONSSA Veterinary Clinic',
  
  features: {
    offlineMode: true,
    multiClinic: false,
    cloudSync: false,
    encryption: true,
    auditLogging: true
  },
  
  storage: {
    maxConsultations: 50000,
    maxBackupSize: 100000000,
    autoBackupInterval: 604800000
  },
  
  apiUrl: 'https://api.onssa-clinic.com',
  apiEndpoints: {
    consultations: '/consultations',
    stock: '/stock',
    invoices: '/invoices'
  }
};
```

---

### Step 5: Update index.html

**Edit: `projects/onssa-engine/src/index.html`**

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  
  <!-- SEO & Meta Tags -->
  <title>ONSSA-Engine v2.0.0 | Sovereign Veterinary Clinical Management</title>
  <meta name="description" content="100% Offline, Zero Dependencies Clinical Management System for Veterinary Clinics">
  <meta name="theme-color" content="#1976d2">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Open Graph -->
  <meta property="og:title" content="ONSSA-Engine | Veterinary Clinical System">
  <meta property="og:description" content="Sovereign, offline-first clinical management for veterinary practices">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://onssa-clinic.com">
  <meta property="og:image" content="/assets/logo-onssa.png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  
  <!-- Google Fonts (Material Design) -->
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="/assets/logo-onssa.png" as="image">
</head>
<body>
  <onsa-app></onsa-app>
  
  <!-- No frameworks, pure Angular -->
  <noscript>
    <p>ONSSA-Engine requires JavaScript to be enabled.</p>
  </noscript>
</body>
</html>
```

---

### Step 6: Update App Name in Browser Tab

**Edit: `projects/onssa-engine/src/app/app/app.component.ts`**

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'onsa-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Set base title
    this.titleService.setTitle(
      `${environment.appName} v${environment.appVersion}`
    );

    // Update title on route change
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const title = this.router.routerState.root.firstChild?.data['title'];
        if (title) {
          this.titleService.setTitle(`${title} | ${environment.appName}`);
        }
      });

    // Set meta tags
    this.metaService.updateTag({
      name: 'description',
      content: environment.production
        ? 'ONSSA Veterinary Clinical Management System'
        : 'ONSSA-Engine Development'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

### Step 7: Delete Unnecessary Files

```bash
# Remove startup docs
rm CHANGELOG.md
rm CODE_OF_CONDUCT.md
rm CONTRIBUTING.md
rm BUILT_WITH.md

# Remove Travis CI
rm .travis.yml
rm .travis-deploy.sh
```

---

### Step 8: Update Footer

**Edit: `projects/onssa-engine/src/app/app/app.component.html`**

```html
<div class="onsa-app-container">
  <!-- Main app content -->
  <router-outlet></router-outlet>

  <!-- Footer -->
  <footer class="onsa-footer">
    <p class="onsa-footer-text">
      © 2026 ONSSA-Engine v{{ appVersion }}
      <span class="separator">|</span>
      Sovereign Veterinary Clinical System
      <span class="separator">|</span>
      <a href="mailto:support@onssa-clinic.com">Support</a>
    </p>
    <p class="onsa-footer-legal">
      Confidential | Offline-First | Zero Dependencies | 100% Data Sovereignty
    </p>
  </footer>
</div>
```

**Edit: `projects/onssa-engine/src/app/app/app.component.scss`**

```scss
.onsa-app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.onsa-footer {
  margin-top: auto;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
  text-align: center;

  .onsa-footer-text {
    font-size: 12px;
    color: #666;
    margin: 0;

    .separator {
      margin: 0 8px;
      color: #ccc;
    }

    a {
      color: #1976d2;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .onsa-footer-legal {
    font-size: 10px;
    color: #999;
    margin: 4px 0 0 0;
  }
}
```

---

### Step 9: Replace Logo

**Steps:**
1. Create logo file: `128x128px` PNG
2. Save as: `projects/onssa-engine/src/assets/logo-onssa.png`
3. Update HTML references:

```html
<!-- In sidenav or header -->
<img src="assets/logo-onssa.png" alt="ONSSA Logo" class="onsa-logo">
```

---

### Step 10: Update Theme Colors

**Edit: `projects/onssa-engine/src/styles/themes/default-theme.scss`**

```scss
// ONSSA Clinical Color Palette
$onsa-primary: #1976d2;      // Primary blue (trust, medical)
$onsa-accent: #ff6b35;       // Alert orange (urgency)
$onsa-warn: #d32f2f;         // Red (critical alerts)
$onsa-success: #388e3c;      // Green (successful operations)
$onsa-info: #0097a7;         // Cyan (informational)

// Clinical UI colors
$onsa-clinical-bg: #f5f7fa;        // Soft clinical background
$onsa-monitoring-border: #e8eef7;  // ICU monitor border
$onsa-alert-bg: #fff3e0;           // Alert background
$onsa-success-bg: #f1f8e9;         // Success background

// Material theme
@import '~@angular/material/theming';

@include mat-core();

$onsa-primary-palette: mat-palette($mat-blue, 600);
$onsa-accent-palette: mat-palette($mat-deep-orange, 400);
$onsa-warn-palette: mat-palette($mat-red, 600);

$onsa-theme: mat-light-theme($onsa-primary-palette, $onsa-accent-palette, $onsa-warn-palette);

@include angular-material-theme($onsa-theme);

// Custom overrides
.mat-toolbar.mat-primary {
  background-color: $onsa-primary;
  color: white;
}

.mat-card {
  border: 1px solid $onsa-monitoring-border;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

---

### Step 11: Update i18n Prefix

**Edit: `.angular.json`**

```json
{
  "projects": {
    "onssa-engine": {
      "i18n": {
        "sourceLocale": "fr",
        "locales": {
          "ar": {
            "translation": "locale/messages.ar.xlf",
            "baseUrl": "/ar/"
          },
          "uk": {
            "translation": "locale/messages.uk.xlf",
            "baseUrl": "/uk/"
          }
        }
      }
    }
  }
}
```

**Update translation files prefix:**
- Change `anms.menu.` → `onsa.menu.`
- Change `anms.common.` → `onsa.common.`
- etc.

---

### Step 12: Update .gitignore

**Add ONSSA-specific ignores:**

```
# ONSSA-Engine specific
/dist/onssa-engine/
/coverage/
backup/
*.backup.json
.onssa-config
clinic-data/
```

---

### Step 13: Setup GitHub CI/CD (Alternative to Travis)

**Create: `.github/workflows/ci.yml`**

```yaml
name: ONSSA-Engine CI/CD

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test

      - name: Build production
        run: npm run build:prod

      - name: Archive artifacts
        if: success()
        uses: actions/upload-artifact@v3
        with:
          name: onssa-engine-build
          path: dist/onssa-engine/

      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: dist/onssa-engine/**/*
```

---

### Step 14: Setup Development Environment

**Create: `DEVELOPMENT.md`**

```markdown
# ONSSA-Engine Development Setup

## Prerequisites
- Node.js 18+
- Angular CLI 15+
- Git

## Setup

```bash
# 1. Clone
git clone https://github.com/redaHamioui/onssa-engine.git
cd onssa-engine

# 2. Install
npm install

# 3. Start dev server
npm start

# 4. Navigate to http://localhost:4200
```

## Development Commands

```bash
# Build
npm run build

# Build production
npm run build:prod

# Run tests
npm run test

# Run linter
npm run lint

# Format code
npm run format:write

# Analyze bundle
npm run analyze
```

## Project Structure

```
projects/onssa-engine/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── clinical/
│   │   │   ├── financial/
│   │   │   ├── stock/
│   │   │   ├── reporting/
│   │   │   └── settings/
│   │   ├── core/
│   │   ├── shared/
│   │   └── root-store/
│   └── environments/
├── angular.json
└── tsconfig.json
```

## Clinic Configuration

Edit `src/environments/environment.ts` to customize:
- Clinic ID
- Feature flags
- Storage quotas
- Language settings
```

---

## Summary of Changes

| File/Folder | Change | Status |
|-------------|--------|--------|
| `package.json` | Update name, version, scripts | ✅ |
| `.angular.json` | Update project name, remove deploy path | ✅ |
| `index.html` | Update title, meta tags | ✅ |
| `environments/` | Update app config | ✅ |
| `app.component.ts` | Update title logic | ✅ |
| `footer` | Update links | ✅ |
| `logo` | Replace with ONSSA logo | ✅ |
| `theme.scss` | Update colors | ✅ |
| Docs | Remove: CONTRIBUTING, CODE_OF_CONDUCT, etc | ✅ |
| CI/CD | GitHub Actions instead of Travis | ✅ |

---

## Next Steps

1. ✅ Complete customization steps above
2. ✅ Commit: `Initial ONSSA-Engine customization`
3. → Begin Phase 1: Clinical module implementation
4. → Implement feature stores (clinical, financial, stock)
5. → Build components and effects
6. → Add tests

---

**Status:** Ready for Phase 1 Implementation  
**Version:** 2.0.0  
**Date:** 2026-05-22
