'use client';

import { Dropdown } from 'primereact/dropdown';
import './shared-dropdown.css';

let sharedDropdownIdCounter = 0;

export function SharedDropdown({
  label = '',
  options = [],
  optionLabel = 'label',
  optionValue = 'value',
  placeholder = '',
  filter = false,
  id,
  isInvalid = false,
  appendTo = 'self',
  disabled = false,
  required = false,
  ariaLabel = '',
  value,
  onValueChange,
  onChange,
  valueTemplate,
  itemTemplate,
}) {
  const fieldId = id || `shared-dropdown-${++sharedDropdownIdCounter}`;

  return (
    <div className="shared-dropdown-host">
      <div
        className={`custom-fieldset${isInvalid ? ' invalid-field' : ''}`}
        role="group"
        aria-labelledby={`${fieldId}-label`}
        aria-invalid={isInvalid ? 'true' : undefined}
      >
        <label className="custom-legend" htmlFor={fieldId} id={`${fieldId}-label`}>
          {label}
        </label>
        <Dropdown
          inputId={fieldId}
          options={options}
          optionLabel={optionLabel}
          optionValue={optionValue}
          placeholder={placeholder}
          filter={filter}
          className="w-full border-none shadow-none bg-transparent"
          appendTo={appendTo}
          value={value}
          onChange={(e) => {
            onValueChange?.(e.value);
            onChange?.(e);
          }}
          disabled={disabled}
          dropdownIcon="pi pi-sort-down-fill"
          aria-label={ariaLabel || label}
          aria-required={required ? 'true' : undefined}
          valueTemplate={valueTemplate}
          itemTemplate={itemTemplate}
        />
      </div>
    </div>
  );
}
