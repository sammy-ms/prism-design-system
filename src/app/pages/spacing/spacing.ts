import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SpacingToken {
  name: string;
  value: string;
  pxValue: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-spacing',
  standalone: true,
  templateUrl: './spacing.html',
  styleUrl: './spacing.scss',
})
export class SpacingPage {
  private readonly platformId = inject(PLATFORM_ID);

  readonly copiedToken = signal<string | null>(null);

  readonly tokens = signal<SpacingToken[]>([
    { name: '-2', value: '-2px', pxValue: -2 },
    { name: '0', value: '0px', pxValue: 0 },
    { name: '1', value: '1px', pxValue: 1 },
    { name: '2', value: '2px', pxValue: 2 },
    { name: '3', value: '3px', pxValue: 3 },
    { name: '4', value: '4px', pxValue: 4 },
    { name: '5', value: '5px', pxValue: 5 },
    { name: '6', value: '6px', pxValue: 6 },
    { name: '7', value: '7px', pxValue: 7 },
    { name: '8', value: '8px', pxValue: 8 },
    { name: '9', value: '9px', pxValue: 9 },
    { name: '10', value: '10px', pxValue: 10 },
    { name: '12', value: '12px', pxValue: 12 },
    { name: '13', value: '13px', pxValue: 13 },
    { name: '14', value: '14px', pxValue: 14 },
    { name: '15', value: '15px', pxValue: 15 },
    { name: '16', value: '16px', pxValue: 16 },
    { name: '17', value: '17px', pxValue: 17 },
    { name: '18', value: '18px', pxValue: 18 },
    { name: '20', value: '20px', pxValue: 20 },
    { name: '24', value: '24px', pxValue: 24 },
    { name: '26', value: '26px', pxValue: 26 },
    { name: '27', value: '27px', pxValue: 27 },
    { name: '28', value: '28px', pxValue: 28 },
    { name: '32', value: '32px', pxValue: 32 },
    { name: '36', value: '36px', pxValue: 36 },
    { name: '40', value: '40px', pxValue: 40 },
    { name: '48', value: '48px', pxValue: 48 },
    { name: '64', value: '64px', pxValue: 64 },
    { name: '80', value: '80px', pxValue: 80 },
    { name: '96', value: '96px', pxValue: 96 },
    { name: '110', value: '110px', pxValue: 110 },
    { name: '160', value: '160px', pxValue: 160 },
  ]);

  copyTokenName(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(name).then(() => {
        this.copiedToken.set(name);
        setTimeout(() => this.copiedToken.set(null), 1500);
      });
    }
  }

  getBarSize(pxValue: number): number {
    return Math.max(0, pxValue);
  }
}
