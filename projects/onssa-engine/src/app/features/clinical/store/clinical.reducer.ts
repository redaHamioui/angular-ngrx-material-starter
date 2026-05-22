import { Action, createReducer, on } from '@ngrx/store';
import { ClinicalState, initialClinicalState, ConsultationStatus } from './clinical.state';
import * as ClinicalActions from './clinical.actions';

const clinicalReducer = createReducer(
  initialClinicalState,

  // Load Consultations
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
    error
  })),

  // Load Consultation By ID
  on(ClinicalActions.loadConsultationById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ClinicalActions.loadConsultationByIdSuccess, (state, { consultation }) => ({
    ...state,
    currentConsultation: consultation,
    loading: false
  })),

  on(ClinicalActions.loadConsultationByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Consultation
  on(ClinicalActions.createConsultation, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ClinicalActions.createConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: [...state.consultations, consultation],
    currentConsultation: consultation,
    saving: false,
    pagination: {
      ...state.pagination,
      total: state.pagination.total + 1
    }
  })),

  on(ClinicalActions.createConsultationFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Update Consultation
  on(ClinicalActions.updateConsultation, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ClinicalActions.updateConsultationSuccess, (state, { consultation }) => ({
    ...state,
    consultations: state.consultations.map((c) =>
      c.id === consultation.id ? consultation : c
    ),
    currentConsultation: consultation,
    saving: false
  })),

  on(ClinicalActions.updateConsultationFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Delete Consultation
  on(ClinicalActions.deleteConsultation, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ClinicalActions.deleteConsultationSuccess, (state, { id }) => ({
    ...state,
    consultations: state.consultations.filter((c) => c.id !== id),
    currentConsultation:
      state.currentConsultation?.id === id ? null : state.currentConsultation,
    saving: false,
    pagination: {
      ...state.pagination,
      total: state.pagination.total - 1
    }
  })),

  on(ClinicalActions.deleteConsultationFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Filter by Date Range
  on(ClinicalActions.filterConsultationsByDateRange, (state, { dateFrom, dateTo }) => ({
    ...state,
    filters: {
      ...state.filters,
      dateFrom,
      dateTo
    },
    pagination: {
      ...state.pagination,
      pageIndex: 0
    }
  })),

  // Filter by Species
  on(ClinicalActions.filterConsultationsBySpecies, (state, { species }) => ({
    ...state,
    filters: {
      ...state.filters,
      species
    },
    pagination: {
      ...state.pagination,
      pageIndex: 0
    }
  })),

  // Filter by Status
  on(ClinicalActions.filterConsultationsByStatus, (state, { status }) => ({
    ...state,
    filters: {
      ...state.filters,
      status: status as ConsultationStatus[]
    },
    pagination: {
      ...state.pagination,
      pageIndex: 0
    }
  })),

  // Clear Filters
  on(ClinicalActions.clearConsultationFilters, (state) => ({
    ...state,
    filters: initialClinicalState.filters,
    pagination: {
      ...state.pagination,
      pageIndex: 0
    }
  })),

  // Pagination
  on(ClinicalActions.setConsultationPageSize, (state, { pageSize }) => ({
    ...state,
    pagination: {
      ...state.pagination,
      pageSize,
      pageIndex: 0
    }
  })),

  on(ClinicalActions.setConsultationPageIndex, (state, { pageIndex }) => ({
    ...state,
    pagination: {
      ...state.pagination,
      pageIndex
    }
  })),

  // Archive Consultation
  on(ClinicalActions.archiveConsultation, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ClinicalActions.archiveConsultationSuccess, (state, { id }) => ({
    ...state,
    consultations: state.consultations.map((c) =>
      c.id === id
        ? {
            ...c,
            status: ConsultationStatus.ARCHIVED,
            archivedAt: new Date()
          }
        : c
    ),
    saving: false
  })),

  on(ClinicalActions.archiveConsultationFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Select Consultation
  on(ClinicalActions.selectConsultation, (state, { id }) => ({
    ...state,
    currentConsultation:
      state.consultations.find((c) => c.id === id) || null
  })),

  // Clear Selected Consultation
  on(ClinicalActions.clearSelectedConsultation, (state) => ({
    ...state,
    currentConsultation: null
  }))
);

export function clinicalReducer(
  state: ClinicalState | undefined,
  action: Action
) {
  return clinicalReducer(state, action);
}
