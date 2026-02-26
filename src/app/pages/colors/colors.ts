import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SEMANTIC_REFS } from './semantic-refs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ColorToken {
  name: string;
  displayName?: string;
  folder: string;
  type: string;
  lightValue: string;
  darkValue: string;
  lightRef?: string;
  darkRef?: string;
  scopes: string[];
}

export interface ColorSection {
  id: string;
  title: string;
  description: string;
  tokenCount: number;
  tokens: ColorToken[];
}

/** Raw token before enrichment (no folder/scopes yet) */
type RawToken = { name: string; type: string; lightValue: string; darkValue: string };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-colors',
  standalone: true,
  templateUrl: './colors.html',
  styleUrl: './colors.scss',
})
export class ColorsPage {
  private readonly platformId = inject(PLATFORM_ID);

  // ---- State ----
  readonly copiedHex = signal<string | null>(null);
  readonly highlightedRef = signal<string | null>(null);

  // ---- Sections ----
  readonly sections = signal<ColorSection[]>([
    this.buildPrimitiveTokens(),
    this.buildBackgroundTokens(),
    this.buildFillTokens(),
    this.buildTextTokens(),
    this.buildBorderTokens(),
    this.buildSurfaceTokens(),
    this.buildIconTokens(),
    this.buildOtherTokens(),
  ]);

  // ---- Actions ----
  copyHex(hex: string): void {
    if (isPlatformBrowser(this.platformId)) {
      navigator.clipboard.writeText(hex).then(() => {
        this.copiedHex.set(hex);
        setTimeout(() => this.copiedHex.set(null), 1500);
      });
    }
  }

