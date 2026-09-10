'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { ArGuard } from '@/components/guards/ArGuard';
import './community.css';
import './community-shared.css';

const TABS = [
  { id: 'discussion', label: 'Discussion Board', href: '/community/discussion' },
  { id: 'chat', label: 'Chat', href: '/community/chat' },
  { id: 'poll', label: 'Poll', href: '/community/poll' },
];

export default function CommunityLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const navigate = (event, href) => {
    event.preventDefault();
    router.push(href);
  };

  return (
    <ArGuard>
      <main className="community-page" aria-label="Community">
        <Card className="community-card">
          <div className="tabs-header">
            <nav className="tabs-nav" role="tablist" aria-label="Community sections">
              {TABS.map((tab) => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <a
                    key={tab.id}
                    className={`tab-button${active ? ' active' : ''}`}
                    role="tab"
                    href={tab.href}
                    aria-selected={active}
                    onClick={(event) => navigate(event, tab.href)}
                    id={`community-tab-${tab.id}`}
                  >
                    {tab.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="tab-content">{children}</div>
        </Card>
      </main>
    </ArGuard>
  );
}
