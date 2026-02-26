import {
  Component,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CodeBlock, CodeBlockType, CodeTab } from '../../../shared/code-block/code-block';

type Tab = 'examples' | 'properties' | 'playground';

@Component({
  selector: 'app-code-page',
  standalone: true,
  imports: [CodeBlock],
  templateUrl: './code.html',
  styleUrl: './code.scss',
})
export class CodePage implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  readonly activeTab = signal<Tab>('examples');
  readonly activeSection = signal('with-line');

  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'examples', label: 'Examples' },
    { id: 'properties', label: 'Properties' },
    { id: 'playground', label: 'Playground' },
  ];

  readonly examplesTocItems = [
    { id: 'with-line', label: 'With Line' },
    { id: 'doc-expanded', label: 'Documentation Expanded' },
    { id: 'doc-collapsed', label: 'Documentation Collapsed' },
    { id: 'usage', label: 'Usage' },
  ];

  readonly propertiesTocItems = [{ id: 'inputs', label: 'Inputs' }];

  readonly tocItems = computed(() => {
    switch (this.activeTab()) {
      case 'examples':
        return this.examplesTocItems;
      case 'properties':
        return this.propertiesTocItems;
      default:
        return [];
    }
  });

  // ═══════════════════════════════════════
  // Properties — only real Angular inputs
  // ═══════════════════════════════════════

  readonly inputProps = [
    {
      property: 'type',
      type: "'line' | 'doc-expanded' | 'doc-collapsed'",
      default: "'line'",
      description:
        'Display type. "line" = numbered code. "doc-expanded" = toolbar + tabs + code. "doc-collapsed" = toolbar only, click to expand.',
    },
    {
      property: 'code',
      type: 'string',
      default: "''",
      description: 'Raw code string. Used directly for type "line" and "doc-collapsed".',
    },
    {
      property: 'codeTabs',
      type: '{ label: string; code: string }[]',
      default: '[]',
      description:
        'Tab objects for "doc-expanded". Each tab has a label and code string. Clicking a tab switches the displayed code.',
    },
    {
      property: 'showLineNumbers',
      type: 'boolean',
      default: 'true',
      description: 'Show or hide line numbers. Only applies to type "line".',
    },
    {
      property: 'highlightLines',
      type: 'number[]',
      default: '[]',
      description: 'Line numbers to highlight with a blue accent. Only applies to type "line".',
    },
  ];

  // ═══════════════════════════════════════
  // Code snippets
  // ═══════════════════════════════════════

  readonly reactCode = `// Button component
import React from 'react';

class Button extends React.Component {
  render() {
    const { variant, children, onClick } = this.props;

    return (
      <button className={\`btn btn-\${variant}\`} onClick={onClick}>
        {children}
      </button>
    );
  }
}

export default Button;`;

  readonly htmlCode = `<!-- Button component -->
<button class="btn btn-primary" onclick="handleClick()">
  Click me
</button>

<button class="btn btn-secondary" disabled>
  Disabled
</button>`;

  readonly docTabs: CodeTab[] = [
    { label: 'React', code: this.reactCode },
    { label: 'HTML', code: this.htmlCode },
  ];

  // ── Usage examples: code shown in a code-block, then rendered live below ──

  readonly usageLineCode = `<app-code-block
  [code]="myCode"
  [type]="'line'"
  [showLineNumbers]="true"
  [highlightLines]="[2, 4]"
/>`;

  readonly usageDocCode = `<app-code-block
  [type]="'doc-expanded'"
  [codeTabs]="[
    { label: 'React', code: reactCode },
    { label: 'HTML', code: htmlCode }
  ]"
/>`;

  readonly usageCollapsedCode = `<app-code-block
  [type]="'doc-collapsed'"
  [code]="myCode"
/>`;

  // ── Live demo data for usage section ──
  readonly demoCode = `const greet = (name) => {
  return 'Hello, ' + name + '!';
};

export default greet;`;

  readonly demoTabs: CodeTab[] = [
    {
      label: 'TypeScript',
      code: `const greet = (name: string): string => {
  return 'Hello, ' + name + '!';
};

export default greet;`,
    },
    {
      label: 'JavaScript',
      code: `const greet = (name) => {
  return 'Hello, ' + name + '!';
};

export default greet;`,
    },
  ];

  // ═══════════════════════════════════════
  // Playground state
  // ═══════════════════════════════════════

  readonly pgType = signal<CodeBlockType>('line');
  readonly pgShowLineNumbers = signal(true);
  readonly pgHighlight = signal<'none' | 'few' | 'many'>('none');

  readonly pgHighlightLines = computed(() => {
    switch (this.pgHighlight()) {
      case 'few':
        return [2, 5];
      case 'many':
        return [1, 2, 3, 6, 7, 8];
      default:
        return [];
    }
  });

  // ═══════════════════════════════════════
  // Methods
  // ═══════════════════════════════════════

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'examples') this.activeSection.set('with-line');
    if (tab === 'properties') this.activeSection.set('inputs');
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.setupObserver(), 50);
    }
  }

  ngAfterViewInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  scrollTo(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onPgType(event: Event): void {
    this.pgType.set((event.target as HTMLSelectElement).value as CodeBlockType);
  }

  onPgLineNumbers(event: Event): void {
    this.pgShowLineNumbers.set((event.target as HTMLSelectElement).value === 'true');
  }

  onPgHighlight(event: Event): void {
    this.pgHighlight.set((event.target as HTMLSelectElement).value as 'none' | 'few' | 'many');
  }

  private setupObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeSection.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-160px 0px -60% 0px', threshold: 0 },
    );

    const sections = this.el.nativeElement.querySelectorAll('.comp-section');
    sections.forEach((s: Element) => this.observer!.observe(s));
  }
}
