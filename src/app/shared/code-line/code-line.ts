import { Component, input, inject, computed } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IndentLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'app-code-line',
  standalone: true,
  templateUrl: './code-line.html',
  styleUrl: './code-line.scss',
})
export class CodeLineComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly highlight = input(false);
  readonly showLineNumber = input(true);
  readonly lineNumber = input(1);
  readonly code = input('');
  readonly indentLevel = input<IndentLevel>(0);

  readonly indentPx = computed(() => this.indentLevel() * 16);

  readonly colorizedHtml = computed(() => this.colorize(this.code()));

  private colorize(text: string): SafeHtml {
    let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Comments (gray italic)
    if (/^\s*\/\//.test(s)) {
      s = s.replace(/^(\s*)(\/\/.*)$/, '$1<span style="color:#6a6b6d;font-style:italic">$2</span>');
      return this.sanitizer.bypassSecurityTrustHtml(s || '&nbsp;');
    }

    // HTML comments
    if (/^\s*&lt;!--/.test(s)) {
      s = `<span style="color:#6a6b6d;font-style:italic">${s}</span>`;
      return this.sanitizer.bypassSecurityTrustHtml(s || '&nbsp;');
    }

    // Strings: 'text' and `text` (green)
    s = s.replace(
      /('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
      '<span style="color:#548519">$1</span>',
    );

    // Keywords (purple)
    s = s.replace(
      /\b(import|from|export|default|class|extends|const|let|var|return|this|new|if|else|function|async|await)\b/g,
      '<span style="color:#7b51c8">$1</span>',
    );

    // Attributes (red)
    s = s.replace(
      /\b(className|onClick|onChange|disabled|type|href|src|alt)\b/g,
      '<span style="color:#da3e37">$1</span>',
    );

    // Function calls (blue)
    s = s.replace(/\b([a-zA-Z_]\w*)\(/g, '<span style="color:#006fd6">$1</span>(');

    return this.sanitizer.bypassSecurityTrustHtml(s || '&nbsp;');
  }
}
