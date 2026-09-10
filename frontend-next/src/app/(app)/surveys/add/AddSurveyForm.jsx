'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { Dialog } from 'primereact/dialog';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Editor } from 'primereact/editor';
import { Stepper } from '@/components/shared/Stepper';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { Table1 } from '@/components/shared/Table1';
import { useLayout } from '@/context/LayoutContext';
import { showToast } from '@/lib/toast';
import {
  saveSurvey,
  updateSurvey,
  getSurveyById,
  loadSurveyById,
} from '@/services/surveyService';
import { getProjects, loadProjects } from '@/services/projectService';
import { getRoundtables, loadRoundtables } from '@/services/roundtableService';
import { getClients, loadClients } from '@/services/clientService';
import './add-survey.css';

// ─── Constants ──────────────────────────────────────────────
const NO_PARENT_QUESTION_VALUE = 'NO_PARENT';
const INDENTED_SUB_QUESTIONS_VALUE = 'has indented sub questions';
const TABULAR_SUB_QUESTIONS_VALUE = 'Tabular Sub Questions';
const MAX_QUESTION_LEVELS = 3;

const ADD_STEPS = [
  { label: 'Add Survey' },
  { label: 'Add Questions' },
  { label: 'Confirm Clients & Review Participants' },
  { label: 'Review Email' },
];

const EDIT_STEPS = [
  { label: 'Update Survey' },
  { label: 'Update Questions' },
  { label: 'Confirm Clients & Review Participants' },
  { label: 'Review Email' },
];

const DISPLAY_TYPE_OPTIONS = [
  { label: 'has indented sub questions', value: 'has indented sub questions' },
  { label: 'Tabular Sub Questions', value: 'Tabular Sub Questions' },
  { label: 'No Related Sub Questions', value: 'No Related Sub Questions' },
];

const ENTRY_BOX_SIZE_OPTIONS = [
  { label: 'Small', value: 'Small' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Large', value: 'Large' },
  { label: 'Multi-line', value: 'Multi-line' },
];

const REQUIRED_ANSWER_TYPE_OPTIONS = [
  { label: 'Date', value: 'Date' },
  { label: 'Money', value: 'Money' },
  { label: 'Text', value: 'Text' },
  { label: 'Numeric', value: 'Numeric' },
  { label: 'Percentage', value: 'Percentage' },
];

const EXISTING_DROPDOWN_LIST_OPTIONS = [
  { label: 'Add New', value: 'Add New' },
  { label: 'Yes/No', value: 'Yes/No' },
];

const ANSWER_CONTROL_TYPE_OPTIONS = [
  { label: 'Blank', value: 'Blank' },
  { label: 'Entry Box', value: 'Entry Box' },
  { label: 'Drop Down', value: 'Drop Down' },
  { label: 'Checkbox (True/False)', value: 'Checkbox (True/False)' },
  { label: 'Calculated - Editable', value: 'Calculated - Editable' },
  { label: 'Calculated - Non-editable', value: 'Calculated - Non-editable' },
];

const SENTIMENT_OPTIONS = [
  { label: '-1', value: '-1' },
  { label: '0', value: '0' },
  { label: '1', value: '1' },
];

const SOURCE_OPTIONS = [
  { label: 'Roundtable', value: 'Roundtable' },
  { label: 'Project', value: 'Project' },
];

const SURVEY_TYPE_OPTIONS = [
  { label: 'Ad Hoc', value: 'Ad Hoc' },
  { label: 'Benchmark', value: 'Benchmark' },
];

const PERIOD_OPTIONS = [
  { label: 'Annual', value: 'Annual' },
  { label: 'Half', value: 'Half' },
  { label: 'Quarter', value: 'Quarter' },
  { label: 'Month', value: 'Month' },
];

const CONFIRM_CLIENT_COLUMNS = [
  { field: 'clientName', header: 'Client Name' },
  { field: 'clientAbbreviation', header: 'Client Abbreviation' },
  { field: 'receiveSurvey', header: 'Receive Survey?', type: 'checkbox' },
  { field: 'allowParticipation', header: 'Allow Participation?', type: 'checkbox' },
];

const EMPTY_FORM = {
  source: 'Roundtable',
  entity: null,
  surveyType: null,
  surveyName: '',
  period: null,
  periodNumber: null,
  year: null,
  dates: null,
  firstAlertDate: null,
  reminderDate: null,
  isInteractiveReports: false,
  isActive: true,
};

const EMPTY_QUESTION_FORM = {
  sectionId: null,
  subQuestionOf: NO_PARENT_QUESTION_VALUE,
  questionText: '',
  questionDescription: '',
  visibleToClients: true,
  displayType: 'Indented Sub Questions',
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
  showNTInDropDown: true,
};

// ─── Pure helpers ────────────────────────────────────────────
function normalizeDisplayType(value) {
  return (value ?? '').trim().toLowerCase();
}

function isIndentedSubQuestionType(question) {
  return normalizeDisplayType(question.displayType) === normalizeDisplayType(INDENTED_SUB_QUESTIONS_VALUE);
}

function isTabularSubQuestionType(question) {
  return normalizeDisplayType(question.displayType) === normalizeDisplayType(TABULAR_SUB_QUESTIONS_VALUE);
}

function sortQuestionsBySectionOrder(section, questions) {
  const orderMap = new Map(section.questions.map((question, index) => [question.id, index]));
  return [...questions].sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
}

function getRootQuestions(section) {
  const questionsById = new Map(section.questions.map((question) => [question.id, question]));
  const roots = section.questions.filter((question) => {
    if (question.subQuestionOf == null) return true;
    return !questionsById.has(question.subQuestionOf);
  });
  return sortQuestionsBySectionOrder(section, roots);
}

function getChildQuestions(section, parentId) {
  const children = section.questions.filter((question) => question.subQuestionOf === parentId);
  return sortQuestionsBySectionOrder(section, children);
}

function getTabularQuestionsForParent(section, parentId) {
  const children = section.questions.filter((question) => question.subQuestionOf === parentId);
  return sortQuestionsBySectionOrder(section, children);
}

function getRootQuestionForQuestionId(section, questionId) {
  const questionsById = new Map(section.questions.map((question) => [question.id, question]));
  let current = questionsById.get(questionId);
  if (!current) return undefined;
  const visited = new Set();
  while (current?.subQuestionOf != null) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    const parent = questionsById.get(current.subQuestionOf);
    if (!parent) break;
    current = parent;
  }
  return current;
}

function getQuestionLevel(section, questionId) {
  const questionsById = new Map(section.questions.map((question) => [question.id, question]));
  let depth = 1;
  let current = questionsById.get(questionId);
  const visited = new Set();
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

function isDescendant(section, questionId, possibleAncestorId) {
  const questionsById = new Map(section.questions.map((question) => [question.id, question]));
  let current = questionsById.get(questionId);
  const visited = new Set();
  while (current?.subQuestionOf != null) {
    if (visited.has(current.id)) return false;
    visited.add(current.id);
    if (current.subQuestionOf === possibleAncestorId) return true;
    current = questionsById.get(current.subQuestionOf);
  }
  return false;
}

function canBeParentQuestion(section, question, editingId) {
  const level = getQuestionLevel(section, question.id);
  const isIndentedParent = isIndentedSubQuestionType(question);
  const isTabularParent = isTabularSubQuestionType(question);
  const root = getRootQuestionForQuestionId(section, question.id);
  const isUnderTabularRoot = !!(root && isTabularSubQuestionType(root));

  if (!isIndentedParent && !isTabularParent) return false;
  if (isIndentedParent && level >= MAX_QUESTION_LEVELS) return false;
  if (isUnderTabularRoot && level >= 2) return false;

  if (editingId == null) return true;
  if (question.id === editingId) return false;
  if (isDescendant(section, question.id, editingId)) return false;
  return true;
}

function shouldRenderChildrenInTabularRow(section, parent) {
  if (isTabularSubQuestionType(parent)) return true;
  return getChildQuestions(section, parent.id).some((child) => isTabularSubQuestionType(child));
}

function getSectionDropdownOptions(sections) {
  return sections.map((s) => ({ label: s.title, value: String(s.id) }));
}

function getParentQuestionOptionsForSectionId(sections, sectionIdValue, editingId) {
  const noParent = { label: 'No Parent Question', value: NO_PARENT_QUESTION_VALUE };
  const sectionId = sectionIdValue == null ? null : Number(sectionIdValue);
  if (sectionId == null || !Number.isFinite(sectionId)) return [noParent];

  const section = sections.find((s) => s.id === sectionId);
  if (!section) return [noParent];

  const orderMap = new Map(section.questions.map((question, index) => [question.id, index]));
  const parents = section.questions
    .filter((question) => canBeParentQuestion(section, question, editingId))
    .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    .map((question) => ({ label: question.text, value: String(question.id) }));

  return [noParent, ...parents];
}

function getDefaultDisplayTypeForNewQuestion(sections, sectionId, parentQuestionId) {
  if (sectionId == null || parentQuestionId == null) {
    return INDENTED_SUB_QUESTIONS_VALUE;
  }
  const section = sections.find((item) => item.id === sectionId);
  if (!section) return INDENTED_SUB_QUESTIONS_VALUE;
  const root = getRootQuestionForQuestionId(section, parentQuestionId);
  return root && isTabularSubQuestionType(root) ? TABULAR_SUB_QUESTIONS_VALUE : INDENTED_SUB_QUESTIONS_VALUE;
}

function resolveDisplayTypeForSave(sections, sectionId, parentId, selectedDisplayType) {
  if (parentId == null) {
    return selectedDisplayType || INDENTED_SUB_QUESTIONS_VALUE;
  }
  const section = sections.find((item) => item.id === sectionId);
  if (!section) {
    return selectedDisplayType || INDENTED_SUB_QUESTIONS_VALUE;
  }
  const root = getRootQuestionForQuestionId(section, parentId);
  if (root && isTabularSubQuestionType(root)) {
    return TABULAR_SUB_QUESTIONS_VALUE;
  }
  return selectedDisplayType || INDENTED_SUB_QUESTIONS_VALUE;
}

function enforceTabularForSection(section) {
  const questionsById = new Map(section.questions.map((question) => [question.id, question]));
  const cache = new Map();

  const hasTabularRoot = (question) => {
    const cached = cache.get(question.id);
    if (cached != null) return cached;
    let current = question;
    const visited = new Set();
    while (current) {
      if (isTabularSubQuestionType(current)) {
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

  const updatedQuestions = section.questions.map((question) => {
    if (!hasTabularRoot(question)) return question;
    if (isTabularSubQuestionType(question)) return question;
    return { ...question, displayType: TABULAR_SUB_QUESTIONS_VALUE };
  });

  return { ...section, questions: updatedQuestions };
}

function enforceTabularHierarchyDisplayTypes(sections) {
  return sections.map((section) => enforceTabularForSection(section));
}

function toAlphabet(index) {
  let n = index + 1;
  let out = '';
  while (n > 0) {
    n -= 1;
    out = String.fromCharCode(97 + (n % 26)) + out;
    n = Math.floor(n / 26);
  }
  return out;
}

function toRoman(value) {
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
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

function getLevelPrefix(level, index) {
  if (level === 1) return `${index + 1}.`;
  if (level === 2) return `${toAlphabet(index)}.`;
  return `${toRoman(index + 1).toLowerCase()}.`;
}

function getCurrentSurveySource(form) {
  return form?.source === 'Project' ? 'Project' : 'Roundtable';
}

function confirmClientRowKey(source, id) {
  return `${source}:${id}`;
}

function toParticipantSelections(rows) {
  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    clientName: row.clientName,
    clientAbbreviation: row.clientAbbreviation,
    receiveSurvey: row.receiveSurvey,
    allowParticipation: row.allowParticipation,
  }));
}

// ─── Validation helpers ──────────────────────────────────────
function datesFieldErrors(dates) {
  const errors = {};
  if (!dates) {
    errors.required = true;
    return errors;
  }
  if (Array.isArray(dates)) {
    if (!dates[1]) errors.incompleteDateRange = true;
    const start = dates[0];
    if (start) {
      const selected = new Date(start);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!(selected > today)) errors.notFuture = true;
    }
  }
  return errors;
}

function basicRequiredError(value) {
  if (value == null || value === '') return { required: true };
  return {};
}

function fieldErrors(form, field) {
  if (field === 'dates') return datesFieldErrors(form.dates);
  if (['source', 'entity', 'surveyType', 'year'].includes(field)) {
    return basicRequiredError(form[field]);
  }
  return {};
}

function crossFieldErrors(form) {
  const dates = form.dates;
  const start = dates && Array.isArray(dates) && dates[0] ? dates[0] : null;
  const end = dates && Array.isArray(dates) && dates[1] ? dates[1] : null;
  const alert = form.firstAlertDate;
  const reminder = form.reminderDate;
  const errors = {};

  if (alert && start && end) {
    const a = new Date(alert);
    const s = new Date(start);
    const e = new Date(end);
    if (a < s) errors.alertBeforeStart = true;
    if (a > e) errors.alertAfterEnd = true;
  }
  if (reminder && start && end) {
    const r = new Date(reminder);
    const s = new Date(start);
    const e = new Date(end);
    if (r < s) errors.reminderBeforeStart = true;
    if (r > e) errors.reminderAfterEnd = true;
  }
  if (reminder && alert) {
    const r = new Date(reminder);
    const a = new Date(alert);
    if (r <= a) errors.reminderBeforeAlert = true;
  }
  return errors;
}

function isAddSurveyStepValid(form) {
  const requiredFields = ['source', 'entity', 'surveyType', 'year', 'dates'];
  for (const field of requiredFields) {
    if (Object.keys(fieldErrors(form, field)).length > 0) return false;
  }
  if (Object.keys(crossFieldErrors(form)).length > 0) return false;
  return true;
}

function isQuestionFormInvalid(qform) {
  if (qform.sectionId == null) return true;
  if (!qform.questionText || !String(qform.questionText).trim()) return true;
  const type = qform.answerControlType;
  if (type === 'Checkbox (True/False)') {
    if (!qform.trueLabel || !String(qform.trueLabel).trim()) return true;
    if (!qform.falseLabel || !String(qform.falseLabel).trim()) return true;
  }
  if (type === 'Calculated - Editable' || type === 'Calculated - Non-editable') {
    if (!qform.formula || !String(qform.formula).trim()) return true;
  }
  return false;
}

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push({ label: String(y), value: String(y) });
  }
  return years;
}

