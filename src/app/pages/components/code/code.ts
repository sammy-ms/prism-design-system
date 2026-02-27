import {
  Component,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  WritableSignal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CodeBlock,
  CodeBlockType,
  CodeTab,
  CodeLinkConfig,
} from '../../../shared/code-block/code-block';
import { CodeLinkSize, CodeLinkStyle, CodeLinkState } from '../../../shared/code-link/code-link';
import { CodeLineComponent, IndentLevel } from '../../../shared/code-line/code-line';
import {
  TabGroupType,
  TabOrientation,
  TabState,
  TabItemConfig,
} from '../../../shared/code-tab-group/code-tab-group';

type Tab = 'examples' | 'properties' | 'playground';

interface LinkSignals {
  size: WritableSignal<CodeLinkSize>;
  style: WritableSignal<CodeLinkStyle>;
  state: WritableSignal<CodeLinkState>;
  showTrailingIcon: WritableSignal<boolean>;
  showLabel: WritableSignal<boolean>;
  label: WritableSignal<string>;
}

interface TabSignals {
  show: WritableSignal<boolean>;
  state: WritableSignal<TabState>;
  focus: WritableSignal<boolean>;
  showLabel: WritableSignal<boolean>;
  showTrailingIcon: WritableSignal<boolean>;
  label: WritableSignal<string>;
}

interface LineSignals {
  highlight: WritableSignal<boolean>;
  showLineNumber: WritableSignal<boolean>;
  lineNumber: WritableSignal<number>;
  code: WritableSignal<string>;
  indentLevel: WritableSignal<IndentLevel>;
}

