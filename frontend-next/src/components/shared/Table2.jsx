'use client';

import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import './table2.css';

export function Table2({
  data = [],
  cols = [],
  showEdit = true,
  showCopy = true,
  showDelete = true,
  onEdit,
  onCopy,
  onDelete,
}) {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(0);
  const hasActions = showEdit || showCopy || showDelete;

  const headerTemplate = (col) => {
    const sortable = col.sortable !== false;
    if (!sortable) return col.header;
    const order = sortField === col.field ? sortOrder : 0;
    return (
      <span className="whitespace-nowrap">
        {col.header}
        <span className="sort-arrows" aria-hidden="true">
          <i className={`pi pi-arrow-up${order === 1 ? ' active' : ''}`}></i>
          <i className={`pi pi-arrow-down${order === -1 ? ' active' : ''}`}></i>
        </span>
      </span>
    );
  };

  const actionsBody = (row) => (
    <div className="row-actions" role="group" aria-label="Row actions">
      {showEdit && (
        <Button
          icon="icon-edit-svg"
          className="p-button-text p-button-rounded p-button-plain action-btn"
          title="Edit"
          aria-label="Edit row"
          onClick={() => onEdit?.(row)}
        />
      )}
      {showCopy && (
        <Button
          icon="pi pi-copy"
          className="p-button-text p-button-rounded p-button-plain action-btn"
          title="Copy"
          aria-label="Copy row"
          onClick={() => onCopy?.(row)}
        />
      )}
      {showDelete && (
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-rounded p-button-plain action-btn delete-btn"
          title="Delete"
          aria-label="Delete row"
          onClick={() => onDelete?.(row)}
        />
      )}
    </div>
  );

  const emptyMessage = (
    <div className="flex flex-column align-items-center gap-3" role="status" aria-live="polite">
      <img src="/assets/no-records.png" alt="" aria-hidden="true" style={{ width: '150px', height: 'auto' }} />
      <span className="text-900 font-semibold text-lg">No Records Found!</span>
    </div>
  );

  return (
    <div className="table2-host">
      <DataTable
        value={data}
        className="p-datatable-striped"
        tableStyle={{ minWidth: '60rem' }}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={(e) => {
          setSortField(e.sortField);
          setSortOrder(e.sortOrder);
        }}
        emptyMessage={emptyMessage}
        aria-label="Data table"
      >
        {cols.map((col) => (
          <Column
            key={col.field}
            field={col.field}
            header={headerTemplate(col)}
            sortable={col.sortable !== false}
            body={(row) => row[col.field] || '-'}
            headerClassName="text-900 text-sm font-semibold whitespace-nowrap"
            bodyClassName="text-600 text-sm"
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
  );
}
