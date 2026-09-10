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
import {
  addRoundtable,
  updateRoundtable,
  loadRoundtables,
  getRoundtableById,
} from '@/services/roundtableService';
import './add-roundtable.css';

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

function getLabelsFromValues(values, options) {
  if (!values || values.length === 0) return '';
  return options
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');
}

export default function AddRoundtableForm() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const isEditMode = !!idParam;
  const roundtableId = idParam ? Number(idParam) : null;

  const roundtables = useAppSelector((s) => s.roundtable.roundtables);

  const [roundtableName, setRoundtableName] = useState('');
  const [roundtableAbbreviation, setRoundtableAbbreviation] = useState('');
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
    loadRoundtables();
  }, []);

  useEffect(() => {
    if (!isEditMode || loadedRef.current) return;
    const roundtable =
      getRoundtableById(roundtableId) || roundtables.find((r) => r.id === roundtableId);
    if (roundtable) {
      loadedRef.current = true;
      setRoundtableName(roundtable.name);
      setRoundtableAbbreviation(roundtable.abbreviation);
      setSelectedClients(roundtable.clientIds || []);
      setSelectedDirectors(roundtable.directorIds || []);
      setSelectedAssociates(roundtable.associateIds || []);
      setPrimaryDirector(roundtable.primaryDirector);
      setPrimaryAssociate(roundtable.primaryAssociate);
      setDescription(roundtable.description);
      setIsActive(roundtable.status === 'Active');
    }
  }, [isEditMode, roundtableId, roundtables]);

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Roundtables', isLink: true },
    { label: isEditMode ? 'Modify Roundtable' : 'Add New Roundtable' },
  ];

  const primaryDirectorOptions =
    !selectedDirectors || selectedDirectors.length === 0
      ? []
      : directorOptions.filter((option) => selectedDirectors.includes(option.value));

  const primaryAssociateOptions =
    !selectedAssociates || selectedAssociates.length === 0
      ? []
      : associateOptions.filter((option) => selectedAssociates.includes(option.value));

  const isDirty = !!(
    roundtableName ||
    roundtableAbbreviation ||
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

    if (!roundtableName || !roundtableAbbreviation) {
      return;
    }

    const newRoundtable = {
      id: isEditMode && roundtableId ? roundtableId : 0,
      name: roundtableName,
      abbreviation: roundtableAbbreviation,
      clientsWithAccess: selectedClients.length,
      directors: getLabelsFromValues(selectedDirectors, directorOptions),
      associates: getLabelsFromValues(selectedAssociates, associateOptions),
      description: description,
      status: isActive ? 'Active' : 'Inactive',
      clientIds: selectedClients,
      directorIds: selectedDirectors,
      associateIds: selectedAssociates,
      primaryDirector: primaryDirector,
      primaryAssociate: primaryAssociate,
    };

    if (isEditMode) {
      await updateRoundtable(newRoundtable);
    } else {
      await addRoundtable(newRoundtable);
    }

    router.push('/admin/roundtables');
  };

  const onCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/roundtables');
    }
  };

  const onConfirmLeave = () => {
    setShowCancelDialog(false);
    router.push('/admin/roundtables');
  };

  const onKeepEditing = () => setShowCancelDialog(false);

  const navigateToRoundtablesList = () => router.push('/admin/roundtables');

  const saveDisabled = !roundtableName || !roundtableAbbreviation;

  return (
    <div className="add-roundtable-page">
      <main className="add-roundtable-container" aria-labelledby="add-roundtable-form-heading">
        <Breadcrumb items={breadcrumbItems} onItemClick={navigateToRoundtablesList} />

        <h2 id="add-roundtable-form-heading" className="sr-only">
          {isEditMode ? 'Edit Roundtable' : 'Add New Roundtable'}
        </h2>

        <div
          className="form-container"
          role="group"
          aria-labelledby="add-roundtable-form-heading"
          aria-describedby="add-roundtable-required-hint"
        >
          <p id="add-roundtable-required-hint" className="sr-only">
            Required fields are marked with an asterisk.
          </p>

          {/* Row 1: Roundtable Name, Abbreviation, Select Clients */}
          <div className="form-row three-column">
            <div className="form-field">
              <label htmlFor="roundtable-name" className="sr-only">
                Roundtable Name
              </label>
              <InputText
                id="roundtable-name"
                type="text"
                value={roundtableName}
                onChange={(e) => setRoundtableName(e.target.value)}
                placeholder="Roundtable Name*"
                name="roundtableName"
                aria-required="true"
                aria-invalid={submitted && !roundtableName ? 'true' : undefined}
                aria-describedby={submitted && !roundtableName ? 'roundtable-name-error' : undefined}
                className={submitted && !roundtableName ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !roundtableName && (
                <small
                  id="roundtable-name-error"
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
              <label htmlFor="roundtable-abbreviation" className="sr-only">
                Roundtable Abbreviation
              </label>
              <InputText
                id="roundtable-abbreviation"
                type="text"
                value={roundtableAbbreviation}
                onChange={(e) => setRoundtableAbbreviation(e.target.value)}
                placeholder="Roundtable Abbreviation*"
                name="roundtableAbbreviation"
                aria-required="true"
                aria-invalid={submitted && !roundtableAbbreviation ? 'true' : undefined}
                aria-describedby={
                  submitted && !roundtableAbbreviation ? 'roundtable-abbreviation-error' : undefined
                }
                className={submitted && !roundtableAbbreviation ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !roundtableAbbreviation && (
                <small
                  id="roundtable-abbreviation-error"
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
              <div className="custom-fieldset" role="group" aria-labelledby="select-clients-label">
                <label className="custom-legend" id="select-clients-label" htmlFor="select-clients">
                  Client(s)
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
          </div>

          {/* Row 2: Select Directors, Primary Director */}
          <div className="form-row three-column">
            <div className="form-field">
              <div className="custom-fieldset" role="group" aria-labelledby="select-directors-label">
                <label className="custom-legend" id="select-directors-label" htmlFor="select-directors">
                  Director(s)
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
                />
              </div>
            </div>

            <div className="form-field">
              <SharedDropdown
                label="Primary Director"
                id="primary-director"
                options={primaryDirectorOptions}
                value={primaryDirector}
                onValueChange={(v) => setPrimaryDirector(v)}
                filter={true}
                placeholder="Select..."
              />
            </div>

            <div className="form-field" aria-hidden="true"></div>
          </div>

          {/* Row 3: Select Associates, Primary Associate */}
          <div className="form-row three-column">
            <div className="form-field">
              <div className="custom-fieldset" role="group" aria-labelledby="select-associates-label">
                <label className="custom-legend" id="select-associates-label" htmlFor="select-associates">
                  Associate(s)
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

          {/* Description */}
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="description" className="sr-only">
                Roundtable Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Roundtable Description"
                rows={5}
                name="description"
                aria-label="Roundtable description"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="checkbox-group">
              <Checkbox
                inputId="active-checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.checked)}
                name="isActive"
                aria-label="Set roundtable as active"
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
              title={isEditMode ? 'Update Roundtable' : 'Save Roundtable'}
              className="p-button-primary"
              aria-label={isEditMode ? 'Update roundtable' : 'Save roundtable'}
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
          role="alertdialog"
          aria-labelledby="cancel-rt-dialog-title"
          aria-describedby="cancel-rt-dialog-message"
        >
          <div className="cancel-dialog-content">
            <div className="dialog-icon-container" aria-hidden="true">
              <i className="pi pi-exclamation-triangle dialog-icon"></i>
            </div>
            <h2 className="dialog-title" id="cancel-rt-dialog-title">
              Unsaved Changes
            </h2>
            <p className="dialog-message" id="cancel-rt-dialog-message">
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
