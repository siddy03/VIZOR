'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { RadioButton } from 'primereact/radiobutton';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { useAppSelector } from '@/store/hooks';
import { addClient, updateClient, loadClients, getClientById } from '@/services/clientService';
import { loadRoundtables } from '@/services/roundtableService';
import { loadProjects } from '@/services/projectService';
import { showToast } from '@/lib/toast';
import './add-client.css';

const peerGroupOptions = [
  { label: 'Peer Group 1', value: 1 },
  { label: 'Peer Group 2', value: 2 },
];

function getLabels(ids, options) {
  return options
    .filter((opt) => ids.includes(opt.value))
    .map((opt) => opt.label)
    .join(', ');
}

export default function AddClientForm() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const isEditMode = !!idParam;
  const clientId = idParam ? Number(idParam) : null;

  const clients = useAppSelector((s) => s.client.clients);
  const roundtables = useAppSelector((s) => s.roundtable.roundtables);
  const projects = useAppSelector((s) => s.project.projects);

  // Form fields
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [parentClient, setParentClient] = useState(null);
  const [peerGroupIds, setPeerGroupIds] = useState([]);
  const [roundtableIds, setRoundtableIds] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [domainInput, setDomainInput] = useState('');
  const [identityProvider, setIdentityProvider] = useState('AR Identity Provider');
  const [active, setActive] = useState(true);
  const [selfDatabase, setSelfDatabase] = useState(false);

  const [domains, setDomains] = useState([]);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [touched, setTouched] = useState({});

  const loadedRef = useRef(false);

  useEffect(() => {
    loadRoundtables();
    loadProjects();
    loadClients();
  }, []);

  useEffect(() => {
    if (!isEditMode || loadedRef.current) return;
    const client = getClientById(clientId) || clients.find((c) => c.id === clientId);
    if (client) {
      loadedRef.current = true;
      setDomains([...(client.domains || [])]);
      setName(client.name);
      setAbbreviation(client.abbreviation);
      setParentClient(client.parentClient);
      setPeerGroupIds(client.peerGroupIds || []);
      setRoundtableIds(client.roundtableIds || []);
      setProjectIds(client.projectIds || []);
      setIdentityProvider(client.identityProvider);
      setActive(client.active);
      setSelfDatabase(client.selfDatabase);
      setIsFormDirty(false);
    }
  }, [isEditMode, clientId, clients]);

  const parentClientOptions = (clients || [])
    .filter((c) => !isEditMode || c.id !== clientId)
    .map((c) => ({ label: c.name, value: c.name }));

  const roundtableOptions = (roundtables || []).map((r) => ({ label: r.name, value: r.id }));
  const projectOptions = (projects || []).map((p) => ({ label: p.name, value: p.id }));

  const breadcrumbItems = [
    { label: 'Admin' },
    { label: 'Clients', isLink: true },
    { label: isEditMode ? 'Modify Client' : 'Add New Client' },
  ];

  const markDirty = () => setIsFormDirty(true);

  const missingProjectOrRoundtable = roundtableIds.length === 0 && projectIds.length === 0;
  const nameInvalid = !name;
  const abbreviationInvalid = !abbreviation;

  const onDomainKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = domainInput?.trim();
      if (value && !domains.includes(value)) {
        setDomains((prev) => [...prev, value]);
        setDomainInput('');
        setIsFormDirty(true);
      }
    }
  };

  const removeDomain = (index) => {
    setDomains((prev) => prev.filter((_, i) => i !== index));
    setIsFormDirty(true);
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();

    setTouched({
      name: true,
      abbreviation: true,
      roundtableIds: true,
      projectIds: true,
      domainInput: true,
    });

    const formInvalid = nameInvalid || abbreviationInvalid || missingProjectOrRoundtable;

    if (formInvalid || domains.length === 0) {
      showToast({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields correctly.',
      });
      return;
    }

    const clientData = {
      id: isEditMode && clientId ? clientId : Date.now(),
      name: name,
      abbreviation: abbreviation,
      parentClient: parentClient || '-',
      peerGroups: getLabels(peerGroupIds || [], peerGroupOptions),
      roundtables: getLabels(roundtableIds || [], roundtableOptions),
      projects: getLabels(projectIds || [], projectOptions),
      domains: domains,
      identityProvider: identityProvider,
      active: active,
      selfDatabase: selfDatabase,
      status: active ? 'Active' : 'Inactive',
      peerGroupIds: peerGroupIds,
      roundtableIds: roundtableIds,
      projectIds: projectIds,
    };

    if (isEditMode) {
      await updateClient(clientData);
      showToast({ severity: 'success', summary: 'Success', detail: 'Client updated successfully.' });
    } else {
      await addClient(clientData);
      showToast({ severity: 'success', summary: 'Success', detail: 'Client created successfully.' });
    }

    setIsFormDirty(false);

    setTimeout(() => {
      router.push('/admin/clients');
    }, 1000);
  };

  const onCancel = () => {
    if (isFormDirty) {
      setShowCancelDialog(true);
    } else {
      router.push('/admin/clients');
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 1) {
      onCancel();
    }
  };

  const onKeepEditing = () => setShowCancelDialog(false);

  const onConfirmLeave = () => {
    setIsFormDirty(false);
    setShowCancelDialog(false);
    router.push('/admin/clients');
  };

  const crossFieldError =
    missingProjectOrRoundtable && (touched.roundtableIds || touched.projectIds);

  return (
    <div className="add-client-page">
      <main className="add-client-container" aria-label="Add new client form">
        <Breadcrumb items={breadcrumbItems} onItemClick={handleBreadcrumbClick} />

        <div className="form-container">
          <form onSubmit={onSubmit} aria-label="Client details form">
            {/* Row 1: Client Name | Client Abbreviation | Parent Client */}
            <div className="form-row three-column">
              <div className="form-field">
                <label htmlFor="clientName" className="sr-only">
                  Client Name*
                </label>
                <InputText
                  id="clientName"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    markDirty();
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  placeholder="Client Name*"
                  aria-required="true"
                  className={nameInvalid && touched.name ? 'ng-invalid ng-dirty' : undefined}
                />
                {nameInvalid && touched.name && (
                  <div className="error-text" role="alert">
                    Client Name is required.
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="clientAbbreviation" className="sr-only">
                  Client Abbreviation*
                </label>
                <InputText
                  id="clientAbbreviation"
                  type="text"
                  value={abbreviation}
                  onChange={(e) => {
                    setAbbreviation(e.target.value);
                    markDirty();
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, abbreviation: true }))}
                  placeholder="Client Abbreviation*"
                  aria-required="true"
                  className={
                    abbreviationInvalid && touched.abbreviation ? 'ng-invalid ng-dirty' : undefined
                  }
                />
                {abbreviationInvalid && touched.abbreviation && (
                  <div className="error-text" role="alert">
                    Client Abbreviation is required.
                  </div>
                )}
              </div>

              <div className="form-field">
                <SharedDropdown
                  label="Parent Client"
                  id="parentClient"
                  options={parentClientOptions}
                  value={parentClient}
                  onValueChange={(v) => {
                    setParentClient(v);
                    markDirty();
                  }}
                  placeholder="Select Parent Client"
                />
              </div>
            </div>

            {/* Row 2: Peer Group(s) | Roundtable(s) | Project(s) */}
            <div className="form-row three-column">
              <div className="form-field">
                <div className="custom-fieldset" role="group" aria-labelledby="peerGroups-label">
                  <label className="custom-legend" id="peerGroups-label" htmlFor="peerGroups">
                    Peer Group(s) - Member of
                  </label>
                  <MultiSelect
                    inputId="peerGroups"
                    options={peerGroupOptions}
                    value={peerGroupIds}
                    onChange={(e) => {
                      setPeerGroupIds(e.value);
                      markDirty();
                    }}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select..."
                    showClear
                    filter
                    appendTo={typeof document !== 'undefined' ? document.body : undefined}
                    className="w-full border-none shadow-none bg-transparent"
                    dropdownIcon="pi pi-sort-down-fill"
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="custom-fieldset" role="group" aria-labelledby="roundtables-label">
                  <label className="custom-legend" id="roundtables-label" htmlFor="roundtables">
                    Roundtable(s)*
                  </label>
                  <MultiSelect
                    inputId="roundtables"
                    options={roundtableOptions}
                    value={roundtableIds}
                    onChange={(e) => {
                      setRoundtableIds(e.value);
                      markDirty();
                      setTouched((t) => ({ ...t, roundtableIds: true }));
                    }}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select..."
                    showClear
                    filter
                    appendTo={typeof document !== 'undefined' ? document.body : undefined}
                    className={`w-full border-none shadow-none bg-transparent${crossFieldError ? ' ng-invalid ng-dirty' : ''}`}
                    dropdownIcon="pi pi-sort-down-fill"
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="custom-fieldset" role="group" aria-labelledby="projects-label">
                  <label className="custom-legend" id="projects-label" htmlFor="projects">
                    Project(s)*
                  </label>
                  <MultiSelect
                    inputId="projects"
                    options={projectOptions}
                    value={projectIds}
                    onChange={(e) => {
                      setProjectIds(e.value);
                      markDirty();
                      setTouched((t) => ({ ...t, projectIds: true }));
                    }}
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select..."
                    showClear
                    filter
                    appendTo={typeof document !== 'undefined' ? document.body : undefined}
                    className={`w-full border-none shadow-none bg-transparent${crossFieldError ? ' ng-invalid ng-dirty' : ''}`}
                    dropdownIcon="pi pi-sort-down-fill"
                  />
                </div>
              </div>
            </div>

            {/* Cross-field Validation Error */}
            <div className="form-row">
              <div className="form-field full-width">
                {crossFieldError && (
                  <div className="error-text" role="alert">
                    At least one selection between Roundtable(s) or Project(s) is required.
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Domains (Full Width) */}
            <div className="form-row">
              <div className="form-field full-width">
                <label htmlFor="domainInput" className="sr-only">
                  Domains*
                </label>
                <div
                  className={`domain-input-container${domains.length === 0 && touched.domainInput ? ' ng-invalid ng-dirty' : ''}`}
                >
                  {domains.map((domain, i) => (
                    <div className="domain-chip" key={`${domain}-${i}`}>
                      {domain}
                      <i
                        className="pi pi-times"
                        onClick={() => removeDomain(i)}
                        aria-label={`Remove domain ${domain}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') removeDomain(i);
                          if (e.key === ' ') {
                            removeDomain(i);
                            e.preventDefault();
                          }
                        }}
                      ></i>
                    </div>
                  ))}
                  <input
                    id="domainInput"
                    type="text"
                    className="domain-input"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, domainInput: true }))}
                    placeholder="Domains*"
                    onKeyDown={onDomainKeyDown}
                  />
                </div>
                <small className="text-color-secondary mt-1">Note: Press enter after typing the domain</small>
                {domains.length === 0 && touched.domainInput && (
                  <div className="error-text" role="alert">
                    At least one domain is required.
                  </div>
                )}
              </div>
            </div>

            {/* Identity Provider */}
            <div className="identity-provider-section">
              <span className="identity-provider-label" id="identityProvider">
                Identity Provider:
              </span>
              <div className="radio-group" role="radiogroup" aria-labelledby="identityProvider">
                <div className="radio-item">
                  <RadioButton
                    name="identityProvider"
                    value="Client Identity Provider"
                    inputId="idpClient"
                    checked={identityProvider === 'Client Identity Provider'}
                    onChange={(e) => {
                      setIdentityProvider(e.value);
                      markDirty();
                    }}
                  />
                  <label htmlFor="idpClient">Client Identity Provider</label>
                </div>
                <div className="radio-item">
                  <RadioButton
                    name="identityProvider"
                    value="AR Identity Provider"
                    inputId="idpAR"
                    checked={identityProvider === 'AR Identity Provider'}
                    onChange={(e) => {
                      setIdentityProvider(e.value);
                      markDirty();
                    }}
                  />
                  <label htmlFor="idpAR">AR Identity Provider</label>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="checkbox-group">
              <div className="checkbox-item">
                <Checkbox
                  inputId="activeCheck"
                  checked={active}
                  onChange={(e) => {
                    setActive(e.checked);
                    markDirty();
                  }}
                />
                <label htmlFor="activeCheck">Active</label>
              </div>
              <div className="checkbox-item">
                <Checkbox
                  inputId="selfDatabaseCheck"
                  checked={selfDatabase}
                  onChange={(e) => {
                    setSelfDatabase(e.checked);
                    markDirty();
                  }}
                />
                <label htmlFor="selfDatabaseCheck">Self Database</label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="action-buttons">
              <Button
                type="button"
                label="Cancel"
                className="cancel-button"
                aria-label="Cancel and go back"
                onClick={onCancel}
              />
              <Button
                type="submit"
                label={isEditMode ? 'Update' : 'Save'}
                className="save-button"
                aria-label={isEditMode ? 'Update client' : 'Save new client'}
              />
            </div>
          </form>
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
