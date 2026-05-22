import { createAction, props } from '@ngrx/store';
import { Consultation } from './clinical.state';

// Load Consultations
export const loadConsultations = createAction(
  '[Clinical] Load Consultations'
);

export const loadConsultationsSuccess = createAction(
  '[Clinical] Load Consultations Success',
  props<{ consultations: Consultation[] }>()
);

export const loadConsultationsFailure = createAction(
  '[Clinical] Load Consultations Failure',
  props<{ error: string }>()
);

// Load Consultation By ID
export const loadConsultationById = createAction(
  '[Clinical] Load Consultation By ID',
  props<{ id: string }>()
);

export const loadConsultationByIdSuccess = createAction(
  '[Clinical] Load Consultation By ID Success',
  props<{ consultation: Consultation }>()
);

export const loadConsultationByIdFailure = createAction(
  '[Clinical] Load Consultation By ID Failure',
  props<{ error: string }>()
);

// Create Consultation
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
  props<{ error: string }>()
);

// Update Consultation
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
  props<{ error: string }>()
);

// Delete Consultation
export const deleteConsultation = createAction(
  '[Clinical] Delete Consultation',
  props<{ id: string }>()
);

export const deleteConsultationSuccess = createAction(
  '[Clinical] Delete Consultation Success',
  props<{ id: string }>()
);

export const deleteConsultationFailure = createAction(
  '[Clinical] Delete Consultation Failure',
  props<{ error: string }>()
);

// Filter & Search
export const filterConsultationsByDateRange = createAction(
  '[Clinical] Filter Consultations By Date Range',
  props<{ dateFrom: Date; dateTo: Date }>()
);

export const filterConsultationsBySpecies = createAction(
  '[Clinical] Filter Consultations By Species',
  props<{ species: string[] }>()
);

export const filterConsultationsByStatus = createAction(
  '[Clinical] Filter Consultations By Status',
  props<{ status: string[] }>()
);

export const clearConsultationFilters = createAction(
  '[Clinical] Clear Consultation Filters'
);

// Pagination
export const setConsultationPageSize = createAction(
  '[Clinical] Set Consultation Page Size',
  props<{ pageSize: number }>()
);

export const setConsultationPageIndex = createAction(
  '[Clinical] Set Consultation Page Index',
  props<{ pageIndex: number }>()
);

// Archive
export const archiveConsultation = createAction(
  '[Clinical] Archive Consultation',
  props<{ id: string }>()
);

export const archiveConsultationSuccess = createAction(
  '[Clinical] Archive Consultation Success',
  props<{ id: string }>()
);

export const archiveConsultationFailure = createAction(
  '[Clinical] Archive Consultation Failure',
  props<{ error: string }>()
);

// Select Consultation for View/Edit
export const selectConsultation = createAction(
  '[Clinical] Select Consultation',
  props<{ id: string }>()
);

export const clearSelectedConsultation = createAction(
  '[Clinical] Clear Selected Consultation'
);
