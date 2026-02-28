import type { Locale } from '@/types';

type Dictionary = Record<string, string>;

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    // Landing
    'landing.title': 'BMAD Method',
    'landing.subtitle': 'AI-driven product development — Analysis & Planning',
    'landing.creatingSession': 'Creating session...',

    // Workflow cards — Analyst (Mary)
    'workflow.analyst.title': 'Mary — Business Analyst',
    'workflow.analyst.description':
      'Brainstorm ideas, conduct research, and create comprehensive product briefs through guided discovery.',
    'workflow.analyst.badge1': 'Brainstorm',
    'workflow.analyst.badge2': 'Research',
    'workflow.analyst.badge3': 'Brief',
    'workflow.analyst.badge4': 'Analysis',

    // Workflow cards — PM (John)
    'workflow.pm.title': 'John — Product Manager',
    'workflow.pm.description':
      'Create detailed Product Requirements Documents (PRD) through structured workflow facilitation.',
    'workflow.pm.badge1': 'PRD',
    'workflow.pm.badge2': 'Epics',
    'workflow.pm.badge3': 'Validation',
    'workflow.pm.badge4': 'Planning',

    // Chat
    'chat.stepOf': 'Step {current} of {total}',
    'chat.newSession': 'New Session',
    'chat.emptyState':
      'Send a message to start working with {agent}.',
    'chat.thinking': '{agent} is thinking...',
    'chat.placeholder': 'Type a message... (Shift+Enter for new line)',
    'chat.send': 'Send',
    'chat.stop': 'Stop',

    // Sidebar
    'sidebar.title': 'Workflow Progress',
    'sidebar.waitingWorkflow': 'Waiting for {agent} to start a workflow...',

    // Download
    'download.title': 'Generated Files',
    'download.zip': 'Download ZIP',
    'download.download': 'Download',

    // File preview
    'preview.raw': 'Raw',
    'preview.preview': 'Preview',
    'preview.download': 'Download',

    // Errors & fallbacks
    'error.sessionCreate': 'Failed to create session',
    'error.sessionCreateRetry':
      'Failed to create session. Please try again.',
    'error.noSession': 'No session found.',
    'error.startNew': 'Start a new session',
    'loading': 'Loading...',
  },

  fr: {
    // Landing
    'landing.title': 'BMAD Method',
    'landing.subtitle':
      'D\u00e9veloppement produit assist\u00e9 par IA \u2014 Analyse & Planification',
    'landing.creatingSession': 'Cr\u00e9ation de la session...',

    // Workflow cards — Analyst (Mary)
    'workflow.analyst.title': 'Mary \u2014 Business Analyst',
    'workflow.analyst.description':
      'Brainstormez des id\u00e9es, menez des recherches et cr\u00e9ez des briefs produit complets via une d\u00e9couverte guid\u00e9e.',
    'workflow.analyst.badge1': 'Brainstorm',
    'workflow.analyst.badge2': 'Recherche',
    'workflow.analyst.badge3': 'Brief',
    'workflow.analyst.badge4': 'Analyse',

    // Workflow cards — PM (John)
    'workflow.pm.title': 'John \u2014 Product Manager',
    'workflow.pm.description':
      'Cr\u00e9ez des PRD (Product Requirements Documents) d\u00e9taill\u00e9s via un workflow structur\u00e9.',
    'workflow.pm.badge1': 'PRD',
    'workflow.pm.badge2': 'Epics',
    'workflow.pm.badge3': 'Validation',
    'workflow.pm.badge4': 'Planification',

    // Chat
    'chat.stepOf': '\u00c9tape {current} sur {total}',
    'chat.newSession': 'Nouvelle session',
    'chat.emptyState':
      'Envoyez un message pour d\u00e9marrer avec {agent}.',
    'chat.thinking': '{agent} r\u00e9fl\u00e9chit...',
    'chat.placeholder':
      'Tapez un message... (Shift+Entr\u00e9e pour un retour \u00e0 la ligne)',
    'chat.send': 'Envoyer',
    'chat.stop': 'Arr\u00eater',

    // Sidebar
    'sidebar.title': 'Progression du workflow',
    'sidebar.waitingWorkflow': 'En attente que {agent} d\u00e9marre un workflow...',

    // Download
    'download.title': 'Fichiers g\u00e9n\u00e9r\u00e9s',
    'download.zip': 'T\u00e9l\u00e9charger ZIP',
    'download.download': 'T\u00e9l\u00e9charger',

    // File preview
    'preview.raw': 'Brut',
    'preview.preview': 'Aper\u00e7u',
    'preview.download': 'T\u00e9l\u00e9charger',

    // Errors & fallbacks
    'error.sessionCreate':
      '\u00c9chec de la cr\u00e9ation de session',
    'error.sessionCreateRetry':
      '\u00c9chec de la cr\u00e9ation de session. Veuillez r\u00e9essayer.',
    'error.noSession': 'Aucune session trouv\u00e9e.',
    'error.startNew': 'D\u00e9marrer une nouvelle session',
    'loading': 'Chargement...',
  },
};
