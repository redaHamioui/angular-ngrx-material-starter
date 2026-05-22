# ONSSA-Engine: Architecture Design
## Building on Angular + NgRx + Material Starter

**Version:** 2.0.0  
**Status:** Architecture & Design  
**Goal:** Transform POC into production-grade clinical system using Angular + NgRx patterns  
**Platform:** Web-based, offline-first, 100% local data sovereignty  

---

## Executive Summary

This document details the architectural transformation of ONSSA-Engine POC (vanilla JS) into a **production-grade Angular + NgRx application** using the `angular-ngrx-material-starter` as the foundation.

**Key Principles:**
- ✅ Leverage existing Material Design UI components
- ✅ Use NgRx for centralized state management
- ✅ Maintain 100% offline operation
- ✅ Implement proper testing patterns
- ✅ Scale from POC (1,600 lines) to enterprise (10,000+ lines)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [NgRx Store Design](#ngrx-store-design)
4. [Feature Modules](#feature-modules)
5. [Services & Effects](#services--effects)
6. [Component Hierarchy](#component-hierarchy)
7. [Data Models](#data-models)
8. [State Management Patterns](#state-management-patterns)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Phases](#implementation-phases)

---

## 1. Architecture Overview

### 1.1 Layered Architecture (Angular + NgRx)

```
┌─────────────────────────────────────────────────────────┐
│         SMART COMPONENTS (Angular)                      │
│  ├─ ConsultationContainerComponent                     │
│  ├─ DashboardContainerComponent                        │
│  └─ StockManagementContainerComponent                  │
├─────────────────────────────────────────────────────────┤
│         PRESENTATIONAL COMPONENTS (Material Design)     │
│  ├─ ConsultationFormComponent                          │
│  ├─ PatientListComponent                               │
│  ├─ InvoiceComponent                                   │
│  └─ StockAlertComponent                                │
├─────────────────────────────────────────────────────────┤
│         SERVICES (Business Logic)                       │
│  ├─ ConsultationService                                │
│  ├─ FinancialService                                   │
│  ├─ StockService                                       │
│  └─ OfflineService                                     │
├─────────────────────────────────────────────────────────┤
│         NgRx EFFECTS (Side Effects Management)          │
│  ├─ ConsultationEffects                                │
│  ├─ StockEffects                                       │
│  └─ SyncEffects (offline/backup)                       │
├─────────────────────────────────────────────────────────┤
│         NgRx STORE (Single Source of Truth)             │
│  ├─ ClinicalState (consultations, diagnoses)           │
│  ├─ FinancialState (invoices, payments)                │
│  ├─ StockState (inventory, alerts)                     │
│  └─ UIState (filters, selections, language)            │
├─────────────────────────────────────────────────────────┤
│         DATA LAYER (Offline-First)                      │
│  ├─ localStorage (primary, ~5MB)                       │
│  ├─ IndexedDB (optional, ~50MB+)                       │
│  └─ Service Worker (caching, sync queue)               │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Pattern

```
User Interaction (Template)
    ↓
dispatch(Action)
    ↓
    ┌─────────────────────┐
    │   NgRx Effects      │
    │ (Side Effects)      │
    └──────────┬──────────┘
               ↓
         [Service Call]
         ↓ (localStorage/IndexedDB)
               ↓
    ┌─────────────────────┐
    │   NgRx Reducer      │
    │ (Update Store)      │
    └──────────┬──────────┘
               ↓
    [Store emits new state]
               ↓
    ┌─────────────────────┐
    │   Component (async  │
    │   pipe subscribes)  │
    └──────────┬──────────┘
               ↓
         [Template updates]
```

---

## 2. Project Structure

### 2.1 Folder Organization

```
projects/
└── angular-ngrx-material-starter/
    └── src/
        └── app/
            ├── app.component.ts               # Root component
            ├── app.module.ts                  # Root module
            │
            ├── core/
            │   ├── core.module.ts             # Shared singletons
            │   ├── services/
            │   │   ├── auth.service.ts        # Auth (if needed)
            │   │   ├── logger.service.ts      # Audit logging
            │   │   └── storage.service.ts     # localStorage/IndexedDB abstraction
            │   │
            │   ├── guards/
            │   │   └── can-activate.guard.ts  # Route guards
            │   │
            │   └── interceptors/
            │       └── offline.interceptor.ts # Offline handling
            │
            ├── shared/
            │   ├── shared.module.ts           # Shared components & pipes
            │   ├── components/
            │   │   ├── header/
            │   │   ├── sidebar/
            │   │   ├── data-table/
            │   │   ├── form-builder/
            │   │   └── modal/
            │   │
            │   ├── pipes/
            │   │   ├── currency.pipe.ts       # MAD formatting
            │   │   ├── patient-age.pipe.ts    # Calculate from DOB
            │   │   └── status.pipe.ts
            │   │
            │   ├── directives/
            │   │   ├── required-field.directive.ts
            │   │   └── clinic-only.directive.ts
            │   │
            │   └── models/
            │       ├── consultation.model.ts
            │       ├── patient.model.ts
            │       ├── invoice.model.ts
            │       ├── stock-item.model.ts
            │       └── enums/
            │           ├── species.enum.ts
            │           ├── diagnosis.enum.ts
            │           └── payment-method.enum.ts
            │
            ├── features/
            │   │
            │   ├── clinical/
            │   │   ├── clinical.module.ts
            │   │   ├── clinical-routing.module.ts
            │   │   │
            │   │   ├── containers/
            │   │   │   ├── clinical-dashboard/
            │   │   │   │   ├── clinical-dashboard.component.ts
            │   │   │   │   ├── clinical-dashboard.component.html
            │   │   │   │   └── clinical-dashboard.component.scss
            │   │   │   │
            │   │   │   └── consultation-edit/
            │   │   │       ├── consultation-edit.container.ts
            │   │   │       ├── consultation-edit.component.html
            │   │   │       └── consultation-edit.component.scss
            │   │   │
            │   │   ├── components/
            │   │   │   ├── consultation-form/
            │   │   │   ├── patient-card/
            │   │   │   ├── vitals-monitor/
            │   │   │   ├── diagnosis-picker/
            │   │   │   └── prescription-editor/
            │   │   │
            │   │   ├── services/
            │   │   │   ├── consultation.service.ts
            │   │   │   └── diagnosis.service.ts
            │   │   │
            │   │   ├── store/
            │   │   │   ├── clinical.actions.ts
            │   │   │   ├── clinical.reducer.ts
            │   │   │   ├── clinical.selectors.ts
            │   │   │   ├── clinical.effects.ts
            │   │   │   └── clinical.state.ts
            │   │   │
            │   │   └── models/
            │   │       └── clinical.model.ts
            │   │
            │   ├── financial/
            │   │   ├── financial.module.ts
            │   │   ├── containers/
            │   │   │   ├── billing-dashboard/
            │   │   │   └── invoice-view/
            │   │   │
            │   │   ├── components/
            │   │   │   ├── invoice-form/
            │   │   │   ├── payment-receipt/
            │   │   │   └── daily-report/
            │   │   │
            │   │   ├── services/
            │   │   │   ├── invoice.service.ts
            │   │   │   ├── payment.service.ts
            │   │   │   └── tax.service.ts
            │   │   │
            │   │   ├── store/
            │   │   │   ├── financial.actions.ts
            │   │   │   ├── financial.reducer.ts
            │   │   │   ├── financial.selectors.ts
            │   │   │   ├── financial.effects.ts
            │   │   │   └── financial.state.ts
            │   │   │
            │   │   └── models/
            │   │       └── financial.model.ts
            │   │
            │   ├── stock/
            │   │   ├── stock.module.ts
            │   │   ├── containers/
            │   │   │   ├── stock-dashboard/
            │   │   │   └── stock-edit/
            │   │   │
            │   │   ├── components/
            │   │   │   ├── stock-list/
            │   │   │   ├── stock-alerts/
            │   │   │   ├── medication-picker/
            │   │   │   └── expiry-tracker/
            │   │   │
            │   │   ├── services/
            │   │   │   ├── inventory.service.ts
            │   │   │   └── alert.service.ts
            │   │   │
            │   │   ├── store/
            │   │   │   ├── stock.actions.ts
            │   │   │   ├── stock.reducer.ts
            │   │   │   ├── stock.selectors.ts
            │   │   │   ├── stock.effects.ts
            │   │   │   └── stock.state.ts
            │   │   │
            │   │   ├── data/
            │   │   │   └── medications.data.ts  # 217 medications
            │   │   │
            │   │   └── models/
            │   │       └── stock.model.ts
            │   │
            │   ├── reporting/
            │   │   ├── reporting.module.ts
            │   │   ├── containers/
            │   │   │   ├── analytics-dashboard/
            │   │   │   └── export-center/
            │   │   │
            │   │   ├── components/
            │   │   │   ├── revenue-chart/
            │   │   │   ├── export-dialog/
            │   │   │   └── backup-manager/
            │   │   │
            │   │   ├── services/
            │   │   │   ├── analytics.service.ts
            │   │   │   ├── export.service.ts
            │   │   │   └── backup.service.ts
            │   │   │
            │   │   ├── store/
            │   │   │   ├── reporting.actions.ts
            │   │   │   ├── reporting.reducer.ts
            │   │   │   └── reporting.selectors.ts
            │   │   │
            │   │   └── models/
            │   │       └── reporting.model.ts
            │   │
            │   └── settings/
            │       ├── settings.module.ts
            │       ├── containers/
            │       │   └── settings-page/
            │       │
            │       ├── components/
            │       │   ├── language-selector/
            │       │   ├── clinic-config/
            │       │   └── backup-settings/
            │       │
            │       ├── services/
            │       │   └── settings.service.ts
            │       │
            │       ├── store/
            │       │   ├── settings.actions.ts
            │       │   ├── settings.reducer.ts
            │       │   └── settings.selectors.ts
            │       │
            │       └── models/
            │           └── settings.model.ts
            │
            └── root-store/
                ├── root.actions.ts
                ├── root.reducer.ts
                ├── root.selectors.ts
                ├── index.ts                   # Store export
                │
                └── app/
                    ├── app.actions.ts         # Global actions
                    ├── app.reducer.ts         # Global reducer
                    ├── app.selectors.ts
                    └── app.effects.ts         # Global effects (sync, backup)
```

---

## 3. NgRx Store Design

### 3.1 Root State Shape

```typescript
// Root state (root-store/index.ts)
export interface RootState {
  // Feature states
  clinical: ClinicalState;
  financial: FinancialState;
  stock: StockState;
  reporting: ReportingState;
  settings: SettingsState;
  
  // App-level state
  app: AppState;
}

// App-level state (global concerns)
export interface AppState {
  initialized: boolean;
  lastSync: Date;
  lastBackup: Date;
  isOffline: boolean;
  syncQueue: QueuedAction[];
  auditLog: AuditLogEntry[];
  errorLog: ErrorLogEntry[];
}
```

### 3.2 Feature State: Clinical

```typescript
// features/clinical/store/clinical.state.ts
export interface ClinicalState {
  consultations: Consultation[];
  currentConsultation: Consultation | null;
  selectedPatient: Patient | null;
  diagnoses: Diagnosis[];
  loading: boolean;
  error: string | null;
  filters: {
    dateFrom: Date;
    dateTo: Date;
    species: Species[];
    status: ConsultationStatus[];
  };
  pagination: {
    pageSize: number;
    pageIndex: number;
    total: number;
  };
}

export interface Consultation {
  id: string;
  createdAt: Date;
  clinicId: string;
  clinician: {
    id: string;
    name: string;
    role: 'veterinarian' | 'assistant' | 'admin';
  };
  patient: Patient;
  vitals: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    bloodPressure: string;
    recordedAt: Date;
  };
  clinical: {
    chiefComplaint: string;
    examinationFindings: string;
    diagnosis: {
      primary: string;
      differential: string[];
      icd10: string;
    };
    treatment: {
      medications: Medication[];
      procedures: string[];
      recommendations: string[];
    };
  };
  billing: InvoiceItem;
  status: 'active' | 'archived' | 'cancelled';
  notes: string;
}

export interface Patient {
  id: string;
  species: Species;
  breed: string;
  name: string;
  dob: Date;
  weight: number;
  chipId: string;
  ownerName: string;
  ownerPhone: string;
}

export enum Species {
  CANINE = 'canine',
  FELINE = 'feline',
  AVIAN = 'avian',
  EXOTIC = 'exotic',
  EQUINE = 'equine'
}
```

### 3.3 Feature State: Financial

```typescript
// features/financial/store/financial.state.ts
export interface FinancialState {
  invoices: Invoice[];
  payments: Payment[];
  dailyFinancials: DailyFinancial[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;
  filters: {
    dateFrom: Date;
    dateTo: Date;
    status: PaymentStatus[];
    clinic: string[];
  };
}

export interface Invoice {
  id: string;
  consultationId: string;
  date: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  paid: boolean;
  paidDate: Date;
  notes: string;
}

export interface DailyFinancial {
  date: Date;
  consultations: {
    count: number;
    revenue: number;
  };
  procedures: {
    count: number;
    revenue: number;
  };
  medications: {
    sold: number;
    cost: number;
    revenue: number;
  };
  expenses: {
    staff: number;
    utilities: number;
    supplies: number;
  };
  summary: {
    grossRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
}
```

### 3.4 Feature State: Stock

```typescript
// features/stock/store/stock.state.ts
export interface StockState {
  items: StockItem[];
  alerts: StockAlert[];
  currentItem: StockItem | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string[];
    alertStatus: 'all' | 'critical' | 'warning' | 'ok';
  };
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  supplier: string;
  unitCost: number;
  retailPrice: number;
  stock: {
    quantity: number;
    unit: string;
    alertLevel: number;
    maximumStock: number;
  };
  expiry: {
    date: Date;
    alertDays: number;
  };
  usage: {
    thisMonth: number;
    lastMonth: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
}

export interface StockAlert {
  id: string;
  itemId: string;
  type: 'low_stock' | 'expiring_soon' | 'expired';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
}
```

### 3.5 Selectors (Memoized Queries)

```typescript
// features/clinical/store/clinical.selectors.ts
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ClinicalState, Consultation } from './clinical.state';

const getClinicalState = createFeatureSelector<ClinicalState>('clinical');

export const selectAllConsultations = createSelector(
  getClinicalState,
  (state: ClinicalState) => state.consultations
);

export const selectCurrentConsultation = createSelector(
  getClinicalState,
  (state: ClinicalState) => state.currentConsultation
);

export const selectConsultationsByDateRange = createSelector(
  selectAllConsultations,
  getClinicalState,
  (consultations: Consultation[], state: ClinicalState) => {
    const { dateFrom, dateTo } = state.filters;
    return consultations.filter(c =>
      c.createdAt >= dateFrom && c.createdAt <= dateTo
    );
  }
);

export const selectConsultationsBySpecies = createSelector(
  selectAllConsultations,
  getClinicalState,
  (consultations: Consultation[], state: ClinicalState) => {
    const { species } = state.filters;
    return consultations.filter(c => species.includes(c.patient.species));
  }
);

export const selectConsultationsCount = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => consultations.length
);

export const selectConsultationLoading = createSelector(
  getClinicalState,
  (state: ClinicalState) => state.loading
);

export const selectConsultationError = createSelector(
  getClinicalState,
  (state: ClinicalState) => state.error
);

// Combined selector for dashboard
export const selectClinicalDashboard = createSelector(
  selectAllConsultations,
  selectCurrentConsultation,
  selectConsultationLoading,
  (all, current, loading) => ({
    allConsultations: all,
    currentConsultation: current,
    loading
  })
);
```

---

## 4. Feature Modules

### 4.1 Clinical Module Structure

```typescript
// features/clinical/clinical.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMaterialModule } from '../../app.material.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ClinicalRoutingModule } from './clinical-routing.module';
import { ClinicalDashboardComponent } from './containers/clinical-dashboard/clinical-dashboard.component';
import { ConsultationFormComponent } from './components/consultation-form/consultation-form.component';
import { ClinicalReducer } from './store/clinical.reducer';
import { ClinicalEffects } from './store/clinical.effects';

@NgModule({
  declarations: [
    ClinicalDashboardComponent,
    ConsultationFormComponent
    // ... other components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatMaterialModule,
    ClinicalRoutingModule,
    StoreModule.forFeature('clinical', ClinicalReducer),
    EffectsModule.forFeature([ClinicalEffects])
  ]
})
export class ClinicalModule { }
```

### 4.2 Routing Module

```typescript
// features/clinical/clinical-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClinicalDashboardComponent } from './containers/clinical-dashboard/clinical-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ClinicalDashboardComponent,
    data: { title: 'anms.menu.clinical' }
  },
  {
    path: ':id',
    component: ClinicalDashboardComponent,
    data: { title: 'anms.menu.consultation-edit' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicalRoutingModule { }
```

---

## 5. Services & Effects

### 5.1 Consultation Service

```typescript
// features/clinical/services/consultation.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { StorageService } from '../../../core/services/storage.service';
import { Consultation } from '../store/clinical.state';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private readonly STORAGE_KEY = 'consultations';

  constructor(private storageService: StorageService) { }

  // Simulate API but persist to localStorage
  getAllConsultations(): Observable<Consultation[]> {
    return of(this.storageService.get<Consultation[]>(this.STORAGE_KEY, []))
      .pipe(delay(300)); // Simulate network latency
  }

  getConsultationById(id: string): Observable<Consultation | null> {
    const consultations = this.storageService.get<Consultation[]>(
      this.STORAGE_KEY,
      []
    );
    const consultation = consultations.find(c => c.id === id);
    return of(consultation || null).pipe(delay(200));
  }

  createConsultation(consultation: Consultation): Observable<Consultation> {
    const consultations = this.storageService.get<Consultation[]>(
      this.STORAGE_KEY,
      []
    );
    consultations.push(consultation);
    this.storageService.set(this.STORAGE_KEY, consultations);
    
    return of(consultation).pipe(
      delay(300),
      map(c => ({ ...c, createdAt: new Date() }))
    );
  }

  updateConsultation(consultation: Consultation): Observable<Consultation> {
    let consultations = this.storageService.get<Consultation[]>(
      this.STORAGE_KEY,
      []
    );
    const index = consultations.findIndex(c => c.id === consultation.id);
    
    if (index !== -1) {
      consultations[index] = consultation;
      this.storageService.set(this.STORAGE_KEY, consultations);
    }
    
    return of(consultation).pipe(delay(300));
  }

  deleteConsultation(id: string): Observable<void> {
    let consultations = this.storageService.get<Consultation[]>(
      this.STORAGE_KEY,
      []
    );
    consultations = consultations.filter(c => c.id !== id);
    this.storageService.set(this.STORAGE_KEY, consultations);
    
    return of(void 0).pipe(delay(200));
  }
}
```

### 5.2 Clinical Effects

```typescript
// features/clinical/store/clinical.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs/operators';

import * as ClinicalActions from './clinical.actions';
import { ClinicalState } from './clinical.state';
import { ConsultationService } from '../services/consultation.service';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable()
export class ClinicalEffects {
  loadConsultations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClinicalActions.loadConsultations),
      switchMap(() =>
        this.consultationService.getAllConsultations().pipe(
          map(consultations =>
            ClinicalActions.loadConsultationsSuccess({ consultations })
          ),
          catchError(error =>
            of(ClinicalActions.loadConsultationsFailure({ error }))
          )
        )
      )
    )
  );

  loadConsultationById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClinicalActions.loadConsultationById),
      switchMap(({ id }) =>
        this.consultationService.getConsultationById(id).pipe(
          map(consultation =>
            ClinicalActions.loadConsultationByIdSuccess({ consultation })
          ),
          catchError(error =>
            of(ClinicalActions.loadConsultationByIdFailure({ error }))
          )
        )
      )
    )
  );

  createConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClinicalActions.createConsultation),
      switchMap(({ consultation }) =>
        this.consultationService.createConsultation(consultation).pipe(
          tap(() =>
            this.logger.log('Consultation created', {
              consultationId: consultation.id
            })
          ),
          map(created =>
            ClinicalActions.createConsultationSuccess({ consultation: created })
          ),
          catchError(error =>
            of(ClinicalActions.createConsultationFailure({ error }))
          )
        )
      )
    )
  );

  updateConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClinicalActions.updateConsultation),
      switchMap(({ consultation }) =>
        this.consultationService.updateConsultation(consultation).pipe(
          tap(() =>
            this.logger.log('Consultation updated', {
              consultationId: consultation.id
            })
          ),
          map(updated =>
            ClinicalActions.updateConsultationSuccess({ consultation: updated })
          ),
          catchError(error =>
            of(ClinicalActions.updateConsultationFailure({ error }))
          )
        )
      )
    )
  );

  deleteConsultation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ClinicalActions.deleteConsultation),
      switchMap(({ id }) =>
        this.consultationService.deleteConsultation(id).pipe(
          tap(() =>
            this.logger.log('Consultation deleted', { consultationId: id })
          ),
          map(() =>
            ClinicalActions.deleteConsultationSuccess({ id })
          ),
          catchError(error =>
            of(ClinicalActions.deleteConsultationFailure({ error }))
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private consultationService: ConsultationService,
    private logger: LoggerService,
    private store: Store<ClinicalState>
  ) { }
}
```

---

## 6. Component Hierarchy

### 6.1 Smart Container Component

```typescript
// features/clinical/containers/clinical-dashboard/clinical-dashboard.container.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as ClinicalActions from '../../store/clinical.actions';
import * as ClinicalSelectors from '../../store/clinical.selectors';
import { RootState } from '../../../../root-store/index';
import { Consultation } from '../../store/clinical.state';

@Component({
  selector: 'anms-clinical-dashboard',
  templateUrl: './clinical-dashboard.container.html',
  styleUrls: ['./clinical-dashboard.container.scss']
})
export class ClinicalDashboardContainer implements OnInit, OnDestroy {
  consultations$: Observable<Consultation[]>;
  currentConsultation$: Observable<Consultation | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<RootState>,
    private route: ActivatedRoute
  ) {
    this.consultations$ = this.store.select(
      ClinicalSelectors.selectAllConsultations
    );
    this.currentConsultation$ = this.store.select(
      ClinicalSelectors.selectCurrentConsultation
    );
    this.loading$ = this.store.select(
      ClinicalSelectors.selectConsultationLoading
    );
    this.error$ = this.store.select(
      ClinicalSelectors.selectConsultationError
    );
  }

  ngOnInit(): void {
    // Load all consultations on init
    this.store.dispatch(ClinicalActions.loadConsultations());

    // If route has ID, load that specific consultation
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ id }) => {
        if (id) {
          this.store.dispatch(ClinicalActions.loadConsultationById({ id }));
        }
      });
  }

  onCreateConsultation(consultation: Consultation): void {
    this.store.dispatch(
      ClinicalActions.createConsultation({ consultation })
    );
  }

  onUpdateConsultation(consultation: Consultation): void {
    this.store.dispatch(
      ClinicalActions.updateConsultation({ consultation })
    );
  }

  onDeleteConsultation(id: string): void {
    this.store.dispatch(ClinicalActions.deleteConsultation({ id }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 6.2 Presentational Component

```typescript
// features/clinical/components/consultation-form/consultation-form.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Consultation, Patient, Species } from '../../store/clinical.state';

@Component({
  selector: 'anms-consultation-form',
  templateUrl: './consultation-form.component.html',
  styleUrls: ['./consultation-form.component.scss']
})
export class ConsultationFormComponent implements OnInit {
  @Input() consultation: Consultation | null;
  @Input() loading = false;
  @Output() save = new EventEmitter<Consultation>();
  @Output() cancel = new EventEmitter<void>();

  consultationForm: FormGroup;
  species = Object.values(Species);

  constructor(private fb: FormBuilder) {
    this.consultationForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.consultation) {
      this.consultationForm.patchValue(this.consultation);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patient: this.fb.group({
        species: ['canine', Validators.required],
        breed: ['', Validators.required],
        name: ['', Validators.required],
        weight: ['', [Validators.required, Validators.min(0)]]
      }),
      vitals: this.fb.group({
        temperature: ['', [Validators.required, Validators.min(35), Validators.max(42)]],
        heartRate: ['', [Validators.required, Validators.min(0)]],
        respiratoryRate: ['', [Validators.required, Validators.min(0)]]
      }),
      clinical: this.fb.group({
        chiefComplaint: ['', Validators.required],
        diagnosis: this.fb.group({
          primary: ['', Validators.required],
          differential: [[]]
        })
      })
    });
  }

  onSubmit(): void {
    if (this.consultationForm.valid) {
      const consultation: Consultation = {
        ...this.consultation,
        ...this.consultationForm.value,
        id: this.consultation?.id || this.generateId(),
        createdAt: this.consultation?.createdAt || new Date(),
        clinicId: 'ONSSA-CLINIC-001', // From settings
        clinician: this.getCurrentClinician()
      };
      this.save.emit(consultation);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private generateId(): string {
    return `CONS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentClinician() {
    return {
      id: 'VET-001',
      name: 'Dr. Ahmed',
      role: 'veterinarian'
    };
  }
}
```

---

## 7. Data Models

```typescript
// shared/models/consultation.model.ts
export interface Consultation {
  id: string;
  createdAt: Date;
  clinicId: string;
  clinician: Clinician;
  patient: Patient;
  vitals: Vitals;
  clinical: ClinicalData;
  billing: Invoice;
  status: ConsultationStatus;
  notes: string;
}

export interface Clinician {
  id: string;
  name: string;
  role: 'veterinarian' | 'assistant' | 'admin';
}

export interface Patient {
  id: string;
  species: Species;
  breed: string;
  name: string;
  dob: Date;
  weight: number;
  chipId: string;
  ownerName: string;
  ownerPhone: string;
}

export interface Vitals {
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  bloodPressure: string;
  recordedAt: Date;
}

export interface ClinicalData {
  chiefComplaint: string;
  examinationFindings: string;
  diagnosis: Diagnosis;
  treatment: Treatment;
}

export interface Diagnosis {
  primary: string;
  differential: string[];
  icd10: string;
}

export interface Treatment {
  medications: Medication[];
  procedures: string[];
  recommendations: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: 'oral' | 'injection' | 'topical' | 'other';
}

export interface Invoice {
  consultationFee: number;
  procedures: { name: string; cost: number }[];
  medications: { name: string; qty: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  paid: boolean;
}

export enum Species {
  CANINE = 'canine',
  FELINE = 'feline',
  AVIAN = 'avian',
  EXOTIC = 'exotic',
  EQUINE = 'equine'
}

export enum ConsultationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CANCELLED = 'cancelled'
}
```

---

## 8. State Management Patterns

### 8.1 Actions Pattern

```typescript
// features/clinical/store/clinical.actions.ts
import { createAction, props } from '@ngrx/store';
import { Consultation } from './clinical.state';

// Load actions
export const loadConsultations = createAction(
  '[Clinical] Load Consultations'
);

export const loadConsultationsSuccess = createAction(
  '[Clinical] Load Consultations Success',
  props<{ consultations: Consultation[] }>()
);

export const loadConsultationsFailure = createAction(
  '[Clinical] Load Consultations Failure',
  props<{ error: any }>()
);

// CRUD actions
export const createConsultation = createAction(
  '[Clinical] Create Consultation',
  props<{ consultation: Consultation }>()
);

export const createConsultationSuccess = createAction(
  '[Clinical] Create Consultation Success',
  props<{ consultation: Consultation }>()
);

export const createConsultationFailure = createAction(
  '[Clinical] Create Consultation Failure',
  props<{ error: any }>()
);

export const updateConsultation = createAction(
  '[Clinical] Update Consultation',
  props<{ consultation: Consultation }>()
);

export const updateConsultationSuccess = createAction(
  '[Clinical] Update Consultation Success',
  props<{ consultation: Consultation }>()
);

export const updateConsultationFailure = createAction(
  '[Clinical] Update Consultation Failure',
  props<{ error: any }>()
);

// ... more actions
```

### 8.2 Reducer Pattern

```typescript
// features/clinical/store/clinical.reducer.ts
import { Action, createReducer, on } from '@ngrx/store';
import { ClinicalState, Consultation } from './clinical.state';
import * as ClinicalActions from './clinical.actions';

const initialState: ClinicalState = {
  consultations: [],
  currentConsultation: null,
  selectedPatient: null,
  diagnoses: [],
  loading: false,
  error: null,
  filters: {
    dateFrom: new Date(new Date().getFullYear(), 0, 1),
    dateTo: new Date(),
    species: [],
    status: []
  },
  pagination: {
    pageSize: 10,
    pageIndex: 0,
    total: 0
  }
};

const clinicalReducer = createReducer(
  initialState,
  on(ClinicalActions.loadConsultations, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ClinicalActions.loadConsultationsSuccess, (state, { consultations }) => ({
    ...state,
    consultations,
    loading: false,
    pagination: {
      ...state.pagination,
      total: consultations.length
    }
  })),
  on(ClinicalActions.loadConsultationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error.message
  })),
  on(ClinicalActions.createConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: [...state.consultations, consultation],
    currentConsultation: consultation
  })),
  on(ClinicalActions.updateConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: state.consultations.map((c) =>
      c.id === consultation.id ? consultation : c
    ),
    currentConsultation: consultation
  })),
  on(ClinicalActions.deleteConsultationSuccess, (state, { id }) => ({
    ...state,
    consultations: state.consultations.filter((c) => c.id !== id),
    currentConsultation: state.currentConsultation?.id === id ? null : state.currentConsultation
  }))
);

