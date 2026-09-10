'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { ArGuard } from '@/components/guards/ArGuard';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { SharedSearchbar } from '@/components/shared/SharedSearchbar';
import { Table1 } from '@/components/shared/Table1';
import { useAppSelector } from '@/store/hooks';
import { loadClients, deleteClient } from '@/services/clientService';
import './page.css';

const breadcrumbItems = [{ label: 'Admin' }, { label: 'Clients' }];

const statusOptions = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const clientColumns = [
  { field: 'name', header: 'Client Name', sortable: true },
  { field: 'parentClient', header: 'Parent Client', sortable: true },
  { field: 'status', header: 'Status', sortable: true },
];

const clientActions = [
  { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit', cssClass: 'p-button-secondary' },
  { id: 'delete', icon: 'pi pi-trash', tooltip: 'Delete', cssClass: 'p-button-danger' },
];

export default function ClientsPage() {
  const router = useRouter();
  const clients = useAppSelector((s) => s.client.clients);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [selectedParentClient, setSelectedParentClient] = useState('All');

  useEffect(() => {
    loadClients();
  }, []);

  const parentClientOptions = useMemo(() => {
    const parents = new Set();
    (clients || []).forEach((c) => {
      if (c.parentClient && c.parentClient !== '-') {
        parents.add(c.parentClient);
      }
    });
    return [
      { label: 'All', value: 'All' },
      ...Array.from(parents).map((p) => ({ label: p, value: p })),
    ];
  }, [clients]);

  const filteredClients = useMemo(() => {
    let result = clients || [];

    if (selectedStatus !== 'All') {
      result = result.filter((c) => c.status === selectedStatus);
    }

    if (selectedParentClient !== 'All') {
      result = result.filter((c) => c.parentClient === selectedParentClient);
    }

    const term = searchTerm.toLowerCase();
    if (term) {
      result = result.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(term)) ||
          (c.parentClient && c.parentClient.toLowerCase().includes(term))
      );
    }

    return result;
  }, [clients, selectedStatus, selectedParentClient, searchTerm]);

  const navigateToAddClient = () => {
    router.push('/admin/clients/add');
  };

  const onActionClick = ({ actionId, row }) => {
    if (actionId === 'edit') {
      router.push(`/admin/clients/edit/${row.id}`);
    } else if (actionId === 'delete') {
      const confirmed = window.confirm(`Delete client "${row.name}"?`);
      if (confirmed) {
        deleteClient(row.id);
      }
    }
  };

  return (
    <ArGuard>
      <main
        className="clients-page projects-page-container"
        aria-labelledby="page-heading"
        aria-label="Clients management"
      >
        {/* Skip to main content link for keyboard users */}
        <a className="skip-link" href="#clients-table">
          Skip to clients table
        </a>

        {/* Breadcrumb + Add Button Row */}
        <div className="top-row">
          <Breadcrumb items={breadcrumbItems} />
          <Button
            type="button"
            label="Add New Client"
            className="p-button-primary"
            aria-label="Add new client"
            onClick={navigateToAddClient}
          />
        </div>

        {/* Filters (3-column grid) */}
        <section className="filter-bar" role="search" aria-label="Client filters">
          {/* Status Dropdown */}
          <div className="filter-item status-filter">
            <SharedDropdown
              label="Status"
              options={statusOptions}
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v)}
              optionLabel="label"
              placeholder="Active"
            />
          </div>

          {/* Parent Client Dropdown */}
          <div className="filter-item parent-client-filter">
            <SharedDropdown
              label="Parent Client"
              options={parentClientOptions}
              value={selectedParentClient}
              onValueChange={(v) => setSelectedParentClient(v)}
              optionLabel="label"
              placeholder="All"
            />
          </div>

          {/* Search Bar */}
          <div className="filter-item search-filter">
            <SharedSearchbar
              placeholder="Search"
              ariaLabel="Search clients"
              id="clients-search"
              value={searchTerm}
              onValueChange={(v) => setSearchTerm(v)}
            />
          </div>
        </section>

        {/* Table */}
        <section id="clients-table" aria-label="Clients data table" tabIndex={-1}>
          <Table1
            rows={filteredClients}
            columns={clientColumns}
            rowActions={clientActions}
            paginator
            rowsPerPage={10}
            onActionClick={onActionClick}
          />
        </section>
      </main>
    </ArGuard>
  );
}