@Component({
  selector: 'app-code-page',
  standalone: true,
  imports: [CodeBlock, CodeLineComponent],
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
      type: '1 | 2 | 3 | 4 | 5 | 6',
      default: '1',
      description:
        'Indent level. For "line" type, applies to all code lines. For doc types, shifts the Show code link only (16px per level, level 1 = no indent).',
    },
    {
      property: 'lineConfigs',
      type: 'CodeLineConfig[] | null',
      default: 'null',
      description:
        'Direct per-line config array. When provided, overrides code/highlightLines/indentLevel parsing.',
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
    {
      property: 'pressed',
      type: 'OutputEmitterRef<void>',
      default: '—',
      description: 'Emitted when the link is clicked (unless disabled).',
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
      type: '1 | 2 | 3 | 4 | 5 | 6',
      default: '1',
      description: 'Indent level (16px per level, level 1 = no indent).',
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
      description: 'Array of tab item configurations.',
    },
    {
      property: 'activeIndex',
      type: 'number',
      default: '0',
      description: 'Index of the currently selected tab.',
    },
    {
      property: 'tabSelected',
      type: 'OutputEmitterRef<number>',
      default: '—',
      description: 'Emitted with the tab index when a tab is clicked.',
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

  readonly cssCode = `.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
}`;

  readonly vueCode = `<template>
  <button :class="classes" @click="onClick">
    <slot />
  </button>
</template>`;

  readonly svelteCode = `<script>
  export let variant = 'primary';
</script>

<button class="btn btn-{variant}" on:click>
  <slot />
</button>`;

  readonly docTabs: CodeTab[] = [
    { label: 'React', code: this.reactCode },
    { label: 'HTML', code: this.htmlCode },
  ];

  readonly playgroundTabs: CodeTab[] = [
    { label: 'React', code: this.reactCode },
    { label: 'HTML', code: this.htmlCode },
    { label: 'CSS', code: this.cssCode },
    { label: 'Vue', code: this.vueCode },
    { label: 'Svelte', code: this.svelteCode },
  ];

  // ── Usage examples ──

  readonly usageLineCode = `<app-code-block
  [code]="myCode"
  [type]="'line'"
  [showLineNumbers]="true"
  [highlightLines]="[2, 4]"
  [indentLevel]="1"
/>`;

  readonly usageDocCode = `<app-code-block
  [type]="'doc-expanded'"
  [codeTabs]="myTabs"
  [tabGroupConfig]="{ type: 'white-pill' }"
  [showCodeLink]="{ size: 'small', style: 'subtle' }"
  [copyLink]="{ label: 'Copy' }"
  [editLink]="{ label: 'Edit' }"
/>`;

  readonly usageCollapsedCode = `<app-code-block
  [type]="'doc-collapsed'"
  [code]="myCode"
  [showCodeLink]="{ label: 'Show code' }"
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

  // ── Core ──
  readonly pgType = signal<CodeBlockType>('line');

  // ── Per-line config (line type) ──
  private readonly pgIndentLevels: IndentLevel[] = [1, 1, 1, 1, 2, 3, 1, 3, 4, 5, 4, 3, 2, 1, 1, 1];

  readonly pgLines: LineSignals[] = this.reactCode.split('\n').map((text, i) => ({
    highlight: signal(false),
    showLineNumber: signal(true),
    lineNumber: signal(i + 1),
    code: signal(text),
    indentLevel: signal<IndentLevel>(this.pgIndentLevels[i] ?? 1),
  }));

  // ── Doc type globals ──
  readonly pgIndentLevel = signal<IndentLevel>(1);
  readonly pgShowLineNumbers = signal(true);
  readonly pgHighlight = signal<'none' | 'few' | 'many'>('none');

  // ── Show Code link ──
  readonly pgShowCode: LinkSignals = {
    size: signal<CodeLinkSize>('small'),
    style: signal<CodeLinkStyle>('subtle'),
    state: signal<CodeLinkState>('default'),
    showTrailingIcon: signal(true),
    showLabel: signal(true),
    label: signal('Show code'),
  };

  // ── Copy link ──
  readonly pgCopy: LinkSignals = {
    size: signal<CodeLinkSize>('medium'),
    style: signal<CodeLinkStyle>('primary'),
    state: signal<CodeLinkState>('default'),
    showTrailingIcon: signal(true),
    showLabel: signal(true),
    label: signal('Copy'),
  };

  // ── Edit link ──
  readonly pgEdit: LinkSignals = {
    size: signal<CodeLinkSize>('medium'),
    style: signal<CodeLinkStyle>('primary'),
    state: signal<CodeLinkState>('default'),
    showTrailingIcon: signal(true),
    showLabel: signal(true),
    label: signal('Edit'),
  };

  // ── Tab group ──
  readonly pgTabType = signal<TabGroupType>('underline');
  readonly pgTabOrientation = signal<TabOrientation>('horizontal');

  // ── Per-tab config (1–10, 5 pre-filled) ──
  private readonly defaultTabLabels = [
    'React',
    'HTML',
    'Tab',
    'Tab',
    'Tab',
    'Tab',
    'Tab',
    'Tab',
    'Tab',
    'Tab',
  ];

  readonly pgTabItems: TabSignals[] = this.defaultTabLabels.map((name, i) => ({
    show: signal(i < 2),
    state: signal<TabState>('rest'),
    focus: signal(false),
    showLabel: signal(true),
    showTrailingIcon: signal(false),
    label: signal(name),
  }));

  // ── Computed playground configs ──

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

  readonly pgShowCodeConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgShowCode.size(),
    style: this.pgShowCode.style(),
    state: this.pgShowCode.state(),
    showTrailingIcon: this.pgShowCode.showTrailingIcon(),
    showLabel: this.pgShowCode.showLabel(),
    label: this.pgShowCode.label(),
  }));

  readonly pgCopyConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgCopy.size(),
    style: this.pgCopy.style(),
    state: this.pgCopy.state(),
    showTrailingIcon: this.pgCopy.showTrailingIcon(),
    showLabel: this.pgCopy.showLabel(),
    label: this.pgCopy.label(),
  }));

  readonly pgEditConfig = computed<Partial<CodeLinkConfig>>(() => ({
    size: this.pgEdit.size(),
    style: this.pgEdit.style(),
    state: this.pgEdit.state(),
    showTrailingIcon: this.pgEdit.showTrailingIcon(),
    showLabel: this.pgEdit.showLabel(),
    label: this.pgEdit.label(),
  }));

  readonly pgResolvedCodeTabs = computed<CodeTab[]>(() => {
    const items = this.pgTabItems;
    return this.playgroundTabs
      .filter((_, i) => i < items.length && items[i].show())
      .map((tab, i) => {
        const matchIdx = this.playgroundTabs.indexOf(tab);
        return { label: items[matchIdx]?.label() ?? tab.label, code: tab.code };
      });
  });

  readonly pgTabGroupConfig = computed(() => ({
    type: this.pgTabType(),
    orientation: this.pgTabOrientation(),
    tabs: this.pgTabItems.map(
      (t) =>
        ({
          show: t.show(),
          label: t.label(),
          showLabel: t.showLabel(),
          showTrailingIcon: t.showTrailingIcon(),
          state: t.state(),
          focus: t.focus(),
        }) as TabItemConfig,
    ),
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

  // ── Generic handlers ──

  onSelect(sig: WritableSignal<string>, event: Event): void {
    sig.set((event.target as HTMLSelectElement).value);
  }

  onToggle(sig: WritableSignal<boolean>): void {
    sig.update((v) => !v);
  }

  onText(sig: WritableSignal<string>, event: Event): void {
    sig.set((event.target as HTMLInputElement).value);
  }

  onNumber(sig: WritableSignal<number>, event: Event): void {
    sig.set(+(event.target as HTMLInputElement).value);
  }

  onIndent(sig: WritableSignal<IndentLevel>, event: Event): void {
    sig.set(+(event.target as HTMLSelectElement).value as IndentLevel);
  }

  onPgType(event: Event): void {
    this.pgType.set((event.target as HTMLSelectElement).value as CodeBlockType);
  }

  onPgHighlight(event: Event): void {
    this.pgHighlight.set((event.target as HTMLSelectElement).value as 'none' | 'few' | 'many');
  }

  resetPlayground(): void {
    this.pgType.set('line');
    this.pgIndentLevel.set(1);
    this.pgShowLineNumbers.set(true);
    this.pgHighlight.set('none');

    const lines = this.reactCode.split('\n');
    this.pgLines.forEach((line, i) => {
      line.highlight.set(false);
      line.showLineNumber.set(true);
      line.lineNumber.set(i + 1);
      line.code.set(lines[i] ?? '');
      line.indentLevel.set(this.pgIndentLevels[i] ?? 1);
    });

    this.pgShowCode.size.set('small');
    this.pgShowCode.style.set('subtle');
    this.pgShowCode.state.set('default');
    this.pgShowCode.showTrailingIcon.set(true);
    this.pgShowCode.showLabel.set(true);
    this.pgShowCode.label.set('Show code');

    this.pgCopy.size.set('medium');
    this.pgCopy.style.set('primary');
    this.pgCopy.state.set('default');
    this.pgCopy.showTrailingIcon.set(true);
    this.pgCopy.showLabel.set(true);
    this.pgCopy.label.set('Copy');

    this.pgEdit.size.set('medium');
    this.pgEdit.style.set('primary');
    this.pgEdit.state.set('default');
    this.pgEdit.showTrailingIcon.set(true);
    this.pgEdit.showLabel.set(true);
    this.pgEdit.label.set('Edit');

    this.pgTabType.set('underline');
    this.pgTabOrientation.set('horizontal');
    this.pgTabItems.forEach((tab, i) => {
      tab.show.set(i < 2);
      tab.state.set('rest');
      tab.focus.set(false);
      tab.showLabel.set(true);
      tab.showTrailingIcon.set(false);
      tab.label.set(this.defaultTabLabels[i]);
    });
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
      { rootMargin: '-200px 0px -60% 0px', threshold: 0 },
    );

    const sections = this.el.nativeElement.querySelectorAll('.comp-section');
    sections.forEach((s: Element) => this.observer!.observe(s));
  }
}
