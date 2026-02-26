import { Component, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavChild {
  label: string;
  route: string;
}

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number | null;
  expandable?: boolean;
  children?: NavChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly collapsed = input(false);
  readonly collapseToggle = output<void>();

  readonly expandedItems = signal<Set<string>>(new Set(['Icons', 'Components']));

  readonly navItems: NavItem[] = [
    { label: 'Get Started', route: '/get-started', icon: 'book' },
    { label: 'Changelog', route: '/changelog', icon: 'clock' },
    { label: 'Typography', route: '/typography', icon: 'type' },
    { label: 'Spacing', route: '/spacing', icon: 'grid' },
    { label: 'Colors', route: '/colors', icon: 'palette' },
    {
      label: 'Icons',
      route: '/icons',
      icon: 'icons',
      expandable: true,
      children: [
        { label: 'All Icons', route: '/icons/all' },
        { label: 'Stroke Icons', route: '/icons/stroke' },
        { label: 'Filled Icons', route: '/icons/filled' },
        { label: 'Flags', route: '/icons/flags' },
      ],
    },
    {
      label: 'Components',
      route: '/components',
      icon: 'components',
      badge: 1,
      expandable: true,
      children: [{ label: 'Code', route: '/components/code' }],
    },
  ];

  toggleCollapse(): void {
    this.collapseToggle.emit();
  }

  toggleExpand(item: NavItem, event: Event): void {
    if (!item.expandable || !item.children) return;
    event.preventDefault();
    event.stopPropagation();
    const expanded = new Set(this.expandedItems());
    if (expanded.has(item.label)) {
      expanded.delete(item.label);
    } else {
      expanded.add(item.label);
    }
    this.expandedItems.set(expanded);
  }

  isExpanded(item: NavItem): boolean {
    return this.expandedItems().has(item.label);
  }
}
