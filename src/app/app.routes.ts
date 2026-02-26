import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'colors', pathMatch: 'full' },
  {
    path: 'get-started',
    loadComponent: () => import('./pages/placeholder/placeholder').then((m) => m.Placeholder),
    data: { title: 'Get Started' },
  },
  {
    path: 'changelog',
    loadComponent: () => import('./pages/placeholder/placeholder').then((m) => m.Placeholder),
    data: { title: 'Changelog' },
  },
  {
    path: 'typography',
    loadComponent: () => import('./pages/typography/typography').then((m) => m.TypographyPage),
    data: { title: 'Typography' },
  },
  {
    path: 'spacing',
    loadComponent: () => import('./pages/spacing/spacing').then((m) => m.SpacingPage),
    data: { title: 'Spacing' },
  },
  {
    path: 'colors',
    loadComponent: () => import('./pages/colors/colors').then((m) => m.ColorsPage),
    data: { title: 'Colors' },
  },
  {
    path: 'icons',
    loadComponent: () => import('./pages/icons/icons').then((m) => m.IconsPage),
    data: { title: 'Icons' },
  },
  {
    path: 'components',
    loadComponent: () => import('./pages/placeholder/placeholder').then((m) => m.Placeholder),
    data: { title: 'Components' },
  },
];
