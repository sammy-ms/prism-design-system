import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// ---------------------------------------------------------------------------
// Genkit AI flow endpoints (lazy-loaded to avoid requiring API key at build)
// ---------------------------------------------------------------------------

let genkitInitialized = false;

async function initGenkitRoutes() {
  if (genkitInitialized) return;
  genkitInitialized = true;

  try {
    const { expressHandler } = await import('@genkit-ai/express');
    const { designAssistantFlow, componentSuggestionFlow } = await import('./genkit/flows');

    app.post('/api/design-assistant', expressHandler(designAssistantFlow));
    app.post('/api/component-suggestion', expressHandler(componentSuggestionFlow));
    console.log(
      'Genkit AI flows registered at /api/design-assistant and /api/component-suggestion',
    );
  } catch (e) {
    console.warn(
      'Genkit flows not loaded (ANTHROPIC_API_KEY may be missing):',
      (e as Error).message,
    );
  }
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  initGenkitRoutes().then(() => {
    app.listen(port, (error) => {
      if (error) {
        throw error;
      }
      console.log(`Node Express server listening on http://localhost:${port}`);
    });
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
