'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { SharedDropdown } from '@/components/shared/SharedDropdown';
import { addUser } from '@/services/userService';
import { showToast } from '@/lib/toast';
import './add-user.css';

const breadcrumbItems = [
  { label: 'Admin' },
  { label: 'Users', isLink: true },
  { label: 'Add New User' },
];

const countryOptions = [
  { name: 'United States', code: '+1', flag: 'us' },
  { name: 'United Kingdom', code: '+44', flag: 'gb' },
  { name: 'Canada', code: '+1', flag: 'ca' },
];

const primaryContactOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Manager', value: 'manager' },
];

export default function AddUserForm() {
  const router = useRouter();

  // Form Fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [countryCode, setCountryCode] = useState({ name: 'United States', code: '+1', flag: 'us' });
  const [phone, setPhone] = useState('');
  const [salesforceCode, setSalesforceCode] = useState('');
  const [primaryContact, setPrimaryContact] = useState(null);
  const [role, setRole] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);

  // Status
  const [isActive, setIsActive] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [enableNotifications, setEnableNotifications] = useState(true);

  // Data Tables
  const roundtablePermissions = [];
  const projectPermissions = [];

  const [submitted, setSubmitted] = useState(false);

  const navigateToUsersList = () => router.push('/admin/users');

  const onSave = async () => {
    setSubmitted(true);
    if (!email || !firstName || !lastName || !countryCode || !phone || !role) {
      return;
    }

    const payload = {
      email,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      title,
      countryCode: countryCode?.code ?? '',
      phone,
      salesforceCode: salesforceCode || null,
      primaryContact,
      role,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
      active: isActive,
      locked: isLocked,
      suspended: isSuspended,
      enableNotifications,
    };

    const created = await addUser(payload);
    if (created) {
      showToast({
        severity: 'success',
        summary: 'User Created',
        detail: `User "${created.email}" has been created successfully.`,
        life: 4000,
      });
      router.push('/admin/users');
    }
  };

  const onCancel = () => router.push('/admin/users');

  const countryValueTemplate = () =>
    countryCode ? (
      <div className="flex align-items-center gap-2">
        <img
          src={`https://flagcdn.com/w20/${countryCode.flag}.png`}
          className={`flag flag-${countryCode.flag}`}
          alt={`${countryCode.name} flag`}
          style={{ width: '18px' }}
        />
        <div>{countryCode.code}</div>
      </div>
    ) : null;

  const countryItemTemplate = (country) => (
    <div className="flex align-items-center gap-2">
      <img
        src={`https://flagcdn.com/w20/${country.flag}.png`}
        className={`flag flag-${country.flag}`}
        alt={`${country.name} flag`}
        style={{ width: '18px' }}
      />
      <div>
        {country.name} ({country.code})
      </div>
    </div>
  );

  return (
    <div className="add-user-page">
      <main className="add-user-container" aria-labelledby="add-user-form-heading">
        <Breadcrumb items={breadcrumbItems} onItemClick={navigateToUsersList} />

        <h2 id="add-user-form-heading" className="sr-only">
          Add New User
        </h2>

        <div
          className="form-container"
          role="group"
          aria-labelledby="add-user-form-heading"
          aria-describedby="add-user-required-hint"
        >
          <p id="add-user-required-hint" className="sr-only">
            Required fields are marked with an asterisk.
          </p>

          {/* Row 1: Email, First Name, Last Name */}
          <div className="form-row three-column">
            <div className="form-field">
              <label htmlFor="email">Email*</label>
              <InputText
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={submitted && !email ? 'true' : undefined}
                aria-describedby={submitted && !email ? 'email-error' : undefined}
                className={submitted && !email ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !email && (
                <small
                  id="email-error"
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  Email is required
                </small>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="firstName">First Name*</label>
              <InputText
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                name="firstName"
                autoComplete="given-name"
                aria-required="true"
                aria-invalid={submitted && !firstName ? 'true' : undefined}
                aria-describedby={submitted && !firstName ? 'firstName-error' : undefined}
                className={submitted && !firstName ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !firstName && (
                <small
                  id="firstName-error"
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  First name is required
                </small>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="lastName">Last Name*</label>
              <InputText
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                name="lastName"
                autoComplete="family-name"
                aria-required="true"
                aria-invalid={submitted && !lastName ? 'true' : undefined}
                aria-describedby={submitted && !lastName ? 'lastName-error' : undefined}
                className={submitted && !lastName ? 'ng-invalid ng-dirty' : undefined}
              />
              {submitted && !lastName && (
                <small
                  id="lastName-error"
                  className="p-error"
                  role="alert"
                  aria-live="polite"
                  style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                >
                  Last name is required
                </small>
              )}
            </div>
          </div>

          {/* Row 2: Title, Country/Phone, Salesforce Code */}
          <div className="form-row three-column">
            <div className="form-field">
              <label htmlFor="title">Title</label>
              <InputText
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                name="title"
                autoComplete="organization-title"
                aria-label="Job title"
              />
            </div>
            <div className="form-field phone-group" role="group" aria-label="Country code and phone number">
              <SharedDropdown
                label="Country*"
                id="country"
                options={countryOptions}
                value={countryCode}
                onValueChange={(v) => setCountryCode(v)}
                optionLabel="code"
                optionValue={null}
                filter={true}
                required={true}
                valueTemplate={countryValueTemplate}
                itemTemplate={countryItemTemplate}
              />
              <div className="phone-input">
                <label htmlFor="phone">Phone*</label>
                <InputText
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  name="phone"
                  autoComplete="tel"
                  aria-required="true"
                  aria-invalid={submitted && !phone ? 'true' : undefined}
                  aria-describedby={submitted && !phone ? 'phone-error' : undefined}
                  className={submitted && !phone ? 'ng-invalid ng-dirty' : undefined}
                />
                {submitted && !phone && (
                  <small
                    id="phone-error"
                    className="p-error"
                    role="alert"
                    aria-live="polite"
                    style={{ display: 'block', marginTop: '4px', color: '#dc3545' }}
                  >
                    Phone is required
                  </small>
                )}
              </div>
            </div>
            <div className="form-field">
              <SharedDropdown
                label="Salesforce Code"
                id="salesforceCode"
                options={[]}
                value={salesforceCode}
                onValueChange={(v) => setSalesforceCode(v)}
                filter={true}
                placeholder="Select"
              />
            </div>
          </div>

          {/* Row 3: Primary Contact, Role, Expiry Date */}
          <div className="form-row three-column">
            <div className="form-field">
              <SharedDropdown
                label="Primary Contact"
                id="primaryContact"
                options={primaryContactOptions}
                value={primaryContact}
                onValueChange={(v) => setPrimaryContact(v)}
                filter={true}
                placeholder="Select"
              />
            </div>
            <div className="form-field">
              <SharedDropdown
                label="Role*"
                id="role"
                options={roleOptions}
                value={role}
                onValueChange={(v) => setRole(v)}
                filter={true}
                required={true}
                isInvalid={submitted && !role}
                placeholder="Select"
              />
            </div>
            <div className="form-field">
              <label htmlFor="expiryDate">Expiry Date</label>
              <Calendar
                id="expiryDate"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.value)}
                name="expiryDate"
                showIcon
                appendTo={typeof document !== 'undefined' ? document.body : undefined}
                className="w-full"
                aria-label="Account expiry date"
              />
            </div>
          </div>

          {/* Row 4: Status Checkboxes */}
          <div className="form-row status-row" role="group" aria-labelledby="status-group-label">
            <span className="status-label" id="status-group-label">
              Status:
            </span>
            <div className="checkbox-group">
              <Checkbox
                inputId="active"
                checked={isActive}
                onChange={(e) => setIsActive(e.checked)}
                aria-label="Active status"
              />
              <label htmlFor="active">Active</label>
            </div>
            <div className="checkbox-group">
              <Checkbox
                inputId="locked"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.checked)}
                aria-label="Locked status"
              />
              <label htmlFor="locked">Locked</label>
            </div>
            <div className="checkbox-group">
              <Checkbox
                inputId="suspended"
                checked={isSuspended}
                onChange={(e) => setIsSuspended(e.checked)}
                aria-label="Suspended status"
              />
              <label htmlFor="suspended">Suspended</label>
            </div>
          </div>

          {/* Row 5: Enable Notifications */}
          <div className="form-row">
            <div className="checkbox-group">
              <Checkbox
                inputId="notifications"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.checked)}
                aria-label="Enable email notifications"
              />
              <label htmlFor="notifications">Enable email notifications</label>
            </div>
          </div>

          {/* Roundtables Permissions */}
          <section className="permissions-section" aria-labelledby="roundtables-permissions-heading">
            <div className="section-header">
              <h3 id="roundtables-permissions-heading">Roundtables*</h3>
              <Button
                label="Add Permissions"
                className="p-button-outlined p-button-sm"
                aria-label="Add roundtable permissions"
              />
            </div>
            <DataTable
              value={roundtablePermissions}
              className="p-datatable-striped permission-table"
              role="region"
              aria-label="Roundtable permissions list"
              emptyMessage="No Permissions added yet"
            >
              <Column header="#" style={{ width: '50px' }} body={(perm) => perm.id} />
              <Column header="Roundtable" body={(perm) => perm.name} />
              <Column header="Permissions" body={(perm) => perm.permissions} />
            </DataTable>
          </section>

          {/* Projects Permissions */}
          <section className="permissions-section" aria-labelledby="projects-permissions-heading">
            <div className="section-header">
              <h3 id="projects-permissions-heading">Projects*</h3>
              <Button
                label="Add Permissions"
                className="p-button-outlined p-button-sm"
                aria-label="Add project permissions"
              />
            </div>
            <DataTable
              value={projectPermissions}
              className="p-datatable-striped permission-table"
              role="region"
              aria-label="Project permissions list"
              emptyMessage="No Permissions added yet"
            >
              <Column header="#" style={{ width: '50px' }} body={(perm) => perm.id} />
              <Column header="Project" body={(perm) => perm.name} />
              <Column header="Permissions" body={(perm) => perm.permissions} />
            </DataTable>
          </section>

          {/* Footer Actions */}
          <div className="action-buttons" role="group" aria-label="Form actions">
            <Button
              label="Cancel"
              className="p-button-outlined p-button-secondary"
              aria-label="Cancel and discard changes"
              onClick={onCancel}
            />
            <Button label="Save" className="p-button-primary" aria-label="Save user" onClick={onSave} />
          </div>
        </div>
      </main>
    </div>
  );
}
