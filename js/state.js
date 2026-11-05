/**
 * Alerta Vecinos - Central State Management & Persistence
 * Red Urbana - Evaluación Final Integradora (EFI)
 * Zero external libraries - Pure Vanilla JavaScript + LocalStorage
 */

const STORAGE_KEY = 'alerta_vecinos_state_v1';

/**
 * Initial Seed Data for Academic Demonstration
 */
const INITIAL_INCIDENTS = [
  {
    id: 'REP-104',
    title: 'Luminaria rota en esquina San Martín',
    category: 'iluminacion',
    categoryLabel: 'Iluminación',
    severity: 'alta',
    severityLabel: 'Gravedad Alta',
    address: 'Av. San Martín y Belgrano',
    coords: { x: 140, y: 150 },
    timestamp: 'Hace 20 min',
    fullDate: '03/11/2026 14:05',
    description: 'La farola pública de la esquina titila y se apaga por completo al anochecer. Es la parada de colectivo donde descienden trabajadores y estudiantes.',
    author: 'Vecino del barrio',
    isAnonymous: false,
    authorReputation: 'Nivel 2',
    status: 'pendiente', // 'pendiente' | 'resuelto' | 'dado_de_baja'
    inReview: false,
    reviewReason: null,
    reviewDetails: null,
    endorsements: 3,
    validationVotes: {
      stillHappening: 14,
      notHappening: 1
    }
  },
  {
    id: 'REP-082',
    title: 'Luminaria frente a plaza principal sin funcionamiento',
    category: 'iluminacion',
    categoryLabel: 'Iluminación',
    severity: 'media',
    severityLabel: 'Gravedad Media',
    address: 'Plaza Central - Sector Juegos',
    coords: { x: 230, y: 220 },
    timestamp: 'Hace 2 horas',
    fullDate: '03/11/2026 12:15',
    description: 'Tercera luminaria consecutiva apagada sobre el sendero de juegos infantiles. Queda una zona a oscuras de más de 40 metros.',
    author: 'Carlos Gómez',
    isAnonymous: false,
    authorReputation: 'Nivel 2',
    status: 'pendiente',
    inReview: false,
    reviewReason: null,
    reviewDetails: null,
    endorsements: 5,
    validationVotes: {
      stillHappening: 8,
      notHappening: 0
    }
  },
  {
    id: 'REP-079',
    title: 'Pastizales altos y visibilidad nula en cruce peatonal',
    category: 'terrenos',
    categoryLabel: 'Terrenos / Pastizal',
    severity: 'media',
    severityLabel: 'Gravedad Media',
    address: 'Calle Mitre y Vías del Ferrocarril',
    coords: { x: 90, y: 310 },
    timestamp: 'Hace 1 día',
    fullDate: '02/11/2026 10:30',
    description: 'Lote baldío con malezas que superan los dos metros y tapan la senda peatonal y la señal de cruce ferroviario.',
    author: 'Anónimo ante vecinos',
    isAnonymous: true,
    authorReputation: 'Nivel 1',
    status: 'pendiente',
    inReview: false,
    reviewReason: null,
    reviewDetails: null,
    endorsements: 7,
    validationVotes: {
      stillHappening: 12,
      notHappening: 2
    }
  }
];

const INITIAL_USER = {
  id: 'usr-carlos-gomez',
  name: 'Carlos Gómez',
  email: 'carlos.gomez@vecinos.org',
  barrio: 'Barrio San Martín',
  reputacion: 'Nivel 2 (Vecino activo)',
  activeRole: 'vecino', // 'vecino' | 'moderador'
  isLoggedIn: true
};

const INITIAL_DRAFT = {
  category: 'iluminacion',
  severity: 'media',
  location: 'Av. San Martín y Belgrano',
  description: '',
  isAnonymous: false
};

