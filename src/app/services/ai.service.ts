import { Injectable, inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { runFlow, streamFlow } from 'genkit/beta/client';

/** Shape returned by the designAssistant flow. */
interface DesignAssistantResponse {
  text: string;
}

/** Shape returned by the componentSuggestion flow. */
interface ComponentSuggestionResponse {
  componentName: string;
  description: string;
  api: string;
  implementation: string;
  accessibilityNotes: string;
}

/** Streaming chunk emitted by both flows. */
interface StreamChunk {
  chunk: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly document = inject(DOCUMENT);

  // ---- state signals ----
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly streamedText = signal('');

  /** Derived flag: true while a request is in flight. */
  readonly busy = computed(() => this.loading());

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  /**
   * Resolves the base URL for API calls.
   * During SSR `window.location` is unavailable, so we fall back to an
   * empty string (relative URLs work on the same origin).
   */
  private get baseUrl(): string {
    const loc = this.document.defaultView?.location;
    return loc ? `${loc.protocol}//${loc.host}` : '';
  }

  // -----------------------------------------------------------------------
  // Design Assistant
  // -----------------------------------------------------------------------

  /** Fire-and-forget call that returns the full response. */
  async askDesignAssistant(prompt: string): Promise<DesignAssistantResponse> {
    this.loading.set(true);
    this.error.set(null);
    this.streamedText.set('');

    try {
      const result = await runFlow<DesignAssistantResponse>({
        url: `${this.baseUrl}/api/design-assistant`,
        input: { prompt },
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error.set(message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /** Streaming variant that progressively updates `streamedText`. */
  async askDesignAssistantStream(prompt: string): Promise<DesignAssistantResponse> {
    this.loading.set(true);
    this.error.set(null);
    this.streamedText.set('');

    try {
      const { output, stream } = streamFlow<DesignAssistantResponse, StreamChunk>({
        url: `${this.baseUrl}/api/design-assistant`,
        input: { prompt },
      });

      for await (const chunk of stream) {
        this.streamedText.update((prev) => prev + chunk.chunk);
      }

      return await output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error.set(message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  // -----------------------------------------------------------------------
  // Component Suggestion
  // -----------------------------------------------------------------------

  /** Fire-and-forget call that returns the full response. */
  async suggestComponent(requirements: string): Promise<ComponentSuggestionResponse> {
    this.loading.set(true);
    this.error.set(null);
    this.streamedText.set('');

    try {
      const result = await runFlow<ComponentSuggestionResponse>({
        url: `${this.baseUrl}/api/component-suggestion`,
        input: { requirements },
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error.set(message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /** Streaming variant that progressively updates `streamedText`. */
  async suggestComponentStream(requirements: string): Promise<ComponentSuggestionResponse> {
    this.loading.set(true);
    this.error.set(null);
    this.streamedText.set('');

    try {
      const { output, stream } = streamFlow<ComponentSuggestionResponse, StreamChunk>({
        url: `${this.baseUrl}/api/component-suggestion`,
        input: { requirements },
      });

      for await (const chunk of stream) {
        this.streamedText.update((prev) => prev + chunk.chunk);
      }

      return await output;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.error.set(message);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }
}
