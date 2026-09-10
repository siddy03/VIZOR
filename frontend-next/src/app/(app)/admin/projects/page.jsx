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
import { loadProjects, deleteProject } from '@/services/projectService';
import './page.css';

const breadcrumbItems = [{ label: 'Admin' }, { label: 'Projects' }];

const projectTypeOptions = [
  { label: 'All', value: 'All' },
  { label: 'Internal', value: 'Internal' },
  { label: 'External', value: 'External' },
  { label: 'Research', value: 'Research' },
];

const statusOptions = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

const projectColumns = [
  { field: 'name', header: 'Project Name', sortable: true },
  { field: 'clientsWithAccess', header: 'Client(s) With Access', sortable: true },
  { field: 'directors', header: 'Director(s)', sortable: true },
  { field: 'associates', header: 'Associate(s)', sortable: true },
  { field: 'projectType', header: 'Project Type', sortable: true },
  { field: 'status', header: 'Status', sortable: true },
];

const projectActions = [
  { id: 'edit', icon: 'icon-edit-svg', tooltip: 'Edit Project' },
  { id: 'delete', icon: 'pi pi-trash', tooltip: 'Delete Project', cssClass: 'p-button-danger' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useAppSelector((s) => s.project.projects);

  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (selectedProjectType !== 'All') {
      filtered = filtered.filter((p) => p.projectType === selectedProjectType);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.directors.toLowerCase().includes(search) ||
          p.associates.toLowerCase().includes(search) ||
          p.clientsWithAccess.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [projects, selectedProjectType, selectedStatus, searchTerm]);

  const onDeleteProject = async (project) => {
    const confirmed = window.confirm(`Delete project "${project.name}"?`);
    if (!confirmed) return;
    const ok = await deleteProject(project.id);
    if (!ok) {
      window.alert(`Could not delete project "${project.name}". Please try again.`);
    }
  };

  const editProject = (project) => {
    router.push(`/admin/projects/edit/${project.id}`);
  };

  const onActionClick = ({ actionId, row }) => {
    if (actionId === 'edit') {
      editProject(row);
    } else if (actionId === 'delete') {
      onDeleteProject(row);
    }
  };

  const addNewProject = () => {
    router.push('/admin/projects/add');
  };

  return (
    <ArGuard>
      <main
        className="projects-page projects-page-container"
        aria-labelledby="page-heading"
        aria-label="Projects management"
      >
        {/* Skip to main content link for keyboard users */}
        <a className="skip-link" href="#projects-table">
          Skip to projects table
        </a>

        {/* Breadcrumb + Add Button Row */}
        <div className="top-row">
          <Breadcrumb items={breadcrumbItems} />
          <Button
            type="button"
            label="Add New Project"
            className="p-button-primary"
            aria-label="Add new project"
            onClick={addNewProject}
          />
        </div>

        {/* Filters (3-column grid) */}
        <section className="filter-bar" role="search" aria-label="Project filters">
          {/* Project Type Filter */}
          <div className="filter-item">
            <SharedDropdown
              label="Project Type"
              options={projectTypeOptions}
              value={selectedProjectType}
              onValueChange={(v) => setSelectedProjectType(v)}
              optionLabel="label"
              placeholder="All"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <SharedDropdown
              label="Status"
              options={statusOptions}
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v)}
              optionLabel="label"
              placeholder="Active"
            />
          </div>

          {/* Search Bar */}
          <div className="filter-item search-filter">
            <SharedSearchbar
              placeholder="Search"
              ariaLabel="Search projects"
              id="projects-search"
              value={searchTerm}
              onValueChange={(v) => setSearchTerm(v)}
            />
          </div>
        </section>

        {/* Table */}
        <section id="projects-table" aria-label="Projects data table" tabIndex={-1}>
          <Table1
            rows={filteredProjects}
            columns={projectColumns}
            rowActions={projectActions}
            onActionClick={onActionClick}
          />
        </section>
      </main>
    </ArGuard>
  );
}
