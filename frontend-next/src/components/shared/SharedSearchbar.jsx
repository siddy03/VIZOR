'use client';

import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import './shared-searchbar.css';

let sharedSearchbarIdCounter = 0;

export function SharedSearchbar({
  placeholder = 'Search',
  ariaLabel = 'Search',
  value = '',
  id,
  onValueChange,
  onSearch,
}) {
  const fieldId = id || `shared-searchbar-${++sharedSearchbarIdCounter}`;

  const submitSearch = () => onSearch?.(value);

  return (
    <div className="shared-searchbar-host">
      <div className="search-container" role="search">
        <div className="p-inputgroup">
          <span className="p-inputgroup-addon search-addon" aria-hidden="true">
            <i className="pi pi-search"></i>
          </span>
          <label htmlFor={fieldId} className="sr-only">
            {ariaLabel}
          </label>
          <InputText
            id={fieldId}
            type="text"
            placeholder={placeholder}
            aria-label={ariaLabel}
            autoComplete="off"
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') submitSearch();
            }}
            className="search-input"
          />
          <Button
            type="button"
            icon="pi pi-angle-right"
            className="search-btn"
            aria-label={`Submit ${ariaLabel}`}
            onClick={submitSearch}
          />
        </div>
      </div>
    </div>
  );
}
