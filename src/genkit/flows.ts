import { genkit, z } from 'genkit';
import { anthropic } from '@genkit-ai/anthropic';

/**
 * Initialize Genkit with the Anthropic plugin.
 *
 * The ANTHROPIC_API_KEY environment variable must be set for the
 * plugin to authenticate with the Anthropic API.
 */
export const ai = genkit({
  plugins: [anthropic()],
});

// ---------------------------------------------------------------------------
// Flow: designAssistant
// ---------------------------------------------------------------------------

const DesignAssistantInputSchema = z.object({
  prompt: z.string().describe('The design question or prompt from the user'),
});

const DesignAssistantOutputSchema = z.object({
  text: z.string().describe('AI-generated design guidance'),
});

const DesignAssistantStreamSchema = z.object({
  chunk: z.string().describe('Incremental text chunk for streaming'),
});

export const designAssistantFlow = ai.defineFlow(
  {
    name: 'designAssistant',
    inputSchema: DesignAssistantInputSchema,
    outputSchema: DesignAssistantOutputSchema,
    streamSchema: DesignAssistantStreamSchema,
  },
  async (input, streamingCallback) => {
    const { response, stream } = ai.generateStream({
      model: anthropic.model('claude-sonnet-4-5'),
      system:
        'You are a senior design-system architect. Provide actionable, ' +
        'concise guidance about UI/UX patterns, component APIs, accessibility, ' +
        'and visual design tokens. Format your answers in Markdown.',
      prompt: input.prompt,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        streamingCallback({ chunk: text });
      }
    }

    const result = await response;
    return { text: result.text };
  },
);

// ---------------------------------------------------------------------------
// Flow: componentSuggestion
// ---------------------------------------------------------------------------

const ComponentSuggestionInputSchema = z.object({
  requirements: z.string().describe('Description of the component requirements'),
});

const ComponentSuggestionOutputSchema = z.object({
  componentName: z.string().describe('Suggested component name'),
  description: z.string().describe('What the component does'),
  api: z.string().describe('Suggested public API (inputs, outputs, slots)'),
  implementation: z.string().describe('Implementation sketch in Angular 21 style'),
  accessibilityNotes: z.string().describe('Key a11y considerations'),
});

const ComponentSuggestionStreamSchema = z.object({
  chunk: z.string().describe('Incremental text chunk for streaming'),
});

export const componentSuggestionFlow = ai.defineFlow(
  {
    name: 'componentSuggestion',
    inputSchema: ComponentSuggestionInputSchema,
    outputSchema: ComponentSuggestionOutputSchema,
    streamSchema: ComponentSuggestionStreamSchema,
  },
  async (input, streamingCallback) => {
    const { response, stream } = ai.generateStream({
      model: anthropic.model('claude-sonnet-4-5'),
      system:
        'You are an Angular 21 component architect specialising in design systems. ' +
        'Given component requirements, return a JSON object with the keys: ' +
        'componentName, description, api, implementation, accessibilityNotes. ' +
        'The "implementation" field should contain a full standalone Angular 21 ' +
        'component using signals, inject(), and modern control flow syntax. ' +
        'Return ONLY valid JSON — no markdown fences, no extra text.',
      prompt: input.requirements,
      output: { schema: ComponentSuggestionOutputSchema },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        streamingCallback({ chunk: text });
      }
    }

    const result = await response;
    return result.output!;
  },
);
