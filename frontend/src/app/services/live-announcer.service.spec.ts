import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LiveAnnouncerService } from './live-announcer.service';

describe('LiveAnnouncerService', () => {
  let service: LiveAnnouncerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveAnnouncerService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.querySelectorAll('[data-live-announcer]').forEach(el => el.remove());
    vi.useRealTimers();
  });

  it('creates a polite live region on first announce', () => {
    service.announce('Hello world');
    const region = document.querySelector('[data-live-announcer="polite"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('polite');
    expect(region?.getAttribute('aria-atomic')).toBe('true');
    expect(region?.getAttribute('role')).toBe('status');
    expect(region?.classList.contains('sr-only')).toBe(true);
  });

  it('creates a separate assertive region for urgent messages', () => {
    service.announce('Critical error', 'assertive');
    const region = document.querySelector('[data-live-announcer="assertive"]');
    expect(region).not.toBeNull();
    expect(region?.getAttribute('aria-live')).toBe('assertive');
    expect(region?.getAttribute('role')).toBe('alert');
  });

  it('reuses the same region across multiple announcements', () => {
    service.announce('First');
    service.announce('Second');
    const regions = document.querySelectorAll('[data-live-announcer="polite"]');
    expect(regions.length).toBe(1);
  });

  it('ignores empty messages', () => {
    service.announce('');
    const region = document.querySelector('[data-live-announcer]');
    expect(region).toBeNull();
  });

  it('clears the message after the timeout window', () => {
    service.announce('Transient');
    vi.advanceTimersByTime(2000);
    const region = document.querySelector('[data-live-announcer="polite"]');
    expect(region?.textContent).toBe('');
  });
});
