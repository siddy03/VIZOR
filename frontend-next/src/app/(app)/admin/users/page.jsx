'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { ArGuard } from '@/components/guards/ArGuard';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { SharedSearchbar } from '@/components/shared/SharedSearchbar';
import { Table1 } from '@/components/shared/Table1';
import { useAppSelector } from '@/store/hooks';
import {
  loadUsers,
  loadUserRequests,
  deleteUser,
  deleteUserRequest,
} from '@/services/userService';
import './page.css';

const breadcrumbItems = [{ label: 'Admin' }, { label: 'Users' }];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'All', value: 'all' },
];

const roundtableOptions = [
  { label: 'All Roundtables', value: null },
  { label: 'RONE', value: 'RONE' },
  { label: 'RTHIRD', value: 'RTHIRD' },
];

const clientOptions = [
  { label: 'All Clients', value: null },
  { label: 'c3', value: 'c3' },
  { label: 'c1', value: 'c1' },
  { label: 'c2', value: 'c2' },
];

const usersColumns = [
  { field: 'email', header: 'Email', sortable: true },
  { field: 'firstName', header: 'First Name', sortable: true },
  { field: 'lastName', header: 'Last Name', sortable: true },
  { field: 'role', header: 'Role', sortable: true },
  { field: 'roundtables', header: 'Roundtable(s)', sortable: true },
  { field: 'client', header: 'Client', sortable: true },
  { field: 'status', header: 'Status', sortable: true, type: 'status' },
  { field: 'lastLoggedIn', header: 'Last Logged In', sortable: true },
];

