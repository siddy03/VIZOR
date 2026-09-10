'use client';

import './poll.css';

// Community -> Poll tab. Placeholder for now.
export default function PollPage() {
  return (
    <section className="panel-host" aria-label="Community polls">
      <div className="tab-panel" role="tabpanel" tabIndex={0}>
        <div className="empty-state" role="status">
          <i className="pi pi-chart-bar" style={{ fontSize: '3rem', color: '#dee2e6' }} aria-hidden="true"></i>
          <p>No polls available. Create a poll!</p>
        </div>
      </div>
    </section>
  );
}
