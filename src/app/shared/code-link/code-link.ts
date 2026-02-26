import { Component, input, output, computed } from '@angular/core';

export type CodeLinkSize = 'small' | 'medium' | 'large';
export type CodeLinkStyle = 'primary' | 'subtle' | 'warning' | 'destructive';
export type CodeLinkState = 'default' | 'hover' | 'pressed' | 'disabled';
export type CodeLinkIcon = 'chevron' | 'copy' | 'edit' | 'none';

@Component({
  selector: 'app-code-link',
  standalone: true,
  templateUrl: './code-link.html',
  styleUrl: './code-link.scss',
})
export class CodeLink {
  readonly size = input<CodeLinkSize>('medium');
  readonly variant = input<CodeLinkStyle>('primary');
  readonly state = input<CodeLinkState>('default');
  readonly showTrailingIcon = input(true);
  readonly showLabel = input(true);
  readonly label = input('');
  readonly icon = input<CodeLinkIcon>('chevron');
  readonly iconRotated = input(false);

  readonly pressed = output<void>();

  readonly hostClasses = computed(() => {
    const classes = ['cl', `cl--${this.size()}`, `cl--${this.variant()}`];
    const s = this.state();
    if (s !== 'default') classes.push(`cl--${s}`);
    return classes.join(' ');
  });

  readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'small':
        return 12;
      case 'large':
        return 20;
      default:
        return 16;
    }
  });

  onClick(): void {
    if (this.state() === 'disabled') return;
    this.pressed.emit();
  }
}
