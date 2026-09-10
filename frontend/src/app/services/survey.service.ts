import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { MessageService } from 'primeng/api';
import { AppState } from '../store/app.state';
import { selectAllSurveys, selectSurveyById } from '../store/survey/survey.selectors';
import * as SurveyActions from '../store/survey/survey.actions';

export interface SurveyQuestionItem {
  id: number;
  sectionId: number;
  subQuestionOf: number | null;
  text: string;
  description?: string;
  visibleToClients: boolean;
  displayType: string;
  answerControlType: string;
  sentimentValue: string;
  metricReportable: boolean;
  showIndividualResponses: boolean;
  showInExecutiveSummary: boolean;
  includeInVarianceTracker: boolean;
  showInChartGenerator: boolean;
  allowAutoMarkNA: boolean;
  optionValues?: string;
  trueLabel?: string;
  falseLabel?: string;
  formula?: string;
  maxLength?: number | null;
  entryBoxSize?: string;
  requiredAnswerType?: string;
  decimalsOnReport?: string;
  existingDropdownList?: string;
  dropDownHeading?: string;
  dropDownValues?: string;
  showNAInDropDown?: boolean;
  showNTInDropDown?: boolean;
}

export interface SurveyQuestionSection {
  id: number;
  title: string;
  description: string;
  expanded: boolean;
  questions: SurveyQuestionItem[];
}

export interface SurveyParticipantSelection {
  id: number;
  source?: 'Roundtable' | 'Project';
  clientName: string;
  clientAbbreviation: string;
  receiveSurvey: boolean;
  allowParticipation: boolean;
}

export interface SurveyPayload {
  source: string;
  entity: string;
  surveyType: string;
  surveyName: string;
  period: string;
  periodNumber: string;
  year: number;
  startDate: string;
  endDate: string;
  firstAlertDate: string;
  reminderDate: string;
  isInteractiveReports: boolean;
  isActive: boolean;
}

export interface StoredSurvey extends SurveyPayload {
  id: number;
  lastStep: number;
  status: string;
  questionSections?: SurveyQuestionSection[];
  participantSelections?: SurveyParticipantSelection[];
}

export interface SurveyResponse {
  id: number;
  message: string;
  survey: StoredSurvey;
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private store = inject(Store<AppState>);

  readonly surveys$ = this.store.select(selectAllSurveys);

  async loadSurveys(): Promise<void> {
    try {
      const surveys = await firstValueFrom(
        this.http.get<StoredSurvey[]>('/api/surveys')
      );
      this.store.dispatch(SurveyActions.loadSurveys({ surveys }));
    } catch (error) {
      console.error('Failed to load surveys from API', error);
    }
  }

  async loadSurveyById(id: number): Promise<StoredSurvey | undefined> {
    try {
      const survey = await firstValueFrom(
        this.http.get<StoredSurvey>(`/api/surveys/${id}`)
      );

      if (this.getSurveyById(id)) {
        this.store.dispatch(SurveyActions.updateSurvey({ survey }));
      } else {
        this.store.dispatch(SurveyActions.addSurvey({ survey }));
      }
      return survey;
    } catch (error) {
      console.error(`Failed to load survey ${id} from API`, error);
      return undefined;
    }
  }

  saveSurvey(
    payload: SurveyPayload,
    lastStep: number = 0,
    questionSections: SurveyQuestionSection[] = [],
    participantSelections: SurveyParticipantSelection[] = [],
    notify: boolean = true
  ): Observable<SurveyResponse> {

    const storedSurvey: StoredSurvey = {
      ...payload,
      id: 0,
      lastStep,
      status: 'Draft',
      questionSections,
      participantSelections
    };

    return this.http.post<StoredSurvey>('/api/surveys', storedSurvey).pipe(
      tap((savedSurvey) => {
        this.store.dispatch(SurveyActions.addSurvey({ survey: savedSurvey }));
        if (notify) {
          this.messageService.add({
            severity: 'success',
            summary: 'Survey Saved',
            detail: `Survey "${savedSurvey.surveyName}" has been created successfully.`,
            life: 4000
          });
        }
      }),
      map((savedSurvey) => ({
        id: savedSurvey.id,
        message: 'Survey created successfully',
        survey: savedSurvey
      }))
    );
  }

  updateSurvey(survey: StoredSurvey, notify: boolean = true): Observable<SurveyResponse> {
    return this.http.put<StoredSurvey>(`/api/surveys/${survey.id}`, survey).pipe(
      tap((savedSurvey) => {
        this.store.dispatch(SurveyActions.updateSurvey({ survey: savedSurvey }));
        if (notify) {
          this.messageService.add({
            severity: 'success',
            summary: 'Survey Updated',
            detail: `Survey "${savedSurvey.surveyName}" has been updated successfully.`,
            life: 4000
          });
        }
      }),
      map((savedSurvey) => ({
        id: savedSurvey.id,
        message: 'Survey updated successfully',
        survey: savedSurvey
      }))
    );
  }

  getSurveys(): StoredSurvey[] {
    let surveys: StoredSurvey[] = [];
    this.store.select(selectAllSurveys).subscribe(s => surveys = s).unsubscribe();
    return surveys;
  }

  getSurveyById(id: number): StoredSurvey | undefined {
    let survey: StoredSurvey | undefined;
    this.store.select(selectSurveyById(id)).subscribe(s => survey = s).unsubscribe();
    return survey;
  }

  async deleteSurvey(id: number): Promise<boolean> {
    try {
      await firstValueFrom(this.http.delete<void>(`/api/surveys/${id}`));
      const surveys = this.getSurveys().filter(survey => survey.id !== id);
      this.store.dispatch(SurveyActions.loadSurveys({ surveys }));
      return true;
    } catch (error) {
      console.error(`Failed to delete survey ${id}`, error);
      return false;
    }
  }
}
