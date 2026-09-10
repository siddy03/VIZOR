'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import './table1.css';

export function Table1({
  rows = [],
  columns = [],
  emptyTitle = 'No Records Found!',
  paginator = false,
  rowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50],
  showEditAction = false,
  editAriaLabel = 'Edit row',
  showDeleteAction = false,
  deleteAriaLabel = 'Delete row',
  rowActions = [],
  expandableRows = false,
  dataKey = 'id',
  isCheckboxDisabled = null,
  onCheckboxChange,
  onEdit,
  onDelete,
  onActionClick,
  rowExpansionTemplate,
}) {
  const [expandedRows, setExpandedRows] = useState(null);

  const getTextValue = (row, field) => {
    const value = row?.[field];
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  };

  const isCellDisabled = (row, field) => (isCheckboxDisabled ? isCheckboxDisabled(row, field) : false);

  const hasActions = showEditAction || showDeleteAction || rowActions.length > 0;

  const cellBody = (col) => (row) => {
    const type = col.type || 'text';
    if (type === 'checkbox') {
      return (
        <Checkbox
          inputId={`cb-${col.field}-${row[dataKey] ?? ''}`}
          checked={!!row?.[col.field]}
          disabled={isCellDisabled(row, col.field)}
          aria-label={`${col.header} for row`}
          onChange={(e) => onCheckboxChange?.({ row, field: col.field, checked: e.checked })}
        />
      );
    }
    if (type === 'status') {
      return (
        <span className="status-text" aria-label={`Status: ${row[col.field]}`}>
          {row[col.field]}
        </span>
      );
    }
    return getTextValue(row, col.field);
  };

  const actionsBody = (row) => (
    <div className="row-actions" role="group" aria-label="Row actions">
      {rowActions.map((action) => (
        <Button
          key={action.id}
          type="button"
          icon={action.icon}
          title={action.title || action.tooltip}
          className={`p-button-text p-button-rounded action-btn ${action.cssClass || ''}`}
          aria-label={action.tooltip}
          onClick={() => onActionClick?.({ actionId: action.id, row })}
        />
      ))}
      {showEditAction && (
        <Button
          type="button"
          icon="icon-edit-svg"
          className="p-button-text p-button-rounded p-button-plain table1-edit-btn"
          aria-label={editAriaLabel}
          onClick={() => onEdit?.(row)}
        />
      )}
      {showDeleteAction && (
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-text p-button-rounded p-button-plain action-btn delete-btn"
          title="Delete"
          aria-label={deleteAriaLabel}
          onClick={() => onDelete?.(row)}
        />
      )}
    </div>
  );

  const emptyMessage = (
    <div className="table1-empty-state" role="status" aria-live="polite">
      <img src="/assets/no-records.png" alt="" aria-hidden="true" />
      <span>{emptyTitle}</span>
    </div>
  );

  const expansionProps = expandableRows
    ? {
        expandedRows,
        onRowToggle: (e) => setExpandedRows(e.data),
        rowExpansionTemplate: (row) => rowExpansionTemplate?.(row),
      }
    : {};

  return (
    <div className="table1-host">
      <div className="card" role="region" aria-label={emptyTitle ? 'Data table' : undefined}>
        <DataTable
          value={rows}
          dataKey={dataKey}
          tableStyle={{ minWidth: '50rem' }}
          paginator={paginator}
          rows={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          paginatorTemplate={
            paginator
              ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport'
              : undefined
          }
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          emptyMessage={emptyMessage}
          aria-label="Data table"
          {...expansionProps}
        >
          {expandableRows && <Column expander style={{ width: '3rem' }} />}
          {columns.map((col) => (
            <Column
              key={col.field}
              field={col.field}
              header={col.header}
              sortable={!!col.sortable}
              body={cellBody(col)}
              headerClassName="text-900 text-sm font-semibold whitespace-nowrap"
              bodyClassName="text-600 text-sm font-normal"
            />
          ))}
          {hasActions && (
            <Column
              header={<span className="sr-only">Actions</span>}
              body={actionsBody}
              className="text-center"
              headerClassName="w-8rem text-center"
            />
          )}
        </DataTable>
      </div>
    </div>
  );
}
