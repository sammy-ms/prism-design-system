import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface TypographyToken {
  name: string;
  web: string;
  mobile: string;
  scope: string;
  isAlias?: boolean;
  aliasRef?: string;
  aliasValue?: string;
}

export interface TypographySection {
  label: string;
  iconType: 'text' | 'number';
  tokens: TypographyToken[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
@Component({
  selector: 'app-typography',
  standalone: true,
  templateUrl: './typography.html',
  styleUrl: './typography.scss',
})
export class TypographyPage {
  private readonly platformId = inject(PLATFORM_ID);

  readonly highlightedRef = signal<string | null>(null);

  readonly sections = signal<TypographySection[]>([
    {
      label: 'Family',
      iconType: 'text',
      tokens: [
        { name: 'Family/Mono', web: 'Roboto Mono', mobile: 'Roboto Mono', scope: 'FONT_FAMILY' },
        { name: 'Family/Sans', web: 'Inter', mobile: 'Inter', scope: 'FONT_FAMILY' },
      ],
    },
    {
      label: 'Size',
      iconType: 'number',
      tokens: [
        { name: 'Size/H1', web: '32', mobile: '32', scope: 'FONT_SIZE' },
        { name: 'Size/H2', web: '24', mobile: '24', scope: 'FONT_SIZE' },
        { name: 'Size/H3', web: '20', mobile: '20', scope: 'FONT_SIZE' },
        { name: 'Size/Body-lg', web: '16', mobile: '16', scope: 'FONT_SIZE' },
        { name: 'Size/Body-md', web: '14', mobile: '14', scope: 'FONT_SIZE' },
        { name: 'Size/Body-sm', web: '13', mobile: '13', scope: 'FONT_SIZE' },
        { name: 'Size/Caption-md', web: '12', mobile: '12', scope: 'FONT_SIZE' },
        { name: 'Size/Caption-sm', web: '10', mobile: '10', scope: 'FONT_SIZE' },
      ],
    },
    {
      label: 'Weight',
      iconType: 'number',
      tokens: [
        { name: 'Weight/Bold', web: '650', mobile: '650', scope: 'FONT_WEIGHT' },
        { name: 'Weight/Medium', web: '550', mobile: '550', scope: 'FONT_WEIGHT' },
        { name: 'Weight/Mono', web: 'Regular', mobile: 'Regular', scope: 'FONT_STYLE' },
        { name: 'Weight/Regular', web: '450', mobile: '450', scope: 'FONT_WEIGHT' },
        { name: 'Weight/Semi-bold', web: '550', mobile: '550', scope: 'FONT_WEIGHT' },
      ],
    },
    {
      label: 'Line Height',
      iconType: 'number',
      tokens: [
        { name: 'Line Height/H1', web: '40', mobile: '40', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/H2', web: '30', mobile: '30', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/H3', web: '25', mobile: '25', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/Body-lg', web: '20', mobile: '20', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/Body-md', web: '17.3', mobile: '17.3', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/Body-sm', web: '16.3', mobile: '16.3', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/Caption-md', web: '15', mobile: '15', scope: 'LINE_HEIGHT' },
        { name: 'Line Height/Caption-sm', web: '12', mobile: '12', scope: 'LINE_HEIGHT' },
      ],
    },
    {
      label: 'Semantic Text',
      iconType: 'number',
      tokens: [
        {
          name: 'Text/H1/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/H1',
          aliasValue: '40',
        },
        {
          name: 'Text/H1/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/H1',
          aliasValue: '32',
        },
        {
          name: 'Text/H2/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/H2',
          aliasValue: '30',
        },
        {
          name: 'Text/H2/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/H2',
          aliasValue: '24',
        },
        {
          name: 'Text/H3/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/H3',
          aliasValue: '25',
        },
        {
          name: 'Text/H3/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/H3',
          aliasValue: '20',
        },
        {
          name: 'Text/Body-lg/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/Body-lg',
          aliasValue: '20',
        },
        {
          name: 'Text/Body-lg/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/Body-lg',
          aliasValue: '16',
        },
        {
          name: 'Text/Body-md/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/Body-md',
          aliasValue: '17.3',
        },
        {
          name: 'Text/Body-md/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/Body-md',
          aliasValue: '14',
        },
        {
          name: 'Text/Body-sm/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/Body-sm',
          aliasValue: '16.3',
        },
        {
          name: 'Text/Body-sm/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/Body-sm',
          aliasValue: '13',
        },
        {
          name: 'Text/Caption-md/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/Caption-md',
          aliasValue: '15',
        },
        {
          name: 'Text/Caption-md/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/Caption-md',
          aliasValue: '12',
        },
        {
          name: 'Text/Caption-sm/Line Height',
          web: '',
          mobile: '',
          scope: 'LINE_HEIGHT',
          isAlias: true,
          aliasRef: 'Line Height/Caption-sm',
          aliasValue: '12',
        },
        {
          name: 'Text/Caption-sm/Size',
          web: '',
          mobile: '',
          scope: 'FONT_SIZE',
          isAlias: true,
          aliasRef: 'Size/Caption-sm',
          aliasValue: '10',
        },
      ],
    },
  ]);

  scrollToRef(ref: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = 'typo-' + ref.replace(/\//g, '-').replace(/\s+/g, '-');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.highlightedRef.set(ref);
      setTimeout(() => this.highlightedRef.set(null), 1800);
    }
  }
}