function loadEntityOptionsFor(source) {
  if (source === 'Project') {
    const projects = getProjects();
    if (projects.length > 0) {
      return projects.map((p) => ({ label: p.name, value: p.name }));
    }
    return [
      { label: 'Project Alpha', value: 'Project Alpha' },
      { label: 'Project Beta', value: 'Project Beta' },
      { label: 'Project Gamma', value: 'Project Gamma' },
    ];
  }
  const roundtables = getRoundtables();
  if (roundtables.length > 0) {
    return roundtables.map((r) => ({ label: r.name, value: r.name }));
  }
  return [
    { label: 'Credit Cards', value: 'Credit Cards' },
    { label: 'Auto Lending', value: 'Auto Lending' },
    { label: 'Small Business', value: 'Small Business' },
  ];
}

function filterClientsByEntity(clients, source, entityName) {
  if (!entityName) return clients;
  if (source === 'Project') {
    const project = getProjects().find((p) => p.name === entityName);
    if (!project) return [];
    const projectId = project.id;
    return clients.filter((c) => (c.projectIds || []).map(Number).includes(projectId));
  }
  const roundtable = getRoundtables().find((r) => r.name === entityName);
  if (!roundtable) return [];
  const roundtableId = roundtable.id;
  return clients.filter((c) => (c.roundtableIds || []).map(Number).includes(roundtableId));
}

