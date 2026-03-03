/**
 * Configuração do Sentry para error tracking no frontend
 * 
 * Para usar:
 * 1. npm install @sentry/react
 * 2. Configure SENTRY_DSN no .env
 * 3. Importe e inicialize no main.tsx
 */

import * as Sentry from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;
  const release = import.meta.env.VITE_APP_VERSION || "1.0.0";

  if (!dsn) {
    console.warn("Sentry DSN não configurado. Error tracking desabilitado.");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Filtros
    beforeSend(event, hint) {
      // Não enviar erros de desenvolvimento
      if (environment === "development") {
        return null;
      }

      // Filtrar erros conhecidos
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignorar erros de rede comuns
        if (
          error.message.includes("NetworkError") ||
          error.message.includes("Failed to fetch")
        ) {
          return null;
        }
      }

      return event;
    },
    // Tags padrão
    initialScope: {
      tags: {
        component: "frontend",
      },
    },
  });
};

