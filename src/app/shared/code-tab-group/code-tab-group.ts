import { Component, input, output, computed } from '@angular/core';

export type TabGroupType = 'underline' | 'white-pill' | 'grey-pill';
export type TabOrientation = 'horizontal' | 'vertical';
export type TabState =
  | 'rest'
  | 'hover'
  | 'surface-hover'
  | 'background-hover'
  | 'selected'
  | 'disabled'
  | 'skeleton';

export interface TabItemConfig {
  show: boolean;
  label: string;
  showLabel: boolean;
  showTrailingIcon: boolean;
  state: TabState;
  focus: boolean;
  type?: TabGroupType;
}

@Component({
  selector: 'app-code-tab-group',
  standalone: true,
  templateUrl: './code-tab-group.html',
  styleUrl: './code-tab-group.scss',
})
export class CodeTabGroup {
  readonly type = input<TabGroupType>('underline');
  readonly orientation = input<TabOrientation>('horizontal');
  readonly tabs = input<TabItemConfig[]>([]);
  readonly activeIndex = input(0);

  readonly tabSelected = output<number>();

  readonly visibleTabEntries = computed(() =>
    this.tabs()
      .map((tab, index) => ({ tab, index }))
      .filter((entry) => entry.tab.show),
  );

  getTabClasses(tab: TabItemConfig, index: number): string {
    const t = tab.type ?? this.type();
    const classes = ['ctg__tab', `ctg__tab--${t}`];

    if (tab.state === 'selected' || index === this.activeIndex()) {
      classes.push('ctg__tab--selected');
    }
    if (
      tab.state === 'hover' ||
      tab.state === 'surface-hover' ||
      tab.state === 'background-hover'
    ) {
      classes.push('ctg__tab--hover');
    }
    if (tab.state === 'disabled') classes.push('ctg__tab--disabled');
    if (tab.state === 'skeleton') classes.push('ctg__tab--skeleton');
    if (tab.focus) classes.push('ctg__tab--focus');

    return classes.join(' ');
  }

  onSelect(index: number, tab: TabItemConfig): void {
    if (tab.state === 'disabled') return;
    this.tabSelected.emit(index);
  }
}
