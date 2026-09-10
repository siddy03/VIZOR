'use client';

import React from 'react';
import './breadcrumb.css';

export function Breadcrumb({ items = [], onItemClick }) {
  const handleClick = (index) => {
    if (items[index]?.isLink) {
      onItemClick?.(index);
    }
  };

  return (
    <div className="breadcrumb-host">
      <nav className="vizor-breadcrumb" aria-label="Breadcrumb">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${i}`}>
              <span
                className={`breadcrumb-item${last ? ' active' : ''}${item.isLink ? ' breadcrumb-link' : ''}`}
                role={item.isLink && !last ? 'link' : undefined}
                tabIndex={item.isLink && !last ? 0 : undefined}
                aria-current={last ? 'page' : undefined}
                aria-label={last ? `Current page: ${item.label}` : item.label}
                onClick={() => handleClick(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClick(i);
                  if (e.key === ' ') {
                    handleClick(i);
                    e.preventDefault();
                  }
                }}
              >
                {item.label}
              </span>
              {!last && <i className="pi pi-angle-right breadcrumb-separator" aria-hidden="true"></i>}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
