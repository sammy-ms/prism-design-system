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
import {
  CodeBlock,
  CodeBlockType,
  CodeTab,
  CodeLinkConfig,
} from '../../../shared/code-block/code-block';
import { CodeLink } from '../../../shared/code-link/code-link';
import { CodeLineComponent, IndentLevel } from '../../../shared/code-line/code-line';
import {
  CodeTabGroup,
  TabGroupType,
  TabItemConfig,
} from '../../../shared/code-tab-group/code-tab-group';

type Tab = 'examples' | 'properties' | 'playground';

@Component({
  selector: 'app-code-page',
  standalone: true,
  imports: [CodeBlock, CodeLink, CodeLineComponent, CodeTabGroup],
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

  readonly propertiesTocItems = [
    { id: 'code-block-inputs', label: 'Code Block' },
    { id: 'code-link-inputs', label: 'Code Link' },
    { id: 'code-line-inputs', label: 'Code Line' },
    { id: 'code-tab-group-inputs', label: 'Tab Group' },
  ];

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
  // Properties tables
  // ═══════════════════════════════════════

  readonly codeBlockProps = [
    {
      property: 'type',
      type: "'line' | 'doc-expanded' | 'doc-collapsed'",
      default: "'line'",
      description:
        'Display type. "line" = numbered code. "doc-expanded" = toolbar + tabs + code. "doc-collapsed" = toolbar only (no expand).',
    },
    {
      property: 'code',
      type: 'string',
      default: "''",
      description: 'Raw code string for single-source blocks.',
    },
    {
      property: 'codeTabs',
      type: 'CodeTab[]',
      default: '[]',
      description: 'Tab objects for "doc-expanded". Each tab has a label and code string.',
    },
    {
      property: 'showLineNumbers',
      type: 'boolean',
      default: 'true',
      description: 'Show or hide line numbers. Applies to all types.',
    },
    {
      property: 'highlightLines',
      type: 'number[]',
      default: '[]',
      description: 'Line numbers to highlight with a blue accent.',
    },
    {
      property: 'indentLevel',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      default: '0',
      description: 'Global indent level applied to all code lines (16px per level).',
    },
    {
      property: 'showCodeLink',
      type: 'Partial<CodeLinkConfig>',
      default: '{}',
      description: 'Override config for the "Show code" toolbar link (doc types only).',
    },
    {
      property: 'copyLink',
      type: 'Partial<CodeLinkConfig>',
      default: '{}',
      description: 'Override config for the "Copy" toolbar link (doc types only).',
    },
    {
      property: 'editLink',
      type: 'Partial<CodeLinkConfig>',
      default: '{}',
      description: 'Override config for the "Edit" toolbar link (doc types only).',
    },
    {
      property: 'tabGroupConfig',
      type: 'Partial<TabGroupConfig>',
      default: '{}',
      description: 'Override config for the tab group (doc-expanded only).',
    },
  ];

  readonly codeLinkProps = [
    {
      property: 'size',
      type: "'small' | 'medium' | 'large'",
      default: "'medium'",
      description: 'Button size. Controls font size and icon dimensions.',
    },
    {
      property: 'variant',
      type: "'primary' | 'subtle' | 'warning' | 'destructive'",
      default: "'primary'",
      description:
        'Visual style. Primary = blue, subtle = dark, warning = orange, destructive = red.',
    },
    {
      property: 'state',
      type: "'default' | 'hover' | 'pressed' | 'disabled'",
      default: "'default'",
      description: 'Forced visual state. Overrides natural interactive state for documentation.',
    },
    {
      property: 'showTrailingIcon',
      type: 'boolean',
      default: 'true',
      description: 'Show the trailing icon (chevron, copy, or edit).',
    },
    {
      property: 'showLabel',
      type: 'boolean',
      default: 'true',
      description: 'Show the text label.',
    },
    {
      property: 'label',
      type: 'string',
      default: "''",
      description: 'The text label to display when showLabel is true.',
    },
    {
      property: 'icon',
      type: "'chevron' | 'copy' | 'edit' | 'none'",
      default: "'chevron'",
      description: 'Which trailing icon to render.',
    },
    {
      property: 'iconRotated',
      type: 'boolean',
      default: 'false',
      description: 'Rotate the icon 90 degrees (used for expanded chevron).',
    },
  ];

  readonly codeLineProps = [
    {
      property: 'highlight',
      type: 'boolean',
      default: 'false',
      description: 'Apply blue highlight background to this line.',
    },
    {
      property: 'showLineNumber',
      type: 'boolean',
      default: 'true',
      description: 'Show the line number gutter.',
    },
    {
      property: 'lineNumber',
      type: 'number',
      default: '1',
      description: 'The line number to display when showLineNumber is true.',
    },
    {
      property: 'code',
      type: 'string',
      default: "''",
      description: 'Raw code text for this line. Automatically syntax-highlighted.',
    },
    {
      property: 'indentLevel',
      type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
      default: '0',
      description: 'Indent level (16px per level).',
    },
  ];

  readonly codeTabGroupProps = [
    {
      property: 'type',
      type: "'underline' | 'white-pill' | 'grey-pill'",
      default: "'underline'",
      description: 'Tab group visual style.',
    },
    {
      property: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Layout direction of tabs.',
    },
    {
      property: 'tabs',
      type: 'TabItemConfig[]',
      default: '[]',
      description:
        'Array of tab item configurations. Each tab has show, label, state, focus, showLabel, showTrailingIcon.',
    },
    {
      property: 'activeIndex',
      type: 'number',
      default: '0',
      description: 'Index of the currently selected tab.',
    },
  ];

  readonly tabItemProps = [
    {
      property: 'show',
      type: 'boolean',
      default: 'true',
      description: 'Whether this tab is visible.',
    },
    { property: 'label', type: 'string', default: "''", description: 'Tab label text.' },
    {
      property: 'showLabel',
      type: 'boolean',
      default: 'true',
      description: 'Whether to display the label.',
    },
    {
      property: 'showTrailingIcon',
      type: 'boolean',
      default: 'false',
      description: 'Show trailing chevron icon on this tab.',
    },
    {
      property: 'state',
      type: "'rest' | 'hover' | 'surface-hover' | 'background-hover' | 'selected' | 'disabled' | 'skeleton'",
      default: "'rest'",
      description: 'Forced visual state of this tab.',
    },
    {
      property: 'focus',
      type: 'boolean',
      default: 'false',
      description: 'Show focus ring around this tab.',
    },
    {
      property: 'type',
      type: "'underline' | 'white-pill' | 'grey-pill'",
      default: 'group type',
      description: 'Override the group type for this individual tab.',
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

  // ── Usage examples ──

  readonly usageLineCode = `<app-code-block
  [code]="myCode"
  [type]="'line'"
  [showLineNumbers]="true"
  [highlightLines]="[2, 4]"
/>`;

  readonly usageDocCode = `<app-code-block
  [type]="'doc-expanded'"
  [codeTabs]="myTabs"
  [tabGroupConfig]="{ type: 'white-pill' }"
/>`;

  readonly usageCollapsedCode = `<app-code-block
  [type]="'doc-collapsed'"
  [code]="myCode"
  [showCodeLink]="{ label: 'View source', style: 'primary' }"
/>`;

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
  readonly pgIndentLevel = signal<IndentLevel>(0);

  // Link controls
  readonly pgLinkSize = signal<'small' | 'medium' | 'large'>('medium');
  readonly pgLinkStyle = signal<'primary' | 'subtle' | 'warning' | 'destructive'>('subtle');
  readonly pgCopyStyle = signal<'primary' | 'subtle' | 'warning' | 'destructive'>('primary');
  readonly pgShowTrailingIcon = signal(true);
  readonly pgShowLabel = signal(true);

  // Tab group controls
  readonly pgTabType = signal<TabGroupType>('underline');
  readonly pgTabOrientation = signal<'horizontal' | 'vertical'>('horizontal');

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

  readonly pgShowCodeLinkConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgLinkSize(),
    style: this.pgLinkStyle(),
    showTrailingIcon: this.pgShowTrailingIcon(),
    showLabel: this.pgShowLabel(),
  }));

  readonly pgCopyLinkConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgLinkSize(),
    style: this.pgCopyStyle(),
    showTrailingIcon: this.pgShowTrailingIcon(),
    showLabel: this.pgShowLabel(),
  }));

  readonly pgEditLinkConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgLinkSize(),
    style: this.pgCopyStyle(),
    showTrailingIcon: this.pgShowTrailingIcon(),
    showLabel: this.pgShowLabel(),
  }));

  readonly pgTabGroupConfig = computed(() => ({
    type: this.pgTabType(),
    orientation: this.pgTabOrientation(),
  }));

  // ═══════════════════════════════════════
  // Methods
  // ═══════════════════════════════════════

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
    if (tab === 'examples') this.activeSection.set('with-line');
    if (tab === 'properties') this.activeSection.set('code-block-inputs');
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

  onPgIndent(event: Event): void {
    this.pgIndentLevel.set(+(event.target as HTMLSelectElement).value as IndentLevel);
  }

  onPgLinkSize(event: Event): void {
    this.pgLinkSize.set((event.target as HTMLSelectElement).value as 'small' | 'medium' | 'large');
  }

  onPgLinkStyle(event: Event): void {
    this.pgLinkStyle.set(
      (event.target as HTMLSelectElement).value as 'primary' | 'subtle' | 'warning' | 'destructive',
    );
  }

  onPgCopyStyle(event: Event): void {
    this.pgCopyStyle.set(
      (event.target as HTMLSelectElement).value as 'primary' | 'subtle' | 'warning' | 'destructive',
    );
  }

  onPgShowTrailingIcon(event: Event): void {
    this.pgShowTrailingIcon.set((event.target as HTMLSelectElement).value === 'true');
  }

  onPgShowLabel(event: Event): void {
    this.pgShowLabel.set((event.target as HTMLSelectElement).value === 'true');
  }

  onPgTabType(event: Event): void {
    this.pgTabType.set((event.target as HTMLSelectElement).value as TabGroupType);
  }

  onPgTabOrientation(event: Event): void {
    this.pgTabOrientation.set(
      (event.target as HTMLSelectElement).value as 'horizontal' | 'vertical',
    );
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
