'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { useAppSelector } from '@/store/hooks';
import { addProject, updateProject, loadProjects, getProjectById } from '@/services/projectService';
import './add-project.css';

const projectTypeOptions = [
  { label: 'Internal', value: 'Internal' },
  { label: 'External', value: 'External' },
  { label: 'Research', value: 'Research' },
];

const clientOptions = [
  { label: 'Client A', value: 'client_a' },
  { label: 'Client B', value: 'client_b' },
  { label: 'Client C', value: 'client_c' },
  { label: 'Client D', value: 'client_d' },
  { label: 'Client E', value: 'client_e' },
];

const directorOptions = [
  { label: 'Director A', value: 'director_a' },
  { label: 'Director B', value: 'director_b' },
  { label: 'Director C', value: 'director_c' },
  { label: 'Director D', value: 'director_d' },
  { label: 'Director E', value: 'director_e' },
];

const associateOptions = [
  { label: 'Associate A', value: 'associate_a' },
  { label: 'Associate B', value: 'associate_b' },
  { label: 'Associate C', value: 'associate_c' },
  { label: 'Associate D', value: 'associate_d' },
  { label: 'Associate E', value: 'associate_e' },
];

function getLabels(values, options) {
  if (!values || values.length === 0) return '';
  return options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label)
    .join(', ');
}

