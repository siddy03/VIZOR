'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { Table2 } from '@/components/shared/Table2';
import { SharedSearchbar } from '@/components/shared/SharedSearchbar';
import { loadSurveys, deleteSurvey } from '@/services/surveyService';
import { useAppSelector } from '@/store/hooks';
import './page.css';

const BREADCRUMB_ITEMS = [{ label: 'Surveys' }, { label: 'View Survey' }];

const SURVEY_TYPE_OPTIONS = [
  { label: 'All', value: 'All' },
  { label: 'Benchmark', value: 'Benchmark' },
  { label: 'Ad Hoc', value: 'Ad Hoc' },
];

const SURVEY_COLS = [
  { field: 'name', header: 'Survey Name' },
  { field: 'type', header: 'Survey Type' },
  { field: 'timePeriod', header: 'Time Period' },
  { field: 'year', header: 'Year' },
  { field: 'surveyDates', header: 'Survey Dates' },
  { field: 'firstReminder', header: 'First Reminder' },
  { field: 'secondReminder', header: 'Second Reminder' },
  { field: 'status', header: 'Survey Status' },
];

function formatDate(isoDate) {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '-';
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  } catch {
    return '-';
  }
}

function normalizeSurveyType(value) {
  return (value || '').toLowerCase().replace(/\s+/g, '');
}

function mapToTableRow(s) {
  const startDate = s.startDate ? formatDate(s.startDate) : '';
  const endDate = s.endDate ? formatDate(s.endDate) : '';
  const surveyDates = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate;

  return {
    id: s.id,
    name: s.surveyName || '-',
    type: s.surveyType || '-',
    timePeriod: s.period ? (s.periodNumber ? `${s.period} ${s.periodNumber}` : s.period) : '-',
    year: s.year || '-',
    surveyDates: surveyDates || '-',
    firstReminder: s.firstAlertDate ? formatDate(s.firstAlertDate) : '-',
    secondReminder: s.reminderDate ? formatDate(s.reminderDate) : '-',
    status: s.status || 'Draft',
  };
}

