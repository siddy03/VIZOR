'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { ArGuard } from '@/components/guards/ArGuard';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { SharedSearchbar } from '@/components/shared/SharedSearchbar';
import { Table1 } from '@/components/shared/Table1';
import { useAppSelector } from '@/store/hooks';
import { loadRoundtables, deleteRoundtable } from '@/services/roundtableService';
import './page.css';



const breadcrumbItems = [{ label: 'Admin' }, { label: 'Roundtables' }];

const statusOptions = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const roundtableColumns = [
  { field: 'name', header: 'Roundtable Name' },
  { field: 'clientsWithAccess', header: 'Client(s) With Access' },
  { field: 'directors', header: 'Director(s)' },
  { field: 'associates', header: 'Associate(s)' },
  { field: 'status', header: 'Status' },
];

export default function RoundtablesPage() {
  const router = useRouter();
  const roundtables = useAppSelector((s) => s.roundtable.roundtables);

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const announceTimer = useRef(null);

  useEffect(() => {
    loadRoundtables();
  }, []);

  const filteredRoundtables = useMemo(() => {
    let filtered = [...roundtables];

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.directors.toLowerCase().includes(search) ||
          r.associates.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [roundtables, selectedStatus, searchText]);

  // Announce filtered results count to screen readers (debounced)
  useEffect(() => {
    const count = filteredRoundtables.length;

    let announcement = '';
    if (count === 0) {
      announcement = 'No roundtables found';
    } else if (count === 1) {
      announcement = '1 roundtable found';
    } else {
      announcement = `${count} roundtables found`;
    }

    if (selectedStatus !== 'All') {
      announcement += `, filtered by ${selectedStatus}`;
    }
    if (searchText.trim()) {
      announcement += `, searching for "${searchText}"`;
    }

    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => {
      setLiveAnnouncement(announcement);
    }, 300);

    return () => clearTimeout(announceTimer.current);
  }, [filteredRoundtables, selectedStatus, searchText]);

  const onStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
  };

  const onSearchChange = (newText) => {
    setSearchText(newText);
  };

  const editRoundtable = (roundtable) => {
    router.push(`/admin/roundtables/edit/${roundtable.id}`);
  };

  const onDeleteRoundtable = async (roundtable) => {
    const confirmed = window.confirm(`Delete roundtable "${roundtable.name}"?`);
    if (!confirmed) return;
    const ok = await deleteRoundtable(roundtable.id);
    if (!ok) {
      window.alert(`Could not delete roundtable "${roundtable.name}". Please try again.`);
    }
  };

  const addNewRoundtable = () => {
    router.push('/admin/roundtables/add');
  };

  return (
    <ArGuard>
      <main className="roundtables-page roundtables-page-container" aria-label="Roundtables management">
        {/* Skip to main content link for keyboard users */}
        <a className="skip-link" href="#roundtables-table" id="skip-to-content">
          Skip to roundtables table
        </a>

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Filters Section */}
        <section className="filter-bar" aria-label="Roundtable filters" role="search">
          {/* Status Filter with Custom Fieldset */}
          <div className="filter-item status-filter">
            <SharedDropdown
              label="Status"
              id="status-filter-label"
              options={statusOptions}
              value={selectedStatus}
              onValueChange={(v) => onStatusChange(v)}
              optionLabel="label"
              placeholder="All"
              ariaLabel={`Filter by status, currently showing ${selectedStatus}`}
            />
          </div>

          {/* Search Bar */}
          <div className="filter-item search-filter">
            <SharedSearchbar
              placeholder="Search"
              ariaLabel="Search roundtables"
              id="roundtable-search"
              value={searchText}
              onValueChange={(v) => onSearchChange(v)}
            />
          </div>

          {/* Add Button */}
          <div className="action-item">
            <Button
              type="button"
              label="Add New Roundtable"
              className="p-button-primary"
              aria-label="Add new roundtable"
              onClick={addNewRoundtable}
            />
          </div>
        </section>

        {/* Live region for dynamic announcements */}
        <div
          id="search-results-status"
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
          role="status"
        >
          {liveAnnouncement}
        </div>

        {/* Roundtables Data Table */}
        <section id="roundtables-table" aria-label="Roundtables data" tabIndex={-1}>
          <Table1
            rows={filteredRoundtables}
            columns={roundtableColumns}
            showEditAction
            showDeleteAction
            editAriaLabel="Edit roundtable"
            deleteAriaLabel="Delete roundtable"
            onEdit={editRoundtable}
            onDelete={onDeleteRoundtable}
          />
        </section>
      </main>
    </ArGuard>
  );
}
