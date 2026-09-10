'use client';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import './page.css';

const SURVEYS = [
  { id: '1', surveyName: '2023 Annual Engagement', datePublished: '01/10/2024', participantsInvited: 150, participantsResponded: 120, responseRate: '80%', status: 'Published' },
  { id: '2', surveyName: 'Q4 Customer Feedback', datePublished: '12/15/2023', participantsInvited: 500, participantsResponded: 250, responseRate: '50%', status: 'Closed' },
  { id: '3', surveyName: 'New Product Interest', datePublished: '02/05/2024', participantsInvited: 200, participantsResponded: 45, responseRate: '22.5%', status: 'Open' },
  { id: '4', surveyName: 'Training Feedback', datePublished: '02/12/2024', participantsInvited: 30, participantsResponded: 28, responseRate: '93%', status: 'Open' },
];

function getSeverity(status) {
  switch (status) {
    case 'Published':
    case 'Open':
      return 'success';
    case 'Closed':
      return 'secondary';
    default:
      return undefined;
  }
}

export default function PublishedSurveysPage() {
  const statusBody = (survey) => (
    <>
      <span className="p-column-title" aria-hidden="true">Status</span>
      <Tag value={survey.status} severity={getSeverity(survey.status)} aria-label={`Status: ${survey.status}`} />
    </>
  );

  const actionsBody = (survey) => (
    <Button
      icon="pi pi-eye"
      className="p-button-text p-button-rounded p-button-secondary"
      title="View Results"
      aria-label={`View results for ${survey.surveyName || 'this survey'}`}
    />
  );

  const cellBody = (field, label, className) => (survey) => (
    <>
      <span className="p-column-title" aria-hidden="true">{label}</span>
      <span className={className}>{survey[field]}</span>
    </>
  );

  const emptyMessage = (
    <div className="text-center p-4">
      <span role="status" aria-live="polite">No published surveys found.</span>
    </div>
  );

  return (
    <main className="published-surveys-page-container" aria-labelledby="published-surveys-heading">
      <div className="header-row">
        <h2 id="published-surveys-heading" className="text-xl font-semibold m-0 text-900">Published Surveys</h2>
      </div>

      <DataTable
        value={SURVEYS}
        className="p-datatable-striped"
        tableStyle={{ minWidth: '60rem' }}
        responsiveLayout="stack"
        breakpoint="960px"
        emptyMessage={emptyMessage}
        role="region"
        aria-label="Published surveys list"
      >
        <Column field="surveyName" header="Survey Name" sortable body={cellBody('surveyName', 'Survey Name')} />
        <Column field="datePublished" header="Date Published" sortable body={cellBody('datePublished', 'Date Published')} />
        <Column field="participantsInvited" header="Invited" sortable className="text-right" headerClassName="text-right" body={cellBody('participantsInvited', 'Invited')} />
        <Column field="participantsResponded" header="Responded" sortable className="text-right" headerClassName="text-right" body={cellBody('participantsResponded', 'Responded')} />
        <Column field="responseRate" header="Response Rate" sortable className="text-right" headerClassName="text-right" body={cellBody('responseRate', 'Rate')} />
        <Column field="status" header="Status" sortable body={statusBody} />
        <Column header={<span className="sr-only">Actions</span>} body={actionsBody} className="text-center" headerClassName="w-4rem" />
      </DataTable>
    </main>
  );
}
