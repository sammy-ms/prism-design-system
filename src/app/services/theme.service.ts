import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly isDark = signal(false);

  toggle(): void {
    this.isDark.update((v) => !v);
    if (isPlatformBrowser(this.platformId)) {
      const html = this.document.documentElement;
      if (this.isDark()) {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.removeAttribute('data-theme');
      }
    }
  }
}
