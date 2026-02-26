import {
  Component,
  input,
  signal,
  inject,
  computed,
  linkedSignal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type CodeBlockType = 'line' | 'doc-expanded' | 'doc-collapsed';

export interface CodeTab {
  label: string;
  code: string;
}

export interface CodeLine {
  num: number;
  html: SafeHtml;
  hl: boolean;
}

@Component({
  selector: 'app-code-block',
  standalone: true,
  templateUrl: './code-block.html',
  styleUrl: './code-block.scss',
})
export class CodeBlock {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);

  // ── Inputs ──
  readonly type = input<CodeBlockType>('line');
  readonly code = input('');
  readonly showLineNumbers = input(true);
  readonly highlightLines = input<number[]>([]);
  readonly codeTabs = input<CodeTab[]>([]);

  // ── Internal state ──
  readonly isCopied = signal(false);
  readonly isExpanded = linkedSignal(() => this.type() !== 'doc-collapsed');
  readonly activeTabIndex = signal(0);

  /** The code string currently being displayed — either from `code` or the active tab. */
  readonly displayCode = computed(() => {
    const tabs = this.codeTabs();
    if (tabs.length) {
      return tabs[this.activeTabIndex()]?.code ?? '';
    }
    return this.code();
  });

  /** Parsed + colorized lines for rendering. */
  readonly lines = computed<CodeLine[]>(() => {
    const raw = this.displayCode();
    const hlSet = new Set(this.highlightLines());
    const parts = raw.split('\n');
    if (parts.length > 1 && parts[parts.length - 1].trim() === '') {
      parts.pop();
    }
    return parts.map((text, i) => ({
      num: i + 1,
      html: this.colorize(text),
      hl: hlSet.has(i + 1),
    }));
  });

  toggleCode(): void {
    this.isExpanded.update((v) => !v);
  }

  selectTab(index: number): void {
    this.activeTabIndex.set(index);
  }

  copyCode(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard?.writeText(this.displayCode()).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 1500);
    });
  }

  private colorize(text: string): SafeHtml {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 1. Comments (gray italic)
    if (/^\s*\/\//.test(s)) {
      s = s.replace(/^(\s*)(\/\/.*)$/, '$1<span style="color:#6a6b6d;font-style:italic">$2</span>');
      return this.sanitizer.bypassSecurityTrustHtml(s || '&nbsp;');
    }

    // 2. Strings: 'text' and `text` (green)
    s = s.replace(
      /('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color:#548519">$1</span>',
    );

    // 3. Keywords (purple)
    s = s.replace(
      /\b(import|from|export|default|class|extends|const|let|var|return|this|new|if|else|function|async|await)\b/g,
      '<span style="color:#7b51c8">$1</span>',
    );

    // 4. Attributes (red)
    s = s.replace(
      /\b(className|onClick|onChange|disabled|type|href|src|alt)\b/g,
      '<span style="color:#da3e37">$1</span>',
    );

    // 5. Function calls — word( (blue)
    s = s.replace(/\b([a-zA-Z_]\w*)\(/g, '<span style="color:#006fd6">$1</span>(');

    return this.sanitizer.bypassSecurityTrustHtml(s || '&nbsp;');
  }
}
