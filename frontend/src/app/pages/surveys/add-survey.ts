import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { PopoverModule } from 'primeng/popover';
import { EditorModule } from 'primeng/editor';
import { MessageService } from 'primeng/api';
import {
  SurveyParticipantSelection,
  SurveyService,
  SurveyPayload,
  StoredSurvey
} from '../../services/survey.service';
import { Roundtable, RoundtableService } from '../../services/roundtable.service';
import { Project, ProjectService } from '../../services/project.service';
import { Client, ClientService } from '../../services/client.service';
import { StepperComponent, StepItem } from '../../shared/stepper/stepper';
import { BreadcrumbComponent, BreadcrumbItem } from '../../shared/breadcrumb/breadcrumb';
import { LayoutService } from '../../layout/layout.service';
import { SharedDropdownComponent } from '../../shared/shared-dropdown/shared-dropdown';
import { Table1CheckboxChangeEvent, Table1Column, Table1Component } from '../../shared/table1/table1';

interface DropdownOption {
  label: string;
  value: string;
}

interface QuestionItem {
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

  // Dynamic fields by answerControlType
  optionValues?: string;
  trueLabel?: string;
  falseLabel?: string;
  formula?: string;
  maxLength?: number | null;

  // Entry Box specific fields
  entryBoxSize?: string;
  requiredAnswerType?: string;
  decimalsOnReport?: string;

  // Drop Down specific fields
  existingDropdownList?: string;
  dropDownHeading?: string;
  dropDownValues?: string;
  showNAInDropDown?: boolean;
  showNTInDropDown?: boolean;
}

interface QuestionSection {
  id: number;
  title: string;
  description: string;
  expanded: boolean;
  questions: QuestionItem[];
}

interface ConfirmClientRow {
  id: number;
  source: 'Roundtable' | 'Project';
  clientName: string;
  clientAbbreviation: string;
  receiveSurvey: boolean;
  allowParticipation: boolean;
}