export default function AddProjectForm() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const isEditMode = !!idParam;
  const projectId = idParam ? Number(idParam) : null;

  const projects = useAppSelector((s) => s.project.projects);

  const [projectName, setProjectName] = useState('');
  const [projectAbbreviation, setProjectAbbreviation] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [primaryDirector, setPrimaryDirector] = useState(null);
  const [selectedAssociates, setSelectedAssociates] = useState([]);
  const [primaryAssociate, setPrimaryAssociate] = useState(null);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadedRef = useRef(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!isEditMode || loadedRef.current) return;
    const project = getProjectById(projectId) || projects.find((p) => p.id === projectId);
    if (project) {
      loadedRef.current = true;
      setProjectName(project.name);
      setProjectAbbreviation(project.abbreviation);
      setSelectedProjectType(project.selectedProjectType || null);
      setSelectedClients(project.clientIds || []);
      setSelectedDirectors(project.directorIds || []);
      setPrimaryDirector(project.primaryDirector || null);
      setSelectedAssociates(project.associateIds || []);
      setPrimaryAssociate(project.primaryAssociate || null);
      setDescription(project.description || '');
      setIsActive(project.status === 'Active');
    }
  }, [isEditMode, projectId, projects]);

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Projects', isLink: true },
    { label: isEditMode ? 'Modify Project' : 'Add New Project' },
  ];

  const primaryDirectorOptions =
    !selectedDirectors || selectedDirectors.length === 0
      ? []
      : directorOptions.filter((o) => selectedDirectors.includes(o.value));

  const primaryAssociateOptions =
    !selectedAssociates || selectedAssociates.length === 0
      ? []
      : associateOptions.filter((o) => selectedAssociates.includes(o.value));

  const isDirty = !!(
    projectName ||
    projectAbbreviation ||
    selectedProjectType ||
    selectedClients.length > 0 ||
    selectedDirectors.length > 0 ||
    primaryDirector ||
    selectedAssociates.length > 0 ||
    primaryAssociate ||
    description
  );

  const onDirectorsChange = (e) => {
    const val = e.value;
    setSelectedDirectors(val);
    if (primaryDirector && !val.includes(primaryDirector)) {
      setPrimaryDirector(null);
    }
  };

  const onAssociatesChange = (e) => {
    const val = e.value;
    setSelectedAssociates(val);
    if (primaryAssociate && !val.includes(primaryAssociate)) {
      setPrimaryAssociate(null);
    }
  };

  const onSave = async () => {
    setSubmitted(true);
    if (!projectName || !projectAbbreviation || !selectedProjectType) return;

    const project = {
      id: isEditMode && projectId ? projectId : 0,
      name: projectName,
      abbreviation: projectAbbreviation,
      projectType: selectedProjectType,
      clientsWithAccess: getLabels(selectedClients, clientOptions),
      directors: getLabels(selectedDirectors, directorOptions),
      associates: getLabels(selectedAssociates, associateOptions),
      description: description,
      status: isActive ? 'Active' : 'Inactive',
      clientIds: selectedClients,
      directorIds: selectedDirectors,
      associateIds: selectedAssociates,
      primaryDirector: primaryDirector,
      primaryAssociate: primaryAssociate,
      selectedProjectType: selectedProjectType,
    };

    if (isEditMode) {
      await updateProject(project);
    } else {
      await addProject(project);
    }

    router.push('/admin/projects');
  };

  const onCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/projects');
    }
  };

  const onConfirmLeave = () => {
    setShowCancelDialog(false);
    router.push('/admin/projects');
  };

  const onKeepEditing = () => setShowCancelDialog(false);

  const navigateToProjectsList = () => router.push('/admin/projects');

  const saveDisabled = !projectName || !projectAbbreviation || !selectedProjectType;

  return (
    <div className="add-project-page">
      <main className="add-project-container" aria-labelledby="add-project-form-heading">
        <Breadcrumb items={breadcrumbItems} onItemClick={navigateToProjectsList} />

        <h2 id="add-project-form-heading" className="sr-only">
          {isEditMode ? 'Edit Project' : 'Add New Project'}
        </h2>

        <div
          className="form-container"
          role="group"
          aria-labelledby="add-project-form-heading"
          aria-describedby="add-project-required-hint"
        >
          <p id="add-project-required-hint" className="sr-only">
            Required fields are marked with an asterisk.
          </p>

          {/* Row 1: Project Name | Project Abbreviation | Project Type */}
          <div className="form-row three-column">
            <div className="form-field">
              <label htmlFor="project-name" className="sr-only">
                Project Name
              </label>
              <InputText
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project Name*"
                name="projectName"
                aria-required="true"
                aria-invalid={submitted && !projectName ? 'true' : undefined}
                aria-describedby={submitted && !projectName ? 'project-name-error' : undefined}
                className={submitted && !projectName ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !projectName && (
                <small
                  id="project-name-error"
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  This field is required
                </small>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="project-abbreviation" className="sr-only">
                Project Abbreviation
              </label>
              <InputText
                id="project-abbreviation"
                type="text"
                value={projectAbbreviation}
                onChange={(e) => setProjectAbbreviation(e.target.value)}
                placeholder="Project Abbreviation*"
                name="projectAbbreviation"
                aria-required="true"
                aria-invalid={submitted && !projectAbbreviation ? 'true' : undefined}
                aria-describedby={submitted && !projectAbbreviation ? 'project-abbreviation-error' : undefined}
                className={submitted && !projectAbbreviation ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !projectAbbreviation && (
                <small
                  id="project-abbreviation-error"
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  This field is required
                </small>
              )}
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Project Type*"
                id="project-type"
                options={projectTypeOptions}
                value={selectedProjectType}
                onValueChange={(v) => setSelectedProjectType(v)}
                filter={true}
                required={true}
                isInvalid={submitted && !selectedProjectType}
                placeholder="Select..."
              />
              {submitted && !selectedProjectType && (
                <small
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  This field is required
                </small>
              )}
            </div>
          </div>

          {/* Row 2: Select Client(s) | Select Director(s) | Primary Director */}
          <div className="form-row three-column">
            <div className="form-field">
              <div className="custom-fieldset" role="group" aria-labelledby="select-clients-label">
                <label className="custom-legend" id="select-clients-label" htmlFor="select-clients">
                  Select Client(s)
                </label>
                <MultiSelect
                  inputId="select-clients"
                  options={clientOptions}
                  value={selectedClients}
                  onChange={(e) => setSelectedClients(e.value)}
                  className="w-full border-none shadow-none bg-transparent"
                  showClear
                  filter
                  optionValue="value"
                  appendTo={typeof document !== 'undefined' ? document.body : undefined}
                  placeholder="Select..."
                  dropdownIcon="pi pi-sort-down-fill"
                  aria-label="Select clients"
                />
              </div>
            </div>

            <div className="form-field">
              <div className="custom-fieldset" role="group" aria-labelledby="select-directors-label">
                <label className="custom-legend" id="select-directors-label" htmlFor="select-directors">
                  Select Director(s)*
                </label>
                <MultiSelect
                  inputId="select-directors"
                  options={directorOptions}
                  value={selectedDirectors}
                  onChange={onDirectorsChange}
                  className="w-full border-none shadow-none bg-transparent"
                  showClear
                  filter
                  optionValue="value"
                  appendTo={typeof document !== 'undefined' ? document.body : undefined}
                  placeholder="Select..."
                  dropdownIcon="pi pi-sort-down-fill"
                  aria-label="Select directors"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Primary Director*"
                id="primary-director"
                options={primaryDirectorOptions}
                value={primaryDirector}
                onValueChange={(v) => setPrimaryDirector(v)}
                filter={true}
                required={true}
                placeholder="Select..."
              />
            </div>
          </div>

          {/* Row 3: Select Associate(s) | Primary Associate | (empty) */}
          <div className="form-row three-column">
            <div className="form-field">
              <div className="custom-fieldset" role="group" aria-labelledby="select-associates-label">
                <label className="custom-legend" id="select-associates-label" htmlFor="select-associates">
                  Select Associate(s)
                </label>
                <MultiSelect
                  inputId="select-associates"
                  options={associateOptions}
                  value={selectedAssociates}
                  onChange={onAssociatesChange}
                  className="w-full border-none shadow-none bg-transparent"
                  showClear
                  filter
                  optionValue="value"
                  appendTo={typeof document !== 'undefined' ? document.body : undefined}
                  placeholder="Select..."
                  dropdownIcon="pi pi-sort-down-fill"
                  aria-label="Select associates"
                />
              </div>
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Primary Associate"
                id="primary-associate"
                options={primaryAssociateOptions}
                value={primaryAssociate}
                onValueChange={(v) => setPrimaryAssociate(v)}
                filter={true}
                placeholder="Select..."
              />
            </div>

            <div className="form-field" aria-hidden="true"></div>
          </div>

          {/* Row 4: Project Description (full width) */}
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="description" className="sr-only">
                Project Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project Description"
                rows={5}
                name="description"
                aria-label="Project description"
              />
            </div>
          </div>

          {/* Active Checkbox */}
          <div className="form-row">
            <div className="checkbox-group">
              <Checkbox
                inputId="active-checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.checked)}
                name="isActive"
                aria-label="Set project as active"
              />
              <label htmlFor="active-checkbox">Active</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons" role="group" aria-label="Form actions">
            <Button
              type="button"
              label="Cancel"
              title="Cancel"
              className="p-button-secondary"
              aria-label="Cancel and discard changes"
              onClick={onCancel}
            />
            <Button
              type="button"
              label={isEditMode ? 'Update' : 'Save'}
              title={isEditMode ? 'Update Project' : 'Save Project'}
              className="p-button-primary"
              aria-label={isEditMode ? 'Update project' : 'Save project'}
              disabled={saveDisabled}
              onClick={onSave}
            />
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog
          visible={showCancelDialog}
          onHide={onKeepEditing}
          modal
          closable={false}
          resizable={false}
          draggable={false}
          className="custom-cancel-dialog"
          style={{ width: '560px', borderRadius: '12px', boxShadow: 'none' }}
          appendTo={typeof document !== 'undefined' ? document.body : undefined}
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-message"
          role="alertdialog"
        >
          <div className="cancel-dialog-content">
            <div className="dialog-icon-container" aria-hidden="true">
              <i className="pi pi-exclamation-triangle dialog-icon"></i>
            </div>
            <h2 className="dialog-title" id="cancel-dialog-title">
              Unsaved Changes
            </h2>
            <p className="dialog-message" id="cancel-dialog-message">
              You have unsaved changes, do you want to leave without saving?
            </p>
            <div className="dialog-actions" role="group" aria-label="Confirmation actions">
              <Button
                type="button"
                label="No"
                className="dialog-button-no"
                aria-label="Stay and keep editing"
                onClick={onKeepEditing}
              />
              <Button
                type="button"
                label="Yes"
                className="dialog-button-yes"
                aria-label="Leave without saving"
                onClick={onConfirmLeave}
              />
            </div>
          </div>
        </Dialog>
      </main>
    </div>
  );
}