export default function ViewSurveyPage() {
  const router = useRouter();
  const allSurveys = useAppSelector((s) => s.survey.surveys);

  const [activeTab, setActiveTab] = useState('roundtables');
  const [selectedContext, setSelectedContext] = useState('All');
  const [selectedSurveyType, setSelectedSurveyType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSurveys();
  }, []);

  const filterByTab = (surveys) => {
    const sourceFilter = activeTab === 'roundtables' ? 'Roundtable' : 'Project';
    return surveys.filter((s) => s.source === sourceFilter);
  };

  const contextOptions = useMemo(() => {
    const sourceFilter = activeTab === 'roundtables' ? 'Roundtable' : 'Project';
    const entitySet = new Set(
      allSurveys
        .filter((s) => s.source === sourceFilter)
        .map((s) => s.entity?.trim())
        .filter((entity) => !!entity)
    );
    const entityOptions = Array.from(entitySet)
      .sort((a, b) => a.localeCompare(b))
      .map((entity) => ({ label: entity, value: entity }));
    return [{ label: 'All', value: 'All' }, ...entityOptions];
  }, [allSurveys, activeTab]);

  const surveyData = useMemo(() => {
    const sourceFiltered = filterByTab(allSurveys);
    const contextFiltered =
      selectedContext === 'All'
        ? sourceFiltered
        : sourceFiltered.filter((survey) => survey.entity === selectedContext);

    const surveyTypeFiltered =
      selectedSurveyType === 'All'
        ? contextFiltered
        : contextFiltered.filter(
            (survey) => normalizeSurveyType(survey.surveyType) === normalizeSurveyType(selectedSurveyType)
          );

    const query = searchQuery.trim().toLowerCase();
    const searched = !query
      ? surveyTypeFiltered
      : surveyTypeFiltered.filter((survey) => {
          const haystack = [
            survey.surveyName,
            survey.entity,
            survey.surveyType,
            survey.period,
            survey.periodNumber,
            String(survey.year ?? ''),
            survey.status,
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(query);
        });

    return searched.map((survey) => mapToTableRow(survey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSurveys, activeTab, selectedContext, selectedSurveyType, searchQuery]);

  const switchTab = (tab) => {
    if (tab !== 'roundtables' && tab !== 'projects') return;
    setActiveTab(tab);
    setSelectedContext('All');
    setSelectedSurveyType('All');
    setSearchQuery('');
  };

  const handleEdit = (row) => {
    if (row?.id) {
      router.push(`/surveys/edit/${row.id}`);
    }
  };

  const handleCopy = (row) => {
    console.log('Copy clicked for', row);
  };

  const handleDelete = async (row) => {
    if (!row?.id) return;
    const surveyName = row.name && row.name !== '-' ? row.name : 'this survey';
    const confirmed = window.confirm(`Delete survey "${surveyName}"? This cannot be undone.`);
    if (!confirmed) return;

    const ok = await deleteSurvey(row.id);
    if (!ok) {
      window.alert(`Could not delete survey "${surveyName}". Please try again.`);
    }
  };

  const panelId = activeTab === 'roundtables' ? 'view-survey-panel-roundtables' : 'view-survey-panel-projects';
  const tabId = activeTab === 'roundtables' ? 'view-survey-tab-roundtables' : 'view-survey-tab-projects';

  return (
    <main className="view-survey-page-container" aria-label="View surveys">
      <a className="skip-link" href="#view-surveys-table">Skip to surveys table</a>

      <Breadcrumb items={BREADCRUMB_ITEMS} />

      <div className="main-card">
        <div className="tab-row" role="tablist" aria-label="Survey source tabs">
          <button
            className={`tab-btn${activeTab === 'roundtables' ? ' active' : ''}`}
            role="tab"
            id="view-survey-tab-roundtables"
            aria-controls="view-survey-panel-roundtables"
            aria-selected={activeTab === 'roundtables'}
            tabIndex={activeTab === 'roundtables' ? 0 : -1}
            onClick={() => switchTab('roundtables')}
          >
            Roundtables
          </button>
          <button
            className={`tab-btn${activeTab === 'projects' ? ' active' : ''}`}
            role="tab"
            id="view-survey-tab-projects"
            aria-controls="view-survey-panel-projects"
            aria-selected={activeTab === 'projects'}
            tabIndex={activeTab === 'projects' ? 0 : -1}
            onClick={() => switchTab('projects')}
          >
            Projects
          </button>
        </div>

        <div className="content-container" role="tabpanel" id={panelId} aria-labelledby={tabId} tabIndex={0}>
          <section className="filter-bar" role="search" aria-label="Survey filters">
            <div className="filter-group">
              <div className="dropdown-wrapper">
                <SharedDropdown
                  label={activeTab === 'roundtables' ? 'Roundtables' : 'Projects'}
                  options={contextOptions}
                  value={selectedContext}
                  onValueChange={(v) => setSelectedContext(v || 'All')}
                  optionLabel="label"
                  placeholder="All"
                />
              </div>

              <div className="dropdown-wrapper">
                <SharedDropdown
                  label="Survey Type"
                  options={SURVEY_TYPE_OPTIONS}
                  value={selectedSurveyType}
                  onValueChange={(v) => setSelectedSurveyType(v || 'All')}
                  optionLabel="label"
                  placeholder="All"
                />
              </div>

              <div className="filter-item search-filter">
                <SharedSearchbar
                  placeholder="Search"
                  ariaLabel="Search surveys"
                  id="view-survey-search"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onSearch={() => {}}
                />
              </div>
            </div>
          </section>

          <div id="view-surveys-table" className="table-container">
            <Table2
              data={surveyData}
              cols={SURVEY_COLS}
              showEdit
              showCopy
              showDelete
              onEdit={handleEdit}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