  scrollToRef(ref: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById('primitives-' + ref);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightedRef.set(ref);
      setTimeout(() => this.highlightedRef.set(null), 1800);
    }
  }

  /** Strip CSS variable prefix to get clean display name */
  private toDisplayName(name: string): string {
    return name.replace(/^--primitives-/, '').replace(/^--semantics-/, '');
  }

  /** Convert CSS var name to Figma folder path */
  private toFolder(name: string): string {
    const clean = name.replace(/^--/, '');
    const parts = clean.split('-');
    // For primitives: primitives/brand-blue, primitives/neutral, etc.
    // For semantics: semantics/bg/subtle/primary, semantics/fill/brand, etc.
    if (clean.startsWith('primitives-')) {
      // Group: primitives/<group>  e.g. primitives/brand-blue, primitives/neutral
      const rest = clean.replace('primitives-', '');
      // Match known groups
      if (rest.startsWith('brand-blue')) return 'primitives/brand-blue';
      if (rest.startsWith('error-red')) return 'primitives/error-red';
      if (rest.startsWith('success-green')) return 'primitives/success-green';
      if (rest.startsWith('warning-orange')) return 'primitives/warning-orange';
      if (rest.startsWith('neutral')) return 'primitives/neutral';
      if (rest.startsWith('utilities')) return 'primitives/utilities';
      return 'primitives';
    }
    // For semantics, convert dashes to slashes based on token structure
    // e.g. semantics-bg-subtle-primary-default → semantics/bg/subtle/primary
    const sem = clean.replace('semantics-', '');
    const semParts = sem.split('-');
    // Remove the last part (the actual token name like "default", "hover")
    semParts.pop();
    return 'semantics/' + semParts.join('/');
  }

  /** Enrich token with computed fields */
  private enrichToken(
    t: { name: string; type: string; lightValue: string; darkValue: string },
    scopes: string[],
  ): ColorToken {
    const ref = SEMANTIC_REFS[t.name];
    return {
      ...t,
      displayName: this.toDisplayName(t.name),
      folder: this.toFolder(t.name),
      lightRef: ref?.[0],
      darkRef: ref?.[1],
      scopes,
    };
  }

  // =========================================================================
  // Token Data Builders
  // =========================================================================

  private buildPrimitiveTokens(): ColorSection {
    const tokens: RawToken[] = [
      // ---- Brand Blue (15) ----
      {
        name: '--primitives-brand-blue-50',
        type: 'Color',
        lightValue: '#e5f2ff',
        darkValue: '#e5f2ff',
      },
      {
        name: '--primitives-brand-blue-100',
        type: 'Color',
        lightValue: '#b7dcff',
        darkValue: '#023564',
      },
      {
        name: '--primitives-brand-blue-200',
        type: 'Color',
        lightValue: '#8ac6ff',
        darkValue: '#8ac6ff',
      },
      {
        name: '--primitives-brand-blue-300',
        type: 'Color',
        lightValue: '#5cb0ff',
        darkValue: '#5cb0ff',
      },
      {
        name: '--primitives-brand-blue-400',
        type: 'Color',
        lightValue: '#2e9aff',
        darkValue: '#2e9aff',
      },
      {
        name: '--primitives-brand-blue-500',
        type: 'Color',
        lightValue: '#0084ff',
        darkValue: '#0084ff',
      },
      {
        name: '--primitives-brand-blue-600',
        type: 'Color',
        lightValue: '#006fd6',
        darkValue: '#006fd6',
      },
      {
        name: '--primitives-brand-blue-700',
        type: 'Color',
        lightValue: '#005aad',
        darkValue: '#005aad',
      },
      {
        name: '--primitives-brand-blue-800',
        type: 'Color',
        lightValue: '#004585',
        darkValue: '#004585',
      },
      {
        name: '--primitives-brand-blue-900',
        type: 'Color',
        lightValue: '#00305c',
        darkValue: '#00305c',
      },
      {
        name: '--primitives-brand-blue-500-10',
        type: 'Color',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(0,132,255,0.1)',
      },
      {
        name: '--primitives-brand-blue-500-15',
        type: 'Color',
        lightValue: 'rgba(0,132,255,0.15)',
        darkValue: 'rgba(0,132,255,0.15)',
      },
      {
        name: '--primitives-brand-blue-500-25',
        type: 'Color',
        lightValue: 'rgba(0,132,255,0.25)',
        darkValue: 'rgba(20,139,250,0.25)',
      },
      {
        name: '--primitives-brand-blue-500-50',
        type: 'Color',
        lightValue: 'rgba(0,132,255,0.5)',
        darkValue: 'rgba(20,139,250,0.5)',
      },
      {
        name: '--primitives-brand-blue-500-75',
        type: 'Color',
        lightValue: 'rgba(0,132,255,0.75)',
        darkValue: 'rgba(20,139,250,0.75)',
      },

      // ---- Error Red (15) ----
      {
        name: '--primitives-error-red-50',
        type: 'Color',
        lightValue: '#fceded',
        darkValue: '#fceded',
      },
      {
        name: '--primitives-error-red-100',
        type: 'Color',
        lightValue: '#f9dcdb',
        darkValue: '#43110f',
      },
      {
        name: '--primitives-error-red-200',
        type: 'Color',
        lightValue: '#f4b7b6',
        darkValue: '#f4b7b6',
      },
      {
        name: '--primitives-error-red-300',
        type: 'Color',
        lightValue: '#f0918f',
        darkValue: '#f0918f',
      },
      {
        name: '--primitives-error-red-400',
        type: 'Color',
        lightValue: '#ed6560',
        darkValue: '#ed6560',
      },
      {
        name: '--primitives-error-red-500',
        type: 'Color',
        lightValue: '#da3e37',
        darkValue: '#da3e37',
      },
      {
        name: '--primitives-error-red-600',
        type: 'Color',
        lightValue: '#ae302a',
        darkValue: '#ae302a',
      },
      {
        name: '--primitives-error-red-700',
        type: 'Color',
        lightValue: '#85221e',
        darkValue: '#85221e',
      },
      {
        name: '--primitives-error-red-800',
        type: 'Color',
        lightValue: '#5e1512',
        darkValue: '#5e1512',
      },
      {
        name: '--primitives-error-red-900',
        type: 'Color',
        lightValue: '#3a0a08',
        darkValue: '#3a0a08',
      },
      {
        name: '--primitives-error-red-500-10',
        type: 'Color',
        lightValue: 'rgba(218,62,55,0.1)',
        darkValue: 'rgba(218,62,55,0.1)',
      },
      {
        name: '--primitives-error-red-500-15',
        type: 'Color',
        lightValue: 'rgba(218,62,55,0.15)',
        darkValue: 'rgba(218,62,55,0.15)',
      },
      {
        name: '--primitives-error-red-500-25',
        type: 'Color',
        lightValue: 'rgba(218,62,55,0.25)',
        darkValue: 'rgba(230,77,71,0.25)',
      },
      {
        name: '--primitives-error-red-500-50',
        type: 'Color',
        lightValue: 'rgba(218,62,55,0.5)',
        darkValue: 'rgba(230,77,71,0.5)',
      },
      {
        name: '--primitives-error-red-500-75',
        type: 'Color',
        lightValue: 'rgba(218,62,55,0.75)',
        darkValue: 'rgba(230,77,71,0.75)',
      },

      // ---- Success Green (15) ----
      {
        name: '--primitives-success-green-50',
        type: 'Color',
        lightValue: '#d8eee5',
        darkValue: '#d8eee5',
      },
      {
        name: '--primitives-success-green-100',
        type: 'Color',
        lightValue: '#b5decf',
        darkValue: '#012d1d',
      },
      {
        name: '--primitives-success-green-200',
        type: 'Color',
        lightValue: '#9bd7c1',
        darkValue: '#9bd7c1',
      },
      {
        name: '--primitives-success-green-300',
        type: 'Color',
        lightValue: '#63bf9e',
        darkValue: '#63bf9e',
      },
      {
        name: '--primitives-success-green-400',
        type: 'Color',
        lightValue: '#3fb98d',
        darkValue: '#3fb98d',
      },
      {
        name: '--primitives-success-green-500',
        type: 'Color',
        lightValue: '#00935c',
        darkValue: '#00935c',
      },
      {
        name: '--primitives-success-green-600',
        type: 'Color',
        lightValue: '#007c4e',
        darkValue: '#007c4e',
      },
      {
        name: '--primitives-success-green-700',
        type: 'Color',
        lightValue: '#00663f',
        darkValue: '#00663f',
      },
      {
        name: '--primitives-success-green-800',
        type: 'Color',
        lightValue: '#004f32',
        darkValue: '#004f32',
      },
      {
        name: '--primitives-success-green-900',
        type: 'Color',
        lightValue: '#003a24',
        darkValue: '#003a24',
      },
      {
        name: '--primitives-success-green-500-10',
        type: 'Color',
        lightValue: 'rgba(0,147,92,0.1)',
        darkValue: 'rgba(0,147,92,0.1)',
      },
      {
        name: '--primitives-success-green-500-15',
        type: 'Color',
        lightValue: 'rgba(0,147,92,0.15)',
        darkValue: 'rgba(0,147,92,0.15)',
      },
      {
        name: '--primitives-success-green-500-25',
        type: 'Color',
        lightValue: 'rgba(0,147,92,0.25)',
        darkValue: 'rgba(60,159,123,0.25)',
      },
      {
        name: '--primitives-success-green-500-50',
        type: 'Color',
        lightValue: 'rgba(0,147,92,0.5)',
        darkValue: 'rgba(60,159,123,0.5)',
      },
      {
        name: '--primitives-success-green-500-75',
        type: 'Color',
        lightValue: 'rgba(0,147,92,0.75)',
        darkValue: 'rgba(60,159,123,0.75)',
      },

      // ---- Warning Orange (15) ----
      {
        name: '--primitives-warning-orange-50',
        type: 'Color',
        lightValue: '#fff3e5',
        darkValue: '#fff3e5',
      },
      {
        name: '--primitives-warning-orange-100',
        type: 'Color',
        lightValue: '#ffe1bf',
        darkValue: '#502c02',
      },
      {
        name: '--primitives-warning-orange-200',
        type: 'Color',
        lightValue: '#ffcb99',
        darkValue: '#ffcb99',
      },
      {
        name: '--primitives-warning-orange-300',
        type: 'Color',
        lightValue: '#ffaf66',
        darkValue: '#ffaf66',
      },
      {
        name: '--primitives-warning-orange-400',
        type: 'Color',
        lightValue: '#ffa73d',
        darkValue: '#ffa73d',
      },
      {
        name: '--primitives-warning-orange-500',
        type: 'Color',
        lightValue: '#f58600',
        darkValue: '#f58600',
      },
      {
        name: '--primitives-warning-orange-600',
        type: 'Color',
        lightValue: '#db7800',
        darkValue: '#db7800',
      },
      {
        name: '--primitives-warning-orange-700',
        type: 'Color',
        lightValue: '#a85a00',
        darkValue: '#a85a00',
      },
      {
        name: '--primitives-warning-orange-800',
        type: 'Color',
        lightValue: '#6b3a00',
        darkValue: '#6b3a00',
      },
      {
        name: '--primitives-warning-orange-900',
        type: 'Color',
        lightValue: '#381e00',
        darkValue: '#381e00',
      },
      {
        name: '--primitives-warning-orange-500-10',
        type: 'Color',
        lightValue: 'rgba(245,134,0,0.1)',
        darkValue: 'rgba(245,134,0,0.1)',
      },
      {
        name: '--primitives-warning-orange-500-15',
        type: 'Color',
        lightValue: 'rgba(245,134,0,0.15)',
        darkValue: 'rgba(245,134,0,0.15)',
      },
      {
        name: '--primitives-warning-orange-500-25',
        type: 'Color',
        lightValue: 'rgba(245,134,0,0.25)',
        darkValue: 'rgba(251,153,35,0.25)',
      },
      {
        name: '--primitives-warning-orange-500-50',
        type: 'Color',
        lightValue: 'rgba(245,134,0,0.5)',
        darkValue: 'rgba(251,153,35,0.5)',
      },
      {
        name: '--primitives-warning-orange-500-75',
        type: 'Color',
        lightValue: 'rgba(245,134,0,0.75)',
        darkValue: 'rgba(251,153,35,0.75)',
      },

      // ---- Neutral Gray (26) ----
      {
        name: '--primitives-neutral-default',
        type: 'Color',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--primitives-neutral-inversed',
        type: 'Color',
        lightValue: '#0e0f10',
        darkValue: '#ffffff',
      },
      {
        name: '--primitives-neutral-gray-50',
        type: 'Color',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--primitives-neutral-gray-100',
        type: 'Color',
        lightValue: '#ebebeb',
        darkValue: '#ebebeb',
      },
      {
        name: '--primitives-neutral-gray-200',
        type: 'Color',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--primitives-neutral-gray-300',
        type: 'Color',
        lightValue: '#d6d6d6',
        darkValue: '#282e33',
      },
      {
        name: '--primitives-neutral-gray-400',
        type: 'Color',
        lightValue: '#cccccc',
        darkValue: '#cccccc',
      },
      {
        name: '--primitives-neutral-gray-500',
        type: 'Color',
        lightValue: '#c2c2c2',
        darkValue: '#363d44',
      },
      {
        name: '--primitives-neutral-gray-600',
        type: 'Color',
        lightValue: '#b8b8b8',
        darkValue: '#b8b8b8',
      },
      {
        name: '--primitives-neutral-gray-700',
        type: 'Color',
        lightValue: '#ababab',
        darkValue: '#ababab',
      },
      {
        name: '--primitives-neutral-gray-800',
        type: 'Color',
        lightValue: '#6a6b6d',
        darkValue: '#6a6b6d',
      },
      {
        name: '--primitives-neutral-gray-900',
        type: 'Color',
        lightValue: '#1b1f22',
        darkValue: '#1b1f22',
      },
      {
        name: '--primitives-neutral-50-tint-3',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.03)',
        darkValue: 'rgba(245,245,245,0.03)',
      },
      {
        name: '--primitives-neutral-50-tint-5',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.05)',
        darkValue: 'rgba(245,245,245,0.05)',
      },
      {
        name: '--primitives-neutral-50-tint-15',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.15)',
        darkValue: 'rgba(245,245,245,0.15)',
      },
      {
        name: '--primitives-neutral-50-tint-25',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.25)',
        darkValue: 'rgba(245,245,245,0.25)',
      },
      {
        name: '--primitives-neutral-50-tint-50',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.5)',
        darkValue: 'rgba(245,245,245,0.5)',
      },
      {
        name: '--primitives-neutral-50-tint-75',
        type: 'Color',
        lightValue: 'rgba(245,245,245,0.75)',
        darkValue: 'rgba(245,245,245,0.75)',
      },
      {
        name: '--primitives-neutral-black-shade-2',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.02)',
        darkValue: 'rgba(31,36,40,0.02)',
      },
      {
        name: '--primitives-neutral-black-shade-3',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.03)',
        darkValue: 'rgba(31,36,40,0.03)',
      },
      {
        name: '--primitives-neutral-black-shade-5',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.05)',
        darkValue: 'rgba(31,36,40,0.05)',
      },
      {
        name: '--primitives-neutral-black-shade-10',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.1)',
        darkValue: 'rgba(31,36,40,0.1)',
      },
      {
        name: '--primitives-neutral-black-shade-15',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.15)',
        darkValue: 'rgba(31,36,40,0.15)',
      },
      {
        name: '--primitives-neutral-black-shade-25',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.25)',
        darkValue: 'rgba(31,36,40,0.25)',
      },
      {
        name: '--primitives-neutral-black-shade-50',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.5)',
        darkValue: 'rgba(31,36,40,0.5)',
      },
      {
        name: '--primitives-neutral-black-shade-75',
        type: 'Color',
        lightValue: 'rgba(31,36,40,0.75)',
        darkValue: 'rgba(31,36,40,0.75)',
      },

      // ---- Utilities (2) ----
      {
        name: '--primitives-utilities-lime-700',
        type: 'Color',
        lightValue: '#548519',
        darkValue: '#548519',
      },
      {
        name: '--primitives-utilities-purple-600',
        type: 'Color',
        lightValue: '#7b51c8',
        darkValue: '#7b51c8',
      },
    ];

    return {
      id: 'primitive-tokens',
      title: 'Primitive Tokens',
      description:
        'Fundamental design choices without any context about where or how they will be used in the UI.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['ALL_SCOPES'])),
    };
  }

  private buildBackgroundTokens(): ColorSection {
    const tokens: RawToken[] = [
      {
        name: '--semantics-bg-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-bg-subtle-primary-disabled',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-bg-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-bg-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-bg-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-bg-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-bg-subtle-secondary-default',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-bg-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-bg-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-bg-subtle-secondary-inversed-static',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-bg-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-bg-subtle-tertiary-default',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-bg-subtle-tertiary-hover',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-bg-subtle-tertiary-pressed',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-bg-brand-primary-default',
        type: 'Semantic',
        lightValue: '#e5f2ff',
        darkValue: '#01203c',
      },
      {
        name: '--semantics-bg-brand-primary-hover',
        type: 'Semantic',
        lightValue: '#b7dcff',
        darkValue: '#023564',
      },
      {
        name: '--semantics-bg-brand-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-bg-brand-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-bg-brand-primary-pressed',
        type: 'Semantic',
        lightValue: '#b7dcff',
        darkValue: '#023564',
      },
      {
        name: '--semantics-bg-brand-secondary-default',
        type: 'Semantic',
        lightValue: '#b7dcff',
        darkValue: '#023564',
      },
      {
        name: '--semantics-bg-brand-secondary-hover',
        type: 'Semantic',
        lightValue: '#8ac6ff',
        darkValue: '#034a8c',
      },
      {
        name: '--semantics-bg-brand-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#004585',
        darkValue: '#9bcdfd',
      },
      {
        name: '--semantics-bg-brand-secondary-inversed-static',
        type: 'Semantic',
        lightValue: '#004585',
        darkValue: '#034a8c',
      },
      {
        name: '--semantics-bg-brand-secondary-pressed',
        type: 'Semantic',
        lightValue: '#8ac6ff',
        darkValue: '#034a8c',
      },
    ];

    return {
      id: 'background-tokens',
      title: 'Background Tokens',
      description: 'Used on the outermost element that fills most of the application window space.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['FRAME_FILL'])),
    };
  }

  private buildFillTokens(): ColorSection {
    const tokens: RawToken[] = [
      // Subtle
      {
        name: '--semantics-fill-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-subtle-primary-disabled',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-primary-focus',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-fill-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-fill-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-fill-subtle-secondary-default',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-secondary-focus',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-fill-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-subtle-secondary-inversed-static',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#282e33',
      },
      {
        name: '--semantics-fill-subtle-tertiary-default',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-tertiary-focus',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-fill-subtle-tertiary-hover',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-fill-subtle-tertiary-pressed',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#363d44',
      },
      // Brand
      {
        name: '--semantics-fill-brand-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-fill-brand-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-fill-brand-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-fill-brand-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Status Error
      {
        name: '--semantics-fill-status-error-primary-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-fill-status-error-primary-focus',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-fill-status-error-primary-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-fill-status-error-primary-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-fill-status-error-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.1)',
        darkValue: 'rgba(230,77,71,0.25)',
      },
      {
        name: '--semantics-fill-status-error-secondary-disabled',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.15)',
        darkValue: 'rgba(230,77,71,0.25)',
      },
      {
        name: '--semantics-fill-status-error-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.1)',
        darkValue: 'rgba(230,77,71,0.25)',
      },
      {
        name: '--semantics-fill-status-error-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.25)',
        darkValue: 'rgba(230,77,71,0.5)',
      },
      {
        name: '--semantics-fill-status-error-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.25)',
        darkValue: 'rgba(230,77,71,0.5)',
      },
      // Status Info
      {
        name: '--semantics-fill-status-info-primary-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-fill-status-info-primary-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-fill-status-info-primary-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-fill-status-info-primary-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      {
        name: '--semantics-fill-status-info-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(20,139,250,0.25)',
      },
      {
        name: '--semantics-fill-status-info-secondary-disabled',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.15)',
        darkValue: 'rgba(20,139,250,0.25)',
      },
      {
        name: '--semantics-fill-status-info-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(20,139,250,0.25)',
      },
      {
        name: '--semantics-fill-status-info-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.25)',
        darkValue: 'rgba(20,139,250,0.5)',
      },
      {
        name: '--semantics-fill-status-info-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.25)',
        darkValue: 'rgba(20,139,250,0.5)',
      },
      // Status Subtle
      {
        name: '--semantics-fill-status-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-status-subtle-primary-focus',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-status-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-fill-status-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-fill-status-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-fill-status-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.1)',
        darkValue: 'rgba(255, 255, 255, 0.1)',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-disabled',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.1)',
        darkValue: 'rgba(255, 255, 255, 0.1)',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.15)',
        darkValue: 'rgba(255, 255, 255, 0.15)',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: 'rgba(245,245,245,0.15)',
        darkValue: 'rgba(31, 36, 40, 0.15)',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-inversed-static',
        type: 'Semantic',
        lightValue: 'rgba(245,245,245,0.15)',
        darkValue: 'rgba(255, 255, 255, 0.15)',
      },
      {
        name: '--semantics-fill-status-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.25)',
        darkValue: 'rgba(255, 255, 255, 0.25)',
      },
      // Status Success
      {
        name: '--semantics-fill-status-success-primary-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-fill-status-success-primary-focus',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-fill-status-success-primary-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-fill-status-success-primary-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-fill-status-success-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.1)',
        darkValue: 'rgba(60,159,123,0.25)',
      },
      {
        name: '--semantics-fill-status-success-secondary-disabled',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.15)',
        darkValue: 'rgba(60,159,123,0.25)',
      },
      {
        name: '--semantics-fill-status-success-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.1)',
        darkValue: 'rgba(60,159,123,0.25)',
      },
      {
        name: '--semantics-fill-status-success-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.25)',
        darkValue: 'rgba(60,159,123,0.5)',
      },
      {
        name: '--semantics-fill-status-success-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.25)',
        darkValue: 'rgba(60,159,123,0.5)',
      },
      // Status Warning
      {
        name: '--semantics-fill-status-warning-primary-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-fill-status-warning-primary-focus',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-fill-status-warning-primary-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-fill-status-warning-primary-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-fill-status-warning-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.1)',
        darkValue: 'rgba(251,153,35,0.25)',
      },
      {
        name: '--semantics-fill-status-warning-secondary-disabled',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.15)',
        darkValue: 'rgba(251,153,35,0.25)',
      },
      {
        name: '--semantics-fill-status-warning-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.1)',
        darkValue: 'rgba(251,153,35,0.25)',
      },
      {
        name: '--semantics-fill-status-warning-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.25)',
        darkValue: 'rgba(251,153,35,0.5)',
      },
      {
        name: '--semantics-fill-status-warning-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.25)',
        darkValue: 'rgba(251,153,35,0.5)',
      },
    ];

    return {
      id: 'fill-tokens',
      title: 'Fill Tokens',
      description:
        'Semantic tokens for fill colors. Used for button fills, icon fills, interactive element fills, and status indicators.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['FRAME_FILL', 'SHAPE_FILL'])),
    };
  }

  private buildTextTokens(): ColorSection {
    const tokens: RawToken[] = [
      // Subtle
      {
        name: '--semantics-text-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-subtle-primary-disabled',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-text-subtle-primary-focus',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-text-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-text-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-subtle-secondary-focus',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-text-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      // Brand
      {
        name: '--semantics-text-brand-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-brand-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-brand-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-brand-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-text-brand-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-text-brand-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Link Brand
      {
        name: '--semantics-text-link-brand-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-link-brand-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-link-brand-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-text-link-brand-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-text-link-brand-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Link Status Error
      {
        name: '--semantics-text-link-status-error-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-text-link-status-error-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-text-link-status-error-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-text-link-status-error-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-text-link-status-error-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      // Link Status Info
      {
        name: '--semantics-text-link-status-info-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-link-status-info-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-link-status-info-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-text-link-status-info-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-text-link-status-info-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Link Status Success
      {
        name: '--semantics-text-link-status-success-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-text-link-status-success-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-text-link-status-success-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-text-link-status-success-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-text-link-status-success-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      // Link Status Warning
      {
        name: '--semantics-text-link-status-warning-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-text-link-status-warning-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-text-link-status-warning-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-text-link-status-warning-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-text-link-status-warning-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      // Link Subtle
      {
        name: '--semantics-text-link-subtle-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-link-subtle-disabled',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-text-link-subtle-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-text-link-subtle-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-link-subtle-inversed-static',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-text-link-subtle-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      // On Fill Error
      {
        name: '--semantics-text-on-fill-error-default',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-text-on-fill-error-focus',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-text-on-fill-error-hover',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-text-on-fill-error-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-text-on-fill-error-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-text-on-fill-error-pressed',
        type: 'Semantic',
        lightValue: '#5e1512',
        darkValue: '#f3c5c3',
      },
      // On Fill Info
      {
        name: '--semantics-text-on-fill-info-default',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-on-fill-info-focus',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-on-fill-info-hover',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      {
        name: '--semantics-text-on-fill-info-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-text-on-fill-info-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-text-on-fill-info-pressed',
        type: 'Semantic',
        lightValue: '#004585',
        darkValue: '#9bcdfd',
      },
      // On Fill Subtle
      {
        name: '--semantics-text-on-fill-subtle-disabled',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-text-on-fill-subtle-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-text-on-fill-subtle-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-on-fill-subtle-primary',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-on-fill-subtle-secondary',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      // On Fill Success
      {
        name: '--semantics-text-on-fill-success-default',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-text-on-fill-success-focus',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-text-on-fill-success-hover',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-text-on-fill-success-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-text-on-fill-success-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-text-on-fill-success-pressed',
        type: 'Semantic',
        lightValue: '#004f32',
        darkValue: '#aedbcb',
      },
      // On Fill Warning
      {
        name: '--semantics-text-on-fill-warning-default',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-text-on-fill-warning-focus',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-text-on-fill-warning-hover',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-text-on-fill-warning-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-text-on-fill-warning-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-text-on-fill-warning-pressed',
        type: 'Semantic',
        lightValue: '#6b3a00',
        darkValue: '#fdd1a0',
      },
      // Status Error
      {
        name: '--semantics-text-status-error-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-text-status-error-focus',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-text-status-error-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-text-status-error-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-text-status-error-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-text-status-error-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      // Status Info
      {
        name: '--semantics-text-status-info-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-status-info-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-text-status-info-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-text-status-info-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-text-status-info-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-text-status-info-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Status Subtle
      {
        name: '--semantics-text-status-subtle-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-status-subtle-focus',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-status-subtle-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-text-status-subtle-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-text-status-subtle-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-text-status-subtle-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      // Status Success
      {
        name: '--semantics-text-status-success-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-text-status-success-focus',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-text-status-success-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-text-status-success-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-text-status-success-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-text-status-success-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      // Status Warning
      {
        name: '--semantics-text-status-warning-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-text-status-warning-focus',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-text-status-warning-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-text-status-warning-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-text-status-warning-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-text-status-warning-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
    ];

    return {
      id: 'text-tokens',
      title: 'Text Tokens',
      description:
        'Semantic tokens for text colors. Used for headings, body copy, labels, links, and status text throughout the design system.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['TEXT_CONTENT'])),
    };
  }

  private buildBorderTokens(): ColorSection {
    const tokens: RawToken[] = [
      // Subtle
      {
        name: '--semantics-border-subtle-primary',
        type: 'Semantic',
        lightValue: '#cccccc',
        darkValue: '#2f353c',
      },
      {
        name: '--semantics-border-subtle-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-border-subtle-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-border-subtle-secondary',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-border-subtle-disabled',
        type: 'Semantic',
        lightValue: '#cccccc',
        darkValue: '#2f353c',
      },
      // Brand
      {
        name: '--semantics-border-brand-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-border-brand-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-border-brand-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-border-brand-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // Status Error
      {
        name: '--semantics-border-status-error-primary-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-border-status-error-primary-focus',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-border-status-error-primary-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-border-status-error-primary-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-border-status-error-secondary-default',
        type: 'Semantic',
        lightValue: '#f9dcdb',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-border-status-error-secondary-focus',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-border-status-error-secondary-hover',
        type: 'Semantic',
        lightValue: '#f4b7b6',
        darkValue: '#691e1b',
      },
      {
        name: '--semantics-border-status-error-secondary-pressed',
        type: 'Semantic',
        lightValue: '#f0918f',
        darkValue: '#902c27',
      },
      // Status Info
      {
        name: '--semantics-border-status-info-primary-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-border-status-info-primary-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-border-status-info-primary-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-border-status-info-primary-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      {
        name: '--semantics-border-status-info-secondary-default',
        type: 'Semantic',
        lightValue: '#b7dcff',
        darkValue: '#023564',
      },
      {
        name: '--semantics-border-status-info-secondary-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-border-status-info-secondary-hover',
        type: 'Semantic',
        lightValue: '#8ac6ff',
        darkValue: '#034a8c',
      },
      {
        name: '--semantics-border-status-info-secondary-pressed',
        type: 'Semantic',
        lightValue: '#5cb0ff',
        darkValue: '#045fb4',
      },
      // Status Success
      {
        name: '--semantics-border-status-success-primary-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-border-status-success-primary-focus',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-border-status-success-primary-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-border-status-success-primary-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-border-status-success-secondary-default',
        type: 'Semantic',
        lightValue: '#b5decf',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-border-status-success-secondary-focus',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-border-status-success-secondary-hover',
        type: 'Semantic',
        lightValue: '#9bd7c1',
        darkValue: '#005c39',
      },
      {
        name: '--semantics-border-status-success-secondary-pressed',
        type: 'Semantic',
        lightValue: '#63bf9e',
        darkValue: '#025a39',
      },
      // Status Warning
      {
        name: '--semantics-border-status-warning-primary-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-border-status-warning-primary-focus',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-border-status-warning-primary-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-border-status-warning-primary-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-border-status-warning-secondary-default',
        type: 'Semantic',
        lightValue: '#ffe1bf',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-border-status-warning-secondary-focus',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-border-status-warning-secondary-hover',
        type: 'Semantic',
        lightValue: '#ffcb99',
        darkValue: '#874a03',
      },
      {
        name: '--semantics-border-status-warning-secondary-pressed',
        type: 'Semantic',
        lightValue: '#ffaf66',
        darkValue: '#b96704',
      },
    ];

    return {
      id: 'border-tokens',
      title: 'Border Tokens',
      description:
        'Semantic tokens for border colors. Used for dividers, input borders, card borders, and status indicator borders.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['STROKE_COLOR'])),
    };
  }

  private buildSurfaceTokens(): ColorSection {
    const tokens: RawToken[] = [
      // Subtle
      {
        name: '--semantics-surface-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-primary-disabled',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-primary-focus',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-surface-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-surface-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-secondary-default',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-surface-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-surface-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-surface-subtle-secondary-inversed-static',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-surface-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-surface-subtle-tertiary-default',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-surface-subtle-tertiary-hover',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-surface-subtle-tertiary-pressed',
        type: 'Semantic',
        lightValue: '#d6d6d6',
        darkValue: '#22262b',
      },
      // Brand
      {
        name: '--semantics-surface-brand-default',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(20, 139, 250, 0.1)',
      },
      {
        name: '--semantics-surface-brand-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.15)',
        darkValue: 'rgba(20, 139, 250, 0.15)',
      },
      {
        name: '--semantics-surface-brand-pressed',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(0,132,255,0.1)',
      },
      // Status Error
      {
        name: '--semantics-surface-status-error-primary-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-surface-status-error-primary-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-surface-status-error-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-surface-status-error-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-surface-status-error-primary-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-surface-status-error-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.1)',
        darkValue: 'rgba(231, 85, 80, 0.1)',
      },
      {
        name: '--semantics-surface-status-error-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.15)',
        darkValue: 'rgba(230, 77, 71, 0.15)',
      },
      {
        name: '--semantics-surface-status-error-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.25)',
        darkValue: 'rgba(230, 77, 71, 0.25)',
      },
      // Status Info
      {
        name: '--semantics-surface-status-info-primary-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-surface-status-info-primary-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-surface-status-info-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-surface-status-info-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-surface-status-info-primary-pressed',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-surface-status-info-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.1)',
        darkValue: 'rgba(20, 139, 250, 0.1)',
      },
      {
        name: '--semantics-surface-status-info-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.15)',
        darkValue: 'rgba(20, 139, 250, 0.15)',
      },
      {
        name: '--semantics-surface-status-info-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.25)',
        darkValue: 'rgba(20, 139, 250, 0.25)',
      },
      // Status Subtle
      {
        name: '--semantics-surface-status-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-surface-status-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-surface-status-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-surface-status-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-surface-status-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-surface-status-subtle-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.05)',
        darkValue: 'rgba(255, 255, 255, 0.05)',
      },
      {
        name: '--semantics-surface-status-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.15)',
        darkValue: 'rgba(255, 255, 255, 0.15)',
      },
      {
        name: '--semantics-surface-status-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: 'rgba(245,245,245,0.05)',
        darkValue: 'rgba(31, 36, 40, 0.05)',
      },
      {
        name: '--semantics-surface-status-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.25)',
        darkValue: 'rgba(255, 255, 255, 0.25)',
      },
      // Status Success
      {
        name: '--semantics-surface-status-success-primary-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-surface-status-success-primary-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-surface-status-success-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-surface-status-success-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-surface-status-success-primary-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-surface-status-success-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.1)',
        darkValue: 'rgba(63, 185, 141, 0.1)',
      },
      {
        name: '--semantics-surface-status-success-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.15)',
        darkValue: 'rgba(60, 159, 123, 0.15)',
      },
      {
        name: '--semantics-surface-status-success-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.25)',
        darkValue: 'rgba(60, 159, 123, 0.25)',
      },
      // Status Warning
      {
        name: '--semantics-surface-status-warning-primary-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-surface-status-warning-primary-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-surface-status-warning-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-surface-status-warning-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-surface-status-warning-primary-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-surface-status-warning-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.1)',
        darkValue: 'rgba(251, 153, 35, 0.1)',
      },
      {
        name: '--semantics-surface-status-warning-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.15)',
        darkValue: 'rgba(251, 153, 35, 0.15)',
      },
      {
        name: '--semantics-surface-status-warning-secondary-pressed',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.25)',
        darkValue: 'rgba(251, 153, 35, 0.25)',
      },
    ];

    return {
      id: 'surface-tokens',
      title: 'Surface Tokens',
      description:
        'Semantic tokens for surface colors. Used for card surfaces, modal overlays, dropdown menus, and elevated containers.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['FRAME_FILL', 'SHAPE_FILL'])),
    };
  }

  private buildIconTokens(): ColorSection {
    const tokens: RawToken[] = [
      // Subtle
      {
        name: '--semantics-icon-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-subtle-primary-disabled',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-icon-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-icon-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-icon-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-subtle-secondary-default',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-icon-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-icon-subtle-secondary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#14171a',
      },
      {
        name: '--semantics-icon-subtle-secondary-inversed-static',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      // Brand
      {
        name: '--semantics-icon-brand-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-icon-brand-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-icon-brand-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-icon-brand-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-icon-brand-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-icon-brand-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      // On Fill Error
      {
        name: '--semantics-icon-on-fill-error-default',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-icon-on-fill-error-focus',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-icon-on-fill-error-hover',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-icon-on-fill-error-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-icon-on-fill-error-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-icon-on-fill-error-pressed',
        type: 'Semantic',
        lightValue: '#5e1512',
        darkValue: '#f3c5c3',
      },
      // On Fill Info
      {
        name: '--semantics-icon-on-fill-info-default',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-icon-on-fill-info-focus',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-icon-on-fill-info-hover',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      {
        name: '--semantics-icon-on-fill-info-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-icon-on-fill-info-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-icon-on-fill-info-pressed',
        type: 'Semantic',
        lightValue: '#004585',
        darkValue: '#9bcdfd',
      },
      // On Fill Subtle
      {
        name: '--semantics-icon-on-fill-subtle-disabled',
        type: 'Semantic',
        lightValue: '#ababab',
        darkValue: '#434c56',
      },
      {
        name: '--semantics-icon-on-fill-subtle-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-icon-on-fill-subtle-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-on-fill-subtle-primary',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-on-fill-subtle-secondary',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      // On Fill Success
      {
        name: '--semantics-icon-on-fill-success-default',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-icon-on-fill-success-focus',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-icon-on-fill-success-hover',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-icon-on-fill-success-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-icon-on-fill-success-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-icon-on-fill-success-pressed',
        type: 'Semantic',
        lightValue: '#004f32',
        darkValue: '#aedbcb',
      },
      // On Fill Warning
      {
        name: '--semantics-icon-on-fill-warning-default',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-icon-on-fill-warning-focus',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-icon-on-fill-warning-hover',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-icon-on-fill-warning-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-icon-on-fill-warning-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-icon-on-fill-warning-pressed',
        type: 'Semantic',
        lightValue: '#6b3a00',
        darkValue: '#fdd1a0',
      },
      // Status Error
      {
        name: '--semantics-icon-status-error-primary-default',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-icon-status-error-primary-focus',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-icon-status-error-primary-hover',
        type: 'Semantic',
        lightValue: '#ae302a',
        darkValue: '#e7716e',
      },
      {
        name: '--semantics-icon-status-error-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#f7d4d4',
      },
      {
        name: '--semantics-icon-status-error-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#3a0a08',
        darkValue: '#43110f',
      },
      {
        name: '--semantics-icon-status-error-primary-pressed',
        type: 'Semantic',
        lightValue: '#85221e',
        darkValue: '#eb908e',
      },
      {
        name: '--semantics-icon-status-error-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.5)',
        darkValue: 'rgba(230, 77, 71, 0.75)',
      },
      {
        name: '--semantics-icon-status-error-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.5)',
        darkValue: 'rgba(230, 77, 71, 0.75)',
      },
      {
        name: '--semantics-icon-status-error-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(218,62,55,0.75)',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-icon-status-error-secondary-pressed',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e7716e',
      },
      // Status Info
      {
        name: '--semantics-icon-status-info-primary-default',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-icon-status-info-primary-focus',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-icon-status-info-primary-hover',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-icon-status-info-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#c8e3fe',
      },
      {
        name: '--semantics-icon-status-info-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#00305c',
        darkValue: '#023564',
      },
      {
        name: '--semantics-icon-status-info-primary-pressed',
        type: 'Semantic',
        lightValue: '#005aad',
        darkValue: '#73b9fc',
      },
      {
        name: '--semantics-icon-status-info-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.5)',
        darkValue: 'rgba(20, 139, 250, 0.75)',
      },
      {
        name: '--semantics-icon-status-info-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.5)',
        darkValue: 'rgba(20, 139, 250, 0.75)',
      },
      {
        name: '--semantics-icon-status-info-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,132,255,0.75)',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-icon-status-info-secondary-pressed',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#41a1fb',
      },
      // Status Subtle
      {
        name: '--semantics-icon-status-subtle-primary-default',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-status-subtle-primary-hover',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-icon-status-subtle-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-icon-status-subtle-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-status-subtle-primary-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-icon-status-subtle-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.5)',
        darkValue: 'rgba(255, 255, 255, 0.5)',
      },
      {
        name: '--semantics-icon-status-subtle-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.5)',
        darkValue: 'rgba(255, 255, 255, 0.5)',
      },
      {
        name: '--semantics-icon-status-subtle-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.75)',
        darkValue: 'rgba(255, 255, 255, 0.75)',
      },
      {
        name: '--semantics-icon-status-subtle-secondary-pressed',
        type: 'Semantic',
        lightValue: '#1b1f22',
        darkValue: '#ffffff',
      },
      // Status Success
      {
        name: '--semantics-icon-status-success-primary-default',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-icon-status-success-primary-focus',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-icon-status-success-primary-hover',
        type: 'Semantic',
        lightValue: '#007c4e',
        darkValue: '#55b995',
      },
      {
        name: '--semantics-icon-status-success-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#d1ebe0',
      },
      {
        name: '--semantics-icon-status-success-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#003a24',
        darkValue: '#012d1d',
      },
      {
        name: '--semantics-icon-status-success-primary-pressed',
        type: 'Semantic',
        lightValue: '#00663f',
        darkValue: '#6dc5a5',
      },
      {
        name: '--semantics-icon-status-success-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.5)',
        darkValue: 'rgba(60, 159, 123, 0.75)',
      },
      {
        name: '--semantics-icon-status-success-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.5)',
        darkValue: 'rgba(60, 159, 123, 0.75)',
      },
      {
        name: '--semantics-icon-status-success-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(0,147,92,0.75)',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-icon-status-success-secondary-pressed',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#55b995',
      },
      // Status Warning
      {
        name: '--semantics-icon-status-warning-primary-default',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-icon-status-warning-primary-focus',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-icon-status-warning-primary-hover',
        type: 'Semantic',
        lightValue: '#db7800',
        darkValue: '#fb9a41',
      },
      {
        name: '--semantics-icon-status-warning-primary-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#ffe5c7',
      },
      {
        name: '--semantics-icon-status-warning-primary-inversed-static',
        type: 'Semantic',
        lightValue: '#381e00',
        darkValue: '#502c02',
      },
      {
        name: '--semantics-icon-status-warning-primary-pressed',
        type: 'Semantic',
        lightValue: '#a85a00',
        darkValue: '#fca95a',
      },
      {
        name: '--semantics-icon-status-warning-secondary-default',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.5)',
        darkValue: 'rgba(251, 153, 35, 0.75)',
      },
      {
        name: '--semantics-icon-status-warning-secondary-focus',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.5)',
        darkValue: 'rgba(251, 153, 35, 0.75)',
      },
      {
        name: '--semantics-icon-status-warning-secondary-hover',
        type: 'Semantic',
        lightValue: 'rgba(245,134,0,0.75)',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-icon-status-warning-secondary-pressed',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#fb9a41',
      },
    ];

    return {
      id: 'icon-tokens',
      title: 'Icon Tokens',
      description:
        'Semantic tokens for icon colors. Used for navigation icons, action icons, status indicators, and decorative iconography.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['SHAPE_FILL'])),
    };
  }

  private buildOtherTokens(): ColorSection {
    const tokens: RawToken[] = [
      {
        name: '--semantics-avatar-one',
        type: 'Semantic',
        lightValue: '#0084ff',
        darkValue: '#148bfa',
      },
      {
        name: '--semantics-avatar-two',
        type: 'Semantic',
        lightValue: '#f58600',
        darkValue: '#f08505',
      },
      {
        name: '--semantics-avatar-three',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-avatar-four',
        type: 'Semantic',
        lightValue: '#00935c',
        darkValue: '#3c9f7b',
      },
      {
        name: '--semantics-avatar-five',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-avatar-six',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#1b1f22',
      },
      {
        name: '--semantics-avatar-seven',
        type: 'Semantic',
        lightValue: '#e0e0e0',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-code-comment',
        type: 'Semantic',
        lightValue: '#6a6b6d',
        darkValue: '#677583',
      },
      {
        name: '--semantics-code-function',
        type: 'Semantic',
        lightValue: '#006fd6',
        darkValue: '#41a1fb',
      },
      {
        name: '--semantics-code-inversed-dynamic',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-code-keyword',
        type: 'Semantic',
        lightValue: '#7b51c8',
        darkValue: '#9975da',
      },
      {
        name: '--semantics-code-overlay',
        type: 'Semantic',
        lightValue: 'rgba(31,36,40,0.02)',
        darkValue: 'rgba(255, 255, 255, 0.02)',
      },
      {
        name: '--semantics-code-properties',
        type: 'Semantic',
        lightValue: '#da3e37',
        darkValue: '#e64d47',
      },
      {
        name: '--semantics-code-string',
        type: 'Semantic',
        lightValue: '#548519',
        darkValue: '#7bad35',
      },
      {
        name: '--semantics-code-text',
        type: 'Semantic',
        lightValue: '#0e0f10',
        darkValue: '#ffffff',
      },
      {
        name: '--semantics-sidebar-default',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#0e0f10',
      },
      {
        name: '--semantics-sidebar-hover',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-sidebar-collapsed-hover',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-sidebar-collapsed-pressed',
        type: 'Semantic',
        lightValue: '#f5f5f5',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-sidebar-expanded-hover',
        type: 'Semantic',
        lightValue: '#ebebeb',
        darkValue: '#22262b',
      },
      {
        name: '--semantics-sidebar-expanded-pressed',
        type: 'Semantic',
        lightValue: '#ffffff',
        darkValue: '#1b1f22',
      },
    ];

    return {
      id: 'other-tokens',
      title: 'Other Tokens',
      description:
        'Miscellaneous semantic tokens for avatars, code highlighting, sidebar navigation, and other specialized UI elements.',
      tokenCount: tokens.length,
      tokens: tokens.map((t) => this.enrichToken(t, ['SHAPE_FILL'])),
    };
  }
}