// ─── Component ──────────────────────────────────────────────
export default function AddSurveyForm({ editId = null }) {
  const router = useRouter();
  const { setPageTitleOverride } = useLayout();

  const editMode = editId != null;
  const yearOptions = useMemo(() => buildYearOptions(), []);
  const steps = editMode ? EDIT_STEPS : ADD_STEPS;

  // ── State ──
  const [currentStep, setCurrentStepState] = useState(0);
  const [form, setFormState] = useState({ ...EMPTY_FORM });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [touched, setTouched] = useState({});

  const [editSurveyId, setEditSurveyIdState] = useState(editId != null ? Number(editId) : null);

  const [entityOptions, setEntityOptions] = useState([]);
  const [periodNumberOptions, setPeriodNumberOptions] = useState([]);
  const [showPeriod, setShowPeriod] = useState(false);
  const [showPeriodNumber, setShowPeriodNumber] = useState(false);
  const [surveyNameDisabled, setSurveyNameDisabled] = useState(false);

  const [minAlertDate, setMinAlertDate] = useState(null);
  const [maxAlertDate, setMaxAlertDate] = useState(null);
  const [minReminderDate, setMinReminderDate] = useState(null);
  const [maxReminderDate, setMaxReminderDate] = useState(null);

  const [questionSections, setQuestionSectionsState] = useState([]);
  const [confirmClientRows, setConfirmClientRowsState] = useState([]);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // dialogs
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [showDeleteSectionDialog, setShowDeleteSectionDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showDeleteQuestionDialog, setShowDeleteQuestionDialog] = useState(false);

  const [explanationDraft, setExplanationDraft] = useState('');
  const [questionExplanation, setQuestionExplanation] = useState('');

  const [sectionForm, setSectionForm] = useState({ name: '', description: '' });
  const [sectionSubmitted, setSectionSubmitted] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [deletingSectionId, setDeletingSectionId] = useState(null);

  const [questionForm, setQuestionFormState] = useState({ ...EMPTY_QUESTION_FORM });
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [editingQuestionId, setEditingQuestionIdState] = useState(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [deletingQuestionSectionId, setDeletingQuestionSectionId] = useState(null);
  const [selectedSectionIdForQuestion, setSelectedSectionIdForQuestion] = useState(null);

  // ── Refs (synced mirrors for use inside async callbacks) ──
  const formRef = useRef(form);
  const sectionsRef = useRef(questionSections);
  const confirmRowsRef = useRef(confirmClientRows);
  const savedSnapshotRef = useRef([]);
  const editingQuestionIdRef = useRef(editingQuestionId);
  const editSurveyIdRef = useRef(editSurveyId);
  const confirmRefreshVersionRef = useRef(0);
  const nextSectionIdRef = useRef(1);
  const nextQuestionIdRef = useRef(1);
  const initializedRef = useRef(false);
  const menuRefs = useRef({});

  const setForm = (updater) =>
    setFormState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      formRef.current = next;
      return next;
    });
  const setCurrentStep = (val) => setCurrentStepState(val);
  const setQuestionSections = (updater) =>
    setQuestionSectionsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      sectionsRef.current = next;
      return next;
    });
  const setConfirmClientRows = (updater) =>
    setConfirmClientRowsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      confirmRowsRef.current = next;
      return next;
    });
  const setEditingQuestionId = (val) => {
    editingQuestionIdRef.current = val;
    setEditingQuestionIdState(val);
  };
  const setEditSurveyId = (val) => {
    editSurveyIdRef.current = val;
    setEditSurveyIdState(val);
  };
  const setQuestionForm = (updater) =>
    setQuestionFormState((prev) => (typeof updater === 'function' ? updater(prev) : updater));

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Title sync (mirrors updatePageTitle / ngOnDestroy) ──
  // In add mode the header title tracks the current wizard step label.
  // In edit mode the edit page pins the title to "Modify Survey".
  useEffect(() => {
    if (editMode) return;
    const label = (steps[currentStep]?.label ?? '').replace('\n', ' ');
    setPageTitleOverride(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, editMode]);

  useEffect(() => {
    return () => setPageTitleOverride(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Confirm-client rows ──
  const initializeConfirmClientRows = (savedSelections, source) => {
    const existingRows = new Map(
      confirmRowsRef.current.map((row) => [confirmClientRowKey(row.source, row.id), row])
    );
    const savedRows = new Map(
      (savedSelections ?? []).map((selection) => {
        const selectionSource = selection.source ?? source;
        return [confirmClientRowKey(selectionSource, Number(selection.id)), selection];
      })
    );
    const clients = getClients();
    const entityName = formRef.current?.entity || '';
    const filteredClients = filterClientsByEntity(clients, source, entityName);

    const rows = filteredClients.map((client) => {
      const key = confirmClientRowKey(source, client.id);
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
        allowParticipation: receiveSurvey ? allowParticipation : false,
      };
    });
    setConfirmClientRows(rows);
  };

  const refreshConfirmClientRows = (savedSelections) => {
    const refreshVersion = ++confirmRefreshVersionRef.current;
    const selectionsToApply =
      savedSelections ??
      (confirmRowsRef.current.length ? toParticipantSelections(confirmRowsRef.current) : savedSnapshotRef.current);

    const source = getCurrentSurveySource(formRef.current);
    const entityLoad = source === 'Project' ? loadProjects() : loadRoundtables();

    Promise.allSettled([entityLoad, loadClients()]).then(() => {
      if (refreshVersion !== confirmRefreshVersionRef.current) return;
      if (getCurrentSurveySource(formRef.current) === source) {
        setEntityOptions(loadEntityOptionsFor(source));
      }
      initializeConfirmClientRows(selectionsToApply, source);
    });
  };

  // ── Init (ngOnInit) ──
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    setEntityOptions(loadEntityOptionsFor('Roundtable'));
    refreshConfirmClientRows();

    if (editId != null) {
      const surveyId = Number(editId);
      setEditSurveyId(surveyId);

      const cached = getSurveyById(surveyId);
      if (cached) {
        loadSurveyIntoForm(cached);
        setCurrentStep(0);
      } else {
        loadSurveyById(surveyId).then((survey) => {
          if (!survey) {
            showToast({
              severity: 'error',
              summary: 'Not Found',
              detail: 'Survey could not be loaded.',
              life: 4000,
            });
            router.push('/surveys/view');
            return;
          }
          loadSurveyIntoForm(survey);
          setCurrentStep(0);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load survey for edit mode ──
  const loadSurveyIntoForm = (survey) => {
    savedSnapshotRef.current = Array.isArray(survey.participantSelections) ? survey.participantSelections : [];

    setEntityOptions(loadEntityOptionsFor(survey.source));

    let dateRange = null;
    if (survey.startDate && survey.endDate) {
      dateRange = [new Date(survey.startDate), new Date(survey.endDate)];
    }
    const firstAlertDate = survey.firstAlertDate ? new Date(survey.firstAlertDate) : null;
    const reminderDate = survey.reminderDate ? new Date(survey.reminderDate) : null;

    if (survey.surveyType === 'Benchmark') {
      setShowPeriod(true);
      if (survey.period && survey.period !== 'Annual') {
        setShowPeriodNumber(true);
        applyPeriodOptions(survey.period);
      }
      setSurveyNameDisabled(true);
    }

    setForm((prev) => ({
      ...prev,
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
      isActive: survey.isActive,
    }));

    if (dateRange && dateRange[0] && dateRange[1]) {
      setMinAlertDate(dateRange[0]);
      setMaxAlertDate(dateRange[1]);
      setMinReminderDate(dateRange[0]);
      setMaxReminderDate(dateRange[1]);
    }

    loadQuestionSectionsFromSurvey(survey);
    refreshConfirmClientRows(savedSnapshotRef.current);

    setFormDirty(false);
    setTouched({});
  };

  const loadQuestionSectionsFromSurvey = (survey) => {
    const sections = Array.isArray(survey.questionSections) ? survey.questionSections : [];
    const normalizedSections = sections.map((section) => ({
      id: Number(section.id),
      title: section.title ?? '',
      description: section.description ?? '',
      expanded: section.expanded ?? true,
      questions: Array.isArray(section.questions)
        ? section.questions.map((question) => ({
            ...question,
            id: Number(question.id),
            sectionId: Number(question.sectionId),
          }))
        : [],
    }));

    const maxSectionId = normalizedSections.reduce((max, section) => Math.max(max, section.id || 0), 0);
    const maxQuestionId = normalizedSections.reduce(
      (max, section) => Math.max(max, ...section.questions.map((question) => question.id || 0), 0),
      0
    );

    const enforced = enforceTabularHierarchyDisplayTypes(normalizedSections);
    setQuestionSections(enforced);
    nextSectionIdRef.current = maxSectionId + 1;
    nextQuestionIdRef.current = maxQuestionId + 1;
  };

  // ── Dynamic behaviour ──
  const applyPeriodOptions = (period) => {
    switch (period) {
      case 'Half':
        setPeriodNumberOptions([
          { label: '1st Half', value: '1st Half' },
          { label: '2nd Half', value: '2nd Half' },
        ]);
        setShowPeriodNumber(true);
        break;
      case 'Quarter':
        setPeriodNumberOptions([
          { label: 'Q1', value: 'Q1' },
          { label: 'Q2', value: 'Q2' },
          { label: 'Q3', value: 'Q3' },
          { label: 'Q4', value: 'Q4' },
        ]);
        setShowPeriodNumber(true);
        break;
      case 'Month':
        setPeriodNumberOptions(
          ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => ({
            label: m,
            value: m,
          }))
        );
        setShowPeriodNumber(true);
        break;
      default:
        setPeriodNumberOptions([]);
        setShowPeriodNumber(false);
        break;
    }
  };

  const onSourceChange = (val) => {
    markTouched('source');
    setFormDirty(true);
    setForm((prev) => ({ ...prev, source: val, entity: null }));
    setEntityOptions(loadEntityOptionsFor(val));
    refreshConfirmClientRows();
  };

  const onEntityChange = (val) => {
    markTouched('entity');
    setFormDirty(true);
    setForm((prev) => ({ ...prev, entity: val }));
    refreshConfirmClientRows();
  };

  const onSurveyTypeChange = (val) => {
    markTouched('surveyType');
    setFormDirty(true);
    if (val === 'Ad Hoc') {
      setSurveyNameDisabled(false);
      setShowPeriod(false);
      setShowPeriodNumber(false);
      setForm((prev) => ({ ...prev, surveyType: val, period: null, periodNumber: null }));
      setPeriodNumberOptions([]);
    } else if (val === 'Benchmark') {
      setSurveyNameDisabled(true);
      setShowPeriod(true);
      setForm((prev) => ({ ...prev, surveyType: val }));
    } else {
      setForm((prev) => ({ ...prev, surveyType: val }));
    }
  };

  const onPeriodChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, period: val, periodNumber: null }));
    applyPeriodOptions(val);
  };

  const onPeriodNumberChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, periodNumber: val }));
  };

  const onYearChange = (val) => {
    markTouched('year');
    setFormDirty(true);
    setForm((prev) => ({ ...prev, year: val }));
  };

  const onDatesChange = (val) => {
    markTouched('dates');
    setFormDirty(true);
    setForm((prev) => ({ ...prev, dates: val }));
    if (val && Array.isArray(val) && val[0] && val[1]) {
      setMinAlertDate(val[0]);
      setMaxAlertDate(val[1]);
      setMinReminderDate(val[0]);
      setMaxReminderDate(val[1]);
    } else {
      setMinAlertDate(null);
      setMaxAlertDate(null);
      setMinReminderDate(null);
      setMaxReminderDate(null);
    }
  };

  const onFirstAlertChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, firstAlertDate: val }));
  };
  const onReminderChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, reminderDate: val }));
  };
  const onSurveyNameChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, surveyName: val }));
  };
  const onIsActiveChange = (val) => {
    setFormDirty(true);
    setForm((prev) => ({ ...prev, isActive: val }));
  };

  // ── Validation surface ──
  const isFieldInvalid = (field) => {
    const errs = fieldErrors(form, field);
    return Object.keys(errs).length > 0 && (touched[field] || submitted);
  };

  const getFieldError = (field) => {
    const errs = fieldErrors(form, field);
    if (errs.required) return 'This field is required.';
    if (errs.incompleteDateRange) return 'Please select both start and end dates.';
    if (errs.notFuture) return 'Start date must be in the future.';
    return '';
  };

  const formCrossErrors = crossFieldErrors(form);
  const getFormError = (key) => !!(formCrossErrors[key] && submitted);

  const entityLabel = getCurrentSurveySource(form) === 'Project' ? 'Project' : 'Roundtable';
  const selectedEntityName = (() => {
    const value = form.entity;
    if (typeof value === 'string') return value || '-';
    return '-';
  })();
  const selectedSurveyName = form.surveyName || '-';

  const markStepTouched = () => {
    setSubmitted(true);
    const fields = ['source', 'entity', 'surveyType', 'year', 'dates', 'surveyName', 'period', 'periodNumber', 'firstAlertDate', 'reminderDate'];
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
  };

  const addStepValid = isAddSurveyStepValid(form);

  // ── Stepper ──
  const goToStep = (index) => {
    if (editMode) {
      setCurrentStep(index);
      return;
    }
    if (index < currentStep) {
      setCurrentStep(index);
      return;
    }
    if (index > currentStep && isStepValid(currentStep)) {
      setCurrentStep(index);
    }
  };

  const isStepValid = (step) => {
    if (step === 0) return isAddSurveyStepValid(formRef.current);
    return true;
  };

  const nextStep = () => {
    if (isStepValid(currentStep)) {
      const target = currentStep + 1;
      setCurrentStep(target);
      if (target === 2) refreshConfirmClientRows();
    } else {
      markStepTouched();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // ── Persistence ──
  const buildSurveyPayloadFromForm = () => {
    const f = { ...formRef.current };
    let surveyName = f.surveyName;
    if (f.surveyType === 'Benchmark') {
      const parts = [f.entity, f.period, f.year];
      if (f.periodNumber) parts.splice(2, 0, f.periodNumber);
      surveyName = parts.filter(Boolean).join(' ');
    }
    return {
      source: f.source,
      entity: f.entity,
      surveyType: f.surveyType,
      surveyName: surveyName || '',
      period: f.period || '',
      periodNumber: f.periodNumber || '',
      year: f.year,
      startDate: f.dates && f.dates[0] ? new Date(f.dates[0]).toISOString() : '',
      endDate: f.dates && f.dates[1] ? new Date(f.dates[1]).toISOString() : '',
      firstAlertDate: f.firstAlertDate ? new Date(f.firstAlertDate).toISOString() : '',
      reminderDate: f.reminderDate ? new Date(f.reminderDate).toISOString() : '',
      isInteractiveReports: f.isInteractiveReports,
      isActive: f.isActive,
    };
  };

  const buildStoredSurveyForUpdate = (lastStep) => {
    const id = editSurveyIdRef.current;
    if (id == null) return null;
    return {
      ...buildSurveyPayloadFromForm(),
      id,
      lastStep,
      status: 'Draft',
      questionSections: sectionsRef.current,
      participantSelections: toParticipantSelections(confirmRowsRef.current),
    };
  };

  const persistQuestionChangesSilently = () => {
    const storedSurvey = buildStoredSurveyForUpdate(currentStep);
    if (!storedSurvey) return;
    updateSurvey(storedSurvey, false).catch((error) => {
      console.error('Failed to autosave question changes', error);
    });
  };

  const ensureSurveyDraft = (step, onSuccess) => {
    const existingSurvey = buildStoredSurveyForUpdate(step);
    if (existingSurvey) {
      updateSurvey(existingSurvey, false)
        .then((res) => {
          setEditSurveyId(res.survey.id);
          savedSnapshotRef.current = toParticipantSelections(confirmRowsRef.current);
          onSuccess();
        })
        .catch(() => {
          setSaving(false);
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to save survey draft.', life: 4000 });
        });
      return;
    }

    const payload = buildSurveyPayloadFromForm();
    saveSurvey(payload, step, sectionsRef.current, toParticipantSelections(confirmRowsRef.current), false)
      .then((res) => {
        setEditSurveyId(res.survey.id);
        savedSnapshotRef.current = toParticipantSelections(confirmRowsRef.current);
        onSuccess();
      })
      .catch(() => {
        setSaving(false);
        showToast({ severity: 'error', summary: 'Error', detail: 'Failed to save survey draft.', life: 4000 });
      });
  };

  // ── Actions ──
  const onSave = () => {
    setSubmitted(true);
    markStepTouched();

    if (!isAddSurveyStepValid(formRef.current)) {
      showToast({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.', life: 4000 });
      return;
    }

    setSaving(true);
    const storedSurvey = buildStoredSurveyForUpdate(currentStep);

    if (storedSurvey) {
      updateSurvey(storedSurvey)
        .then(() => {
          setSaving(false);
          setFormDirty(false);
          router.push('/surveys/view');
        })
        .catch(() => {
          setSaving(false);
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to update survey. Please try again.', life: 4000 });
        });
    } else {
      saveSurvey(buildSurveyPayloadFromForm(), currentStep, sectionsRef.current, toParticipantSelections(confirmRowsRef.current))
        .then(() => {
          setSaving(false);
          setFormDirty(false);
          router.push('/surveys/view');
        })
        .catch(() => {
          setSaving(false);
          showToast({ severity: 'error', summary: 'Error', detail: 'Failed to save survey. Please try again.', life: 4000 });
        });
    }
  };

  const onAddQuestions = () => {
    setSubmitted(true);
    if (!isAddSurveyStepValid(formRef.current)) {
      markStepTouched();
      showToast({ severity: 'warn', summary: 'Validation Error', detail: 'Complete the Add Survey step before proceeding.', life: 4000 });
      return;
    }
    setSaving(true);
    ensureSurveyDraft(1, () => {
      setSaving(false);
      setCurrentStep(1);
    });
  };

  const saveEmailFormat = () => {
    showToast({ severity: 'success', summary: 'Success', detail: 'Email format saved.' });
  };
  const launchSurvey = () => {
    showToast({ severity: 'success', summary: 'Success', detail: 'Survey Launched!' });
  };
  const designReport = () => {
    showToast({ severity: 'info', summary: 'Info', detail: 'Design Report feature pending.' });
  };

  // ── Section dialog ──
  const addNewSection = () => {
    setSectionSubmitted(false);
    setEditingSectionId(null);
    setSectionForm({ name: '', description: '' });
    setShowSectionDialog(true);
  };

  const editSection = (sectionId) => {
    const section = sectionsRef.current.find((item) => item.id === sectionId);
    if (!section) return;
    setSectionSubmitted(false);
    setEditingSectionId(sectionId);
    setSectionForm({ name: section.title, description: section.description });
    setShowSectionDialog(true);
  };

  const saveSection = () => {
    setSectionSubmitted(true);
    if (!sectionForm.name || !String(sectionForm.name).trim()) {
      return;
    }
    const name = (sectionForm.name ?? '').trim();
    const description = (sectionForm.description ?? '').trim();
    const editingId = editingSectionId;

    if (editingId) {
      setQuestionSections((sections) =>
        sections.map((section) => (section.id === editingId ? { ...section, title: name, description } : section))
      );
      showToast({ severity: 'success', summary: 'Updated', detail: 'Section updated successfully.', life: 2500 });
    } else {
      const sectionId = nextSectionIdRef.current++;
      const newSection = { id: sectionId, title: name, description, expanded: true, questions: [] };
      setQuestionSections((sections) => sections.map((section) => ({ ...section, expanded: false })).concat(newSection));
      showToast({ severity: 'success', summary: 'Saved', detail: 'Section added successfully.', life: 2500 });
    }

    setShowSectionDialog(false);
    setEditingSectionId(null);
    persistQuestionChangesSilently();
  };

  const closeSectionDialog = () => {
    setShowSectionDialog(false);
    setEditingSectionId(null);
    setSectionSubmitted(false);
  };

  const confirmDeleteSection = (sectionId) => {
    setDeletingSectionId(sectionId);
    setShowDeleteSectionDialog(true);
  };

  const deleteSection = () => {
    const sectionId = deletingSectionId;
    if (!sectionId) return;
    setQuestionSections((sections) => sections.filter((section) => section.id !== sectionId));
    setShowDeleteSectionDialog(false);
    setDeletingSectionId(null);
    showToast({ severity: 'success', summary: 'Deleted', detail: 'Section deleted successfully.', life: 2500 });
    persistQuestionChangesSilently();
  };

  const cancelDeleteSection = () => {
    setShowDeleteSectionDialog(false);
    setDeletingSectionId(null);
  };

  // ── Question dialog ──
  const computeSyncedDisplayType = (qform) => {
    const sectionIdValue = qform.sectionId;
    const parentValueRaw = qform.subQuestionOf;
    const currentDisplayType = qform.displayType;
    const sectionId = sectionIdValue == null ? NaN : Number(sectionIdValue);
    const parentId = parentValueRaw === NO_PARENT_QUESTION_VALUE || parentValueRaw == null ? null : Number(parentValueRaw);
    return resolveDisplayTypeForSave(
      sectionsRef.current,
      Number.isFinite(sectionId) ? sectionId : -1,
      parentId,
      currentDisplayType
    );
  };

  const handleQuestionSectionChange = (val) => {
    setQuestionForm((prev) => {
      let next = { ...prev, sectionId: val };
      const parentOptions = getParentQuestionOptionsForSectionId(sectionsRef.current, val, editingQuestionIdRef.current);
      const allowed = new Set(parentOptions.map((o) => o.value));
      if (next.subQuestionOf == null || !allowed.has(String(next.subQuestionOf))) {
        next.subQuestionOf = NO_PARENT_QUESTION_VALUE;
      }
      next.displayType = computeSyncedDisplayType(next);
      return next;
    });
  };

  const handleQuestionParentChange = (val) => {
    setQuestionForm((prev) => {
      const next = { ...prev, subQuestionOf: val };
      next.displayType = computeSyncedDisplayType(next);
      return next;
    });
  };

  const setQField = (field, val) => setQuestionForm((prev) => ({ ...prev, [field]: val }));

  const shouldLockDisplayTypeToTabular = () => {
    const sectionIdValue = questionForm.sectionId;
    const parentValueRaw = questionForm.subQuestionOf;
    if (sectionIdValue == null || parentValueRaw == null || parentValueRaw === NO_PARENT_QUESTION_VALUE) return false;
    const sectionId = Number(sectionIdValue);
    const parentId = Number(parentValueRaw);
    if (!Number.isFinite(sectionId) || !Number.isFinite(parentId)) return false;
    const section = questionSections.find((item) => item.id === sectionId);
    if (!section) return false;
    const root = getRootQuestionForQuestionId(section, parentId);
    return !!(root && isTabularSubQuestionType(root));
  };

  const openQuestionDialog = (sectionId, parentQuestionId) => {
    const sections = sectionsRef.current;
    if (!sections.length) {
      showToast({ severity: 'warn', summary: 'Section Required', detail: 'Please add at least one section first.', life: 3000 });
      return;
    }
    const fallbackSectionId = sections[0]?.id ?? null;
    const targetSectionId = sectionId ?? fallbackSectionId;
    setSelectedSectionIdForQuestion(targetSectionId);

    const initialParentValue = parentQuestionId == null ? NO_PARENT_QUESTION_VALUE : String(parentQuestionId);
    const defaultDisplayType = getDefaultDisplayTypeForNewQuestion(sections, targetSectionId, parentQuestionId);

    setEditingQuestionId(null);
    setQuestionSubmitted(false);

    let nextForm = {
      ...EMPTY_QUESTION_FORM,
      sectionId: targetSectionId == null ? null : String(targetSectionId),
      subQuestionOf: initialParentValue,
      displayType: defaultDisplayType,
    };

    // updateSubQuestionControl
    const parentOptions = getParentQuestionOptionsForSectionId(sections, targetSectionId, null);
    const allowed = new Set(parentOptions.map((o) => o.value));
    if (nextForm.subQuestionOf == null || !allowed.has(String(nextForm.subQuestionOf))) {
      nextForm.subQuestionOf = NO_PARENT_QUESTION_VALUE;
    }
    if (parentQuestionId != null) {
      const parentAsValue = String(parentQuestionId);
      const isParentAllowed = parentOptions.some((option) => option.value === parentAsValue);
      nextForm.subQuestionOf = isParentAllowed ? parentAsValue : NO_PARENT_QUESTION_VALUE;
    }
    setQuestionForm(nextForm);
    setShowQuestionDialog(true);
  };

  const addQuestion = (sectionId) => openQuestionDialog(sectionId, undefined);

  const addSubQuestion = (sectionId, parentQuestionId) => {
    const section = sectionsRef.current.find((item) => item.id === sectionId);
    const parent = section?.questions.find((item) => item.id === parentQuestionId);
    if (!section || !parent) return;

    if (!isIndentedSubQuestionType(parent) && !isTabularSubQuestionType(parent)) {
      showToast({
        severity: 'warn',
        summary: 'Display Type Required',
        detail: 'Parent question must use either "has indented sub questions" or "Tabular Sub Questions" to add nested sub questions.',
        life: 3500,
      });
      return;
    }

    const parentLevel = getQuestionLevel(section, parent.id);
    const rootParent = getRootQuestionForQuestionId(section, parent.id);
    const isUnderTabularRoot = !!(rootParent && isTabularSubQuestionType(rootParent));
    if (isUnderTabularRoot && parentLevel >= 2) {
      showToast({
        severity: 'warn',
        summary: 'Tabular Limit Reached',
        detail: 'Tabular Sub Questions support only one child level (root -> children).',
        life: 3500,
      });
      return;
    }
    if (isIndentedSubQuestionType(parent) && parentLevel >= MAX_QUESTION_LEVELS) {
      showToast({ severity: 'warn', summary: 'Max Depth Reached', detail: 'Only 3 levels of question hierarchy are supported.', life: 3500 });
      return;
    }

    openQuestionDialog(sectionId, parentQuestionId);
  };

  const saveQuestion = () => {
    setQuestionSubmitted(true);
    if (isQuestionFormInvalid(questionForm)) {
      return;
    }

    const value = questionForm;
    const sectionId = Number(value.sectionId);
    const questionText = (value.questionText ?? '').trim();
    const questionDescription = (value.questionDescription ?? '').trim();
    const parentValue = value.subQuestionOf === NO_PARENT_QUESTION_VALUE ? null : Number(value.subQuestionOf);

    const payload = {
      sectionId,
      subQuestionOf: parentValue,
      text: questionText,
      description: questionDescription || undefined,
      visibleToClients: !!value.visibleToClients,
      displayType: resolveDisplayTypeForSave(sectionsRef.current, sectionId, parentValue, value.displayType),
      answerControlType: value.answerControlType,
      sentimentValue: value.sentimentValue,
      metricReportable: !!value.metricReportable,
      showIndividualResponses: !!value.showIndividualResponses,
      showInExecutiveSummary: !!value.showInExecutiveSummary,
      includeInVarianceTracker: !!value.includeInVarianceTracker,
      showInChartGenerator: !!value.showInChartGenerator,
      allowAutoMarkNA: !!value.allowAutoMarkNA,
      optionValues: value.optionValues?.trim?.() ? String(value.optionValues).trim() : value.optionValues || undefined,
      trueLabel: value.trueLabel?.trim?.() ? String(value.trueLabel).trim() : value.trueLabel || undefined,
      falseLabel: value.falseLabel?.trim?.() ? String(value.falseLabel).trim() : value.falseLabel || undefined,
      formula: value.formula?.trim?.() ? String(value.formula).trim() : value.formula || undefined,
      maxLength: value.maxLength != null && value.maxLength !== '' ? Number(value.maxLength) : null,
      entryBoxSize: value.entryBoxSize || undefined,
      requiredAnswerType: value.requiredAnswerType || undefined,
      decimalsOnReport: value.decimalsOnReport ?? undefined,
      existingDropdownList: value.existingDropdownList || undefined,
      dropDownHeading: value.dropDownHeading?.trim?.() || undefined,
      dropDownValues: value.dropDownValues?.trim?.() || undefined,
      showNAInDropDown: value.showNAInDropDown ?? true,
      showNTInDropDown: value.showNTInDropDown ?? true,
    };

    const editingId = editingQuestionIdRef.current;

    setQuestionSections((sections) => {
      const updated = sections
        .map((section) => {
          if (editingId != null) {
            const isInThisSection = section.id === sectionId;
            if (!isInThisSection) return section;
            return {
              ...section,
              expanded: true,
              questions: section.questions.map((q) => (q.id === editingId ? { ...q, ...payload } : q)),
            };
          }
          if (section.id !== sectionId) return section;
          return {
            ...section,
            expanded: true,
            questions: section.questions.concat({ id: nextQuestionIdRef.current++, ...payload }),
          };
        })
        .map((section) => {
          if (editingId == null) return section;
          if (section.id === sectionId) return section;
          return { ...section, questions: section.questions.filter((q) => q.id !== editingId) };
        });
      return enforceTabularHierarchyDisplayTypes(updated);
    });

    setShowQuestionDialog(false);
    setEditingQuestionId(null);
    showToast({
      severity: 'success',
      summary: 'Saved',
      detail: editingId != null ? 'Question updated successfully.' : 'Question added successfully.',
      life: 2500,
    });
    persistQuestionChangesSilently();
  };

  const resetQuestionForm = () => {
    const sectionId = selectedSectionIdForQuestion;
    setQuestionForm({
      ...EMPTY_QUESTION_FORM,
      sectionId: sectionId == null ? null : String(sectionId),
      displayType: 'has indented sub questions',
    });
    setQuestionSubmitted(false);
  };

  const closeQuestionDialog = () => {
    setShowQuestionDialog(false);
    setQuestionSubmitted(false);
    setEditingQuestionId(null);
  };

  const editQuestion = (sectionId, questionId) => {
    const section = sectionsRef.current.find((s) => s.id === sectionId);
    const question = section?.questions.find((q) => q.id === questionId);
    if (!section || !question) return;

    setSelectedSectionIdForQuestion(sectionId);
    setEditingQuestionId(questionId);
    setQuestionSubmitted(false);

    setQuestionForm({
      sectionId: String(sectionId),
      subQuestionOf: question.subQuestionOf == null ? NO_PARENT_QUESTION_VALUE : String(question.subQuestionOf),
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
      showNTInDropDown: question.showNTInDropDown ?? true,
    });

    setShowQuestionDialog(true);
  };

  const confirmDeleteQuestion = (sectionId, questionId) => {
    setDeletingQuestionSectionId(sectionId);
    setDeletingQuestionId(questionId);
    setShowDeleteQuestionDialog(true);
  };

  const deleteQuestion = () => {
    const sectionId = deletingQuestionSectionId;
    const questionId = deletingQuestionId;
    if (sectionId == null || questionId == null) return;

    setQuestionSections((sections) =>
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, expanded: true, questions: section.questions.filter((q) => q.id !== questionId) }
          : section
      )
    );

    setShowDeleteQuestionDialog(false);
    setDeletingQuestionSectionId(null);
    setDeletingQuestionId(null);
    showToast({ severity: 'success', summary: 'Deleted', detail: 'Question deleted successfully.', life: 2500 });
    persistQuestionChangesSilently();
  };

  const cancelDeleteQuestion = () => {
    setShowDeleteQuestionDialog(false);
    setDeletingQuestionSectionId(null);
    setDeletingQuestionId(null);
  };

  const toggleSection = (sectionId) => {
    setQuestionSections((sections) =>
      sections.map((section) => (section.id === sectionId ? { ...section, expanded: !section.expanded } : section))
    );
  };

  const onDeleteAllQuestions = () => {
    setQuestionSections([]);
    persistQuestionChangesSilently();
  };

  const downloadTemplate = () => {
    const headers = [
      'Section Name',
      'Sub Question Of (Parent ID/Text)',
      'Question Text',
      'Question Description',
      'Visible To Clients',
      'Display Type',
      'Answer Control Type',
    ];
    const sampleData = [
      ['General Info', '', 'What is your primary region?', 'Specify the region you operate in.', 'true', 'No Related Sub Questions', 'Drop Down'],
      ['General Info', '', 'Are you satisfied with the service?', '', 'true', 'has indented sub questions', 'Checkbox (True/False)'],
    ];
    const csvContent = [headers.join(','), ...sampleData.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'survey_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Explanation dialog ──
  const openExplanationDialog = () => {
    setExplanationDraft(questionExplanation);
    setShowExplanationDialog(true);
  };
  const closeExplanationDialog = () => setShowExplanationDialog(false);
  const saveExplanation = () => {
    const explanation = explanationDraft.trim();
    if (!explanation) {
      showToast({ severity: 'warn', summary: 'Explanation Required', detail: 'Please enter an explanation before saving.', life: 3000 });
      return;
    }
    setQuestionExplanation(explanation);
    setShowExplanationDialog(false);
    showToast({ severity: 'success', summary: 'Saved', detail: 'Explanation added successfully.', life: 2500 });
  };

  // ── Confirm clients ──
  const saveConfirmClients = () => {
    setSaving(true);
    ensureSurveyDraft(2, () => {
      setSaving(false);
      showToast({ severity: 'success', summary: 'Saved', detail: 'Client participation settings saved.', life: 2500 });
    });
  };
  const reviewParticipants = () => saveConfirmClients();
  const reviewEmail = () => {
    setSaving(true);
    ensureSurveyDraft(3, () => {
      setSaving(false);
      setCurrentStep(3);
    });
  };

  const resetConfirmClients = () => {
    setConfirmClientRows((rows) => rows.map((row) => ({ ...row, receiveSurvey: true, allowParticipation: true })));
  };

  const onConfirmClientCheckboxChange = (event) => {
    setConfirmClientRows((rows) =>
      rows.map((row) => {
        if (row.id !== event.row.id || row.source !== event.row.source) return row;
        if (event.field === 'receiveSurvey') {
          return { ...row, receiveSurvey: event.checked, allowParticipation: event.checked ? true : false };
        }
        if (event.field === 'allowParticipation') {
          if (!row.receiveSurvey) return row;
          return { ...row, allowParticipation: event.checked };
        }
        return row;
      })
    );
  };

  const isConfirmClientCheckboxDisabled = (row, field) => field === 'allowParticipation' && !row.receiveSurvey;

  // ── Cancel ──
  const onCancel = () => {
    if (formDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/surveys/view');
    }
  };
  const onConfirmLeave = () => {
    setShowCancelDialog(false);
    setForm({ ...EMPTY_FORM });
    setSubmitted(false);
    router.push('/surveys/view');
  };
  const onKeepEditing = () => setShowCancelDialog(false);

  const breadcrumbItems = [
    { label: 'Surveys' },
    { label: (steps[currentStep]?.label ?? '').replace('\n', ' ') },
  ];

  // ── Inline question control renderer ──
  const renderInlineControl = (question) => {
    if (question.answerControlType === 'Entry Box') {
      return (
        <input
          type="text"
          className={`question-inline-input${question.entryBoxSize === 'Medium' ? ' entry-box-medium' : ''}${
            question.entryBoxSize === 'Large' ? ' entry-box-large' : ''
          }`}
          readOnly
          aria-hidden="true"
          tabIndex={-1}
        />
      );
    }
    if (question.answerControlType === 'Drop Down') {
      return (
        <div className="question-inline-dropdown">
          <span className="question-inline-dropdown-label">Dropdown List</span>
          <span className="question-inline-dropdown-value">{question.dropDownHeading || question.existingDropdownList || '-'}</span>
          <i className="pi pi-angle-down question-inline-dropdown-icon"></i>
        </div>
      );
    }
    if (question.answerControlType === 'Checkbox (True/False)') {
      return (
        <div className="question-inline-checkbox-slot">
          <input type="checkbox" className="question-inline-checkbox" disabled aria-hidden="true" tabIndex={-1} />
        </div>
      );
    }
    return null;
  };

  const questionMenu = (key, section, question, allowAdd) => (
    <div className="question-row-menu-wrapper">
      <Button
        type="button"
        icon="pi pi-ellipsis-v"
        className="p-button-text p-button-rounded p-button-secondary"
        aria-label="Open question actions menu"
        aria-haspopup="menu"
        onClick={(e) => menuRefs.current[key]?.toggle(e)}
      />
      <OverlayPanel ref={(el) => (menuRefs.current[key] = el)} role="menu">
        <div className="question-context-menu">
          <button
            type="button"
            className="question-context-item"
            role="menuitem"
            onClick={() => {
              editQuestion(section.id, question.id);
              menuRefs.current[key]?.hide();
            }}
          >
            <i className="icon-edit-svg" aria-hidden="true"></i> Edit
          </button>
          {allowAdd && (
            <button
              type="button"
              className="question-context-item"
              role="menuitem"
              onClick={() => {
                addSubQuestion(section.id, question.id);
                menuRefs.current[key]?.hide();
              }}
            >
              <i className="pi pi-plus" aria-hidden="true"></i> Add
            </button>
          )}
          <button
            type="button"
            className="question-context-item question-context-delete"
            role="menuitem"
            onClick={() => {
              confirmDeleteQuestion(section.id, question.id);
              menuRefs.current[key]?.hide();
            }}
          >
            <i className="pi pi-trash" aria-hidden="true"></i> Delete
          </button>
        </div>
      </OverlayPanel>
    </div>
  );

  const parentOptionsForDialog = getParentQuestionOptionsForSectionId(questionSections, questionForm.sectionId ?? null, editingQuestionId);

  return (
    <main className="add-survey-page add-survey-container" aria-labelledby="add-survey-heading">
      <h2 id="add-survey-heading" className="sr-only">{editMode ? 'Edit Survey' : 'Add New Survey'}</h2>

      <Breadcrumb items={breadcrumbItems} />

      <Stepper steps={steps} currentStep={currentStep} allowFreeNavigation={editMode} onStepChange={goToStep} />

      {/* STEP 1: ADD SURVEY FORM */}
      {currentStep === 0 && (
        <form className="form-container" autoComplete="off" role="form" aria-label="Add survey - basic information" aria-describedby="add-survey-required-hint">
          <p id="add-survey-required-hint" className="sr-only">Required fields are marked with an asterisk.</p>

          <div className="form-row three-column">
            <div className="form-field">
              <SharedDropdown
                label="Source*"
                id="survey-source"
                options={SOURCE_OPTIONS}
                placeholder="Select Source"
                isInvalid={isFieldInvalid('source')}
                value={form.source}
                onValueChange={onSourceChange}
              />
              {isFieldInvalid('source') && <small className="field-error">{getFieldError('source')}</small>}
            </div>

            <div className="form-field">
              <SharedDropdown
                label={entityLabel + '*'}
                id="survey-entity"
                options={entityOptions}
                placeholder={'Select ' + entityLabel}
                filter
                isInvalid={isFieldInvalid('entity')}
                value={form.entity}
                onValueChange={onEntityChange}
              />
              {isFieldInvalid('entity') && <small className="field-error">{getFieldError('entity')}</small>}
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Survey Type*"
                id="survey-type"
                options={SURVEY_TYPE_OPTIONS}
                placeholder="Select Type"
                isInvalid={isFieldInvalid('surveyType')}
                value={form.surveyType}
                onValueChange={onSurveyTypeChange}
              />
              {isFieldInvalid('surveyType') && <small className="field-error">{getFieldError('surveyType')}</small>}
            </div>
          </div>

          <div className="form-row three-column">
            <div className="form-field">
              <label htmlFor="survey-name" className="sr-only">Survey Name</label>
              <input
                id="survey-name"
                type="text"
                placeholder="Survey Name"
                aria-label="Survey name"
                value={form.surveyName ?? ''}
                disabled={surveyNameDisabled}
                onChange={(e) => onSurveyNameChange(e.target.value)}
              />
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Year*"
                id="survey-year"
                options={yearOptions}
                placeholder="Select Year"
                isInvalid={isFieldInvalid('year')}
                value={form.year}
                onValueChange={onYearChange}
              />
              {isFieldInvalid('year') && <small className="field-error">{getFieldError('year')}</small>}
            </div>

            <div className="form-field">
              <div className={`custom-fieldset date-fieldset${isFieldInvalid('dates') ? ' invalid-field' : ''}`}>
                <label className="custom-legend">Dates*</label>
                <Calendar
                  id="survey-dates"
                  value={form.dates}
                  onChange={(e) => onDatesChange(e.value)}
                  selectionMode="range"
                  showIcon
                  dateFormat="mm/dd/yy"
                  placeholder="Select start and end dates"
                  className="w-full border-none"
                  readOnlyInput
                />
              </div>
              {isFieldInvalid('dates') && <small className="field-error">{getFieldError('dates')}</small>}
            </div>
          </div>

          {showPeriod && (
            <div className="form-row three-column">
              <div className="form-field">
                <SharedDropdown
                  label="Period"
                  id="survey-period"
                  options={PERIOD_OPTIONS}
                  placeholder="Select Period"
                  value={form.period}
                  onValueChange={onPeriodChange}
                />
              </div>

              {showPeriodNumber && (
                <div className="form-field">
                  <SharedDropdown
                    label="Period#"
                    id="survey-period-number"
                    options={periodNumberOptions}
                    placeholder="Select..."
                    value={form.periodNumber}
                    onValueChange={onPeriodNumberChange}
                  />
                </div>
              )}

              <div className="form-field"></div>
            </div>
          )}

          <div className="form-row three-column">
            <div className="form-field">
              <div className="custom-fieldset date-fieldset">
                <label className="custom-legend">Date after start date for first alert*</label>
                <Calendar
                  id="survey-alert-date"
                  value={form.firstAlertDate}
                  onChange={(e) => onFirstAlertChange(e.value)}
                  showIcon
                  minDate={minAlertDate || undefined}
                  maxDate={maxAlertDate || undefined}
                  dateFormat="mm/dd/yy"
                  placeholder="First Alert Date"
                  className="w-full border-none"
                />
              </div>
              {getFormError('alertBeforeStart') && <small className="field-error">Must be after or on start date.</small>}
              {getFormError('alertAfterEnd') && <small className="field-error">Must be before or on end date.</small>}
            </div>

            <div className="form-field">
              <div className="custom-fieldset date-fieldset">
                <label className="custom-legend">Date before due date for reminder*</label>
                <Calendar
                  id="survey-reminder-date"
                  value={form.reminderDate}
                  onChange={(e) => onReminderChange(e.value)}
                  showIcon
                  minDate={minReminderDate || undefined}
                  maxDate={maxReminderDate || undefined}
                  dateFormat="mm/dd/yy"
                  placeholder="Reminder Date"
                  className="w-full border-none"
                />
              </div>
              {getFormError('reminderBeforeStart') && <small className="field-error">Must be after or on start date.</small>}
              {getFormError('reminderBeforeAlert') && <small className="field-error">Must be after first alert date.</small>}
              {getFormError('reminderAfterEnd') && <small className="field-error">Must be before or on end date.</small>}
            </div>
          </div>

          <div className="form-row">
            <div className="checkbox-group">
              <Checkbox inputId="survey-active" checked={form.isActive} onChange={(e) => onIsActiveChange(e.checked)} />
              <label htmlFor="survey-active">Active</label>
            </div>
          </div>

          <div className="action-buttons form-actions-right" role="group" aria-label="Step 1 actions">
            <Button
              type="button"
              label="Save"
              className="p-button-primary"
              disabled={!addStepValid}
              loading={saving}
              aria-label="Save survey draft"
              onClick={onSave}
            />
            <Button
              type="button"
              label="Add Questions"
              icon="pi pi-angle-right"
              iconPos="right"
              className="p-button-primary"
              disabled={!addStepValid}
              aria-label="Continue to add questions"
              onClick={onAddQuestions}
            />
          </div>
        </form>
      )}

      {/* STEP 2: ADD QUESTIONS */}
      {currentStep === 1 && (
        <section className="questions-step" aria-label="Survey questions">
          <div className="questions-meta" role="group" aria-label="Survey context">
            <div className="meta-item">
              <span className="meta-label">{entityLabel} :</span>
              <span className="meta-value">{selectedEntityName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Survey :</span>
              <span className="meta-value">{selectedSurveyName}</span>
            </div>
          </div>

          <div className="questions-toolbar" role="toolbar" aria-label="Question section actions">
            <div className="toolbar-left"></div>
            <div className="toolbar-right">
              <Button type="button" label="Add Explanation" className="p-button-primary" aria-label="Add explanation for this section" onClick={openExplanationDialog} />
              <Button type="button" label="Add New Section" className="p-button-primary" aria-label="Add a new question section" onClick={addNewSection} />
            </div>
          </div>

          {!questionSections.length && (
            <div className="empty-sections-state" role="status" aria-live="polite">
              Click <b>Add New Section</b> to start building your survey questions.
            </div>
          )}

          {questionSections.map((section) => (
            <article className="question-section-card" key={section.id} aria-labelledby={`section-title-${section.id}`}>
              <div className="section-header">
                <button
                  type="button"
                  className="section-toggle"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={section.expanded}
                  aria-controls={`section-content-${section.id}`}
                  id={`section-title-${section.id}`}
                >
                  <i className={`pi ${section.expanded ? 'pi-angle-down' : 'pi-angle-right'}`} aria-hidden="true"></i>
                  <span>{section.title}</span>
                </button>
                <div className="section-actions" role="group" aria-label={`Actions for section ${section.title}`}>
                  <Button
                    type="button"
                    label="Add Question"
                    icon="pi pi-angle-down"
                    iconPos="right"
                    className="p-button-primary"
                    aria-label={`Add question to ${section.title}`}
                    onClick={() => addQuestion(section.id)}
                  />
                </div>
              </div>

              {section.expanded && (
                <div className="section-questions" id={`section-content-${section.id}`} role="list" aria-label={`${section.title} questions`}>
                  {!section.questions.length && (
                    <div className="empty-questions" role="status" aria-live="polite">No questions yet in this section.</div>
                  )}

                  {getRootQuestions(section).map((question, i) => {
                    const renderTabular = shouldRenderChildrenInTabularRow(section, question);
                    const rootTabularQuestions = getTabularQuestionsForParent(section, question.id);
                    return (
                      <div key={question.id}>
                        <div className={`question-row question-row-level-1${renderTabular ? ' question-row-tabular' : ''}`}>
                          <div className={`question-row-left${renderTabular ? ' question-row-left-tabular' : ''}`}>
                            <span className="question-prefix">{getLevelPrefix(1, i)}</span>
                            <span className="question-text">{question.text}</span>
                            {questionMenu(`l1-${section.id}-${question.id}`, section, question, true)}
                          </div>
                          <div className={`question-row-right${renderTabular ? ' question-row-right-tabular' : ''}`}>
                            {!renderTabular && renderInlineControl(question)}

                            {renderTabular && rootTabularQuestions.length ? (
                              <div className="tabular-grid tabular-grid-inline">
                                {rootTabularQuestions.map((subQuestion, j) => (
                                  <div className="tabular-grid-cell tabular-grid-cell-inline" key={subQuestion.id}>
                                    <div className="tabular-cell-header">
                                      <span className="question-prefix">{getLevelPrefix(2, j)}</span>
                                      <span className="question-text">{subQuestion.text}</span>
                                      {questionMenu(`t2-${section.id}-${subQuestion.id}`, section, subQuestion, false)}
                                    </div>
                                    <div className="tabular-cell-control">{renderInlineControl(subQuestion)}</div>
                                  </div>
                                ))}
                                <div className="tabular-grid-cell tabular-grid-cell-explanation">
                                  <div className="tabular-cell-header tabular-cell-header-spacer" aria-hidden="true"></div>
                                  <div className="tabular-cell-control">
                                    <input
                                      type="text"
                                      className="question-inline-explanation"
                                      value={questionExplanation || ''}
                                      placeholder="Explanation"
                                      readOnly
                                      aria-hidden="true"
                                      tabIndex={-1}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              question.answerControlType !== 'Blank' &&
                              !renderTabular && (
                                <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                              )
                            )}
                          </div>
                        </div>

                        {!renderTabular &&
                          isIndentedSubQuestionType(question) &&
                          getChildQuestions(section, question.id).map((subQuestion, j) => {
                            const subTabular = isTabularSubQuestionType(subQuestion);
                            return (
                              <div key={subQuestion.id}>
                                <div className={`question-row question-row-level-2${subTabular ? ' question-row-tabular' : ''}`}>
                                  <div className={`question-row-left${subTabular ? ' question-row-left-tabular' : ''}`}>
                                    <span className="question-prefix">{getLevelPrefix(2, j)}</span>
                                    <span className="question-text">
                                      {subQuestion.text}
                                      {subTabular ? ' :' : ''}
                                    </span>
                                    {questionMenu(`l2-${section.id}-${subQuestion.id}`, section, subQuestion, true)}
                                  </div>
                                  <div className={`question-row-right${subTabular ? ' question-row-right-tabular' : ''}`}>
                                    {subQuestion.answerControlType === 'Entry Box' && (
                                      <>
                                        <input
                                          type="text"
                                          className={`question-inline-input${subQuestion.entryBoxSize === 'Medium' ? ' entry-box-medium' : ''}${
                                            subQuestion.entryBoxSize === 'Large' ? ' entry-box-large' : ''
                                          }`}
                                          readOnly
                                          aria-hidden="true"
                                          tabIndex={-1}
                                        />
                                        <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                      </>
                                    )}
                                    {subQuestion.answerControlType === 'Drop Down' && (
                                      <>
                                        <div className="question-inline-dropdown">
                                          <span className="question-inline-dropdown-label">Dropdown List</span>
                                          <span className="question-inline-dropdown-value">{subQuestion.dropDownHeading || subQuestion.existingDropdownList || '-'}</span>
                                          <i className="pi pi-angle-down question-inline-dropdown-icon"></i>
                                        </div>
                                        <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                      </>
                                    )}
                                    {subQuestion.answerControlType === 'Checkbox (True/False)' && (
                                      <>
                                        <div className="question-inline-checkbox-slot">
                                          <input type="checkbox" className="question-inline-checkbox" disabled aria-hidden="true" tabIndex={-1} />
                                        </div>
                                        <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                      </>
                                    )}
                                  </div>
                                </div>

                                {!subTabular &&
                                  isIndentedSubQuestionType(subQuestion) &&
                                  getChildQuestions(section, subQuestion.id).map((innerQuestion, k) => (
                                    <div className="question-row question-row-level-3" key={innerQuestion.id}>
                                      <div className="question-row-left">
                                        <span className="question-prefix">{getLevelPrefix(3, k)}</span>
                                        <span className="question-text">{innerQuestion.text}</span>
                                        {questionMenu(`l3-${section.id}-${innerQuestion.id}`, section, innerQuestion, true)}
                                      </div>
                                      <div className="question-row-right">
                                        {innerQuestion.answerControlType === 'Entry Box' && (
                                          <>
                                            <input
                                              type="text"
                                              className={`question-inline-input${innerQuestion.entryBoxSize === 'Medium' ? ' entry-box-medium' : ''}${
                                                innerQuestion.entryBoxSize === 'Large' ? ' entry-box-large' : ''
                                              }`}
                                              readOnly
                                              aria-hidden="true"
                                              tabIndex={-1}
                                            />
                                            <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                          </>
                                        )}
                                        {innerQuestion.answerControlType === 'Drop Down' && (
                                          <>
                                            <div className="question-inline-dropdown">
                                              <span className="question-inline-dropdown-label">Dropdown List</span>
                                              <span className="question-inline-dropdown-value">{innerQuestion.dropDownHeading || innerQuestion.existingDropdownList || '-'}</span>
                                              <i className="pi pi-angle-down question-inline-dropdown-icon"></i>
                                            </div>
                                            <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                          </>
                                        )}
                                        {innerQuestion.answerControlType === 'Checkbox (True/False)' && (
                                          <>
                                            <div className="question-inline-checkbox-slot">
                                              <input type="checkbox" className="question-inline-checkbox" disabled aria-hidden="true" tabIndex={-1} />
                                            </div>
                                            <input type="text" className="question-inline-explanation" placeholder="Explanation" readOnly aria-hidden="true" tabIndex={-1} />
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          ))}

          <div className="questions-bottom-actions" role="group" aria-label="Step 2 actions">
            <Button type="button" label="Back" className="p-button-secondary" aria-label="Go back to previous step" onClick={prevStep} />
            <div className="bottom-actions-right">
              <Button type="button" label="Delete All Questions" className="p-button-danger" aria-label="Delete all questions" onClick={onDeleteAllQuestions} />
              <Button type="button" label="Get Template" className="p-button-primary" aria-label="Download question template" onClick={downloadTemplate} />
              <Button
                type="button"
                label="Confirm Clients & Review Participants"
                icon="pi pi-angle-right"
                iconPos="right"
                className="p-button-primary"
                aria-label="Continue to confirm clients and review participants"
                onClick={nextStep}
              />
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: CONFIRM CLIENTS */}
      {currentStep === 2 && (
        <section className="confirm-clients-step" aria-label="Confirm clients and review participants">
          <div className="questions-meta confirm-meta" role="group" aria-label="Survey context">
            <div className="meta-item">
              <span className="meta-label">{entityLabel} :</span>
              <span className="meta-value">{selectedEntityName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Survey :</span>
              <span className="meta-value">{selectedSurveyName}</span>
            </div>
          </div>

          <Table1
            rows={confirmClientRows}
            columns={CONFIRM_CLIENT_COLUMNS}
            isCheckboxDisabled={isConfirmClientCheckboxDisabled}
            onCheckboxChange={onConfirmClientCheckboxChange}
          />

          <div className="confirm-actions-row" role="group" aria-label="Step 3 actions">
            <div className="confirm-actions-left">
              <Button type="button" label="Back to Questions" className="p-button-secondary" aria-label="Go back to questions" onClick={prevStep} />
              <Button type="button" label="Reset" className="p-button-secondary" aria-label="Reset confirmed clients" onClick={resetConfirmClients} />
            </div>
            <div className="confirm-actions-right">
              <Button type="button" label="Save" className="p-button-primary" loading={saving} aria-label="Save confirmed clients" onClick={saveConfirmClients} />
              <Button type="button" label="Review Participants" className="p-button-primary" aria-label="Review participants" onClick={reviewParticipants} />
              <Button type="button" label="Review Email" icon="pi pi-angle-right" iconPos="right" className="p-button-primary" loading={saving} aria-label="Continue to review email" onClick={reviewEmail} />
            </div>
          </div>
        </section>
      )}

      {/* STEP 4: REVIEW EMAIL */}
      {currentStep === 3 && (
        <section className="review-email-step" aria-label="Review survey invitation email">
          <div className="questions-meta review-email-meta" role="group" aria-label="Survey context">
            <div className="meta-item">
              <span className="meta-label">{entityLabel} :</span>
              <span className="meta-value">{selectedEntityName}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Survey :</span>
              <span className="meta-value">{form.surveyName}</span>
            </div>
          </div>

          <div className="review-email-content">
            <label htmlFor="email-subject" className="sr-only">Email subject</label>
            <InputText
              id="email-subject"
              type="text"
              className="email-subject-input"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              aria-label="Email subject line"
            />
            <div className="email-editor-wrapper">
              <Editor value={emailBody} onTextChange={(e) => setEmailBody(e.htmlValue)} style={{ height: '320px' }} />
            </div>
          </div>

          <div className="questions-bottom-actions email-bottom-actions" role="group" aria-label="Step 4 actions">
            <Button type="button" label="Back to Clients & Participants" className="p-button-secondary" aria-label="Go back to clients and participants" onClick={prevStep} />
            <div className="bottom-actions-right">
              <Button type="button" label="Save Email Format" className="p-button-primary" aria-label="Save email format" onClick={saveEmailFormat} />
              <Button type="button" label="Launch" className="p-button-primary" aria-label="Launch survey" onClick={launchSurvey} />
              <Button type="button" label="Design Report" className="p-button-primary" aria-label="Design report" onClick={designReport} />
            </div>
          </div>
        </section>
      )}

      {/* EXPLANATION DIALOG */}
      <Dialog
        visible={showExplanationDialog}
        onHide={() => setShowExplanationDialog(false)}
        modal
        closable={false}
        resizable={false}
        draggable={false}
        className="custom-explanation-dialog"
        style={{ width: '560px' }}
        appendTo="self"
        role="dialog"
        aria-labelledby="explanation-dialog-title"
      >
        <div className="explanation-dialog-content">
          <h3 className="explanation-title" id="explanation-dialog-title">Add Explanation</h3>
          <label htmlFor="explanation-textarea" className="sr-only">Explanation text</label>
          <textarea
            id="explanation-textarea"
            className="explanation-textarea"
            rows={6}
            placeholder="Enter explanation..."
            aria-label="Explanation text"
            value={explanationDraft}
            onChange={(e) => setExplanationDraft(e.target.value)}
          ></textarea>
          <div className="explanation-actions" role="group" aria-label="Dialog actions">
            <Button type="button" label="Cancel" className="p-button-secondary" aria-label="Cancel adding explanation" onClick={closeExplanationDialog} />
            <Button type="button" label="Save" className="p-button-primary" aria-label="Save explanation" onClick={saveExplanation} />
          </div>
        </div>
      </Dialog>

      {/* ADD / EDIT SECTION DIALOG */}
      <Dialog
        visible={showSectionDialog}
        onHide={closeSectionDialog}
        modal
        resizable={false}
        draggable={false}
        closable
        className="custom-section-dialog"
        style={{ width: '620px' }}
        appendTo="self"
        role="dialog"
        aria-label={editingSectionId ? 'Edit Section dialog' : 'Add New Section dialog'}
        header={editingSectionId ? 'Edit Section' : 'Add New Section'}
      >
        <form className="dialog-form" autoComplete="off" role="form" aria-label="Section details form">
          <div className="dialog-field">
            <label className="dialog-label" htmlFor="section-name-input">Name*</label>
            <InputText
              id="section-name-input"
              type="text"
              placeholder="Name"
              aria-required="true"
              value={sectionForm.name}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            {sectionSubmitted && (!sectionForm.name || !String(sectionForm.name).trim()) && (
              <small id="section-name-error" className="field-error" role="alert" aria-live="polite">Name is required.</small>
            )}
          </div>

          <div className="dialog-field">
            <label className="dialog-label" htmlFor="section-description-input">Description</label>
            <textarea
              id="section-description-input"
              className="dialog-textarea"
              rows={5}
              placeholder="Section Description"
              aria-label="Section description"
              value={sectionForm.description}
              onChange={(e) => setSectionForm((prev) => ({ ...prev, description: e.target.value }))}
            ></textarea>
          </div>

          <div className="dialog-footer" role="group" aria-label="Dialog actions">
            <Button type="button" label="Cancel" className="p-button-secondary" aria-label="Cancel and close dialog" onClick={closeSectionDialog} />
            <Button
              type="button"
              label={editingSectionId ? 'Update' : 'Save'}
              className="p-button-primary"
              aria-label={editingSectionId ? 'Update section' : 'Save section'}
              onClick={saveSection}
              disabled={(!sectionForm.name || !String(sectionForm.name).trim()) && sectionSubmitted}
            />
          </div>
        </form>
      </Dialog>

      {/* DELETE SECTION CONFIRMATION DIALOG */}
      <Dialog
        visible={showDeleteSectionDialog}
        onHide={cancelDeleteSection}
        modal
        resizable={false}
        draggable={false}
        closable={false}
        className="custom-delete-dialog"
        style={{ width: '520px' }}
        appendTo="self"
        role="alertdialog"
        aria-labelledby="delete-section-title"
        aria-describedby="delete-section-message"
      >
        <div className="delete-dialog-content">
          <h3 className="delete-dialog-title" id="delete-section-title">Delete Section?</h3>
          <p className="delete-dialog-message" id="delete-section-message">
            Are you sure you want to delete this section? All questions inside it will be removed.
          </p>
          <div className="dialog-actions" role="group" aria-label="Confirmation actions">
            <Button type="button" label="Cancel" className="p-button-secondary" aria-label="Cancel deletion" onClick={cancelDeleteSection} />
            <Button type="button" label="Delete" className="p-button-danger" aria-label="Confirm delete section" onClick={deleteSection} />
          </div>
        </div>
      </Dialog>

      {/* ADD / EDIT QUESTION DIALOG */}
      <Dialog
        visible={showQuestionDialog}
        onHide={closeQuestionDialog}
        modal
        resizable={false}
        draggable={false}
        closable={false}
        showHeader={false}
        className="custom-question-dialog"
        style={{ width: '1040px' }}
        appendTo="self"
        role="dialog"
        aria-labelledby="question-dialog-title"
      >
        <h2 id="question-dialog-title" className="sr-only">{editingQuestionId ? 'Edit Question' : 'Add Question'}</h2>

        <form className="dialog-form dialog-question-form" autoComplete="off" role="form" aria-label={editingQuestionId ? 'Edit question form' : 'Add question form'}>
          <Button
            type="button"
            icon="pi pi-times"
            className="p-button-text p-button-rounded p-button-secondary"
            onClick={closeQuestionDialog}
            aria-label="Close Add Question dialog"
          />

          <div className="question-top-row">
            <div className="dialog-field">
              <label className="dialog-label">{entityLabel} :</label>
              <div className="readonly-display-text">{selectedEntityName}</div>
            </div>
            <div className="dialog-field">
              <label className="dialog-label">Survey :</label>
              <div className="readonly-display-text">{selectedSurveyName}</div>
            </div>
            <div className="dialog-field">
              <label className="dialog-label">&nbsp;</label>
              <SharedDropdown
                label="Section"
                options={getSectionDropdownOptions(questionSections)}
                placeholder="Select Section"
                value={questionForm.sectionId}
                onValueChange={handleQuestionSectionChange}
              />
            </div>
          </div>

          <div className="question-second-row">
            <div className="dialog-field">
              <label className="dialog-label">&nbsp;</label>
              <SharedDropdown
                label="Sub Question Of"
                options={parentOptionsForDialog}
                value={questionForm.subQuestionOf}
                onValueChange={handleQuestionParentChange}
              />
            </div>
            <div className="dialog-field">
              <label className="dialog-label" htmlFor="question-text-input">Question Text*</label>
              <InputText
                id="question-text-input"
                type="text"
                placeholder="Question Text*"
                aria-required="true"
                value={questionForm.questionText}
                onChange={(e) => setQField('questionText', e.target.value)}
              />
              {questionSubmitted && (!questionForm.questionText || !String(questionForm.questionText).trim()) && (
                <small id="question-text-error" className="field-error" role="alert" aria-live="polite">Question Text is required.</small>
              )}
            </div>
          </div>

          <div className="dialog-grid-full">
            <div className="dialog-field">
              <label className="dialog-label" htmlFor="question-description-input">Question Description</label>
              <textarea
                id="question-description-input"
                className="dialog-textarea question-definition-textarea"
                rows={4}
                aria-label="Question description"
                value={questionForm.questionDescription}
                onChange={(e) => setQField('questionDescription', e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="checkbox-row checkbox-row-primary">
            <Checkbox inputId="visibleToClients" checked={questionForm.visibleToClients} onChange={(e) => setQField('visibleToClients', e.checked)} />
            <label htmlFor="visibleToClients" className="checkbox-text">Visible to Clients</label>
          </div>

          <div className="question-third-row">
            <div className="dialog-field">
              <SharedDropdown
                label="Display Type*"
                options={DISPLAY_TYPE_OPTIONS}
                disabled={shouldLockDisplayTypeToTabular()}
                value={questionForm.displayType}
                onValueChange={(val) => setQField('displayType', val)}
              />
            </div>
            <div className="dialog-field">
              <SharedDropdown
                label="Answer Control Type"
                options={ANSWER_CONTROL_TYPE_OPTIONS}
                value={questionForm.answerControlType}
                onValueChange={(val) => setQField('answerControlType', val)}
              />
            </div>
            {questionForm.answerControlType === 'Entry Box' ? (
              <div className="dialog-field">
                <SharedDropdown label="Size" options={ENTRY_BOX_SIZE_OPTIONS} value={questionForm.entryBoxSize} onValueChange={(val) => setQField('entryBoxSize', val)} />
              </div>
            ) : (
              <div className="dialog-field">
                <SharedDropdown label="Sentiment Value ?" options={SENTIMENT_OPTIONS} value={questionForm.sentimentValue} onValueChange={(val) => setQField('sentimentValue', val)} />
              </div>
            )}
          </div>

          {questionForm.answerControlType === 'Entry Box' && (
            <div className="question-third-row">
              <div className="dialog-field">
                <SharedDropdown label="Required Answer Type" options={REQUIRED_ANSWER_TYPE_OPTIONS} value={questionForm.requiredAnswerType} onValueChange={(val) => setQField('requiredAnswerType', val)} />
              </div>
              <div className="dialog-field">
                <div className="custom-fieldset">
                  <label className="custom-legend" htmlFor="decimals-on-report">Decimals on Report ?</label>
                  <input
                    id="decimals-on-report"
                    name="decimalsOnReport"
                    type="text"
                    className="fieldset-input"
                    value={questionForm.decimalsOnReport}
                    onChange={(e) => setQField('decimalsOnReport', e.target.value)}
                    aria-label="Decimals on report"
                  />
                </div>
              </div>
              <div className="dialog-field">
                <SharedDropdown label="Sentiment Value ?" options={SENTIMENT_OPTIONS} value={questionForm.sentimentValue} onValueChange={(val) => setQField('sentimentValue', val)} />
              </div>
            </div>
          )}

          <div className="checkbox-grid-four">
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="metricReportable" checked={questionForm.metricReportable} onChange={(e) => setQField('metricReportable', e.checked)} />
              <label htmlFor="metricReportable" className="checkbox-text">Metric is Reportable?</label>
            </div>
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="showIndividualResponses" checked={questionForm.showIndividualResponses} onChange={(e) => setQField('showIndividualResponses', e.checked)} />
              <label htmlFor="showIndividualResponses" className="checkbox-text">Show Individual Responses on Reports</label>
            </div>
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="showInExecutiveSummary" checked={questionForm.showInExecutiveSummary} onChange={(e) => setQField('showInExecutiveSummary', e.checked)} />
              <label htmlFor="showInExecutiveSummary" className="checkbox-text">Show in Executive Summary</label>
            </div>
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="includeInVarianceTracker" checked={questionForm.includeInVarianceTracker} onChange={(e) => setQField('includeInVarianceTracker', e.checked)} />
              <label htmlFor="includeInVarianceTracker" className="checkbox-text">Include in Variance Tracker</label>
            </div>
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="showInChartGenerator" checked={questionForm.showInChartGenerator} onChange={(e) => setQField('showInChartGenerator', e.checked)} />
              <label htmlFor="showInChartGenerator" className="checkbox-text">Show in Chart Generator</label>
            </div>
            <div className="checkbox-row checkbox-row-compact">
              <Checkbox inputId="allowAutoMarkNA" checked={questionForm.allowAutoMarkNA} onChange={(e) => setQField('allowAutoMarkNA', e.checked)} />
              <label htmlFor="allowAutoMarkNA" className="checkbox-text">Allow Auto Mark NA</label>
            </div>
          </div>

          {questionForm.answerControlType === 'Drop Down' && (
            <div className="dropdown-dynamic-section">
              <div className="dialog-field" style={{ maxWidth: '320px' }}>
                <SharedDropdown
                  label="Choose an Existing Dropdown List"
                  options={EXISTING_DROPDOWN_LIST_OPTIONS}
                  value={questionForm.existingDropdownList}
                  onValueChange={(val) => setQField('existingDropdownList', val)}
                />
              </div>

              <div className="dropdown-values-card">
                <h4 className="dropdown-values-title" id="ddl-values-heading">Drop Down Values</h4>
                <div className="dropdown-values-fields" role="group" aria-labelledby="ddl-values-heading">
                  <label htmlFor="ddl-heading-input" className="sr-only">Drop down list heading</label>
                  <input
                    id="ddl-heading-input"
                    name="dropDownHeading"
                    type="text"
                    className="ddl-heading-input"
                    placeholder="ddl heading"
                    aria-label="Drop down list heading"
                    value={questionForm.dropDownHeading}
                    onChange={(e) => setQField('dropDownHeading', e.target.value)}
                  />
                  <label htmlFor="ddl-values-input" className="sr-only">Drop down list values</label>
                  <textarea
                    id="ddl-values-input"
                    name="dropDownValues"
                    className="ddl-values-textarea"
                    rows={3}
                    aria-label="Drop down list values"
                    value={questionForm.dropDownValues}
                    onChange={(e) => setQField('dropDownValues', e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="dropdown-checkboxes-row">
                <div className="checkbox-row checkbox-row-compact">
                  <Checkbox inputId="showNAInDropDown" checked={questionForm.showNAInDropDown} onChange={(e) => setQField('showNAInDropDown', e.checked)} />
                  <label htmlFor="showNAInDropDown" className="checkbox-text">Show NA in Drop Down</label>
                </div>
                <div className="checkbox-row checkbox-row-compact">
                  <Checkbox inputId="showNTInDropDown" checked={questionForm.showNTInDropDown} onChange={(e) => setQField('showNTInDropDown', e.checked)} />
                  <label htmlFor="showNTInDropDown" className="checkbox-text">Show NT in Drop Down</label>
                </div>
              </div>
            </div>
          )}

          {(questionForm.answerControlType === 'Calculated - Editable' || questionForm.answerControlType === 'Calculated - Non-editable') && (
            <div className="dynamic-block">
              <label className="dialog-label">Formula</label>
              <textarea className="dialog-textarea" rows={3} placeholder="Enter formula" value={questionForm.formula} onChange={(e) => setQField('formula', e.target.value)}></textarea>
            </div>
          )}

          <div className="dialog-footer dialog-footer-question" role="group" aria-label="Question dialog actions">
            <Button type="button" label="Cancel" className="p-button-secondary" aria-label="Cancel and close dialog" onClick={closeQuestionDialog} />
            <div className="dialog-footer-right">
              <Button type="button" label="Reset" className="p-button-primary" aria-label="Reset question form" onClick={resetQuestionForm} />
              <Button
                type="button"
                label={editingQuestionId ? 'Update' : 'Save'}
                className="p-button-primary"
                aria-label={editingQuestionId ? 'Update question' : 'Save question'}
                onClick={saveQuestion}
                disabled={isQuestionFormInvalid(questionForm) && questionSubmitted}
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* DELETE QUESTION CONFIRMATION DIALOG */}
      <Dialog
        visible={showDeleteQuestionDialog}
        onHide={cancelDeleteQuestion}
        modal
        resizable={false}
        draggable={false}
        closable={false}
        className="custom-delete-dialog"
        style={{ width: '520px' }}
        appendTo="self"
        role="alertdialog"
        aria-labelledby="delete-question-title"
        aria-describedby="delete-question-message"
      >
        <div className="delete-dialog-content">
          <h3 className="delete-dialog-title" id="delete-question-title">Delete Question?</h3>
          <p className="delete-dialog-message" id="delete-question-message">This action will permanently remove the question from the selected section.</p>
          <div className="dialog-actions" role="group" aria-label="Confirmation actions">
            <Button type="button" label="Cancel" className="p-button-secondary" aria-label="Cancel deletion" onClick={cancelDeleteQuestion} />
            <Button type="button" label="Delete" className="p-button-danger" aria-label="Confirm delete question" onClick={deleteQuestion} />
          </div>
        </div>
      </Dialog>

      {/* CANCEL CONFIRMATION DIALOG */}
      <Dialog
        visible={showCancelDialog}
        onHide={onKeepEditing}
        modal
        closable={false}
        resizable={false}
        draggable={false}
        className="custom-cancel-dialog"
        style={{ width: '560px', borderRadius: '12px', boxShadow: 'none' }}
        appendTo="self"
        role="alertdialog"
        aria-labelledby="cancel-survey-dialog-title"
        aria-describedby="cancel-survey-dialog-message"
      >
        <div className="cancel-dialog-content">
          <div className="dialog-icon-container" aria-hidden="true">
            <i className="pi pi-exclamation-triangle dialog-icon"></i>
          </div>
          <h2 className="dialog-title" id="cancel-survey-dialog-title">Unsaved Changes</h2>
          <p className="dialog-message" id="cancel-survey-dialog-message">You have unsaved changes, do you want to leave without saving?</p>
          <div className="dialog-actions" role="group" aria-label="Confirmation actions">
            <Button type="button" label="No" className="p-button-secondary" aria-label="Stay and keep editing" onClick={onKeepEditing} />
            <Button type="button" label="Yes" className="p-button-primary" aria-label="Leave without saving" onClick={onConfirmLeave} />
          </div>
        </div>
      </Dialog>
    </main>
  );
}
