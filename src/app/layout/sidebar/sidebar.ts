import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number | null;
  expandable?: boolean;
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

  readonly navItems: NavItem[] = [
    { label: 'Get Started', route: '/get-started', icon: 'book' },
    { label: 'Changelog', route: '/changelog', icon: 'clock' },
    { label: 'Typography', route: '/typography', icon: 'type' },
    { label: 'Spacing', route: '/spacing', icon: 'grid' },
    { label: 'Colors', route: '/colors', icon: 'palette' },
    { label: 'Icons', route: '/icons', icon: 'icons', badge: 3, expandable: true },
    { label: 'Components', route: '/components', icon: 'components', badge: 40, expandable: true },
  ];

  toggleCollapse(): void {
    this.collapseToggle.emit();
  }
}
