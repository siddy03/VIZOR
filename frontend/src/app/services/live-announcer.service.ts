import { Injectable, OnDestroy, RendererFactory2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type AnnouncePoliteness = 'polite' | 'assertive';

@Injectable({ providedIn: 'root' })
export class LiveAnnouncerService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  announce(message: string, politeness: AnnouncePoliteness = 'polite'): void {
    if (!message) return;
    const region = this.ensureRegion(politeness);

    region.textContent = '';
    this.document.defaultView?.requestAnimationFrame(() => {
      region.textContent = message;
    });

    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => {
      if (region.textContent === message) region.textContent = '';
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
    this.politeRegion?.remove();
    this.assertiveRegion?.remove();
  }

  private ensureRegion(politeness: AnnouncePoliteness): HTMLElement {
    if (politeness === 'assertive') {
      this.assertiveRegion ??= this.createRegion('assertive');
      return this.assertiveRegion;
    }
    this.politeRegion ??= this.createRegion('polite');
    return this.politeRegion;
  }

  private createRegion(politeness: AnnouncePoliteness): HTMLElement {
    const el = this.renderer.createElement('div') as HTMLElement;
    this.renderer.setAttribute(el, 'aria-live', politeness);
    this.renderer.setAttribute(el, 'aria-atomic', 'true');
    this.renderer.setAttribute(el, 'role', politeness === 'assertive' ? 'alert' : 'status');
    this.renderer.addClass(el, 'sr-only');
    this.renderer.setAttribute(el, 'data-live-announcer', politeness);
    this.renderer.appendChild(this.document.body, el);
    return el;
  }
}