class StateStore {
  constructor() {
    this.listeners = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Ensure all required top-level keys exist
        return {
          incidents: parsed.incidents || INITIAL_INCIDENTS,
          user: parsed.user || INITIAL_USER,
          draft: parsed.draft || INITIAL_DRAFT,
          userVotes: parsed.userVotes || {},
          userEndorsements: parsed.userEndorsements || {},
          moderationLogs: parsed.moderationLogs || [],
          isOffline: parsed.isOffline || false,
          activeView: parsed.activeView || 'map',
          selectedReportId: parsed.selectedReportId || null,
          categoryFilter: parsed.categoryFilter || 'todos',
          searchQuery: parsed.searchQuery || ''
        };
      }
    } catch (e) {
      console.warn('Alerta Vecinos: Error leyendo localStorage, usando seed inicial:', e);
    }

    return {
      incidents: [...INITIAL_INCIDENTS],
      user: { ...INITIAL_USER },
      draft: { ...INITIAL_DRAFT },
      userVotes: {},
      userEndorsements: {},
      moderationLogs: [],
      isOffline: false,
      activeView: 'map',
      selectedReportId: null,
      categoryFilter: 'todos',
      searchQuery: ''
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Alerta Vecinos: Error guardando en localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Alerta Vecinos: Error en listener de estado:', err);
      }
    }
  }

  // --- Read Operations ---
  getState() {
    return this.state;
  }

  getIncidents() {
    return this.state.incidents.filter(inc => inc.status !== 'dado_de_baja');
  }

  getAllIncidents() {
    return this.state.incidents;
  }

  getIncidentById(id) {
    return this.state.incidents.find(inc => inc.id === id);
  }

  getUser() {
    return this.state.user;
  }

  getDraft() {
    return this.state.draft;
  }

  getUserVote(reportId) {
    return this.state.userVotes[reportId] || null;
  }

  hasEndorsed(reportId) {
    return Boolean(this.state.userEndorsements[reportId]);
  }

  getModerationLogs() {
    return this.state.moderationLogs;
  }

  // --- Write Operations ---

  // Flujo 3: Crear reporte
  addIncident(reportData) {
    const nextNum = 105 + (this.state.incidents.length - 3);
    const newId = `REP-${nextNum}`;

    const newIncident = {
      id: newId,
      title: reportData.title || `Reporte de ${reportData.categoryLabel || 'incidente'} en ${reportData.location}`,
      category: reportData.category || 'iluminacion',
      categoryLabel: reportData.categoryLabel || 'Iluminación',
      severity: reportData.severity || 'media',
      severityLabel: reportData.severityLabel || 'Gravedad Media',
      address: reportData.location || 'Av. San Martín y Belgrano',
      coords: reportData.coords || { x: 180, y: 190 },
      timestamp: 'Recién publicado',
      fullDate: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
      description: reportData.description || 'Sin descripción adicional aportada por el vecino.',
      author: reportData.isAnonymous ? 'Anónimo ante vecinos' : this.state.user.name,
      isAnonymous: Boolean(reportData.isAnonymous),
      authorReputation: this.state.user.reputacion,
      status: 'pendiente',
      inReview: false,
      reviewReason: null,
      reviewDetails: null,
      endorsements: 0,
      validationVotes: {
        stillHappening: 1, // Author confirms it initially
        notHappening: 0
      }
    };

    this.state.incidents.unshift(newIncident);
    this.state.userVotes[newId] = 'still';
    this.clearDraft();
    this.saveState();
    return newIncident;
  }

  // Flujo 4: Validación comunitaria ("¿Sigue ocurriendo?")
  castValidationVote(reportId, voteType) {
    const incident = this.getIncidentById(reportId);
    if (!incident) return false;

    // Check if user already voted
    if (this.state.userVotes[reportId]) {
      return false; // Prevent double voting
    }

    if (voteType === 'still') {
      incident.validationVotes.stillHappening += 1;
    } else if (voteType === 'not') {
      incident.validationVotes.notHappening += 1;
    }

    this.state.userVotes[reportId] = voteType;
    this.saveState();
    return true;
  }

  // Respaldar reporte (+1)
  endorseIncident(reportId) {
    const incident = this.getIncidentById(reportId);
    if (!incident) return false;
    if (this.state.userEndorsements[reportId]) return false;

    incident.endorsements += 1;
    this.state.userEndorsements[reportId] = true;
    this.saveState();
    return true;
  }

  // Flujo 5: Denunciar contenido (Aislamiento preventivo)
  flagIncident(reportId, reason, details = '') {
    const incident = this.getIncidentById(reportId);
    if (!incident) return false;

    incident.inReview = true;
    incident.reviewReason = reason;
    incident.reviewDetails = details;

    this.state.moderationLogs.unshift({
      id: 'log-' + Date.now(),
      reportId,
      action: 'flag',
      reason,
      details,
      timestamp: new Date().toLocaleTimeString('es-AR'),
      userName: this.state.user.name
    });

    this.saveState();
    return true;
  }

  // Rol Moderador: Desestimar denuncia (Mantener reporte)
  dismissIncidentFlag(reportId) {
    const incident = this.getIncidentById(reportId);
    if (!incident) return false;

    incident.inReview = false;
    incident.reviewReason = null;
    incident.reviewDetails = null;

    this.state.moderationLogs.unshift({
      id: 'log-' + Date.now(),
      reportId,
      action: 'dismiss',
      timestamp: new Date().toLocaleTimeString('es-AR'),
      moderatorName: this.state.user.name
    });

    this.saveState();
    return true;
  }

  // Rol Moderador: Dar de baja reporte
  takeDownIncident(reportId) {
    const incident = this.getIncidentById(reportId);
    if (!incident) return false;

    incident.status = 'dado_de_baja';
    incident.inReview = false;

    this.state.moderationLogs.unshift({
      id: 'log-' + Date.now(),
      reportId,
      action: 'takedown',
      timestamp: new Date().toLocaleTimeString('es-AR'),
      moderatorName: this.state.user.name
    });

    this.saveState();
    return true;
  }

  // Borrador de nuevo reporte (Zero Data Loss)
  saveDraft(partialDraft) {
    this.state.draft = { ...this.state.draft, ...partialDraft };
    this.saveState();
  }

  clearDraft() {
    this.state.draft = { ...INITIAL_DRAFT };
    this.saveState();
  }

  // Rol Switcher (ADR-029)
  setUserRole(role) {
    if (role === 'vecino' || role === 'moderador') {
      this.state.user.activeRole = role;
      this.saveState();
    }
  }

  setUserLoggedIn(isLoggedIn, userName = null) {
    this.state.user.isLoggedIn = Boolean(isLoggedIn);
    if (userName) {
      this.state.user.name = userName;
    }
    this.saveState();
  }

  // Modo Offline Simulator
  setOffline(bool) {
    this.state.isOffline = Boolean(bool);
    this.saveState();
  }

  // Navegación y Filtros
  setActiveView(viewName, reportId = null) {
    this.state.activeView = viewName;
    if (reportId !== null) {
      this.state.selectedReportId = reportId;
    }
    this.saveState();
  }

  setCategoryFilter(category) {
    this.state.categoryFilter = category;
    this.saveState();
  }

  setSearchQuery(query) {
    this.state.searchQuery = query;
    this.saveState();
  }

  // Restablecer valores de fábrica para la demo
  resetToDefaults() {
    this.state = {
      incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
      user: JSON.parse(JSON.stringify(INITIAL_USER)),
      draft: JSON.parse(JSON.stringify(INITIAL_DRAFT)),
      userVotes: {},
      userEndorsements: {},
      moderationLogs: [],
      isOffline: false,
      activeView: 'map',
      selectedReportId: null,
      categoryFilter: 'todos',
      searchQuery: ''
    };
    this.saveState();
  }
}

// Global state singleton
export const stateStore = new StateStore();
