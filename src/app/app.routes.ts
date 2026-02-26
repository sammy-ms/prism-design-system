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
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      {
        path: 'all',
        loadComponent: () => import('./pages/icons/icons').then((m) => m.IconsPage),
        data: { title: 'Icons', category: 'all' },
      },
      {
        path: 'stroke',
        loadComponent: () => import('./pages/icons/icons').then((m) => m.IconsPage),
        data: { title: 'Stroke Icons', category: 'stroke' },
      },
      {
        path: 'filled',
        loadComponent: () => import('./pages/icons/icons').then((m) => m.IconsPage),
        data: { title: 'Filled Icons', category: 'filled' },
      },
      {
        path: 'flags',
        loadComponent: () => import('./pages/icons/icons').then((m) => m.IconsPage),
        data: { title: 'Flags', category: 'flag' },
      },
    ],
  },
  {
    path: 'components',
    children: [
      { path: '', redirectTo: 'code', pathMatch: 'full' },
      {
        path: 'code',
        loadComponent: () => import('./pages/components/code/code').then((m) => m.CodePage),
        data: { title: 'Code' },
      },
    ],
  },
];