export function ClinicalReducer(
  state: ClinicalState | undefined,
  action: Action
) {
  return clinicalReducer(state, action);
}
```

---

## 9. Testing Strategy

### 9.1 Unit Test Example

```typescript
// features/clinical/store/clinical.reducer.spec.ts
import { ClinicalState, Consultation } from './clinical.state';
import * as ClinicalActions from './clinical.actions';
import { ClinicalReducer } from './clinical.reducer';

describe('ClinicalReducer', () => {
  const initialState: ClinicalState = {
    consultations: [],
    currentConsultation: null,
    loading: false,
    error: null,
    // ... other fields
  };

  it('should handle loadConsultationsSuccess', () => {
    const mockConsultations: Consultation[] = [
      {
        id: 'CONS-001',
        createdAt: new Date(),
        patient: { name: 'Rex', species: 'canine' },
        // ... other fields
      }
    ];

    const action = ClinicalActions.loadConsultationsSuccess({
      consultations: mockConsultations
    });

    const result = ClinicalReducer(initialState, action);

    expect(result.consultations).toEqual(mockConsultations);
    expect(result.loading).toBe(false);
  });

  it('should handle createConsultationSuccess', () => {
    const newConsultation: Consultation = {
      id: 'CONS-002',
      createdAt: new Date(),
      // ... other fields
    };

    const action = ClinicalActions.createConsultationSuccess({
      consultation: newConsultation
    });

    const result = ClinicalReducer(initialState, action);

    expect(result.consultations).toContain(newConsultation);
    expect(result.currentConsultation).toEqual(newConsultation);
  });
});
```

### 9.2 Effects Test Example

```typescript
// features/clinical/store/clinical.effects.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { hot, cold } from 'jasmine-marbles';

