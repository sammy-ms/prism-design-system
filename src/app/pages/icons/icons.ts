import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ICONS, IconEntry } from './icon-data';

interface SanitisedIcon extends IconEntry {
  trustedSvg: SafeHtml;
}

type TabId = 'icons' | 'properties' | 'playground';

@Component({
  selector: 'app-icons',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './icons.html',
  styleUrl: './icons.scss',
})
export class IconsPage {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sanitizer = inject(DomSanitizer);

  // ── Tabs ──
  readonly activeTab = signal<TabId>('icons');
  readonly tabs: { id: TabId; label: string }[] = [
    { id: 'icons', label: 'Icons' },
    { id: 'properties', label: 'Properties' },
    { id: 'playground', label: 'Playground' },
  ];

  // ── All icons (sanitised) ──
  readonly icons = signal<SanitisedIcon[]>(
    ICONS.filter((i) => i.iconType !== 'placeholder').map((icon) => ({
      ...icon,
      trustedSvg: this.sanitizer.bypassSecurityTrustHtml(icon.svgContent),
    })),
  );

  // ── Icons Tab ──
  readonly searchQuery = signal('');
  readonly hoveredIcon = signal<string | null>(null);
  readonly copiedIcon = signal<string | null>(null);

  readonly filteredIcons = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.icons();
    return this.icons().filter(
      (i) => i.name.toLowerCase().includes(q) || i.displayName.toLowerCase().includes(q),
    );
  });

  readonly iconCount = computed(() => this.filteredIcons().length);
  readonly totalCount = computed(() => this.icons().length);

  // ── Properties Tab ──
  readonly propertiesData = [
    {
      property: 'name',
      type: 'string',
      default: '—',
      description:
        'The unique identifier for the icon (e.g. "arrow-back-up", "settings"). Used to reference the icon throughout your application.',
    },
    {
      property: 'size',
      type: 'number',
      default: '24',
      description:
        'Width and height of the icon in pixels. Supported sizes: 16, 20, 24, 32, 40, 48, 64.',
    },
    {
      property: 'color',
      type: 'string',
      default: 'currentColor',
      description:
        'The color applied to the icon stroke or fill. Accepts any valid CSS color value. Inherits from the parent element by default.',
    },
  ];

  // ── Playground Tab ──
  readonly playgroundIcon = signal<SanitisedIcon | null>(this.icons()[0] ?? null);
  readonly playgroundColor = signal('#1B1F22');
  readonly playgroundSize = signal(24);
  readonly playgroundStrokeWidth = signal(2);
  readonly playgroundSearchQuery = signal('');
  readonly playgroundCopied = signal<string | null>(null);

  readonly sizeOptions = [16, 20, 24, 32, 40, 48, 64];

  readonly playgroundFilteredIcons = computed(() => {
    const q = this.playgroundSearchQuery().toLowerCase().trim();
    if (!q) return this.icons();
    return this.icons().filter(
      (i) => i.name.toLowerCase().includes(q) || i.displayName.toLowerCase().includes(q),
    );
  });

  // ── Tab Actions ──
  setTab(tab: TabId): void {
    this.activeTab.set(tab);
  }

  // ── Icons Tab Actions ──
  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onIconHover(name: string | null): void {
    this.hoveredIcon.set(name);
  }

  copySvg(icon: SanitisedIcon, event: Event): void {
    event.stopPropagation();
    if (!isPlatformBrowser(this.platformId)) return;
    const svg = this.buildSvgString(icon);
    this.copyToClipboard(svg).then(() => {
      this.copiedIcon.set(`svg-${icon.name}`);
      setTimeout(() => this.copiedIcon.set(null), 1500);
    });
  }

  copyAngular(icon: SanitisedIcon, event: Event): void {
    event.stopPropagation();
    if (!isPlatformBrowser(this.platformId)) return;
    const snippet = this.buildAngularSnippet(icon);
    this.copyToClipboard(snippet).then(() => {
      this.copiedIcon.set(`ng-${icon.name}`);
      setTimeout(() => this.copiedIcon.set(null), 1500);
    });
  }

  // ── Playground Actions ──
  selectPlaygroundIcon(icon: SanitisedIcon): void {
    this.playgroundIcon.set(icon);
  }

  onPlaygroundSearch(event: Event): void {
    this.playgroundSearchQuery.set((event.target as HTMLInputElement).value);
  }

  copyPlaygroundSvg(): void {
    const icon = this.playgroundIcon();
    if (!icon || !isPlatformBrowser(this.platformId)) return;
    const svg = this.buildSvgString(
      icon,
      this.playgroundSize(),
      this.playgroundColor(),
      this.playgroundStrokeWidth(),
    );
    this.copyToClipboard(svg).then(() => {
      this.playgroundCopied.set('svg');
      setTimeout(() => this.playgroundCopied.set(null), 1500);
    });
  }

  copyPlaygroundAngular(): void {
    const icon = this.playgroundIcon();
    if (!icon || !isPlatformBrowser(this.platformId)) return;
    const snippet = this.buildAngularSnippet(
      icon,
      this.playgroundSize(),
      this.playgroundColor(),
      this.playgroundStrokeWidth(),
    );
    this.copyToClipboard(snippet).then(() => {
      this.playgroundCopied.set('angular');
      setTimeout(() => this.playgroundCopied.set(null), 1500);
    });
  }

  // ── Clipboard with fallback ──
  private copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    }
    return this.fallbackCopy(text);
  }

  private fallbackCopy(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch {
        reject();
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  getPlaygroundTrustedSvg(): SafeHtml {
    const icon = this.playgroundIcon();
    if (!icon) return '';
    return icon.trustedSvg;
  }

  // ── SVG Builders ──
  private buildSvgString(
    icon: IconEntry,
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
  ): string {
    if (icon.iconType === 'filled') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="${color}">${icon.svgContent}</svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${icon.svgContent}</svg>`;
  }

  private buildAngularSnippet(
    icon: IconEntry,
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
  ): string {
    if (icon.iconType === 'filled') {
      return `<svg width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="${color}">\n  ${icon.svgContent}\n</svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="${icon.viewBox}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">\n  ${icon.svgContent}\n</svg>`;
  }
}
