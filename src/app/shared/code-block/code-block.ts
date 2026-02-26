import { Component, input, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CodeLink,
  CodeLinkSize,
  CodeLinkStyle,
  CodeLinkState,
  CodeLinkIcon,
} from '../code-link/code-link';
import { CodeLineComponent, IndentLevel } from '../code-line/code-line';
import {
  CodeTabGroup,
  TabGroupType,
  TabOrientation,
  TabItemConfig,
} from '../code-tab-group/code-tab-group';

export type CodeBlockType = 'line' | 'doc-expanded' | 'doc-collapsed';

export interface CodeTab {
  label: string;
  code: string;
}

export interface CodeLinkConfig {
  size: CodeLinkSize;
  style: CodeLinkStyle;
  state: CodeLinkState;
  showTrailingIcon: boolean;
  showLabel: boolean;
  label: string;
  icon: CodeLinkIcon;
}

export interface CodeLineConfig {
  highlight: boolean;
  showLineNumber: boolean;
  lineNumber: number;
  code: string;
  indentLevel: IndentLevel;
}

export interface TabGroupConfig {
  type: TabGroupType;
  orientation: TabOrientation;
  tabs: TabItemConfig[];
}

@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [CodeLink, CodeLineComponent, CodeTabGroup],
  templateUrl: './code-block.html',
  styleUrl: './code-block.scss',
})
export class CodeBlock {
  private readonly platformId = inject(PLATFORM_ID);

  // ── Core inputs ──
  readonly type = input<CodeBlockType>('line');
  readonly code = input('');
  readonly showLineNumbers = input(true);
  readonly highlightLines = input<number[]>([]);
  readonly indentLevel = input<IndentLevel>(0);
  readonly codeTabs = input<CodeTab[]>([]);

  // ── Link config inputs ──
  readonly showCodeLink = input<Partial<CodeLinkConfig>>({});
  readonly copyLink = input<Partial<CodeLinkConfig>>({});
  readonly editLink = input<Partial<CodeLinkConfig>>({});

  // ── Tab group config input ──
  readonly tabGroupConfig = input<Partial<TabGroupConfig>>({});

  // ── Internal state ──
  readonly isCopied = signal(false);
  readonly isExpanded = signal(true);
  readonly activeTabIndex = signal(0);

  // ── Resolved link configs ──
  readonly resolvedShowCodeLink = computed<CodeLinkConfig>(() => ({
    size: 'medium',
    style: 'subtle',
    state: 'default',
    showTrailingIcon: true,
    showLabel: true,
    label: 'Show code',
    icon: 'chevron' as CodeLinkIcon,
    ...this.showCodeLink(),
  }));

  readonly resolvedCopyLink = computed<CodeLinkConfig>(() => ({
    size: 'medium',
    style: 'primary',
    state: 'default',
    showTrailingIcon: true,
    showLabel: true,
    label: this.isCopied() ? 'Copied!' : 'Copy',
    icon: 'copy' as CodeLinkIcon,
    ...this.copyLink(),
  }));

  readonly resolvedEditLink = computed<CodeLinkConfig>(() => ({
    size: 'medium',
    style: 'primary',
    state: 'default',
    showTrailingIcon: true,
    showLabel: true,
    label: 'Edit',
    icon: 'edit' as CodeLinkIcon,
    ...this.editLink(),
  }));

  // ── Resolved tab group config ──
  readonly resolvedTabGroup = computed<TabGroupConfig>(() => {
    const cfg = this.tabGroupConfig();
    const tabs = this.codeTabs();
    const defaultTabs: TabItemConfig[] = tabs.map((t, i) => ({
      show: true,
      label: t.label,
      showLabel: true,
      showTrailingIcon: false,
      state: 'rest' as const,
      focus: false,
    }));
    return {
      type: cfg.type ?? 'underline',
      orientation: cfg.orientation ?? 'horizontal',
      tabs: cfg.tabs ?? defaultTabs,
    };
  });

  // ── Display code: from active tab or raw code input ──
  readonly displayCode = computed(() => {
    const tabs = this.codeTabs();
    if (tabs.length) {
      return tabs[this.activeTabIndex()]?.code ?? '';
    }
    return this.code();
  });

  // ── Parsed lines for rendering ──
  readonly lines = computed<CodeLineConfig[]>(() => {
    const raw = this.displayCode();
    const hlSet = new Set(this.highlightLines());
    const indent = this.indentLevel();
    const parts = raw.split('\n');
    if (parts.length > 1 && parts[parts.length - 1].trim() === '') {
      parts.pop();
    }
    return parts.map((text, i) => ({
      highlight: hlSet.has(i + 1),
      showLineNumber: this.showLineNumbers(),
      lineNumber: i + 1,
      code: text,
      indentLevel: indent,
    }));
  });

  toggleCode(): void {
    // doc-collapsed cannot expand
    if (this.type() === 'doc-collapsed') return;
    this.isExpanded.update((v) => !v);
  }

  onTabSelected(index: number): void {
    this.activeTabIndex.set(index);
  }

  copyCode(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard?.writeText(this.displayCode()).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 1500);
    });
  }
}
