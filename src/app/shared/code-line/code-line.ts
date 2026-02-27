import {
  Component,
  input,
  inject,
  computed,
  signal,
  output,
  ElementRef,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IndentLevel = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'app-code-line',
  standalone: true,
  templateUrl: './code-line.html',
  styleUrl: './code-line.scss',
  host: { '[class.cline-host--editable]': 'editable()' },
})
export class CodeLineComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly highlight = input(false);
  readonly showLineNumber = input(true);
  readonly lineNumber = input(1);
  readonly code = input('');
  readonly indentLevel = input<IndentLevel>(1);
  readonly editable = input(false);

  readonly editing = signal(false);
  readonly codeChange = output<string>();

  readonly editInput = viewChild<ElementRef<HTMLInputElement>>('editInput');

  enterEdit(): void {
    if (!this.editable()) return;
    this.editing.set(true);
    // Focus after Angular renders the input
    queueMicrotask(() => {
      const el = this.editInput()?.nativeElement;
      if (el) {
        el.focus();
        el.select();
      }
    });
  }

  confirmEdit(value: string): void {
    this.editing.set(false);
    this.codeChange.emit(value);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  onEditKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.confirmEdit((event.target as HTMLInputElement).value);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  readonly indentPx = computed(() => (this.indentLevel() - 1) * 16);

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