@Component({
  selector: 'app-add-survey',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    DatePickerModule,
    DialogModule,
    PopoverModule,
    StepperComponent,
    BreadcrumbComponent,
    SharedDropdownComponent,
    Table1Component,
    EditorModule,
    FormsModule
  ],
  templateUrl: './add-survey/add-survey.html',
  styleUrl: './add-survey/add-survey.css'
})
export class AddSurveyComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private surveyService = inject(SurveyService);
  private roundtableService = inject(RoundtableService);
  private projectService = inject(ProjectService);
  private clientService = inject(ClientService);
  private layoutService = inject(LayoutService);

  // Edit mode
  editMode = signal(false);
  editSurveyId = signal<number | null>(null);

  // Email Step (Step 4) State
  emailSubject = signal<string>('');
  emailBody = signal<string>('');

  // Add mode stepper labels
  private readonly addSteps: StepItem[] = [
    { label: 'Add Survey' },
    { label: 'Add Questions' },
    { label: 'Confirm Clients &\nReview Participants' },
    { label: 'Review Email' }
  ];

  // Edit mode stepper labels
  private readonly editSteps: StepItem[] = [
    { label: 'Update Survey' },
    { label: 'Update Questions' },
    { label: 'Confirm Clients &\nReview Participants' },
    { label: 'Review Email' }
  ];

  // Stepper
  currentStep = signal(0);
  steps: StepItem[] = [...this.addSteps];
  currentStepLabel = computed(() => this.steps[this.currentStep()]?.label.replace('\n', ' ') ?? '');
  breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Surveys' },
    { label: this.currentStepLabel() }
  ]);

  // Form
  surveyForm!: FormGroup;
  submitted = signal(false);
  saving = signal(false);
  showCancelDialog = signal(false);
  showExplanationDialog = signal(false);
  showSectionDialog = signal(false);
  showDeleteSectionDialog = signal(false);
  showQuestionDialog = signal(false);
  confirmClientRows = signal<ConfirmClientRow[]>([]);
  explanationDraft = signal('');
  questionExplanation = signal('');
  questionSections = signal<QuestionSection[]>([]);
  selectedSectionIdForQuestion = signal<number | null>(null);
  editingSectionId = signal<number | null>(null);
  deletingSectionId = signal<number | null>(null);

  private nextSectionId = 1;
  private nextQuestionId = 1;
  private readonly noParentQuestionValue = 'NO_PARENT';
  private readonly indentedSubQuestionsValue = 'has indented sub questions';
  private readonly tabularSubQuestionsValue = 'Tabular Sub Questions';
  private readonly maxQuestionLevels = 3;

  sectionForm!: FormGroup;
  questionForm!: FormGroup;
  sectionSubmitted = signal(false);
  questionSubmitted = signal(false);
  editingQuestionId = signal<number | null>(null);
  showDeleteQuestionDialog = signal(false);
  deletingQuestionId = signal<number | null>(null);
  deletingQuestionSectionId = signal<number | null>(null);

  displayTypeOptions: DropdownOption[] = [
    { label: 'has indented sub questions', value: 'has indented sub questions' },
    { label: 'Tabular Sub Questions', value: 'Tabular Sub Questions' },
    { label: 'No Related Sub Questions', value: 'No Related Sub Questions' }
  ];

  entryBoxSizeOptions: DropdownOption[] = [
    { label: 'Small', value: 'Small' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Large', value: 'Large' },
    { label: 'Multi-line', value: 'Multi-line' }
  ];

  requiredAnswerTypeOptions: DropdownOption[] = [
    { label: 'Date', value: 'Date' },
    { label: 'Money', value: 'Money' },
    { label: 'Text', value: 'Text' },
    { label: 'Numeric', value: 'Numeric' },
    { label: 'Percentage', value: 'Percentage' }
  ];

  existingDropdownListOptions: DropdownOption[] = [
    { label: 'Add New', value: 'Add New' },
    { label: 'Yes/No', value: 'Yes/No' }
  ];

  answerControlTypeOptions: DropdownOption[] = [
    { label: 'Blank', value: 'Blank' },
    { label: 'Entry Box', value: 'Entry Box' },
    { label: 'Drop Down', value: 'Drop Down' },
    { label: 'Checkbox (True/False)', value: 'Checkbox (True/False)' },
    { label: 'Calculated - Editable', value: 'Calculated - Editable' },
    { label: 'Calculated - Non-editable', value: 'Calculated - Non-editable' }
  ];

  sentimentOptions: DropdownOption[] = [
    { label: '-1', value: '-1' },
    { label: '0', value: '0' },
    { label: '1', value: '1' }
  ];

  // Dropdown Options
  sourceOptions: DropdownOption[] = [
    { label: 'Roundtable', value: 'Roundtable' },
    { label: 'Project', value: 'Project' }
  ];

  surveyTypeOptions: DropdownOption[] = [
    { label: 'Ad Hoc', value: 'Ad Hoc' },
    { label: 'Benchmark', value: 'Benchmark' }
  ];

  periodOptions: DropdownOption[] = [
    { label: 'Annual', value: 'Annual' },
    { label: 'Half', value: 'Half' },
    { label: 'Quarter', value: 'Quarter' },
    { label: 'Month', value: 'Month' }
  ];

  yearOptions: DropdownOption[] = [];
  entityOptions = signal<DropdownOption[]>([]);
  periodNumberOptions = signal<DropdownOption[]>([]);
  confirmClientColumns: Table1Column[] = [
    { field: 'clientName', header: 'Client Name' },
    { field: 'clientAbbreviation', header: 'Client Abbreviation' },
    { field: 'receiveSurvey', header: 'Receive Survey?', type: 'checkbox' },
    { field: 'allowParticipation', header: 'Allow Participation?', type: 'checkbox' }
  ];

  // Dynamic visibility flags
  showPeriod = signal(false);
  showPeriodNumber = signal(false);
  surveyNameDisabled = signal(false);

  // Date boundaries
  minAlertDate = signal<Date | null>(null);
  maxAlertDate = signal<Date | null>(null);
  minReminderDate = signal<Date | null>(null);
  maxReminderDate = signal<Date | null>(null);

  private subscriptions: Subscription[] = [];
  private savedParticipantSelectionsSnapshot: SurveyParticipantSelection[] = [];
  private confirmRowsRefreshVersion = 0;

  ngOnInit(): void {
    this.buildYearOptions();
    this.buildForm();
    this.buildSectionForm();
    this.buildQuestionForm();
    this.setupDynamicBehavior();
    this.setupQuestionDialogBehavior();
    this.loadEntityOptions('Roundtable');
    this.refreshConfirmClientRows();

    // Check for edit mode (:id param)
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const surveyId = Number(idParam);
      this.editMode.set(true);
      this.editSurveyId.set(surveyId);
      this.steps = [...this.editSteps];

      const cached = this.surveyService.getSurveyById(surveyId);
      if (cached) {
        this.loadSurveyIntoForm(cached);
        this.currentStep.set(0);
      } else {
        this.surveyService.loadSurveyById(surveyId).then(survey => {
          if (!survey) {
            this.messageService.add({
              severity: 'error',
              summary: 'Not Found',
              detail: 'Survey could not be loaded.',
              life: 4000
            });
            this.router.navigate(['/surveys/view']);
            return;
          }
          this.loadSurveyIntoForm(survey);
          this.currentStep.set(0);
          this.updatePageTitle();
        });
      }
    }

    this.updatePageTitle();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.layoutService.pageTitleOverride.set(null);
  }

  // ─── Load Survey for Edit Mode ────────────────────────────

  private loadSurveyIntoForm(survey: StoredSurvey): void {
    this.savedParticipantSelectionsSnapshot = Array.isArray(survey.participantSelections)
      ? survey.participantSelections
      : [];

    // Load entity options for the survey's source first
    this.loadEntityOptions(survey.source);

    // Parse date range
    let dateRange: Date[] | null = null;
    if (survey.startDate && survey.endDate) {
      dateRange = [new Date(survey.startDate), new Date(survey.endDate)];
    }

    // Parse individual dates
    const firstAlertDate = survey.firstAlertDate ? new Date(survey.firstAlertDate) : null;
    const reminderDate = survey.reminderDate ? new Date(survey.reminderDate) : null;

    // Trigger survey type behavior before patching
    if (survey.surveyType === 'Benchmark') {
      this.showPeriod.set(true);
      if (survey.period && survey.period !== 'Annual') {
        this.showPeriodNumber.set(true);
        this.onPeriodChange(survey.period);
      }
      this.surveyNameDisabled.set(true);
    }

    // Patch the form
    this.surveyForm.patchValue({
      source: survey.source,
      entity: survey.entity,
      surveyType: survey.surveyType,
      surveyName: survey.surveyName,
      period: survey.period || null,
      periodNumber: survey.periodNumber || null,
      year: String(survey.year),
      dates: dateRange,
      firstAlertDate,
      reminderDate,
      isInteractiveReports: survey.isInteractiveReports,
      isActive: survey.isActive
    }, { emitEvent: false });

    // Update date boundaries
    if (dateRange && dateRange[0] && dateRange[1]) {
      this.minAlertDate.set(dateRange[0]);
      this.maxAlertDate.set(dateRange[1]);
      this.minReminderDate.set(dateRange[0]);
      this.maxReminderDate.set(dateRange[1]);
    }

    // If Benchmark, disable the survey name field
    if (survey.surveyType === 'Benchmark') {
      this.surveyForm.get('surveyName')?.disable();
    }

    this.loadQuestionSectionsFromSurvey(survey);
    this.refreshConfirmClientRows(this.savedParticipantSelectionsSnapshot);

    // Mark form as pristine since we just loaded data
    this.surveyForm.markAsPristine();
    this.surveyForm.markAsUntouched();
  }

  private loadQuestionSectionsFromSurvey(survey: StoredSurvey): void {
    const sections = Array.isArray(survey.questionSections) ? survey.questionSections : [];
    const normalizedSections: QuestionSection[] = sections.map(section => ({
      id: Number(section.id),
      title: section.title ?? '',
      description: section.description ?? '',
      expanded: section.expanded ?? true,
      questions: Array.isArray(section.questions)
        ? section.questions.map(question => ({
          ...question,
          id: Number(question.id),
          sectionId: Number(question.sectionId)
        }))
        : []
    }));

    const maxSectionId = normalizedSections.reduce((max, section) => Math.max(max, section.id || 0), 0);
    const maxQuestionId = normalizedSections.reduce(
      (max, section) => Math.max(max, ...section.questions.map(question => question.id || 0)),
      0
    );

    this.questionSections.set(normalizedSections);
    this.enforceTabularHierarchyDisplayTypes();
    this.nextSectionId = maxSectionId + 1;
    this.nextQuestionId = maxQuestionId + 1;
  }

  // ─── Form Builder ──────────────────────────────────────────

  private buildForm(): void {
    this.surveyForm = this.fb.group({
      source: ['Roundtable', Validators.required],
      entity: [null, Validators.required],
      surveyType: [null, Validators.required],
      surveyName: [''],
      period: [null],
      periodNumber: [null],
      year: [null, Validators.required],
      dates: [null, [Validators.required, this.dateRangeSelectionValidator, this.futureDateValidator]],
      firstAlertDate: [null],
      reminderDate: [null],
      isInteractiveReports: [false],
      isActive: [true]
    }, {
      validators: [this.dateRangeValidator]
    });
  }

  private buildSectionForm(): void {
    this.sectionForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  private buildQuestionForm(): void {
    this.questionForm = this.fb.group({
      sectionId: [null, Validators.required],
      subQuestionOf: [this.noParentQuestionValue],
      questionText: ['', Validators.required],
      questionDescription: [''],
      visibleToClients: [true],
      displayType: ['Indented Sub Questions'],
      answerControlType: ['Blank'],
      sentimentValue: ['0'],
      metricReportable: [false],
      showIndividualResponses: [false],
      showInExecutiveSummary: [false],
      includeInVarianceTracker: [false],
      showInChartGenerator: [false],
      allowAutoMarkNA: [false],
      optionValues: [''],
      trueLabel: ['True'],
      falseLabel: ['False'],
      formula: [''],
      maxLength: [null],

      // Entry Box specific
      entryBoxSize: ['Small'],
      requiredAnswerType: ['Numeric'],
      decimalsOnReport: ['2'],

      // Drop Down specific
      existingDropdownList: [null],
      dropDownHeading: [''],
      dropDownValues: [''],
      showNAInDropDown: [true],
      showNTInDropDown: [true]
    });
  }

  // ─── Dynamic Behavior ─────────────────────────────────────

  private setupDynamicBehavior(): void {
    // Source changes → reload entity list
    const sourceSub = this.surveyForm.get('source')!.valueChanges.subscribe(val => {
      this.surveyForm.get('entity')!.reset();
      this.loadEntityOptions(this.normalizeDropdownValue(val));
      this.refreshConfirmClientRows();
    });
    this.subscriptions.push(sourceSub);

    const entitySub = this.surveyForm.get('entity')!.valueChanges.subscribe(() => {
      this.refreshConfirmClientRows();
    });
    this.subscriptions.push(entitySub);

    // Survey Type changes → toggle fields
    const typeSub = this.surveyForm.get('surveyType')!.valueChanges.subscribe(val => {
      this.onSurveyTypeChange(val);
    });
    this.subscriptions.push(typeSub);

    // Period changes → update periodNumber options
    const periodSub = this.surveyForm.get('period')!.valueChanges.subscribe(val => {
      this.onPeriodChange(val);
    });
    this.subscriptions.push(periodSub);

    // Dates changes → update min/max bounds for alert and reminder dates
    const datesSub = this.surveyForm.get('dates')!.valueChanges.subscribe(val => {
      if (val && Array.isArray(val) && val[0] && val[1]) {
        this.minAlertDate.set(val[0]);
        this.maxAlertDate.set(val[1]);
        this.minReminderDate.set(val[0]);
        this.maxReminderDate.set(val[1]);
      } else {
        this.minAlertDate.set(null);
        this.maxAlertDate.set(null);
        this.minReminderDate.set(null);
        this.maxReminderDate.set(null);
      }
    });
    this.subscriptions.push(datesSub);
  }

  private setupQuestionDialogBehavior(): void {
    const sectionSub = this.questionForm.get('sectionId')!.valueChanges.subscribe(value => {
      this.updateSubQuestionControl(value);
      this.syncDisplayTypeWithHierarchy();
    });
    this.subscriptions.push(sectionSub);

    const parentSub = this.questionForm.get('subQuestionOf')!.valueChanges.subscribe(() => {
      this.syncDisplayTypeWithHierarchy();
    });
    this.subscriptions.push(parentSub);

    const answerTypeSub = this.questionForm.get('answerControlType')!.valueChanges.subscribe(value => {
      this.applyAnswerControlValidators(value);
    });
    this.subscriptions.push(answerTypeSub);
  }

  private updateSubQuestionControl(sectionIdValue: unknown): void {
    const sectionId = sectionIdValue == null ? null : Number(sectionIdValue);
    const currentParentValue = this.questionForm.get('subQuestionOf')?.value;

    const parentOptions = this.getParentQuestionOptionsForSectionId(sectionId);
    const allowedParentValues = new Set(parentOptions.map(o => o.value));

    if (currentParentValue == null || !allowedParentValues.has(String(currentParentValue))) {
      this.questionForm.get('subQuestionOf')?.setValue(this.noParentQuestionValue, { emitEvent: false });
    }
  }

  private syncDisplayTypeWithHierarchy(): void {
    const sectionIdValue = this.questionForm.get('sectionId')?.value;
    const parentValueRaw = this.questionForm.get('subQuestionOf')?.value;
    const currentDisplayType = this.questionForm.get('displayType')?.value;
    const sectionId = sectionIdValue == null ? NaN : Number(sectionIdValue);
    const parentId = parentValueRaw === this.noParentQuestionValue || parentValueRaw == null
      ? null
      : Number(parentValueRaw);

    const resolved = this.resolveDisplayTypeForSave(
      Number.isFinite(sectionId) ? sectionId : -1,
      parentId,
      currentDisplayType
    );

    if (resolved !== currentDisplayType) {
      this.questionForm.get('displayType')?.setValue(resolved, { emitEvent: false });
    }
  }

  private applyAnswerControlValidators(answerControlType: unknown): void {
    const type = String(answerControlType ?? 'Blank');

    const optionValuesCtrl = this.questionForm.get('optionValues')!;
    const trueLabelCtrl = this.questionForm.get('trueLabel')!;
    const falseLabelCtrl = this.questionForm.get('falseLabel')!;
    const formulaCtrl = this.questionForm.get('formula')!;
    const maxLengthCtrl = this.questionForm.get('maxLength')!;

    // Clear validators first
    optionValuesCtrl.clearValidators();
    trueLabelCtrl.clearValidators();
    falseLabelCtrl.clearValidators();
    formulaCtrl.clearValidators();
    maxLengthCtrl.clearValidators();

    if (type === 'Drop Down') {
      // No required validators — the new Drop Down UI uses dropDownValues/dropDownHeading
    } else if (type === 'Checkbox (True/False)') {
      trueLabelCtrl.setValidators([Validators.required]);
      falseLabelCtrl.setValidators([Validators.required]);
    } else if (type === 'Calculated - Editable' || type === 'Calculated - Non-editable') {
      formulaCtrl.setValidators([Validators.required]);
    } else if (type === 'Entry Box') {
      // Optional in UI, but allow setting a limit
      maxLengthCtrl.setValidators([]);
    }

    // Update validity after changing validators
    optionValuesCtrl.updateValueAndValidity({ emitEvent: false });
    trueLabelCtrl.updateValueAndValidity({ emitEvent: false });
    falseLabelCtrl.updateValueAndValidity({ emitEvent: false });
    formulaCtrl.updateValueAndValidity({ emitEvent: false });
    maxLengthCtrl.updateValueAndValidity({ emitEvent: false });
  }

  getSectionDropdownOptionsForQuestionDialog(): DropdownOption[] {
    return this.questionSections().map(s => ({
      label: s.title,
      value: String(s.id)
    }));
  }

  getParentQuestionOptionsForSectionId(sectionIdValue: unknown): DropdownOption[] {
    const noParent: DropdownOption = { label: 'No Parent Question', value: this.noParentQuestionValue };
    const sectionId = sectionIdValue == null ? null : Number(sectionIdValue);
    if (sectionId == null || !Number.isFinite(sectionId)) return [noParent];

    const section = this.questionSections().find(s => s.id === sectionId);
    if (!section) return [noParent];

    const editingId = this.editingQuestionId();
    const orderMap = new Map(section.questions.map((question, index) => [question.id, index]));
    const parents = section.questions
      .filter(question => this.canBeParentQuestion(section, question, editingId))
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map(question => ({
        label: question.text,
        value: String(question.id)
      }));

    return [noParent, ...parents];
  }

  getRootQuestions(section: QuestionSection): QuestionItem[] {
    const questionsById = new Map(section.questions.map(question => [question.id, question]));
    const roots = section.questions.filter(question => {
      if (question.subQuestionOf == null) return true;
      return !questionsById.has(question.subQuestionOf);
    });
    return this.sortQuestionsBySectionOrder(section, roots);
  }

  getChildQuestions(section: QuestionSection, parentId: number): QuestionItem[] {
    const children = section.questions.filter(question => question.subQuestionOf === parentId);
    return this.sortQuestionsBySectionOrder(section, children);
  }

  isIndentedSubQuestionType(question: QuestionItem): boolean {
    return this.normalizeDisplayType(question.displayType) === this.normalizeDisplayType(this.indentedSubQuestionsValue);
  }

  isTabularSubQuestionType(question: QuestionItem): boolean {
    return this.normalizeDisplayType(question.displayType) === this.normalizeDisplayType(this.tabularSubQuestionsValue);
  }

  shouldRenderChildrenInTabularRow(section: QuestionSection, parent: QuestionItem): boolean {
    if (this.isTabularSubQuestionType(parent)) return true;
    return this.getChildQuestions(section, parent.id).some(child => this.isTabularSubQuestionType(child));
  }

  getTabularQuestionsForParent(section: QuestionSection, parentId: number): QuestionItem[] {
    const children = section.questions.filter(question => question.subQuestionOf === parentId);
    return this.sortQuestionsBySectionOrder(section, children);
  }

  shouldLockDisplayTypeToTabular(): boolean {
    const sectionIdValue = this.questionForm.get('sectionId')?.value;
    const parentValueRaw = this.questionForm.get('subQuestionOf')?.value;
    if (sectionIdValue == null || parentValueRaw == null || parentValueRaw === this.noParentQuestionValue) {
      return false;
    }

    const sectionId = Number(sectionIdValue);
    const parentId = Number(parentValueRaw);
    if (!Number.isFinite(sectionId) || !Number.isFinite(parentId)) {
      return false;
    }

    const section = this.questionSections().find(item => item.id === sectionId);
    if (!section) return false;

    const root = this.getRootQuestionForQuestionId(section, parentId);
    return !!(root && this.isTabularSubQuestionType(root));
  }

  getLevelPrefix(level: number, index: number): string {
    if (level === 1) return `${index + 1}.`;
    if (level === 2) return `${this.toAlphabet(index)}.`;
    return `${this.toRoman(index + 1).toLowerCase()}.`;
  }

  addSubQuestion(sectionId: number, parentQuestionId: number): void {
    const section = this.questionSections().find(item => item.id === sectionId);
    const parent = section?.questions.find(item => item.id === parentQuestionId);
    if (!section || !parent) return;

    if (!this.isIndentedSubQuestionType(parent) && !this.isTabularSubQuestionType(parent)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Display Type Required',
        detail: 'Parent question must use either "has indented sub questions" or "Tabular Sub Questions" to add nested sub questions.',
        life: 3500
      });
      return;
    }

    const parentLevel = this.getQuestionLevel(section, parent.id);
    const rootParent = this.getRootQuestionForQuestionId(section, parent.id);
    const isUnderTabularRoot = !!(rootParent && this.isTabularSubQuestionType(rootParent));
    if (isUnderTabularRoot && parentLevel >= 2) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tabular Limit Reached',
        detail: 'Tabular Sub Questions support only one child level (root -> children).',
        life: 3500
      });
      return;
    }

    if (this.isIndentedSubQuestionType(parent) && parentLevel >= this.maxQuestionLevels) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Max Depth Reached',
        detail: 'Only 3 levels of question hierarchy are supported.',
        life: 3500
      });
      return;
    }

    this.addQuestion(sectionId, parentQuestionId);
  }

  private loadEntityOptions(source: string): void {
    if (source === 'Project') {
      const projects = this.projectService.getProjects();
      if (projects.length > 0) {
        this.entityOptions.set(projects.map(p => ({ label: p.name, value: p.name })));
      } else {
        // Fallback static data
        this.entityOptions.set([
          { label: 'Project Alpha', value: 'Project Alpha' },
          { label: 'Project Beta', value: 'Project Beta' },
          { label: 'Project Gamma', value: 'Project Gamma' }
        ]);
      }
    } else {
      const roundtables = this.roundtableService.getRoundtables();
      if (roundtables.length > 0) {
        this.entityOptions.set(roundtables.map(r => ({ label: r.name, value: r.name })));
      } else {
        // Fallback static data
        this.entityOptions.set([
          { label: 'Credit Cards', value: 'Credit Cards' },
          { label: 'Auto Lending', value: 'Auto Lending' },
          { label: 'Small Business', value: 'Small Business' }
        ]);
      }
    }
  }

  private onSurveyTypeChange(type: string): void {
    const nameCtrl = this.surveyForm.get('surveyName')!;
    const periodCtrl = this.surveyForm.get('period')!;
    const periodNumCtrl = this.surveyForm.get('periodNumber')!;

    if (type === 'Ad Hoc') {
      nameCtrl.enable();
      this.surveyNameDisabled.set(false);
      this.showPeriod.set(false);
      this.showPeriodNumber.set(false);
      periodCtrl.reset();
      periodNumCtrl.reset();
    } else if (type === 'Benchmark') {
      nameCtrl.disable();
      this.surveyNameDisabled.set(true);
      this.showPeriod.set(true);
    }
  }

  private onPeriodChange(period: string): void {
    const periodNumCtrl = this.surveyForm.get('periodNumber')!;
    periodNumCtrl.reset();

    switch (period) {
      case 'Half':
        this.periodNumberOptions.set([
          { label: '1st Half', value: '1st Half' },
          { label: '2nd Half', value: '2nd Half' }
        ]);
        this.showPeriodNumber.set(true);
        break;
      case 'Quarter':
        this.periodNumberOptions.set([
          { label: 'Q1', value: 'Q1' },
          { label: 'Q2', value: 'Q2' },
          { label: 'Q3', value: 'Q3' },
          { label: 'Q4', value: 'Q4' }
        ]);
        this.showPeriodNumber.set(true);
        break;
      case 'Month':
        this.periodNumberOptions.set(
          ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            .map(m => ({ label: m, value: m }))
        );
        this.showPeriodNumber.set(true);
        break;
      default:
        // Annual or null
        this.periodNumberOptions.set([]);
        this.showPeriodNumber.set(false);
        break;
    }
  }

  // ─── Validators ────────────────────────────────────────────

  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const dates = control.value;
    const start = Array.isArray(dates) ? dates[0] : dates;
    if (!start) return null;
    const selected = new Date(start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? null : { notFuture: true };
  }

  private dateRangeSelectionValidator(control: AbstractControl): ValidationErrors | null {
    const dates = control.value;
    if (dates && Array.isArray(dates)) {
      if (!dates[1]) {
        return { incompleteDateRange: true };
      }
    }
    return null;
  }

  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const dates = group.get('dates')?.value;
    const start = dates && Array.isArray(dates) && dates[0] ? dates[0] : null;
    const end = dates && Array.isArray(dates) && dates[1] ? dates[1] : null;
    const alert = group.get('firstAlertDate')?.value;
    const reminder = group.get('reminderDate')?.value;
    const errors: ValidationErrors = {};

    if (alert && start && end) {
      const a = new Date(alert);
      const s = new Date(start);
      const e = new Date(end);
      if (a < s) errors['alertBeforeStart'] = true;
      if (a > e) errors['alertAfterEnd'] = true;
    }

    if (reminder && start && end) {
      const r = new Date(reminder);
      const s = new Date(start);
      const e = new Date(end);
      if (r < s) errors['reminderBeforeStart'] = true;
      if (r > e) errors['reminderAfterEnd'] = true;
    }

    if (reminder && alert) {
      const r = new Date(reminder);
      const a = new Date(alert);
      if (r <= a) errors['reminderBeforeAlert'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  // ─── Year Options ──────────────────────────────────────────

  private buildYearOptions(): void {
    const currentYear = new Date().getFullYear();
    const years: DropdownOption[] = [];
    for (let y = currentYear; y >= currentYear - 10; y--) {
      years.push({ label: String(y), value: String(y) });
    }
    this.yearOptions = years;
  }

  // ─── Stepper ───────────────────────────────────────────────

  goToStep(index: number): void {
    if (this.editMode()) {
      this.currentStep.set(index);
      this.updatePageTitle();
      return;
    }

    if (index < this.currentStep()) {
      this.currentStep.set(index);
      this.updatePageTitle();
      return;
    }
    if (index > this.currentStep() && this.isStepValid(this.currentStep())) {
      this.currentStep.set(index);
      this.updatePageTitle();
    }
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep())) {
      this.currentStep.set(this.currentStep() + 1);
      if (this.currentStep() === 2) {
        this.refreshConfirmClientRows();
      }
      this.updatePageTitle();
    } else {
      this.markStepTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
      this.updatePageTitle();
    }
  }

  private updatePageTitle(): void {
    const label = this.steps[this.currentStep()]?.label.replace('\n', ' ') ?? '';
    this.layoutService.pageTitleOverride.set(label);
  }

  isStepValid(step: number): boolean {
    if (step === 0) {
      return this.isAddSurveyStepValid();
    }
    return true; // Steps 1-3 are placeholders
  }

  isAddSurveyStepValid(): boolean {
    const requiredFields = ['source', 'entity', 'surveyType', 'year', 'dates'];
    for (const field of requiredFields) {
      const ctrl = this.surveyForm.get(field);
      if (ctrl && ctrl.invalid) return false;
    }
    // Check cross-field validations
    if (this.surveyForm.errors) return false;
    return true;
  }

  private markStepTouched(): void {
    this.submitted.set(true);
    const fields = ['source', 'entity', 'surveyType', 'year', 'dates',
      'surveyName', 'period', 'periodNumber', 'firstAlertDate', 'reminderDate'];
    fields.forEach(f => {
      this.surveyForm.get(f)?.markAsTouched();
      this.surveyForm.get(f)?.markAsDirty();
    });
  }

  // ─── Helper Methods ────────────────────────────────────────

  isFieldInvalid(fieldName: string): boolean {
    const ctrl = this.surveyForm.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted()));
  }

  getFieldError(fieldName: string): string {
    const ctrl = this.surveyForm.get(fieldName);
    if (!ctrl || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['incompleteDateRange']) return 'Please select both start and end dates.';
    if (ctrl.errors['notFuture']) return 'Start date must be in the future.';
    return '';
  }
               
  getFormError(errorKey: string): boolean {
    return !!(this.surveyForm.errors && this.surveyForm.errors[errorKey] && this.submitted());
  }
        
  get isDirty(): boolean {
    return this.surveyForm.dirty;
  }

  // ─── Entity Label (for breadcrumb display) ─────────────────

  get entityLabel(): string {
    const source = this.normalizeDropdownValue(this.surveyForm?.get('source')?.value);
    return source === 'Project' ? 'Project' : 'Roundtable';
  }

  private buildSurveyPayloadFromForm(): SurveyPayload {
    const formValue = this.surveyForm.getRawValue();

    if (formValue.surveyType === 'Benchmark') {
      const parts = [formValue.entity, formValue.period, formValue.year];
      if (formValue.periodNumber) {
        parts.splice(2, 0, formValue.periodNumber);
      }
      formValue.surveyName = parts.filter(Boolean).join(' ');
    }

    return {
      source: formValue.source,
      entity: formValue.entity,
      surveyType: formValue.surveyType,
      surveyName: formValue.surveyName || '',
      period: formValue.period || '',
      periodNumber: formValue.periodNumber || '',
      year: formValue.year,
      startDate: formValue.dates && formValue.dates[0] ? new Date(formValue.dates[0]).toISOString() : '',
      endDate: formValue.dates && formValue.dates[1] ? new Date(formValue.dates[1]).toISOString() : '',
      firstAlertDate: formValue.firstAlertDate ? new Date(formValue.firstAlertDate).toISOString() : '',
      reminderDate: formValue.reminderDate ? new Date(formValue.reminderDate).toISOString() : '',
      isInteractiveReports: formValue.isInteractiveReports,
      isActive: formValue.isActive
    };
  }

  private buildStoredSurveyForUpdate(lastStep: number): StoredSurvey | null {
    const id = this.editSurveyId();
    if (id == null) return null;

    return {
      ...this.buildSurveyPayloadFromForm(),
      id,
      lastStep,
      status: 'Draft',
      questionSections: this.questionSections(),
      participantSelections: this.toParticipantSelections()
    };
  }

  private persistQuestionChangesSilently(): void {
    const storedSurvey = this.buildStoredSurveyForUpdate(this.currentStep());
    if (!storedSurvey) return;

    this.surveyService.updateSurvey(storedSurvey, false).subscribe({
      error: (error) => {
        console.error('Failed to autosave question changes', error);
      }
    });
  }

  private ensureSurveyDraft(step: number, onSuccess: () => void): void {
    const existingSurvey = this.buildStoredSurveyForUpdate(step);
    if (existingSurvey) {
      this.surveyService.updateSurvey(existingSurvey, false).subscribe({
        next: (res) => {
          this.editSurveyId.set(res.survey.id);
          this.savedParticipantSelectionsSnapshot = this.toParticipantSelections();
          onSuccess();
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save survey draft.',
            life: 4000
          });
        }
      });
      return;
    }

    const payload = this.buildSurveyPayloadFromForm();
    this.surveyService.saveSurvey(payload, step, this.questionSections(), this.toParticipantSelections(), false).subscribe({
      next: (res) => {
        this.editSurveyId.set(res.survey.id);
        this.savedParticipantSelectionsSnapshot = this.toParticipantSelections();
        onSuccess();
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save survey draft.',
          life: 4000
        });
      }
    });
  }

  // ─── Actions ───────────────────────────────────────────────

  onSave(): void {
    this.submitted.set(true);
    this.markStepTouched();

    if (!this.isAddSurveyStepValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly.',
        life: 4000
      });
      return;
    }

    this.saving.set(true);
    const storedSurvey = this.buildStoredSurveyForUpdate(this.currentStep());
    
    if (storedSurvey) {
      // Update existing draft (even if we are in Add Mode UI)
      this.surveyService.updateSurvey(storedSurvey).subscribe({
        next: () => {
          this.saving.set(false);
          this.surveyForm.markAsPristine();
          this.router.navigate(['/surveys/view']);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update survey. Please try again.',
            life: 4000
          });
        }
      });
    } else {
      // Create new survey
      this.surveyService.saveSurvey(
        this.buildSurveyPayloadFromForm(),
        this.currentStep(),
        this.questionSections(),
        this.toParticipantSelections()
      ).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.surveyForm.markAsPristine();
          this.router.navigate(['/surveys/view']);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save survey. Please try again.',
            life: 4000
          });
        }
      });
    }
  }

  onAddQuestions(): void {
    this.submitted.set(true);
    if (!this.isAddSurveyStepValid()) {
      this.markStepTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Complete the Add Survey step before proceeding.',
        life: 4000
      });
      return;
    }
    this.saving.set(true);
    this.ensureSurveyDraft(1, () => {
      this.saving.set(false);
      this.currentStep.set(1);
      this.updatePageTitle();
    });
  }


  saveEmailFormat(): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email format saved.' });
  }

  launchSurvey(): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Survey Launched!' });
  }

  designReport(): void {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Design Report feature pending.' });
  }

  addNewSection(): void {
    this.sectionSubmitted.set(false);
    this.editingSectionId.set(null);
    this.sectionForm.reset({ name: '', description: '' });
    this.showSectionDialog.set(true);
  }

  editSection(sectionId: number): void {
    const section = this.questionSections().find(item => item.id === sectionId);
    if (!section) return;

    this.sectionSubmitted.set(false);
    this.editingSectionId.set(sectionId);
    this.sectionForm.reset({
      name: section.title,
      description: section.description
    });
    this.showSectionDialog.set(true);
  }

  saveSection(): void {
    this.sectionSubmitted.set(true);
    if (this.sectionForm.invalid) {
      this.sectionForm.markAllAsTouched();
      return;
    }

    const name = (this.sectionForm.get('name')?.value ?? '').trim();
    const description = (this.sectionForm.get('description')?.value ?? '').trim();
    const editingId = this.editingSectionId();

    if (editingId) {
      this.questionSections.update(sections =>
        sections.map(section =>
          section.id === editingId
            ? { ...section, title: name, description }
            : section
        )
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Section updated successfully.',
        life: 2500
      });
    } else {
      const sectionId = this.nextSectionId++;
      const newSection: QuestionSection = {
        id: sectionId,
        title: name,
        description,
        expanded: true,
        questions: []
      };

      this.questionSections.update(sections =>
        sections.map(section => ({ ...section, expanded: false })).concat(newSection)
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Section added successfully.',
        life: 2500
      });
    }

    this.showSectionDialog.set(false);
    this.editingSectionId.set(null);
    this.persistQuestionChangesSilently();
  }

  closeSectionDialog(): void {
    this.showSectionDialog.set(false);
    this.editingSectionId.set(null);
    this.sectionSubmitted.set(false);
  }

  confirmDeleteSection(sectionId: number): void {
    this.deletingSectionId.set(sectionId);
    this.showDeleteSectionDialog.set(true);
  }

  deleteSection(): void {
    const sectionId = this.deletingSectionId();
    if (!sectionId) return;

    this.questionSections.update(sections => sections.filter(section => section.id !== sectionId));
    this.showDeleteSectionDialog.set(false);
    this.deletingSectionId.set(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Section deleted successfully.',
      life: 2500
    });
    this.persistQuestionChangesSilently();
  }

  cancelDeleteSection(): void {
    this.showDeleteSectionDialog.set(false);
    this.deletingSectionId.set(null);
  }

  addQuestion(sectionId?: number, parentQuestionId?: number): void {
    const sections = this.questionSections();
    if (!sections.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Section Required',
        detail: 'Please add at least one section first.',
        life: 3000
      });
      return;
    }

    const fallbackSectionId = sections[0]?.id ?? null;
    const targetSectionId = sectionId ?? fallbackSectionId;
    this.selectedSectionIdForQuestion.set(targetSectionId);

    const initialParentValue = parentQuestionId == null
      ? this.noParentQuestionValue
      : String(parentQuestionId);
    const defaultDisplayType = this.getDefaultDisplayTypeForNewQuestion(targetSectionId, parentQuestionId);

    this.editingQuestionId.set(null);
    this.questionSubmitted.set(false);
    this.questionForm.reset({
      sectionId: targetSectionId == null ? null : String(targetSectionId),
      subQuestionOf: initialParentValue,
      questionText: '',
      questionDescription: '',
      visibleToClients: true,
      displayType: defaultDisplayType,
      answerControlType: 'Blank',
      sentimentValue: '0',
      metricReportable: false,
      showIndividualResponses: false,
      showInExecutiveSummary: false,
      includeInVarianceTracker: false,
      showInChartGenerator: false,
      allowAutoMarkNA: false,
      optionValues: '',
      trueLabel: 'True',
      falseLabel: 'False',
      formula: '',
      maxLength: null,
      entryBoxSize: 'Small',
      requiredAnswerType: 'Numeric',
      decimalsOnReport: '2',
      existingDropdownList: null,
      dropDownHeading: '',
      dropDownValues: '',
      showNAInDropDown: true,
      showNTInDropDown: true
    });

    this.updateSubQuestionControl(targetSectionId);
    if (parentQuestionId != null) {
      const options = this.getParentQuestionOptionsForSectionId(targetSectionId);
      const parentAsValue = String(parentQuestionId);
      const isParentAllowed = options.some(option => option.value === parentAsValue);
      this.questionForm.get('subQuestionOf')?.setValue(
        isParentAllowed ? parentAsValue : this.noParentQuestionValue,
        { emitEvent: false }
      );
    }
    this.applyAnswerControlValidators(this.questionForm.get('answerControlType')?.value);
    this.showQuestionDialog.set(true);
  }

  saveQuestion(): void {
    this.questionSubmitted.set(true);
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }

    const value = this.questionForm.value;
    const sectionId = Number(value.sectionId);
    const questionText = (value.questionText ?? '').trim();
    const questionDescription = (value.questionDescription ?? '').trim();
    const parentValue = value.subQuestionOf === this.noParentQuestionValue
      ? null
      : Number(value.subQuestionOf);

    const payload: Omit<QuestionItem, 'id'> = {
      sectionId,
      subQuestionOf: parentValue,
      text: questionText,
      description: questionDescription || undefined,

      visibleToClients: !!value.visibleToClients,
      displayType: this.resolveDisplayTypeForSave(sectionId, parentValue, value.displayType),
      answerControlType: value.answerControlType,
      sentimentValue: value.sentimentValue,
      metricReportable: !!value.metricReportable,
      showIndividualResponses: !!value.showIndividualResponses,
      showInExecutiveSummary: !!value.showInExecutiveSummary,
      includeInVarianceTracker: !!value.includeInVarianceTracker,
      showInChartGenerator: !!value.showInChartGenerator,
      allowAutoMarkNA: !!value.allowAutoMarkNA,

      optionValues: value.optionValues?.trim?.() ? String(value.optionValues).trim() : (value.optionValues || undefined),
      trueLabel: value.trueLabel?.trim?.() ? String(value.trueLabel).trim() : (value.trueLabel || undefined),
      falseLabel: value.falseLabel?.trim?.() ? String(value.falseLabel).trim() : (value.falseLabel || undefined),
      formula: value.formula?.trim?.() ? String(value.formula).trim() : (value.formula || undefined),
      maxLength: value.maxLength != null && value.maxLength !== '' ? Number(value.maxLength) : null,

      // Entry Box specific
      entryBoxSize: value.entryBoxSize || undefined,
      requiredAnswerType: value.requiredAnswerType || undefined,
      decimalsOnReport: value.decimalsOnReport ?? undefined,

      // Drop Down specific
      existingDropdownList: value.existingDropdownList || undefined,
      dropDownHeading: value.dropDownHeading?.trim?.() || undefined,
      dropDownValues: value.dropDownValues?.trim?.() || undefined,
      showNAInDropDown: value.showNAInDropDown ?? true,
      showNTInDropDown: value.showNTInDropDown ?? true
    };

    const editingId = this.editingQuestionId();

    this.questionSections.update(sections =>
      sections.map(section => {
        // Edit mode: update the matching question (even if moved between sections)
        if (editingId != null) {
          const isInThisSection = section.id === sectionId;
          if (!isInThisSection) return section;

          return {
            ...section,
            expanded: true,
            questions: section.questions.map(q => q.id === editingId ? { ...q, ...payload } : q)
          };
        }

        // Add mode: append to selected section
        if (section.id !== sectionId) return section;

        return {
          ...section,
          expanded: true,
          questions: section.questions.concat({
            id: this.nextQuestionId++,
            ...payload
          })
        };
      }).map(section => {
        // In edit mode, if sectionId changed, remove from sections other than the target.
        if (editingId == null) return section;
        if (section.id === sectionId) return section;
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== editingId)
        };
      })
    );
    this.enforceTabularHierarchyDisplayTypes();

    this.showQuestionDialog.set(false);
    this.editingQuestionId.set(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: editingId != null ? 'Question updated successfully.' : 'Question added successfully.',
      life: 2500
    });
    this.persistQuestionChangesSilently();
  }

  resetQuestionForm(): void {
    const sectionId = this.selectedSectionIdForQuestion();
    this.questionForm.reset({
      sectionId: sectionId == null ? null : String(sectionId),
      subQuestionOf: this.noParentQuestionValue,
      questionText: '',
      questionDescription: '',
      visibleToClients: true,
      displayType: 'has indented sub questions',
      answerControlType: 'Blank',
      sentimentValue: '0',
      metricReportable: false,
      showIndividualResponses: false,
      showInExecutiveSummary: false,
      includeInVarianceTracker: false,
      showInChartGenerator: false,
      allowAutoMarkNA: false,
      optionValues: '',
      trueLabel: 'True',
      falseLabel: 'False',
      formula: '',
      maxLength: null,
      entryBoxSize: 'Small',
      requiredAnswerType: 'Numeric',
      decimalsOnReport: '2',
      existingDropdownList: null,
      dropDownHeading: '',
      dropDownValues: '',
      showNAInDropDown: true,
      showNTInDropDown: true
    });
    this.questionSubmitted.set(false);
    this.applyAnswerControlValidators(this.questionForm.get('answerControlType')?.value);
  }

  closeQuestionDialog(): void {
    this.showQuestionDialog.set(false);
    this.questionSubmitted.set(false);
    this.editingQuestionId.set(null);
  }

  editQuestion(sectionId: number, questionId: number): void {
    const section = this.questionSections().find(s => s.id === sectionId);
    const question = section?.questions.find(q => q.id === questionId);
    if (!section || !question) return;

    this.selectedSectionIdForQuestion.set(sectionId);
    this.editingQuestionId.set(questionId);
    this.questionSubmitted.set(false);

    this.questionForm.reset({
      sectionId: String(sectionId),
      subQuestionOf: question.subQuestionOf == null ? this.noParentQuestionValue : String(question.subQuestionOf),
      questionText: question.text,
      questionDescription: question.description ?? '',
      visibleToClients: question.visibleToClients,
      displayType: question.displayType,
      answerControlType: question.answerControlType,
      sentimentValue: question.sentimentValue,
      metricReportable: question.metricReportable,
      showIndividualResponses: question.showIndividualResponses,
      showInExecutiveSummary: question.showInExecutiveSummary,
      includeInVarianceTracker: question.includeInVarianceTracker,
      showInChartGenerator: question.showInChartGenerator,
      allowAutoMarkNA: question.allowAutoMarkNA,

      optionValues: question.optionValues ?? '',
      trueLabel: question.trueLabel ?? 'True',
      falseLabel: question.falseLabel ?? 'False',
      formula: question.formula ?? '',
      maxLength: question.maxLength ?? null,
      entryBoxSize: question.entryBoxSize ?? 'Small',
      requiredAnswerType: question.requiredAnswerType ?? 'Numeric',
      decimalsOnReport: question.decimalsOnReport ?? '2',
      existingDropdownList: question.existingDropdownList ?? null,
      dropDownHeading: question.dropDownHeading ?? '',
      dropDownValues: question.dropDownValues ?? '',
      showNAInDropDown: question.showNAInDropDown ?? true,
      showNTInDropDown: question.showNTInDropDown ?? true
    });

    this.applyAnswerControlValidators(this.questionForm.get('answerControlType')?.value);
    this.updateSubQuestionControl(sectionId);
    this.showQuestionDialog.set(true);
  }

  confirmDeleteQuestion(sectionId: number, questionId: number): void {
    this.deletingQuestionSectionId.set(sectionId);
    this.deletingQuestionId.set(questionId);
    this.showDeleteQuestionDialog.set(true);
  }

  deleteQuestion(): void {
    const sectionId = this.deletingQuestionSectionId();
    const questionId = this.deletingQuestionId();
    if (sectionId == null || questionId == null) return;

    this.questionSections.update(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, expanded: true, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    );

    this.showDeleteQuestionDialog.set(false);
    this.deletingQuestionSectionId.set(null);
    this.deletingQuestionId.set(null);

    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Question deleted successfully.',
      life: 2500
    });
    this.persistQuestionChangesSilently();
  }

  cancelDeleteQuestion(): void {
    this.showDeleteQuestionDialog.set(false);
    this.deletingQuestionSectionId.set(null);
    this.deletingQuestionId.set(null);
  }

  toggleSection(sectionId: number): void {
    this.questionSections.update(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  }

  onDeleteAllQuestions(): void {
    this.questionSections.set([]);
    this.persistQuestionChangesSilently();
  }

  downloadTemplate(): void {
    const headers = [
      'Section Name',
      'Sub Question Of (Parent ID/Text)',
      'Question Text',
      'Question Description',
      'Visible To Clients',
      'Display Type',
      'Answer Control Type'
    ];
    
    const sampleData = [
      ['General Info', '', 'What is your primary region?', 'Specify the region you operate in.', 'true', 'No Related Sub Questions', 'Drop Down'],
      ['General Info', '', 'Are you satisfied with the service?', '', 'true', 'has indented sub questions', 'Checkbox (True/False)']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'survey_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  openExplanationDialog(): void {
    this.explanationDraft.set(this.questionExplanation());
    this.showExplanationDialog.set(true);
  }

  closeExplanationDialog(): void {
    this.showExplanationDialog.set(false);
  }

  onExplanationInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this.explanationDraft.set(target?.value ?? '');
  }

  saveExplanation(): void {
    const explanation = this.explanationDraft().trim();
    if (!explanation) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Explanation Required',
        detail: 'Please enter an explanation before saving.',
        life: 3000
      });
      return;
    }

    this.questionExplanation.set(explanation);
    this.showExplanationDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Saved',
      detail: 'Explanation added successfully.',
      life: 2500
    });
  }

  get selectedEntityName(): string {
    const value = this.surveyForm?.get('entity')?.value;
    if (typeof value === 'string') return value || '-';
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return String(record['label'] ?? record['value'] ?? '-');
    }
    return '-';
  }

  get selectedSurveyName(): string {
    return this.surveyForm?.get('surveyName')?.value || '-';
  }

  saveConfirmClients(): void {
    this.saving.set(true);
    this.ensureSurveyDraft(2, () => {
      this.saving.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Saved',
        detail: 'Client participation settings saved.',
        life: 2500
      });
    });
  }

  reviewParticipants(): void {
    this.saveConfirmClients();
  }

  reviewEmail(): void {
    this.saving.set(true);
    this.ensureSurveyDraft(3, () => {
      this.saving.set(false);
      this.currentStep.set(3);
      this.updatePageTitle();
    });
  }

  resetConfirmClients(): void {
    this.confirmClientRows.update(rows =>
      rows.map(row => ({
        ...row,
        receiveSurvey: true,
        allowParticipation: true
      }))
    );
  }

  onConfirmClientCheckboxChange(event: Table1CheckboxChangeEvent): void {
    this.confirmClientRows.update(rows =>
      rows.map(row => {
        if (row.id !== event.row.id || row.source !== event.row.source) return row;

        if (event.field === 'receiveSurvey') {
          return {
            ...row,
            receiveSurvey: event.checked,
            allowParticipation: event.checked ? true : false
          };
        }

        if (event.field === 'allowParticipation') {
          if (!row.receiveSurvey) {
            return row;
          }
          return {
            ...row,
            allowParticipation: event.checked
          };
        }

        return row;
      })
    );
  }

  isConfirmClientCheckboxDisabled = (row: ConfirmClientRow, field: string): boolean => {
    return field === 'allowParticipation' && !row.receiveSurvey;
  };

  onCancel(): void {
    if (this.isDirty) {
      this.showCancelDialog.set(true);
    } else {
      this.router.navigate(['/surveys/view']);
    }
  }

  onConfirmLeave(): void {
    this.showCancelDialog.set(false);
    this.surveyForm.reset({ source: 'Roundtable', isActive: true });
    this.submitted.set(false);
    this.router.navigate(['/surveys/view']);
  }

  onKeepEditing(): void {
    this.showCancelDialog.set(false);
  }

  private initializeConfirmClientRows(savedSelections?: SurveyParticipantSelection[]): void {
    const source = this.getCurrentSurveySource();
    const existingRows = new Map(
      this.confirmClientRows().map(row => [this.getConfirmClientRowKey(row.source, row.id), row])
    );
    const savedRows = new Map(
      (savedSelections ?? []).map(selection => {
        const selectionSource = selection.source ?? source;
        return [this.getConfirmClientRowKey(selectionSource, Number(selection.id)), selection] as const;
      })
    );

    const clients: Client[] = this.clientService.getClients();
    const filteredClients = this.filterClientsByEntity(clients, source);

    this.confirmClientRows.set(
      filteredClients.map(client => {
        const key = this.getConfirmClientRowKey(source, client.id);
        const existing = existingRows.get(key);
        const saved = savedRows.get(key);
        const receiveSurvey = saved?.receiveSurvey ?? existing?.receiveSurvey ?? true;
        const allowParticipation = saved?.allowParticipation ?? existing?.allowParticipation ?? true;
        return {
          id: client.id,
          source,
          clientName: client.name || '-',
          clientAbbreviation: client.abbreviation || '-',
          receiveSurvey,
          allowParticipation: receiveSurvey ? allowParticipation : false
        };
      })
    );
  }

  private filterClientsByEntity(clients: Client[], source: 'Roundtable' | 'Project'): Client[] {
    const entityName = this.normalizeDropdownValue(this.surveyForm?.get('entity')?.value);
    if (!entityName) return clients;

    if (source === 'Project') {
      const project = this.projectService.getProjects().find(p => p.name === entityName);
      if (!project) return [];
      const projectId = project.id;
      return clients.filter(c => (c.projectIds || []).map(Number).includes(projectId));
    }

    const roundtable = this.roundtableService.getRoundtables().find(r => r.name === entityName);
    if (!roundtable) return [];
    const roundtableId = roundtable.id;
    return clients.filter(c => (c.roundtableIds || []).map(Number).includes(roundtableId));
  }

  private refreshConfirmClientRows(savedSelections?: SurveyParticipantSelection[]): void {
    const refreshVersion = ++this.confirmRowsRefreshVersion;
    const selectionsToApply =
      savedSelections
      ?? (this.confirmClientRows().length
        ? this.toParticipantSelections()
        : this.savedParticipantSelectionsSnapshot);

    const source = this.getCurrentSurveySource();
    const entityLoad =
      source === 'Project'
        ? this.projectService.loadProjects()
        : this.roundtableService.loadRoundtables();

    Promise.allSettled([entityLoad, this.clientService.loadClients()]).then(() => {
      if (refreshVersion !== this.confirmRowsRefreshVersion) return;
      if (this.getCurrentSurveySource() === source) {
        this.loadEntityOptions(source);
      }
      this.initializeConfirmClientRows(selectionsToApply);
    });
  }

  private toParticipantSelections(): SurveyParticipantSelection[] {
    return this.confirmClientRows().map(row => ({
      id: row.id,
      source: row.source,
      clientName: row.clientName,
      clientAbbreviation: row.clientAbbreviation,
      receiveSurvey: row.receiveSurvey,
      allowParticipation: row.allowParticipation
    }));
  }

  private getCurrentSurveySource(): 'Roundtable' | 'Project' {
    const source = this.normalizeDropdownValue(this.surveyForm?.get('source')?.value);
    return source === 'Project' ? 'Project' : 'Roundtable';
  }

  private getConfirmClientRowKey(source: string, id: number): string {
    return `${source}:${id}`;
  }

  private normalizeDropdownValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
      const inner = (value as Record<string, unknown>)['value'];
      return inner == null ? '' : String(inner);
    }
    return '';
  }

  private sortQuestionsBySectionOrder(section: QuestionSection, questions: QuestionItem[]): QuestionItem[] {
    const orderMap = new Map(section.questions.map((question, index) => [question.id, index]));
    return [...questions].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
  }

  private normalizeDisplayType(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase();
  }

  private getDefaultDisplayTypeForNewQuestion(sectionId: number | null, parentQuestionId: number | undefined): string {
    if (sectionId == null || parentQuestionId == null) {
      return this.indentedSubQuestionsValue;
    }

    const section = this.questionSections().find(item => item.id === sectionId);
    if (!section) return this.indentedSubQuestionsValue;

    const root = this.getRootQuestionForQuestionId(section, parentQuestionId);
    return root && this.isTabularSubQuestionType(root)
      ? this.tabularSubQuestionsValue
      : this.indentedSubQuestionsValue;
  }

  private resolveDisplayTypeForSave(
    sectionId: number,
    parentId: number | null,
    selectedDisplayType: string | undefined
  ): string {
    if (parentId == null) {
      return selectedDisplayType || this.indentedSubQuestionsValue;
    }

    const section = this.questionSections().find(item => item.id === sectionId);
    if (!section) {
      return selectedDisplayType || this.indentedSubQuestionsValue;
    }

    const root = this.getRootQuestionForQuestionId(section, parentId);
    if (root && this.isTabularSubQuestionType(root)) {
      return this.tabularSubQuestionsValue;
    }

    return selectedDisplayType || this.indentedSubQuestionsValue;
  }

  private enforceTabularHierarchyDisplayTypes(): void {
    this.questionSections.update(sections => sections.map(section => this.enforceTabularForSection(section)));
  }

  private enforceTabularForSection(section: QuestionSection): QuestionSection {
    const questionsById = new Map(section.questions.map(question => [question.id, question]));
    const cache = new Map<number, boolean>();

    const hasTabularRoot = (question: QuestionItem): boolean => {
      const cached = cache.get(question.id);
      if (cached != null) return cached;

      let current: QuestionItem | undefined = question;
      const visited = new Set<number>();
      while (current) {
        if (this.isTabularSubQuestionType(current)) {
          cache.set(question.id, true);
          return true;
        }
        if (current.subQuestionOf == null || visited.has(current.id)) break;
        visited.add(current.id);
        current = questionsById.get(current.subQuestionOf);
      }

      cache.set(question.id, false);
      return false;
    };

    const updatedQuestions = section.questions.map(question => {
      if (!hasTabularRoot(question)) {
        return question;
      }
      if (this.isTabularSubQuestionType(question)) {
        return question;
      }
      return {
        ...question,
        displayType: this.tabularSubQuestionsValue
      };
    });

    return {
      ...section,
      questions: updatedQuestions
    };
  }

  private getQuestionById(section: QuestionSection, questionId: number): QuestionItem | undefined {
    return section.questions.find(question => question.id === questionId);
  }

  private getRootQuestionForQuestionId(section: QuestionSection, questionId: number): QuestionItem | undefined {
    const questionsById = new Map(section.questions.map(question => [question.id, question]));
    let current = questionsById.get(questionId);
    if (!current) return undefined;

    const visited = new Set<number>();
    while (current?.subQuestionOf != null) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      const parent = questionsById.get(current.subQuestionOf);
      if (!parent) break;
      current = parent;
    }

    return current;
  }

  private getQuestionLevel(section: QuestionSection, questionId: number): number {
    const questionsById = new Map(section.questions.map(question => [question.id, question]));
    let depth = 1;
    let current = questionsById.get(questionId);
    const visited = new Set<number>();

    while (current?.subQuestionOf != null) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const parent = questionsById.get(current.subQuestionOf);
      if (!parent) break;

      depth += 1;
      current = parent;
    }

    return depth;
  }

  private isDescendant(section: QuestionSection, questionId: number, possibleAncestorId: number): boolean {
    const questionsById = new Map(section.questions.map(question => [question.id, question]));
    let current = questionsById.get(questionId);
    const visited = new Set<number>();

    while (current?.subQuestionOf != null) {
      if (visited.has(current.id)) return false;
      visited.add(current.id);

      if (current.subQuestionOf === possibleAncestorId) return true;
      current = questionsById.get(current.subQuestionOf);
    }

    return false;
  }

  private canBeParentQuestion(section: QuestionSection, question: QuestionItem, editingId: number | null): boolean {
    const level = this.getQuestionLevel(section, question.id);
    const isIndentedParent = this.isIndentedSubQuestionType(question);
    const isTabularParent = this.isTabularSubQuestionType(question);
    const root = this.getRootQuestionForQuestionId(section, question.id);
    const isUnderTabularRoot = !!(root && this.isTabularSubQuestionType(root));

    if (!isIndentedParent && !isTabularParent) return false;
    if (isIndentedParent && level >= this.maxQuestionLevels) return false;
    if (isUnderTabularRoot && level >= 2) return false;

    if (editingId == null) return true;
    if (question.id === editingId) return false;
    if (this.isDescendant(section, question.id, editingId)) return false;
    return true;
  }

  private collectTabularDescendants(
    section: QuestionSection,
    parentId: number,
    out: QuestionItem[],
    visited: Set<number>
  ): void {
    const children = this.getChildQuestions(section, parentId);
    for (const child of children) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);
      out.push(child);
      this.collectTabularDescendants(section, child.id, out, visited);
    }
  }

  private toAlphabet(index: number): string {
    let n = index + 1;
    let out = '';
    while (n > 0) {
      n -= 1;
      out = String.fromCharCode(97 + (n % 26)) + out;
      n = Math.floor(n / 26);
    }
    return out;
  }

  private toRoman(value: number): string {
    const map: Array<[number, string]> = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let n = Math.max(1, value);
    let result = '';
    for (const [num, symbol] of map) {
      while (n >= num) {
        result += symbol;
        n -= num;
      }
    }
    return result;
  }
}