const usersActions = [
  { id: 'mimic', icon: 'pi pi-shield', tooltip: 'Mimic', cssClass: 'btn-mimic' },
  { id: 'transfer', icon: 'pi pi-sitemap', tooltip: 'Transfer', cssClass: 'btn-transfer' },
  { id: 'resend', icon: 'pi pi-envelope', tooltip: 'Resend Invite', cssClass: 'btn-resend' },
  { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit', cssClass: 'btn-edit' },
  { id: 'delete', icon: 'pi pi-trash', tooltip: 'Delete', cssClass: 'p-button-danger' },
];

const requestsColumns = [
  { field: 'status', header: 'Request Status', sortable: true, type: 'status' },
  { field: 'email', header: 'Email', sortable: true },
  { field: 'firstName', header: 'First Name', sortable: true },
  { field: 'lastName', header: 'Last Name', sortable: true },
  { field: 'client', header: 'Client', sortable: true },
  { field: 'roundtables', header: 'Roundtable(s)', sortable: true },
  { field: 'requestedBy', header: 'Requested By', sortable: true },
];

const requestsActions = [
  { id: 'view', icon: 'pi pi-eye', tooltip: 'View', cssClass: 'btn-transfer' },
  { id: 'delete', icon: 'pi pi-trash', tooltip: 'Delete', cssClass: 'p-button-danger' },
];

export default function UsersPage() {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('users');

  const [selectedRoundtable, setSelectedRoundtable] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Raw rows come from the backend via Redux
  const rawUsers = useAppSelector((s) => s.user.users);
  const rawUserRequests = useAppSelector((s) => s.user.userRequests);

  // Adapt backend shape -> the shape the table & filters already use.
  // (Keeps the UI identical to before.)
  const allUsers = useMemo(
    () =>
      (rawUsers || []).map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        role: u.role,
        roundtables: u.roundtables ?? '',
        client: u.clientName ?? '',
        status: u.active === false ? 'Inactive' : 'Active',
        lastLoggedIn: u.lastLoggedIn ? new Date(u.lastLoggedIn).toLocaleString() : '',
      })),
    [rawUsers]
  );

  const allUserRequests = useMemo(
    () =>
      (rawUserRequests || []).map((r) => ({
        id: r.id,
        email: r.email,
        firstName: r.firstName ?? '',
        lastName: r.lastName ?? '',
        role: r.role,
        roundtables: r.roundtables ?? '',
        client: r.clientName ?? '',
        status: r.status,
        requestedBy: r.requestedBy,
        requestStatus: r.requestStatus,
      })),
    [rawUserRequests]
  );

  const [users, setUsers] = useState([]);
  const [userRequests, setUserRequests] = useState([]);

  const applyFilters = useCallback(() => {
    let filtered = [...allUsers];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(
        (user) => user.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (user) =>
          (user.firstName && user.firstName.toLowerCase().includes(term)) ||
          (user.lastName && user.lastName.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.role && user.role.toLowerCase().includes(term)) ||
          (user.client && user.client.toLowerCase().includes(term)) ||
          (user.roundtables && user.roundtables.toLowerCase().includes(term))
      );
    }

    setUsers(filtered);
  }, [allUsers, selectedStatus, searchTerm]);

  const applyRequestFilters = useCallback(() => {
    let filtered = [...allUserRequests];

    if (selectedRoundtable) {
      filtered = filtered.filter(
        (req) => req.roundtables && req.roundtables.includes(selectedRoundtable)
      );
    }
    if (selectedClient) {
      filtered = filtered.filter((req) => req.client === selectedClient);
    }

    if (requestSearchTerm && requestSearchTerm.trim() !== '') {
      const term = requestSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (req) =>
          (req.firstName && req.firstName.toLowerCase().includes(term)) ||
          (req.lastName && req.lastName.toLowerCase().includes(term)) ||
          (req.email && req.email.toLowerCase().includes(term)) ||
          (req.client && req.client.toLowerCase().includes(term)) ||
          (req.roundtables && req.roundtables.toLowerCase().includes(term)) ||
          (req.requestedBy && req.requestedBy.toLowerCase().includes(term))
      );
    }

    setUserRequests(filtered);
  }, [allUserRequests, selectedRoundtable, selectedClient, requestSearchTerm]);

  useEffect(() => {
    loadUsers();
    loadUserRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    applyRequestFilters();
  }, [applyRequestFilters]);

  const navigateToAddUser = () => {
    router.push('/admin/users/add');
  };

  const onUserActionClick = async ({ actionId, row }) => {
    if (actionId === 'edit') {
      router.push(`/admin/users/edit/${row.id}`);
    } else if (actionId === 'delete') {
      const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || row.email;
      const confirmed = window.confirm(`Delete user "${name}"?`);
      if (!confirmed) return;
      const ok = await deleteUser(row.id);
      if (!ok) {
        window.alert(`Could not delete user "${name}". Please try again.`);
      }
    }
  };

  const onRequestActionClick = async ({ actionId, row }) => {
    if (actionId === 'view') {
      // future: open a details modal
    } else if (actionId === 'delete') {
      const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim() || row.email;
      const confirmed = window.confirm(`Delete request from "${name}"?`);
      if (!confirmed) return;
      const ok = await deleteUserRequest(row.id);
      if (!ok) {
        window.alert(`Could not delete request from "${name}". Please try again.`);
      }
    }
  };

  return (
    <ArGuard>
      <main className="users-page users-page-container" aria-label="Users management">
        {/* Skip to main content link */}
        <a className="skip-link" href="#users-main-card">
          Skip to users content
        </a>

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content Card */}
        <div className="main-card" id="users-main-card">
          {/* Tabs */}
          <div className="tabs-header" role="tablist" aria-label="User management tabs">
            <div
              className={`tab-item${activeTab === 'users' ? ' active' : ''}`}
              role="tab"
              tabIndex={0}
              id="tab-users"
              aria-controls="panel-users"
              aria-selected={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setActiveTab('users');
                if (e.key === ' ') {
                  setActiveTab('users');
                  e.preventDefault();
                }
              }}
            >
              Users
            </div>
            <div
              className={`tab-item${activeTab === 'requests' ? ' active' : ''}`}
              role="tab"
              tabIndex={0}
              id="tab-requests"
              aria-controls="panel-requests"
              aria-selected={activeTab === 'requests'}
              onClick={() => setActiveTab('requests')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setActiveTab('requests');
                if (e.key === ' ') {
                  setActiveTab('requests');
                  e.preventDefault();
                }
              }}
            >
              User Requests
            </div>
          </div>

          <div className="tab-content">
            {/* VIEW 1: USERS TAB */}
            {activeTab === 'users' && (
              <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" tabIndex={0}>
                {/* Filter Bar (Users) */}
                <section className="filter-bar" role="search" aria-label="User filters">
                  <div className="filter-item status-filter">
                    <SharedDropdown
                      label="User Status"
                      options={statusOptions}
                      value={selectedStatus}
                      onValueChange={(v) => setSelectedStatus(v)}
                      filter={false}
                    />
                  </div>

                  <div className="filter-item search-filter">
                    <SharedSearchbar
                      placeholder="Search"
                      ariaLabel="Search users"
                      id="users-search"
                      value={searchTerm}
                      onValueChange={(v) => setSearchTerm(v)}
                      onSearch={() => applyFilters()}
                    />
                  </div>

                  <div className="action-item">
                    <Button
                      label="Add New User"
                      className="p-button-primary"
                      aria-label="Add new user"
                      onClick={navigateToAddUser}
                    />
                  </div>
                </section>

                {/* Users Table */}
                <div className="table-container">
                  <Table1
                    rows={users}
                    columns={usersColumns}
                    rowActions={usersActions}
                    expandableRows
                    dataKey="id"
                    onActionClick={onUserActionClick}
                    rowExpansionTemplate={(user) => (
                      <div
                        className="p-3"
                        role="region"
                        aria-label={`Expanded details for ${user.firstName || ''}`}
                      >
                        <p>Expanded details for {user.firstName}...</p>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            {/* VIEW 2: USER REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div role="tabpanel" id="panel-requests" aria-labelledby="tab-requests" tabIndex={0}>
                {/* Filter Bar (Requests) */}
                <section
                  className="filter-bar requests-filter-bar"
                  role="search"
                  aria-label="User request filters"
                >
                  {/* Roundtables Dropdown */}
                  <div className="filter-item">
                    <SharedDropdown
                      label="Roundtables"
                      options={roundtableOptions}
                      value={selectedRoundtable}
                      onValueChange={(v) => setSelectedRoundtable(v)}
                      placeholder="Select"
                      filter={false}
                    />
                  </div>

                  {/* Clients Dropdown */}
                  <div className="filter-item">
                    <SharedDropdown
                      label="Clients"
                      options={clientOptions}
                      value={selectedClient}
                      onValueChange={(v) => setSelectedClient(v)}
                      placeholder="Select"
                      filter={false}
                    />
                  </div>

                  {/* User Status Dropdown */}
                  <div className="filter-item">
                    <SharedDropdown
                      label="User Status"
                      options={statusOptions}
                      value={selectedStatus}
                      onValueChange={(v) => setSelectedStatus(v)}
                      filter={false}
                    />
                  </div>

                  {/* Search Bar */}
                  <div className="filter-item search-filter">
                    <SharedSearchbar
                      placeholder="Search"
                      ariaLabel="Search user requests"
                      id="requests-search"
                      value={requestSearchTerm}
                      onValueChange={(v) => setRequestSearchTerm(v)}
                      onSearch={() => applyRequestFilters()}
                    />
                  </div>
                </section>

                {/* Requests Table */}
                <div className="table-container">
                  <Table1
                    rows={userRequests}
                    columns={requestsColumns}
                    rowActions={requestsActions}
                    expandableRows
                    dataKey="id"
                    onActionClick={onRequestActionClick}
                    rowExpansionTemplate={(request) => (
                      <div
                        className="p-3"
                        role="region"
                        aria-label={`Expanded details for ${request.firstName || ''}`}
                      >
                        <p>Expanded details for {request.firstName}...</p>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="footer-note" role="note">
              Note: Users highlighted in red indicate that their accounts have been expired &amp;
              Users highlighted in amber indicate that their accounts have been locked.
            </div>
          </div>
        </div>
      </main>
    </ArGuard>
  );
}
