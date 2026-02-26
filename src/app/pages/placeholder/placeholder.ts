import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="ms-placeholder">
      <h1 class="ms-placeholder__title">{{ title }}</h1>
      <p class="ms-placeholder__text">This page is coming soon.</p>
    </div>
  `,
  styles: `
    .ms-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: 48px;
      text-align: center;
    }
    .ms-placeholder__title {
      font-size: 28px;
      font-weight: 700;
      color: var(--semantics-text-subtle-primary-default, #1b1f22);
      margin-bottom: 12px;
    }
    .ms-placeholder__text {
      font-size: 15px;
      color: var(--semantics-text-subtle-primary-hover, #6a6b6d);
    }
  `,
})
export class Placeholder {
  private readonly route = inject(ActivatedRoute);
  readonly title = (this.route.snapshot.data as { title: string }).title ?? '';
}
