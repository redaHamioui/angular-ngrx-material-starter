import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ClinicalState, Consultation, ConsultationStatus, Species } from './clinical.state';

// Feature selector
const getClinicalFeatureState = createFeatureSelector<ClinicalState>('clinical');

// Simple selectors
export const selectAllConsultations = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.consultations
);

export const selectCurrentConsultation = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.currentConsultation
);

export const selectSelectedPatient = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.selectedPatient
);

export const selectDiagnoses = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.diagnoses
);

export const selectClinicalLoading = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.loading
);

export const selectClinicalSaving = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.saving
);

export const selectClinicalError = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.error
);

export const selectConsultationFilters = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.filters
);

export const selectConsultationPagination = createSelector(
  getClinicalFeatureState,
  (state: ClinicalState) => state.pagination
);

// Computed selectors (with filters applied)
export const selectFilteredConsultations = createSelector(
  selectAllConsultations,
  selectConsultationFilters,
  (consultations: Consultation[], filters) => {
    return consultations.filter((consultation) => {
      // Date range filter
      const consultDate = new Date(consultation.createdAt);
      if (consultDate < new Date(filters.dateFrom) || consultDate > new Date(filters.dateTo)) {
        return false;
      }

      // Species filter
      if (filters.species.length > 0 && !filters.species.includes(consultation.patient.species)) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(consultation.status)) {
        return false;
      }

      // Clinician filter
      if (filters.clinician.length > 0 && !filters.clinician.includes(consultation.clinician.id)) {
        return false;
      }

      // Search text filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesPatient = consultation.patient.name.toLowerCase().includes(searchLower) ||
          consultation.patient.breed.toLowerCase().includes(searchLower);
        const matchesClinician = consultation.clinician.name.toLowerCase().includes(searchLower);
        const matchesDiagnosis = consultation.clinical.diagnosis.primary.toLowerCase().includes(searchLower);

        if (!matchesPatient && !matchesClinician && !matchesDiagnosis) {
          return false;
        }
      }

      return true;
    });
  }
);

// Paginated consultations
export const selectPaginatedConsultations = createSelector(
  selectFilteredConsultations,
  selectConsultationPagination,
  (consultations: Consultation[], pagination) => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return consultations.slice(start, end);
  }
);

// Count selectors
export const selectConsultationCount = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => consultations.length
);

export const selectFilteredConsultationCount = createSelector(
  selectFilteredConsultations,
  (consultations: Consultation[]) => consultations.length
);

export const selectActiveConsultationCount = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) =>
    consultations.filter((c) => c.status === ConsultationStatus.ACTIVE).length
);

export const selectArchivedConsultationCount = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) =>
    consultations.filter((c) => c.status === ConsultationStatus.ARCHIVED).length
);

// Consultations by species
export const selectConsultationsBySpecies = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => {
    const grouped: { [key in Species]?: Consultation[] } = {};
    consultations.forEach((c) => {
      if (!grouped[c.patient.species]) {
        grouped[c.patient.species] = [];
      }
      grouped[c.patient.species]!.push(c);
    });
    return grouped;
  }
);

// Consultations by clinician
export const selectConsultationsByClinician = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => {
    const grouped: { [key: string]: Consultation[] } = {};
    consultations.forEach((c) => {
      const clinicianId = c.clinician.id;
      if (!grouped[clinicianId]) {
        grouped[clinicianId] = [];
      }
      grouped[clinicianId].push(c);
    });
    return grouped;
  }
);

// Dashboard selector (combined data for dashboard view)
export const selectClinicalDashboard = createSelector(
  selectAllConsultations,
  selectCurrentConsultation,
  selectClinicalLoading,
  selectActiveConsultationCount,
  selectArchivedConsultationCount,
  (all, current, loading, activeCount, archivedCount) => ({
    allConsultations: all,
    currentConsultation: current,
    loading,
    activeCount,
    archivedCount,
    totalCount: all.length
  })
);

// Recent consultations (last 10)
export const selectRecentConsultations = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => {
    return consultations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }
);

// Today's consultations
export const selectTodayConsultations = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return consultations.filter((c) => {
      const consultDate = new Date(c.createdAt);
      consultDate.setHours(0, 0, 0, 0);
      return consultDate >= today && consultDate < tomorrow;
    });
  }
);

// Consultations awaiting follow-up
export const selectConsultationsAwaitingFollowUp = createSelector(
  selectAllConsultations,
  (consultations: Consultation[]) => {
    const today = new Date();
    return consultations.filter((c) => {
      if (c.status !== ConsultationStatus.COMPLETED) {
        return false;
      }

      // If follow-up was scheduled
      const followUpDate = new Date(c.createdAt);
      followUpDate.setDate(
        followUpDate.getDate() + (c.clinical.treatment?.followUpDays || 0)
      );

      return followUpDate <= today;
    });
  }
);

// Summary stats
export const selectClinicalStats = createSelector(
  selectAllConsultations,
  selectActiveConsultationCount,
  (all, activeCount) => ({
    totalConsultations: all.length,
    activeConsultations: activeCount,
    completedConsultations: all.filter((c) => c.status === ConsultationStatus.COMPLETED).length,
    archivedConsultations: all.filter((c) => c.status === ConsultationStatus.ARCHIVED).length,
    cancelledConsultations: all.filter((c) => c.status === ConsultationStatus.CANCELLED).length
  })
);