import { ClinicalEffects } from './clinical.effects';
import { ConsultationService } from '../services/consultation.service';
import * as ClinicalActions from './clinical.actions';

describe('ClinicalEffects', () => {
  let effects: ClinicalEffects;
  let actions$: Observable<any>;
  let consultationService: jasmine.SpyObj<ConsultationService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConsultationService', [
      'getAllConsultations'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ClinicalEffects,
        provideMockActions(() => actions$),
        { provide: ConsultationService, useValue: spy }
      ]
    });

    effects = TestBed.inject(ClinicalEffects);
    consultationService = TestBed.inject(
      ConsultationService
    ) as jasmine.SpyObj<ConsultationService>;
  });

  it('should return loadConsultationsSuccess action', () => {
    const mockConsultations = [
      { id: 'CONS-001', patient: { name: 'Rex' } }
    ];

    const completion = ClinicalActions.loadConsultationsSuccess({
      consultations: mockConsultations
    });

    actions$ = hot('-a', {
      a: ClinicalActions.loadConsultations()
    });

    const response = cold('-a|', {
      a: mockConsultations
    });

    const expected = cold('--b', { b: completion });

    consultationService.getAllConsultations.and.returnValue(response);

    expect(effects.loadConsultations$).toBeObservable(expected);
  });
});
```

---

## 10. Implementation Phases

### Phase 1: Foundation (Weeks 1-4)

**Objective:** Set up Angular + NgRx structure with clinical module

- [ ] Clone `angular-ngrx-material-starter`
- [ ] Configure modules structure
- [ ] Implement Clinical feature store (actions, reducers, effects)
- [ ] Create consultation service with localStorage integration
- [ ] Build basic consultation form component
- [ ] 20+ unit tests
- [ ] Documentation

**Deliverable:** Working consultation CRUD with NgRx

### Phase 2: Financial & Stock (Weeks 5-8)

**Objective:** Add financial and stock management features

- [ ] Financial module with invoice management
- [ ] Stock module with 217 medications database
- [ ] Inventory alerts system
- [ ] Effects for offline persistence
- [ ] Selectors for efficient queries
- [ ] 25+ unit tests

**Deliverable:** Complete clinical workflow with billing and stock

### Phase 3: Reporting & Export (Weeks 9-12)

**Objective:** Analytics, reporting, and data export

- [ ] Daily financial summaries
- [ ] Revenue analytics
- [ ] PDF export functionality
- [ ] Backup/restore system
- [ ] Settings module (language, clinic config)
- [ ] 20+ unit tests

**Deliverable:** Dashboard with reporting and backup

### Phase 4: Production Hardening (Weeks 13-16)

**Objective:** Testing, performance, and deployment

- [ ] End-to-end tests (Cypress)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deployment documentation
- [ ] Training materials

**Deliverable:** Production-ready application

---

## Success Metrics

✅ **Code Quality**
- 80%+ unit test coverage
- Zero console errors
- TypeScript strict mode

✅ **Performance**
- Initial load: <500ms
- Journal render: <100ms
- No layout jank

✅ **Clinical Functionality**
- 95% of POC features implemented
- All CRUD operations working
- Offline persistence verified

---

**Status:** Ready for implementation  
**Next Step:** Clone starter repository and begin Phase 1
