/**
 * Alerta Vecinos - Aplicación Web Completa
 * Red Urbana de Seguridad Ciudadana
 * JavaScript Vanilla puro - Sin frameworks - Compatible con file:// y http://
 * Persistencia en localStorage + Leaflet OSM Map + Geolocalización Real
 */

(function () {
  "use strict";

  const STORAGE_KEY = "alerta_vecinos_rc_v1";
  const AUTH_KEY = "alerta_vecinos_auth_v2";
  const REMEMBERED_ACCOUNTS_KEY = "alerta_vecinos_remembered_accounts_v2";

  // Coordenadas base (Plaza Roca / Centro, Río Cuarto, Córdoba, Argentina)
  const BASE_LAT = -33.13044;
  const BASE_LNG = -64.35272;

  // Puntos Seguros e Instituciones Oficiales Registradas en Río Cuarto
  const SAFE_POINTS = [
    {
      id: "SP-01",
      name: "Hospital San Antonio de Padua",
      type: "hospital",
      categoryKey: "salud",
      categoryLabel: "Hospital Regional / Urgencias",
      color: "#dc2626",
      icon: "🏥",
      address: "Guardias Nacionales 1027",
      lat: -33.1197,
      lng: -64.3602,
      phone: "0358 4678700 / 107",
      telLink: "tel:03584678700",
      hours: "Atención 24 hs",
      isSafeZone: true,
      description: "Hospital público provincial de alta complejidad con guardia médica general, pediátrica y emergencias las 24 horas."
    },
    {
      id: "SP-02",
      name: "S24 Banda Norte (Centro de Salud 24 hs)",
      type: "salud",
      categoryKey: "salud",
      categoryLabel: "Centro de Salud 24 hs (S24)",
      color: "#16a34a",
      icon: "🩺",
      address: "México 46 (Banda Norte)",
      lat: -33.1145,
      lng: -64.3486,
      phone: "0358 4671199 / 107",
      telLink: "tel:03584671199",
      hours: "Atención 24 hs",
      isSafeZone: true,
      description: "Dispensario municipal con guardia médica, enfermería, ambulancia y contención comunitaria las 24 horas."
    },
    {
      id: "SP-03",
      name: "S24 Alberdi (Centro de Salud 24 hs)",
      type: "salud",
      categoryKey: "salud",
      categoryLabel: "Centro de Salud 24 hs (S24)",
      color: "#16a34a",
      icon: "🩺",
      address: "Pje. Abanderado Grandoli 499 (Alberdi)",
      lat: -33.1412,
      lng: -64.3365,
      phone: "0358 4671198 / 107",
      telLink: "tel:03584671198",
      hours: "Atención 24 hs",
      isSafeZone: true,
      description: "Puesto de salud vecinal con atención médica continua, primeros auxilios y resguardo vecinal las 24 horas."
    },
    {
      id: "SP-04",
      name: "S24 Sur (Centro de Salud 24 hs)",
      type: "salud",
      categoryKey: "salud",
      categoryLabel: "Centro de Salud 24 hs (S24)",
      color: "#16a34a",
      icon: "🩺",
      address: "Enrique Mosconi 185",
      lat: -33.1530,
      lng: -64.3645,
      phone: "0358 4671288 / 107",
      telLink: "tel:03584671288",
      hours: "Atención 24 hs",
      isSafeZone: true,
      description: "Guardia médica permanente del sector sur, punto seguro de resguardo y atención de urgencias."
    },
    {
      id: "SP-05",
      name: "Centro de Salud Municipal",
      type: "salud",
      categoryKey: "salud",
      categoryLabel: "Centro de Salud Municipal",
      color: "#16a34a",
      icon: "🩺",
      address: "Cabrera 1344 (Centro)",
      lat: -33.1258,
      lng: -64.3540,
      phone: "0358 4671200",
      telLink: "tel:03584671200",
      hours: "Lun a Vie 07:00 a 19:00",
      isSafeZone: false,
      description: "Sede central de salud municipal con consultorios externos, vacunatorio y atención ambulatoria programada."
    },
    {
      id: "SP-06",
      name: "Sociedad de Bomberos Voluntarios Río Cuarto",
      type: "bomberos",
      categoryKey: "bomberos",
      categoryLabel: "Cuartel de Bomberos Voluntarios",
      color: "#ea580c",
      icon: "🚒",
      address: "Lamadrid 945 (Centro)",
      lat: -33.1272,
      lng: -64.3551,
      phone: "100 / 0358 4643333",
      telLink: "tel:100",
      hours: "Guardia activa 24 hs",
      isSafeZone: false,
      description: "Cuartel central de bomberos voluntarios, brigada de rescate vehicular y siniestros urbanos."
    },
    {
      id: "SP-07",
      name: "Policía de Córdoba - Departamental Río Cuarto",
      type: "policia",
      categoryKey: "policia",
      categoryLabel: "Policía de Córdoba (URD)",
      color: "#2563eb",
      icon: "👮",
      address: "Belgrano 53 (Centro)",
      lat: -33.1245,
      lng: -64.3485,
      phone: "911 / 101 / 0358 4672962",
      telLink: "tel:911",
      hours: "Atención y guardia 24 hs",
      isSafeZone: false,
      description: "Unidad Regional Departamental Río Cuarto, patrullaje de cuadrículas y denuncias policiales."
    },
    {
      id: "SP-08",
      name: "Defensa Civil Río Cuarto",
      type: "defensa_civil",
      categoryKey: "defensa_civil",
      categoryLabel: "Defensa Civil Municipal",
      color: "#7c3aed",
      icon: "🛡️",
      address: "Lamadrid 945 / Centro Cívico",
      lat: -33.1275,
      lng: -64.3548,
      phone: "103 / 0358 4671143",
      telLink: "tel:103",
      hours: "Guardia y prevención 24 hs",
      isSafeZone: false,
      description: "Coordinación operativa de contingencias climáticas, alertas tempranas y protección civil."
    }
  ];

  // Usuarios Iniciales del Sistema
  const INITIAL_USERS = [
    {
      id: "usr-facundo-rullo",
      name: "Facundo Rullo",
      email: "vecino@alerta.org",
      password: "vecino123",
      barrio: "Centro · Río Cuarto",
      role: "vecino",
      createdAt: "15/03/2026"
    },
    {
      id: "usr-laura-paz",
      name: "Laura Paz",
      email: "moderador@alerta.org",
      password: "admin123",
      barrio: "Banda Norte · Río Cuarto",
      role: "moderador",
      createdAt: "10/01/2026"
    }
  ];

  // Reportes Iniciales Ubicados en Río Cuarto
  const INITIAL_REPORTS = [
    {
      id: "REP-104",
      title: "Luminaria rota en esquina San Martín",
      category: "iluminacion",
      categoryLabel: "Iluminación",
      severity: "alta",
      severityLabel: "Gravedad Alta",
      address: "San Martín y 25 de Mayo (Centro)",
      lat: -33.1265,
      lng: -64.3495,
      timestamp: "Hace 25 min",
      fullDate: "04/11/2026 14:05",
      description: "La farola de alumbrado público titila y se apaga por completo al anochecer. Es parada transitada donde esperan vecinos y estudiantes.",
      author: "Facundo Rullo",
      authorId: "usr-facundo-rullo",
      isAnonymous: false,
      status: "pendiente",
      inReview: false,
      reviewReason: null,
      endorsements: 3,
      validationVotes: {
        stillHappening: 14,
        notHappening: 1
      },
      validatedBy: null,
      validatedAt: null,
      photoUrl: null
    },
    {
      id: "REP-082",
      title: "Luminarias sobre vereda oeste de Plaza Roca sin funcionar",
      category: "iluminacion",
      categoryLabel: "Iluminación",
      severity: "media",
      severityLabel: "Gravedad Media",
      address: "Plaza Roca (Sector bancos y juegos infantiles)",
      lat: -33.1252,
      lng: -64.3491,
      timestamp: "Hace 2 horas",
      fullDate: "04/11/2026 12:15",
      description: "Tres farolas consecutivas apagadas sobre la vereda oeste de la Plaza Roca. Queda una zona a oscuras de más de 40 metros durante la noche.",
      author: "Carlos Gómez",
      authorId: "usr-carlos-gomez",
      isAnonymous: false,
      status: "validado",
      inReview: false,
      reviewReason: null,
      endorsements: 8,
      validationVotes: {
        stillHappening: 18,
        notHappening: 0
      },
      validatedBy: "Laura Paz (Moderadora)",
      validatedAt: "04/11/2026 13:00",
      photoUrl: null
    },
    {
      id: "REP-079",
      title: "Pastizales altos y visibilidad nula en cruce peatonal",
      category: "terrenos",
      categoryLabel: "Terrenos / Baldíos",
      severity: "media",
      severityLabel: "Gravedad Media",
      address: "Av. Colombres y Pje. Grandoli (Barrio Alberdi)",
      lat: -33.1405,
      lng: -64.3370,
      timestamp: "Hace 1 día",
      fullDate: "03/11/2026 10:30",
      description: "Lote baldío con malezas que superan los dos metros de altura y obstaculizan la senda peatonal y la visión de conductores en la esquina.",
      author: "Vecino Anónimo",
      authorId: "usr-anon-1",
      isAnonymous: true,
      status: "pendiente",
      inReview: false,
      reviewReason: null,
      endorsements: 12,
      validationVotes: {
        stillHappening: 22,
        notHappening: 2
      },
      validatedBy: null,
      validatedAt: null,
      photoUrl: null
    },
    {
      id: "REP-065",
      title: "Cámara domo preventiva desconectada",
      category: "seguridad",
      categoryLabel: "Seguridad",
      severity: "alta",
      severityLabel: "Gravedad Alta",
      address: "Av. Marcelo T. de Alvear 750 (Banda Norte)",
      lat: -33.1160,
      lng: -64.3510,
      timestamp: "Hace 3 horas",
      fullDate: "04/11/2026 11:20",
      description: "Domo de monitoreo preventivo con cableado expuesto y suelto frente a la costanera norte.",
      author: "Marta Díaz",
      authorId: "usr-marta-diaz",
      isAnonymous: false,
      status: "en_revision",
      inReview: true,
      reviewReason: "Información falsa o engañosa",
      endorsements: 1,
      validationVotes: {
        stillHappening: 3,
        notHappening: 2
      },
      validatedBy: null,
      validatedAt: null,
      photoUrl: null
    },
    {
      id: "REP-055",
      title: "Tapa de registro cloacal hundida y peligrosa",
      category: "infraestructura",
      categoryLabel: "Infraestructura",
      severity: "alta",
      severityLabel: "Gravedad Alta",
      address: "Av. España y Deán Funes (Macrocentro)",
      lat: -33.1290,
      lng: -64.3560,
      timestamp: "Hace 5 horas",
      fullDate: "04/11/2026 09:15",
      description: "Hundimiento pronunciado de rejilla pluvial en la calzada, riesgo latente de rotura de tren delantero vehicular o caída grave de ciclistas y motociclistas.",
      author: "Esteban Rossi",
      authorId: "usr-esteban-rossi",
      isAnonymous: false,
      status: "pendiente",
      inReview: false,
      reviewReason: null,
      endorsements: 6,
      validationVotes: {
        stillHappening: 11,
        notHappening: 1
      },
      validatedBy: null,
      validatedAt: null,
      photoUrl: null
    },
    {
      id: "REP-041",
      title: "Ruidos molestos y disturbios nocturnos reiterados",
      category: "seguridad",
      categoryLabel: "Seguridad",
      severity: "baja",
      severityLabel: "Gravedad Baja",
      address: "Sobremonte y Constitución (Centro)",
      lat: -33.1240,
      lng: -64.3520,
      timestamp: "Hace 1 día",
      fullDate: "03/11/2026 02:40",
      description: "Música a volumen excesivo y disturbios en la acera a la salida de locales nocturnos, impidiendo el descanso vecinal.",
      author: "Facundo Rullo",
      authorId: "usr-facundo-rullo",
      isAnonymous: false,
      status: "resuelto",
      inReview: false,
      reviewReason: null,
      endorsements: 4,
      validationVotes: {
        stillHappening: 2,
        notHappening: 15
      },
      validatedBy: null,
      validatedAt: null,
      photoUrl: null
    }
  ];

  // =========================================================================
  // GESTOR DE ESTADO Y PERSISTENCIA (LOCALSTORAGE REAL)
  // =========================================================================
  class StateManager {
    constructor() {
      this.state = this.loadState();
      this.currentUser = this.loadUser();
      if (this.currentUser) {
        this.addRememberedAccount(this.currentUser);
      }
    }

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.reports) && parsed.safePoints && parsed.safePoints.length >= 8) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn("Error leyendo localStorage, cargando datos semilla:", err);
      }

      const freshState = {
        users: JSON.parse(JSON.stringify(INITIAL_USERS)),
        reports: JSON.parse(JSON.stringify(INITIAL_REPORTS)),
        safePoints: JSON.parse(JSON.stringify(SAFE_POINTS)),
        userVotes: {},
        moderationAudit: [
          {
            reportId: "REP-082",
            action: "validado",
            moderatorName: "Laura Paz",
            date: "04/11/2026 13:00",
            notes: "Verificado con cuadrilla de alumbrado de Río Cuarto."
          }
        ],
        draft: {
          title: "",
          category: "seguridad",
          severity: "media",
          address: "Plaza Roca (Centro)",
          lat: BASE_LAT,
          lng: BASE_LNG,
          description: "",
          isAnonymous: false,
          photoUrl: null
        },
        categoryFilter: "todos",
        searchQuery: "",
        activeView: "map",
        selectedReportId: "REP-104",
        userLocation: null
      };

      this.persist(freshState);
      return freshState;
    }

    persist(state = this.state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Error persistiendo en localStorage:", err);
      }
    }

    loadUser() {
      try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.warn("Error leyendo usuario de auth:", e);
      }
      return null;
    }

    saveUser(user) {
      this.currentUser = user;
      try {
        if (user) {
          localStorage.setItem(AUTH_KEY, JSON.stringify(user));
          this.addRememberedAccount(user);
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch (e) {
        console.error("Error guardando sesión de usuario:", e);
      }
    }

    getRememberedAccounts() {
      try {
        const raw = localStorage.getItem(REMEMBERED_ACCOUNTS_KEY);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) return list;
        }
      } catch (e) {
        console.warn("Error leyendo cuentas recordadas:", e);
      }
      return [];
    }

    addRememberedAccount(user) {
      if (!user || !user.email) return;
      try {
        const list = this.getRememberedAccounts().filter(
          a => a.email.toLowerCase() !== user.email.toLowerCase()
        );
        const accountData = {
          id: user.id || ("usr-" + Date.now()),
          name: user.name || "Vecino",
          email: user.email.toLowerCase(),
          barrio: user.barrio || "Centro · Río Cuarto",
          role: user.role || "vecino",
          lastUsed: Date.now()
        };
        list.unshift(accountData);
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(list.slice(0, 5)));
      } catch (e) {
        console.warn("Error guardando cuenta recordada:", e);
      }
    }

    removeRememberedAccount(email) {
      if (!email) return;
      try {
        const list = this.getRememberedAccounts().filter(
          a => a.email.toLowerCase() !== email.toLowerCase()
        );
        localStorage.setItem(REMEMBERED_ACCOUNTS_KEY, JSON.stringify(list));
      } catch (e) {
        console.warn("Error eliminando cuenta recordada:", e);
      }
    }

    isLoggedIn() {
      return Boolean(this.currentUser);
    }

    isModerator() {
      return Boolean(this.currentUser && this.currentUser.role === "moderador");
    }

    login(email, password) {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = (password || "").trim();

      const found = this.state.users.find(
        u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
      );

      if (found) {
        this.saveUser(found);
        return { success: true, user: found };
      }
      return { success: false, error: "Credenciales inválidas. Verificá el correo y la contraseña." };
    }

    register({ name, email, barrio, password }) {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!name || name.trim().length < 3) {
        return { success: false, error: "El nombre debe tener al menos 3 caracteres." };
      }
      if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
        return { success: false, error: "Ingresá un correo electrónico válido." };
      }
      if (!password || password.length < 6) {
        return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
      }

      const exists = this.state.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return { success: false, error: "Ya existe una cuenta registrada con este correo." };
      }

      const newUser = {
        id: "usr-" + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password: password,
        barrio: barrio ? barrio.trim() : "Comuna 14",
        role: "vecino",
        createdAt: new Date().toLocaleDateString("es-AR")
      };

      this.state.users.push(newUser);
      this.persist();
      this.saveUser(newUser);
      return { success: true, user: newUser };
    }

    logout() {
      this.saveUser(null);
    }

    getStatusInfo(statusKey) {
      const s = String(statusKey || "").toLowerCase();
      const map = {
        pendiente: {
          key: "pendiente",
          label: "Pendiente",
          badgeClass: "badge-info",
          desc: "Reporte creado por un vecino, publicado inicialmente en el mapa y en la lista a la espera de validación de la comunidad o moderación."
        },
        en_revision: {
          key: "en_revision",
          label: "En revisión",
          badgeClass: "badge-warning",
          desc: "Reporte señalado o denunciado por vecinos por posible falsedad o infracción de normas. Su contenido permanece protegido bajo escudo preventivo hasta su verificación."
        },
        validado: {
          key: "validado",
          label: "Validado",
          badgeClass: "badge-success",
          desc: "Reporte verificado formalmente por el equipo de moderación o respaldado comunitariamente con alto consenso vecinal."
        },
        resuelto: {
          key: "resuelto",
          label: "Resuelto",
          badgeClass: "badge-success",
          desc: "Incidente solucionado en el territorio (reparado por autoridades o verificado por vecinos que ya no persiste)."
        },
        rechazado: {
          key: "rechazado",
          label: "Rechazado",
          badgeClass: "badge-danger",
          desc: "Reporte descartado por un moderador tras comprobarse falsedad, duplicación o incompatibilidad."
        },
        dado_de_baja: {
          key: "dado_de_baja",
          label: "Dado de baja",
          badgeClass: "badge-neutral",
          desc: "Reporte retirado definitivamente de las vistas públicas por violación de las normas comunitarias."
        }
      };
      return map[s] || { key: s, label: s ? s.replace(/_/g, " ") : "Desconocido", badgeClass: "badge-neutral", desc: "Estado operativo" };
    }

    getReports() {
      return this.state.reports.filter(r => r.status !== "dado_de_baja");
    }

    getFilteredReports() {
      const query = (this.state.searchQuery || "").trim().toLowerCase();
      const cat = this.state.categoryFilter;

      return this.state.reports.filter(r => {
        if (r.status === "dado_de_baja") return false;

        // Filtro por categoría
        if (cat && cat !== "todos") {
          if (r.category !== cat) return false;
        }

        // Búsqueda por palabra clave
        if (query) {
          const inTitle = (r.title || "").toLowerCase().includes(query);
          const inDesc = (r.description || "").toLowerCase().includes(query);
          const inAddr = (r.address || "").toLowerCase().includes(query);
          const inCat = (r.categoryLabel || "").toLowerCase().includes(query);
          if (!inTitle && !inDesc && !inAddr && !inCat) return false;
        }

        return true;
      });
    }

    getReportById(id) {
      return this.state.reports.find(r => r.id === id);
    }

    addReport(draftData) {
      const user = this.currentUser || { name: "Vecino Anónimo", id: "anon" };
      const nextNum = this.state.reports.length + 105;
      const newId = "REP-" + String(nextNum).padStart(3, "0");

      const categoryLabels = {
        iluminacion: "Iluminación",
        terrenos: "Terrenos / Baldíos",
        seguridad: "Seguridad",
        infraestructura: "Vía Pública"
      };

      const severityLabels = {
        baja: "Gravedad Baja",
        media: "Gravedad Media",
        alta: "Gravedad Alta",
        critica: "Gravedad Crítica"
      };

      const now = new Date();
      const fullDate = now.toLocaleDateString("es-AR") + " " + now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

      const newReport = {
        id: newId,
        title: draftData.title.trim(),
        category: draftData.category,
        categoryLabel: categoryLabels[draftData.category] || "General",
        severity: draftData.severity,
        severityLabel: severityLabels[draftData.severity] || "Media",
        address: draftData.address ? draftData.address.trim() : "Ubicación en mapa",
        lat: Number(draftData.lat) || BASE_LAT,
        lng: Number(draftData.lng) || BASE_LNG,
        timestamp: "Recién publicado",
        fullDate: fullDate,
        description: draftData.description.trim(),
        author: draftData.isAnonymous ? "Vecino Anónimo" : user.name,
        authorId: user.id,
        isAnonymous: Boolean(draftData.isAnonymous),
        status: "pendiente",
        inReview: false,
        reviewReason: null,
        endorsements: 1,
        validationVotes: {
          stillHappening: 1,
          notHappening: 0
        },
        validatedBy: null,
        validatedAt: null,
        photoUrl: draftData.photoUrl || null
      };

      this.state.reports.unshift(newReport);

      // Limpiar borrador
      this.state.draft = {
        title: "",
        category: "seguridad",
        severity: "media",
        address: "Av. San Martín y Belgrano",
        lat: BASE_LAT,
        lng: BASE_LNG,
        description: "",
        isAnonymous: false,
        photoUrl: null
      };

      this.persist();
      return newReport;
    }

    voteReport(reportId, isStillHappening) {
      const rep = this.getReportById(reportId);
      if (!rep) return false;

      const userKey = (this.currentUser ? this.currentUser.id : "guest") + "_" + reportId;
      if (this.state.userVotes[userKey]) {
        return { success: false, alreadyVoted: true };
      }

      if (isStillHappening) {
        rep.validationVotes.stillHappening++;
        rep.endorsements++;
      } else {
        rep.validationVotes.notHappening++;
      }

      this.state.userVotes[userKey] = isStillHappening ? "still" : "not";
      this.persist();
      return { success: true, report: rep };
    }

    flagReport(reportId, reason, notes = "") {
      const rep = this.getReportById(reportId);
      if (!rep) return false;

      rep.inReview = true;
      rep.reviewReason = reason || "Contenido señalado para revisión";
      if (notes) rep.reviewNotes = notes;
      rep.status = "en_revision";

      if (!this.state.moderationLogs) this.state.moderationLogs = [];
      this.state.moderationLogs.unshift({
        reportId: rep.id,
        moderatorName: this.currentUser ? this.currentUser.name : "Vecino de la comunidad",
        action: "en_revision",
        reason: reason + (notes ? (" — " + notes) : ""),
        timestamp: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      });

      this.persist();
      return true;
    }

    moderateReport(reportId, newStatus, reason = "") {
      if (!this.isModerator()) {
        return { success: false, error: "Permiso denegado: Se requiere rol de Moderador." };
      }

      const rep = this.getReportById(reportId);
      if (!rep) return { success: false, error: "Reporte no encontrado." };

      const oldStatus = rep.status;
      rep.status = newStatus;
      if (newStatus === "validado") {
        rep.inReview = false;
        rep.validatedBy = this.currentUser.name;
        rep.validatedAt = new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
      } else if (newStatus === "dado_de_baja") {
        rep.inReview = false;
      } else if (newStatus === "rechazado") {
        rep.inReview = false;
      } else if (newStatus === "resuelto") {
        rep.inReview = false;
      }

      // Registro de auditoría
      const auditEntry = {
        reportId: rep.id,
        action: newStatus,
        moderatorName: this.currentUser.name,
        date: new Date().toLocaleDateString("es-AR") + " " + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        notes: reason || ("Cambio de estado de " + oldStatus + " a " + newStatus)
      };

      this.state.moderationAudit.unshift(auditEntry);
      this.persist();
      return { success: true, report: rep };
    }

    saveDraft(fields) {
      this.state.draft = { ...this.state.draft, ...fields };
      this.persist();
    }
  }

  // =========================================================================
  // CONTROLADOR PRINCIPAL DE LA APLICACIÓN
  // =========================================================================
  class AlertaVecinosApp {
    constructor() {
      window.store = new StateManager();
      this.store = window.store;

      this.leafletMap = null;
      this.leafletMarkers = [];
      this.safePointMarkers = [];
      this.safePointAreas = [];
      this.userLocationMarker = null;
      this.userAccuracyCircle = null;

      this.miniMapInstance = null;
      this.createPickerMap = null;
      this.emergencyMap = null;
      this.emergencySafeAreas = [];
      this.emergencyUserMarker = null;
      this.emergencyAccuracyCircle = null;

      this.currentView = "map";
      this.currentDetailId = null;

      this.callInterval = null;
      this.callDuration = 0;
      this.safePointMarkersMap = {};

      this.geoWatchId = null;
      this.autoFollowUser = true;
      this.activeAssistanceCategory = "todos";
      this._isProgrammaticPan = false;

      this.init();
    }

    init() {
      this.bindNavigation();
      this.bindMap();
      this.bindReports();
      this.bindDetail();
      this.bindCreate();
      this.bindModeration();
      this.bindEmergency();
      this.bindCall();
      this.bindProfile();
      this.bindModals();
      this.bindClock();

      this.updateHeaderUser();

      // Navegar a vista inicial guardada
      const startView = this.store.state.activeView || "map";
      this.navigate(startView, this.store.state.selectedReportId);

      // Iniciar monitoreo continuo de geolocalización en tiempo real
      this.startLiveGeolocationTracking();
    }

    // =========================================================================
    // NAVEGACIÓN Y CABECERA
    // =========================================================================
    bindNavigation() {
      // Bottom navigation tabs
      document.querySelectorAll("#bottom-nav .nav-item").forEach(item => {
        item.addEventListener("click", () => {
          const view = item.getAttribute("data-view");
          if (view === "moderation" && !this.store.isModerator()) {
            this.showToast("Acceso denegado: Esta sección requiere rol de Moderador.", "error");
            return;
          }
          this.navigate(view);
        });
      });

      // Botón volver en header
      const backBtn = document.getElementById("header-back-btn");
      if (backBtn) {
        backBtn.addEventListener("click", () => {
          if (this.currentView === "detail" || this.currentView === "create") {
            this.navigate("reports");
          } else {
            this.navigate("map");
          }
        });
      }

      // Clic en badge de usuario en el header lleva al perfil
      const headerBadge = document.getElementById("header-user-badge");
      if (headerBadge) {
        headerBadge.addEventListener("click", () => this.navigate("profile"));
      }
    }

    navigate(viewName, param = null) {
      // Detener temporizador si salimos de la vista de llamada
      if (this.currentView === "call" && viewName !== "call") {
        this.stopCallTimer();
      }

      this.currentView = viewName;
      this.store.state.activeView = viewName;
      if (param) this.store.state.selectedReportId = param;
      this.store.persist();

      // Control estricto de viewport scrolling
      const viewport = document.getElementById("app-viewport");
      if (viewport) {
        if (viewName === "map" || viewName === "call") {
          viewport.classList.add("lock-scroll");
          viewport.scrollTop = 0;
        } else {
          viewport.classList.remove("lock-scroll");
        }
      }

      // Ocultar barra de emergencia en llamada o en central de asistencia
      const emBar = document.getElementById("emergency-bar");
      if (emBar) {
        emBar.style.display = (viewName === "emergency" || viewName === "call") ? "none" : "block";
      }

      // Ocultar header y barra inferior durante la llamada para experiencia full-screen de smartphone
      const appHeader = document.getElementById("app-header");
      if (appHeader) {
        appHeader.style.display = (viewName === "call") ? "none" : "flex";
      }

      const bottomNav = document.getElementById("bottom-nav");
      if (bottomNav) {
        bottomNav.style.display = (viewName === "call") ? "none" : "flex";
      }

      // Ocultar todas las vistas y activar EXCLUSIVAMENTE la seleccionada
      document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
      const targetView = document.getElementById("view-" + viewName);
      if (targetView) {
        targetView.classList.add("active");
        targetView.scrollTop = 0;
      }

      // Actualizar Bottom Navigation
      document.querySelectorAll("#bottom-nav .nav-item").forEach(item => {
        const isSelected = item.getAttribute("data-view") === viewName;
        item.classList.toggle("active", isSelected);
        item.setAttribute("aria-selected", isSelected ? "true" : "false");
      });

      // Visibilidad del tab de moderación
      const modTab = document.getElementById("nav-tab-moderation");
      if (modTab) {
        modTab.style.display = this.store.isModerator() ? "flex" : "none";
      }

      // Actualizar Header
      this.updateHeader(viewName);

      // Render de la vista específica
      if (viewName === "map") {
        this.renderMap();
      } else if (viewName === "reports") {
        this.renderReportsList();
      } else if (viewName === "detail") {
        this.renderDetail(param || this.store.state.selectedReportId || "REP-104");
      } else if (viewName === "create") {
        this.renderCreateForm();
      } else if (viewName === "moderation") {
        this.renderModerationDashboard();
      } else if (viewName === "call") {
        this.renderCallView();
      } else if (viewName === "emergency") {
        this.renderEmergencyView();
      } else if (viewName === "profile") {
        this.renderProfile();
      }
    }

    updateHeader(viewName) {
      const titleEl = document.getElementById("header-title");
      const breadcrumbEl = document.getElementById("header-breadcrumb");
      const backBtn = document.getElementById("header-back-btn");

      const headerData = {
        map: { title: "ALERTA VECINOS", crumb: "■ INICIO / MAPA", back: false },
        reports: { title: "REPORTES VECINALES", crumb: "■ REPORTES / LISTA", back: true },
        detail: { title: "DETALLE DE ALERTA", crumb: "■ REPORTES / DETALLE", back: true },
        create: { title: "NUEVO REPORTE", crumb: "■ CREAR / INCIDENTE", back: true },
        moderation: { title: "MODERACIÓN", crumb: "■ PANEL / CONTROL", back: false },
        call: { title: "EMERGENCIA", crumb: "■ LLAMADA / 911", back: false },
        emergency: { title: "CENTRAL DE ASISTENCIA", crumb: "■ ASISTENCIA / 911", back: true },
        profile: { title: "MI CUENTA", crumb: "■ PERFIL / SESIÓN", back: false }
      };

      const info = headerData[viewName] || headerData.map;
      if (titleEl) titleEl.textContent = info.title;
      if (breadcrumbEl) breadcrumbEl.textContent = info.crumb;
      if (backBtn) backBtn.style.display = info.back ? "flex" : "none";

      this.updateHeaderUser();
    }

    updateHeaderUser() {
      const roleText = document.getElementById("header-role-text");
      if (!roleText) return;

      if (this.store.currentUser) {
        roleText.textContent = this.store.currentUser.role === "moderador" ? "🛡️ Moderador" : "👤 Vecino";
        roleText.className = "user-role-pill " + (this.store.currentUser.role === "moderador" ? "role-moderador" : "role-vecino");
      } else {
        roleText.textContent = "Ingresar";
        roleText.className = "user-role-pill";
      }

      // Actualizar contador badge de moderación
      const modBadge = document.getElementById("nav-badge-moderation");
      if (modBadge) {
        const inReviewCount = this.store.state.reports.filter(r => r.inReview || r.status === "en_revision").length;
        if (inReviewCount > 0 && this.store.isModerator()) {
          modBadge.style.display = "inline-block";
          modBadge.textContent = inReviewCount;
        } else {
          modBadge.style.display = "none";
        }
      }
    }

    bindClock() {
      const clock = document.getElementById("status-clock");
      const update = () => {
        if (clock) {
          const now = new Date();
          clock.textContent = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        }
      };
      update();
      setInterval(update, 30000);
    }

    // =========================================================================
    // MAPA GEOGRÁFICO INTERACTIVO (LEAFLET OSM + GEOLOCALIZACIÓN REAL)
    // =========================================================================
    initLeafletMap() {
      if (typeof L === "undefined") {
        console.warn("Leaflet no disponible, usando motor SVG fallback");
        return false;
      }

      const mapWrapper = document.getElementById("interactive-map-wrapper");
      if (!mapWrapper) return false;

      let leafletContainer = document.getElementById("leaflet-map-canvas");
      if (!leafletContainer) {
        leafletContainer = document.createElement("div");
        leafletContainer.id = "leaflet-map-canvas";
        mapWrapper.appendChild(leafletContainer);
      }
      leafletContainer.style.display = "block";

      const svgMap = document.getElementById("svg-map");
      if (svgMap) svgMap.style.display = "none";

      if (!this.leafletMap) {
        this.leafletMap = L.map("leaflet-map-canvas", {
          center: [BASE_LAT, BASE_LNG],
          zoom: 15,
          zoomControl: false
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.leafletMap);

        // Comportamiento inteligente: si el usuario mueve o arrastra el mapa, pausar auto-seguimiento
        this.leafletMap.on("movestart", () => {
          if (!this._isProgrammaticPan) {
            this.autoFollowUser = false;
            this.updateRecenterBtnState();
          }
        });
        this.leafletMap.on("dragstart", () => {
          this.autoFollowUser = false;
          this.updateRecenterBtnState();
        });
      }

      return true;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Radio de la Tierra en metros
      const phi1 = (lat1 * Math.PI) / 180;
      const phi2 = (lat2 * Math.PI) / 180;
      const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    formatDistance(meters) {
      if (meters < 1000) {
        return Math.round(meters) + " m";
      }
      return (meters / 1000).toFixed(1) + " km";
    }

    createSafePointMarkerIcon(sp) {
      const shortName = sp.name.length > 22 ? sp.name.substring(0, 20) + "…" : sp.name;
      const pinHtml =
        '<div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.35)); cursor:pointer;">' +
          '<div style="background:' + sp.color + '; color:#ffffff; font-size:11px; font-weight:800; padding:2px 8px; border-radius:12px; border:2px solid #ffffff; white-space:nowrap; display:flex; align-items:center; gap:4px; box-shadow:0 1px 4px rgba(0,0,0,0.2);">' +
            '<span>' + sp.icon + '</span>' +
            '<span>' + shortName + '</span>' +
          '</div>' +
          '<div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid ' + sp.color + '; margin-top:-1px;"></div>' +
        '</div>';

      return L.divIcon({
        className: "custom-institution-pin",
        html: pinHtml,
        iconSize: [120, 32],
        iconAnchor: [60, 32],
        popupAnchor: [0, -30]
      });
    }

    createSafePointPopupHtml(sp) {
      const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + sp.lat + "," + sp.lng;
      const badgeHtml = sp.isSafeZone
        ? '<div style="display:inline-flex; align-items:center; gap:4px; background:#dcfce7; color:#15803d; font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; margin-bottom:5px;">🛡️ ZONA SEGURA VERIFICADA</div>'
        : '<div style="display:inline-flex; align-items:center; gap:4px; background:#f1f5f9; color:#475569; font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; margin-bottom:5px;">' + sp.icon + ' ' + sp.categoryLabel + '</div>';

      return (
        '<div style="font-family:system-ui,-apple-system,sans-serif; min-width:220px; max-width:270px; padding:3px;">' +
          badgeHtml +
          '<strong style="font-size:13px; color:#0f172a; display:block; line-height:1.3; margin-bottom:4px;">' + sp.name + '</strong>' +
          '<div style="font-size:11px; color:#334155; margin-bottom:2px;">📍 ' + sp.address + '</div>' +
          '<div style="font-size:11px; color:#64748b; margin-bottom:4px;">⏰ ' + sp.hours + '</div>' +
          '<div style="font-size:11px; color:#475569; margin-bottom:8px; line-height:1.3;">' + sp.description + '</div>' +
          '<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px;">' +
            '<a href="' + sp.telLink + '" style="display:inline-flex; align-items:center; justify-content:center; gap:4px; padding:6px 8px; background:#16a34a; color:#ffffff; text-decoration:none; border-radius:6px; font-size:11px; font-weight:700; text-align:center;">' +
              '📞 Llamar' +
            '</a>' +
            '<a href="' + directionsUrl + '" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; justify-content:center; gap:4px; padding:6px 8px; background:#0f172a; color:#ffffff; text-decoration:none; border-radius:6px; font-size:11px; font-weight:700; text-align:center;">' +
              '🧭 Cómo llegar' +
            '</a>' +
          '</div>' +
        '</div>'
      );
    }

    createUserLocationIcon() {
      return L.divIcon({
        className: "leaflet-live-user-marker",
        html:
          '<div class="user-live-location-pin">' +
            '<div class="user-live-pulse"></div>' +
            '<div class="user-live-core"></div>' +
          '</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -14]
      });
    }

    updateUserMapMarker(lat, lng, accuracy = 25) {
      if (!this.leafletMap) return;

      if (!this.userLocationMarker) {
        this.userLocationMarker = L.marker([lat, lng], {
          icon: this.createUserLocationIcon(),
          zIndexOffset: 1000
        }).addTo(this.leafletMap).bindPopup("<strong>📍 Tu ubicación actual en tiempo real</strong>");
      } else {
        this.userLocationMarker.setLatLng([lat, lng]);
      }

      const radius = Math.max(15, Math.min(accuracy, 150));
      if (!this.userAccuracyCircle) {
        this.userAccuracyCircle = L.circle([lat, lng], {
          radius: radius,
          color: "#3b82f6",
          fillColor: "#60a5fa",
          fillOpacity: 0.12,
          weight: 1
        }).addTo(this.leafletMap);
      } else {
        this.userAccuracyCircle.setLatLng([lat, lng]);
        this.userAccuracyCircle.setRadius(radius);
      }
    }

    updateEmergencyUserMarker(lat, lng, accuracy = 25) {
      if (!this.emergencyMap) return;

      if (!this.emergencyUserMarker) {
        this.emergencyUserMarker = L.marker([lat, lng], {
          icon: this.createUserLocationIcon(),
          zIndexOffset: 1000
        }).addTo(this.emergencyMap).bindPopup("<strong>📍 Tu ubicación actual en tiempo real</strong>");
      } else {
        this.emergencyUserMarker.setLatLng([lat, lng]);
      }

      const radius = Math.max(15, Math.min(accuracy, 150));
      if (!this.emergencyAccuracyCircle) {
        this.emergencyAccuracyCircle = L.circle([lat, lng], {
          radius: radius,
          color: "#3b82f6",
          fillColor: "#60a5fa",
          fillOpacity: 0.12,
          weight: 1
        }).addTo(this.emergencyMap);
      } else {
        this.emergencyAccuracyCircle.setLatLng([lat, lng]);
        this.emergencyAccuracyCircle.setRadius(radius);
      }
    }

    startLiveGeolocationTracking() {
      if (!("geolocation" in navigator)) return;

      const onLocationSuccess = (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 25;

        const isFirstFix = !this.store.state.userLocation;
        this.store.state.userLocation = { lat, lng, accuracy };

        // Actualizar marcadores en vivo en ambos mapas
        this.updateUserMapMarker(lat, lng, accuracy);
        this.updateEmergencyUserMarker(lat, lng, accuracy);

        // Si auto-follow está activo o es la primera fijación, centrar
        if (this.autoFollowUser || isFirstFix) {
          this._isProgrammaticPan = true;
          if (this.currentView === "map" && this.leafletMap) {
            this.leafletMap.setView([lat, lng], 15, { animate: true });
          } else if (this.currentView === "emergency" && this.emergencyMap) {
            this.emergencyMap.setView([lat, lng], 15, { animate: true });
          }
          setTimeout(() => { this._isProgrammaticPan = false; }, 400);
        }

        // Si estamos en la vista de asistencia, actualizar lista por proximidad
        if (this.currentView === "emergency") {
          this.renderSafePointsList();
        }

        this.updateRecenterBtnState();
      };

      const onLocationError = (err) => {
        console.warn("Seguimiento de ubicación GPS:", err.message);
      };

      // Limpiar watch previo si existía
      if (this.geoWatchId !== null) {
        navigator.geolocation.clearWatch(this.geoWatchId);
        this.geoWatchId = null;
      }

      this.geoWatchId = navigator.geolocation.watchPosition(onLocationSuccess, onLocationError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000
      });
    }

    stopLiveGeolocationTracking() {
      if (this.geoWatchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(this.geoWatchId);
        this.geoWatchId = null;
      }
    }

    handleRecenterClick() {
      this.autoFollowUser = true;
      this.updateRecenterBtnState();

      if (this.store.state.userLocation) {
        const { lat, lng } = this.store.state.userLocation;
        this._isProgrammaticPan = true;
        if (this.currentView === "map" && this.leafletMap) {
          this.leafletMap.setView([lat, lng], 16, { animate: true });
        } else if (this.currentView === "emergency" && this.emergencyMap) {
          this.emergencyMap.setView([lat, lng], 16, { animate: true });
        }
        setTimeout(() => { this._isProgrammaticPan = false; }, 400);
        this.showToast("Centrado en tu ubicación actual.", "info");
      } else {
        this.showToast("Obteniendo señal GPS...", "info");
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              const accuracy = pos.coords.accuracy || 25;
              this.store.state.userLocation = { lat, lng, accuracy };
              this.updateUserMapMarker(lat, lng, accuracy);
              this.updateEmergencyUserMarker(lat, lng, accuracy);
              this._isProgrammaticPan = true;
              if (this.currentView === "map" && this.leafletMap) {
                this.leafletMap.setView([lat, lng], 16, { animate: true });
              } else if (this.currentView === "emergency" && this.emergencyMap) {
                this.emergencyMap.setView([lat, lng], 16, { animate: true });
              }
              setTimeout(() => { this._isProgrammaticPan = false; }, 400);
              this.showToast("Ubicación GPS obtenida y centrada.", "success");
              this.updateRecenterBtnState();
            },
            (err) => {
              this.showToast("No se pudo obtener el GPS (" + err.message + "). Manteniendo Río Cuarto como centro.", "warning");
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        }
      }
    }

    updateRecenterBtnState() {
      const btnHome = document.getElementById("btn-map-recenter");
      const btnEmergency = document.getElementById("btn-emergency-recenter");
      [btnHome, btnEmergency].forEach(btn => {
        if (!btn) return;
        if (this.autoFollowUser) {
          btn.classList.add("active-follow");
        } else {
          btn.classList.remove("active-follow");
        }
      });
    }

    renderMap() {
      const hasLeaflet = this.initLeafletMap();
      const reports = this.store.getFilteredReports();

      // Actualizar conteos en chips
      this.updateCategoryChipCounts();

      // Actualizar barra de proximidad
      const proxText = document.getElementById("proximity-count-text");
      if (proxText) {
        proxText.textContent = reports.length === 1
          ? "1 alerta activa en tu zona"
          : `${reports.length} alertas activas en tu zona`;
      }

      if (hasLeaflet && this.leafletMap) {
        // Limpiar marcadores anteriores
        this.leafletMarkers.forEach(m => this.leafletMap.removeLayer(m));
        this.leafletMarkers = [];
        this.safePointMarkers.forEach(m => this.leafletMap.removeLayer(m));
        this.safePointMarkers = [];

        // 1. Renderizar Puntos Seguros e Instituciones de Río Cuarto
        this.store.state.safePoints.forEach(sp => {
          const safeIcon = this.createSafePointMarkerIcon(sp);
          const spMarker = L.marker([sp.lat, sp.lng], { icon: safeIcon }).addTo(this.leafletMap);
          spMarker.bindPopup(this.createSafePointPopupHtml(sp));
          this.safePointMarkers.push(spMarker);
        });

        // 2. Renderizar Reportes
        reports.forEach((rep, idx) => {
          let pinColor = "#d97706";
          if (rep.status === "validado") pinColor = "#16a34a";
          if (rep.severity === "alta" || rep.severity === "critica") pinColor = "#dc2626";
          if (rep.inReview) pinColor = "#ea580c";

          const pinIcon = L.divIcon({
            className: "custom-report-pin",
            html: '<div style="background:' + pinColor + ';color:#fff;border:2px solid #ffffff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;box-shadow:0 3px 8px rgba(0,0,0,0.35);cursor:pointer;">' +
                    (idx + 1) +
                  "</div>",
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const marker = L.marker([rep.lat, rep.lng], { icon: pinIcon }).addTo(this.leafletMap);

          // Popup al hacer clic
          const statusInfo = this.store.getStatusInfo(rep.status);
          const popupContent =
            '<div style="font-family:system-ui,sans-serif;min-width:190px;">' +
              '<div style="font-size:10px;font-weight:800;color:' + pinColor + ';text-transform:uppercase;">' + rep.categoryLabel + " · " + statusInfo.label + "</div>" +
              '<strong style="font-size:13px;color:#0f172a;display:block;margin:3px 0;">' + rep.title + "</strong>" +
              '<div style="font-size:11px;color:#64748b;">📍 ' + rep.address + "</div>" +
              '<button onclick="window.app.navigate(&quot;detail&quot;, &quot;' + rep.id + '&quot;)" style="margin-top:8px;width:100%;background:#0f172a;color:#fff;border:none;border-radius:4px;padding:6px;font-size:11px;font-weight:700;cursor:pointer;">' +
                "Ver detalle completo →" +
              "</button>" +
            "</div>";

          marker.bindPopup(popupContent);

          marker.on("click", () => {
            this.showMapPreviewCard(rep);
          });

          this.leafletMarkers.push(marker);
        });

        // 3. Ubicación del usuario si está disponible
        if (this.store.state.userLocation) {
          this.updateUserMapMarker(
            this.store.state.userLocation.lat,
            this.store.state.userLocation.lng,
            this.store.state.userLocation.accuracy
          );
        }

        setTimeout(() => this.leafletMap.invalidateSize(), 200);
      }
    }

    showMapPreviewCard(rep) {
      const card = document.getElementById("map-preview-card");
      if (!card) return;

      const title = document.getElementById("preview-title");
      const address = document.getElementById("preview-address");
      const badges = document.getElementById("preview-badges");
      const detailBtn = document.getElementById("preview-detail-btn");

      if (title) title.textContent = rep.title;
      if (address) address.textContent = rep.address;
      if (badges) {
        const statusInfo = this.store.getStatusInfo(rep.status);
        badges.innerHTML =
          '<span class="badge badge-info">' + rep.categoryLabel + "</span> " +
          '<span class="badge ' + statusInfo.badgeClass + '">' + statusInfo.label + "</span>";
      }

      if (detailBtn) {
        detailBtn.onclick = () => this.navigate("detail", rep.id);
      }

      card.classList.add("visible");
    }

    bindMap() {
      // CTA flotante + Crear Reporte
      const mapCreateBtn = document.getElementById("map-create-btn");
      if (mapCreateBtn) {
        mapCreateBtn.addEventListener("click", () => this.navigate("create"));
      }

      // Cerrar tarjeta de previsualización
      const previewClose = document.getElementById("preview-close-btn");
      if (previewClose) {
        previewClose.addEventListener("click", () => {
          const card = document.getElementById("map-preview-card");
          if (card) card.classList.remove("visible");
        });
      }

      // Filtros de categoría en mapa
      document.querySelectorAll('#view-map .filter-chips-row [data-filter]').forEach(chip => {
        chip.addEventListener("click", () => {
          document.querySelectorAll('#view-map .filter-chips-row [data-filter]').forEach(c => {
            c.classList.remove("active");
            c.setAttribute("aria-selected", "false");
          });
          chip.classList.add("active");
          chip.setAttribute("aria-selected", "true");

          const cat = chip.getAttribute("data-filter");
          this.store.state.categoryFilter = cat;
          this.store.persist();
          this.renderMap();
        });
      });

      // Controles de zoom y centrado
      const zoomIn = document.getElementById("btn-map-zoomin");
      const zoomOut = document.getElementById("btn-map-zoomout");
      const recenter = document.getElementById("btn-map-recenter");

      if (zoomIn) {
        zoomIn.addEventListener("click", () => {
          if (this.leafletMap) this.leafletMap.zoomIn();
        });
      }
      if (zoomOut) {
        zoomOut.addEventListener("click", () => {
          if (this.leafletMap) this.leafletMap.zoomOut();
        });
      }
      if (recenter) {
        recenter.addEventListener("click", () => {
          this.handleRecenterClick();
        });
      }

      // Botón refrescar
      const refreshBtn = document.getElementById("btn-refresh-map");
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
          this.renderMap();
          this.showToast("Mapa actualizado con los reportes en vivo.", "info");
        });
      }
    }

    updateCategoryChipCounts() {
      const all = this.store.getReports();
      const counts = {
        todos: all.length,
        seguridad: all.filter(r => r.category === "seguridad").length,
        iluminacion: all.filter(r => r.category === "iluminacion").length,
        terrenos: all.filter(r => r.category === "terrenos").length,
        infraestructura: all.filter(r => r.category === "infraestructura").length
      };

      for (const k in counts) {
        const el = document.getElementById("count-chip-" + k);
        if (el) el.textContent = counts[k];
      }
    }

    // =========================================================================
    // LISTA DE REPORTES
    // =========================================================================
    bindReports() {
      // Input de búsqueda en vivo
      const searchInput = document.getElementById("reports-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          this.store.state.searchQuery = e.target.value;
          this.store.persist();
          this.renderReportsList();
        });
      }

      // Botón + Nuevo Reporte en lista
      const listCreateBtn = document.getElementById("btn-list-create-report");
      if (listCreateBtn) {
        listCreateBtn.addEventListener("click", () => this.navigate("create"));
      }

      // Botón limpiar filtros
      const clearBtn = document.getElementById("btn-clear-filters");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          this.store.state.searchQuery = "";
          this.store.state.categoryFilter = "todos";
          this.store.persist();
          if (searchInput) searchInput.value = "";
          this.renderReportsList();
        });
      }
    }

    renderReportsList() {
      const container = document.getElementById("reports-stream-container");
      const emptyState = document.getElementById("reports-empty-state");
      const summaryCount = document.getElementById("reports-summary-count");
      const chipsRow = document.getElementById("reports-filter-chips");

      if (!container) return;

      // Renderizar chips de filtro sincronizados
      if (chipsRow) {
        const categories = [
          { id: "todos", label: "Todos" },
          { id: "seguridad", label: "🛡️ Seguridad" },
          { id: "iluminacion", label: "💡 Iluminación" },
          { id: "terrenos", label: "🌿 Terrenos" },
          { id: "infraestructura", label: "🚧 Vía Pública" }
        ];

        chipsRow.innerHTML = categories.map(c =>
          '<button class="filter-chip ' + (this.store.state.categoryFilter === c.id ? "active" : "") + '" data-filter="' + c.id + '">' +
            c.label +
          '</button>'
        ).join("");

        chipsRow.querySelectorAll(".filter-chip").forEach(btn => {
          btn.addEventListener("click", () => {
            const cat = btn.getAttribute("data-filter");
            this.store.state.categoryFilter = cat;
            this.store.persist();
            this.renderReportsList();
          });
        });
      }

      const filtered = this.store.getFilteredReports();

      if (summaryCount) {
        summaryCount.textContent = "Mostrando " + filtered.length + " reporte" + (filtered.length === 1 ? "" : "s") + " en la zona";
      }

      if (filtered.length === 0) {
        container.innerHTML = "";
        if (emptyState) emptyState.style.display = "flex";
        return;
      }

      if (emptyState) emptyState.style.display = "none";

      container.innerHTML = filtered.map(rep => {
        const statusInfo = this.store.getStatusInfo(rep.status);

        return (
          '<article class="incident-card" style="cursor:pointer;" onclick="window.app.navigate(&quot;detail&quot;, &quot;' + rep.id + '&quot;)">' +
            '<div class="card-header">' +
              '<div class="card-badges-group">' +
                '<span class="badge badge-info">' + rep.categoryLabel + '</span>' +
                '<span class="badge ' + statusInfo.badgeClass + '">' + statusInfo.label + '</span>' +
              '</div>' +
              '<span class="card-id">#' + rep.id + '</span>' +
            '</div>' +
            '<h3 class="card-title">' + rep.title + '</h3>' +
            '<p class="card-address">📍 ' + rep.address + '</p>' +
            '<p style="font-size:12px;color:#475569;margin:6px 0;line-height:1.4;">' +
              (rep.inReview ? "⚠️ <em>Contenido señalado para revisión de veracidad.</em>" : (rep.description.length > 90 ? rep.description.substring(0, 90) + "..." : rep.description)) +
            '</p>' +
            '<div class="card-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px;color:#64748b;">' +
              '<span>🕒 ' + rep.timestamp + '</span>' +
              '<span>👥 ' + rep.validationVotes.stillHappening + ' confirmaciones</span>' +
            '</div>' +
          '</article>'
        );
      }).join("");
    }

    // =========================================================================
    // DETALLE DE REPORTE
    // =========================================================================
    bindDetail() {
      const backToListBtn = document.getElementById("btn-back-to-list");
      if (backToListBtn) {
        backToListBtn.addEventListener("click", () => this.navigate("reports"));
      }

      // Votar vigencia: Sí
      const voteStillBtn = document.getElementById("btn-vote-still");
      if (voteStillBtn) {
        voteStillBtn.addEventListener("click", () => {
          if (!this.currentDetailId) return;
          const res = this.store.voteReport(this.currentDetailId, true);
          if (res.alreadyVoted) {
            this.showToast("Ya registraste tu validación sobre este reporte.", "warning");
          } else {
            this.showToast("¡Gracias! Tu confirmación fue registrada en tiempo real.", "success");
            this.renderDetail(this.currentDetailId);
          }
        });
      }

      // Votar vigencia: No
      const voteNotBtn = document.getElementById("btn-vote-not");
      if (voteNotBtn) {
        voteNotBtn.addEventListener("click", () => {
          if (!this.currentDetailId) return;
          const res = this.store.voteReport(this.currentDetailId, false);
          if (res.alreadyVoted) {
            this.showToast("Ya registraste tu validación sobre este reporte.", "warning");
          } else {
            this.showToast("Registraste que la situación ya no ocurre.", "info");
            this.renderDetail(this.currentDetailId);
          }
        });
      }

      // Abrir modal de denuncia
      const openFlagBtn = document.getElementById("btn-open-flag-modal");
      if (openFlagBtn) {
        openFlagBtn.addEventListener("click", () => {
          this.openFlagModal(this.currentDetailId);
        });
      }

      // Moderador: Validar
      const btnModValidate = document.getElementById("btn-mod-validate");
      if (btnModValidate) {
        btnModValidate.addEventListener("click", () => {
          const res = this.store.moderateReport(this.currentDetailId, "validado", "Validación oficial por moderador");
          if (res.success) {
            this.showToast("Reporte #" + this.currentDetailId + " validado y publicado oficialmente.", "success");
            this.renderDetail(this.currentDetailId);
            this.updateHeaderUser();
          } else {
            this.showToast(res.error, "error");
          }
        });
      }

      // Moderador: Marcar Resuelto
      const btnModResolve = document.getElementById("btn-mod-resolve");
      if (btnModResolve) {
        btnModResolve.addEventListener("click", () => {
          const res = this.store.moderateReport(this.currentDetailId, "resuelto", "Incidente marcado como solucionado");
          if (res.success) {
            this.showToast("Reporte #" + this.currentDetailId + " marcado como resuelto.", "success");
            this.renderDetail(this.currentDetailId);
            this.updateHeaderUser();
          } else {
            this.showToast(res.error, "error");
          }
        });
      }

      // Moderador: Rechazar
      const btnModReject = document.getElementById("btn-mod-reject");
      if (btnModReject) {
        btnModReject.addEventListener("click", () => {
          const res = this.store.moderateReport(this.currentDetailId, "rechazado", "Rechazado por moderador");
          if (res.success) {
            this.showToast("Reporte #" + this.currentDetailId + " rechazado.", "info");
            this.renderDetail(this.currentDetailId);
            this.updateHeaderUser();
          } else {
            this.showToast(res.error, "error");
          }
        });
      }

      // Moderador: Dar de Baja
      const btnModTakedown = document.getElementById("btn-mod-takedown");
      if (btnModTakedown) {
        btnModTakedown.addEventListener("click", () => {
          if (confirm("¿Confirmás dar de baja definitiva este reporte de la comunidad?")) {
            const res = this.store.moderateReport(this.currentDetailId, "dado_de_baja", "Dado de baja definitiva por violación de normas");
            if (res.success) {
              this.showToast("Reporte dado de baja y ocultado de la comunidad.", "info");
              this.navigate("reports");
              this.updateHeaderUser();
            } else {
              this.showToast(res.error, "error");
            }
          }
        });
      }

      // Desplegar descripción oculta por Content Shield
      const btnUnfold = document.getElementById("btn-unfold-description");
      if (btnUnfold) {
        btnUnfold.addEventListener("click", () => {
          const rep = this.store.getReportById(this.currentDetailId);
          const box = document.getElementById("unfolded-desc-box");
          if (rep && box) {
            box.style.display = "block";
            box.textContent = rep.description;
            btnUnfold.style.display = "none";
          }
        });
      }
    }

    openFlagModal(reportId) {
      const targetId = reportId || this.currentDetailId || this.store.state.selectedReportId || "REP-104";
      const rep = this.store.getReportById(targetId);
      this.flagTargetReportId = targetId;

      const flagModal = document.getElementById("modal-flag-report");
      const refEl = document.getElementById("flag-modal-report-ref");
      const notesEl = document.getElementById("flag-modal-notes");

      if (refEl) {
        refEl.textContent = "Reporte #" + targetId + (rep ? (" · " + rep.title) : "");
      }
      if (notesEl) {
        notesEl.value = "";
      }

      const firstRadio = document.querySelector('input[name="flag-reason"]');
      if (firstRadio) firstRadio.checked = true;

      if (flagModal) {
        flagModal.classList.add("active");
        flagModal.classList.add("open");
      }
    }

    renderDetail(reportId) {
      this.currentDetailId = reportId;
      const rep = this.store.getReportById(reportId);
      if (!rep) {
        this.navigate("reports");
        return;
      }

      const statusInfo = this.store.getStatusInfo(rep.status);
      const sevClass = (rep.severity === "alta" || rep.severity === "critica") ? "badge-danger" : (rep.severity === "media" ? "badge-warning" : "badge-neutral");

      const idEl = document.getElementById("detail-report-id");
      const titleEl = document.getElementById("detail-title");
      const addrEl = document.getElementById("detail-address-text");
      const timeEl = document.getElementById("detail-timestamp");
      const authEl = document.getElementById("detail-author");
      const statEl = document.getElementById("detail-status");
      const endEl = document.getElementById("detail-endorsements-count");
      const badgesEl = document.getElementById("detail-badges-group");

      if (idEl) idEl.textContent = "#" + rep.id;
      if (titleEl) titleEl.textContent = rep.title;
      if (addrEl) addrEl.textContent = rep.address;
      if (timeEl) timeEl.textContent = rep.timestamp + " (" + rep.fullDate + ")";
      if (authEl) authEl.textContent = rep.author;
      if (statEl) {
        statEl.textContent = statusInfo.label;
        statEl.style.color = statusInfo.key === "validado" ? "#16a34a" : (statusInfo.key === "en_revision" ? "#ea580c" : "#0f172a");
      }
      if (endEl) {
        const count = rep.endorsements || 0;
        endEl.textContent = count + " vecino" + (count === 1 ? "" : "s") + " confirmaron esta alerta";
      }

      if (badgesEl) {
        badgesEl.innerHTML =
          '<span class="badge badge-info">' + rep.categoryLabel + "</span>" +
          '<span class="badge ' + sevClass + '">' + rep.severityLabel + "</span>" +
          '<span class="badge ' + statusInfo.badgeClass + '">' + statusInfo.label + "</span>";
      }

      // Foto
      const photoWrapper = document.getElementById("detail-photo-wrapper");
      const photoImg = document.getElementById("detail-photo-img");
      if (photoWrapper && photoImg) {
        if (rep.photoUrl) {
          photoImg.src = rep.photoUrl;
          photoWrapper.style.display = "block";
        } else {
          photoWrapper.style.display = "none";
        }
      }

      // Descripción y Content Shield
      const descContainer = document.getElementById("detail-description-container");
      const descText = document.getElementById("detail-description-text");
      const shield = document.getElementById("detail-content-shield");
      const unfolded = document.getElementById("unfolded-desc-box");
      const btnUnfold = document.getElementById("btn-unfold-description");

      if (rep.inReview) {
        if (descContainer) descContainer.style.display = "none";
        if (shield) shield.style.display = "block";
        if (unfolded) {
          unfolded.style.display = "none";
          unfolded.textContent = "";
        }
        if (btnUnfold) btnUnfold.style.display = "inline-block";
      } else {
        if (descContainer) descContainer.style.display = "block";
        if (shield) shield.style.display = "none";
        if (descText) descText.textContent = rep.description;
      }

      // Validación comunitaria
      const tallyText = document.getElementById("validation-tally-text");
      const votedBlock = document.getElementById("validation-voted-block");
      const buttonsGrid = document.getElementById("validation-buttons-grid");

      if (tallyText) {
        tallyText.textContent = rep.validationVotes.stillHappening + " confirmaron vigencia · " + rep.validationVotes.notHappening + " indicaron resuelto";
      }

      const userKey = (this.store.currentUser ? this.store.currentUser.id : "guest") + "_" + rep.id;
      const hasVoted = Boolean(this.store.state.userVotes && this.store.state.userVotes[userKey]);

      if (votedBlock && buttonsGrid) {
        if (hasVoted) {
          votedBlock.style.display = "flex";
          buttonsGrid.style.display = "none";
        } else {
          votedBlock.style.display = "none";
          buttonsGrid.style.display = "flex";
        }
      }

      // Panel de moderador
      const modPanel = document.getElementById("moderator-terminal-panel");
      const modStatus = document.getElementById("mod-report-status");
      const modAuthor = document.getElementById("mod-author-info");
      const modAudit = document.getElementById("mod-audit-info");

      if (modPanel) {
        if (this.store.isModerator()) {
          modPanel.style.display = "block";
          if (modStatus) modStatus.textContent = statusInfo.label + (rep.inReview ? " (Bajo revisión preventiva)" : "");
          if (modAuthor) modAuthor.textContent = rep.author + " (ID: " + rep.authorId + ")";
          if (modAudit) {
            modAudit.textContent = rep.validatedBy ? ("Validado por " + rep.validatedBy + " el " + rep.validatedAt) : "Sin validación previa";
          }
        } else {
          modPanel.style.display = "none";
        }
      }

      // Mini mapa Leaflet
      this.renderDetailMiniMap(rep.lat, rep.lng, rep.title);
    }

    renderDetailMiniMap(lat, lng, title) {
      const container = document.getElementById("detail-mini-map");
      if (!container || typeof L === "undefined") return;

      if (this.miniMapInstance) {
        this.miniMapInstance.remove();
        this.miniMapInstance = null;
      }

      container.innerHTML = "";
      this.miniMapInstance = L.map("detail-mini-map", {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.miniMapInstance);

      L.marker([lat, lng]).addTo(this.miniMapInstance).bindPopup("<strong>" + title + "</strong>").openPopup();

      setTimeout(() => {
        if (this.miniMapInstance) this.miniMapInstance.invalidateSize();
      }, 250);
    }

    // =========================================================================
    // CREAR REPORTE
    // =========================================================================
    bindCreate() {
      // Input de título
      const titleInput = document.getElementById("create-title-input");
      if (titleInput) {
        titleInput.addEventListener("input", (e) => {
          this.store.saveDraft({ title: e.target.value });
          document.getElementById("error-create-title").style.display = "none";
        });
      }

      // Selector de categoría
      document.querySelectorAll("#create-category-grid .category-tile-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("#create-category-grid .category-tile-btn").forEach(b => {
            b.classList.remove("selected");
            b.setAttribute("aria-checked", "false");
          });
          btn.classList.add("selected");
          btn.setAttribute("aria-checked", "true");
          this.store.saveDraft({ category: btn.getAttribute("data-cat") });
        });
      });

      // Selector de gravedad
      document.querySelectorAll("#create-severity-group .severity-pill-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("#create-severity-group .severity-pill-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          this.store.saveDraft({ severity: btn.getAttribute("data-sev") });
        });
      });

      // Dirección
      const addrInput = document.getElementById("create-address-input");
      if (addrInput) {
        addrInput.addEventListener("input", (e) => {
          this.store.saveDraft({ address: e.target.value });
          document.getElementById("error-create-address").style.display = "none";
        });
      }

      // Botón usar mi GPS
      const gpsBtn = document.getElementById("btn-create-gps-loc");
      if (gpsBtn) {
        gpsBtn.addEventListener("click", () => {
          if (!("geolocation" in navigator)) {
            this.showToast("Geolocalización no disponible.", "warning");
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              this.store.saveDraft({ lat, lng, address: "Ubicación detectada por GPS (" + lat.toFixed(4) + ", " + lng.toFixed(4) + ")" });
              if (addrInput) addrInput.value = this.store.state.draft.address;
              const coordsPreview = document.getElementById("create-coords-preview");
              if (coordsPreview) coordsPreview.textContent = lat.toFixed(4) + ", " + lng.toFixed(4);
              this.updateCreatePickerMap(lat, lng);
              this.showToast("Ubicación GPS fijada en el formulario.", "success");
            },
            (err) => {
              this.showToast("No se pudo obtener el GPS: " + err.message, "error");
            }
          );
        });
      }

      // Descripción libre
      const descInput = document.getElementById("create-description-input");
      const charCounter = document.getElementById("create-char-counter");
      if (descInput) {
        descInput.addEventListener("input", (e) => {
          const val = e.target.value;
          if (charCounter) charCounter.textContent = val.length + " caracteres";
          this.store.saveDraft({ description: val });
          document.getElementById("error-create-desc").style.display = "none";
        });
      }

      // Adjuntar foto (FileReader a base64)
      const photoInput = document.getElementById("create-photo-input");
      const photoBox = document.getElementById("create-photo-preview-box");
      const photoImg = document.getElementById("create-photo-preview-img");
      const removePhotoBtn = document.getElementById("btn-remove-photo");

      if (photoInput) {
        photoInput.addEventListener("change", (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              const base64 = evt.target.result;
              this.store.saveDraft({ photoUrl: base64 });
              if (photoImg) photoImg.src = base64;
              if (photoBox) photoBox.style.display = "block";
            };
            reader.readAsDataURL(file);
          }
        });
      }

      if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", () => {
          this.store.saveDraft({ photoUrl: null });
          if (photoInput) photoInput.value = "";
          if (photoBox) photoBox.style.display = "none";
        });
      }

      // Checkbox anónimo
      const anonCheck = document.getElementById("create-anon-checkbox");
      if (anonCheck) {
        anonCheck.addEventListener("change", (e) => {
          this.store.saveDraft({ isAnonymous: e.target.checked });
        });
      }

      // Cancelar
      const cancelBtn = document.getElementById("btn-cancel-create");
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (confirm("¿Deseás salir? El borrador se conservará guardado.")) {
            this.navigate("reports");
          }
        });
      }

      // Submit
      const submitBtn = document.getElementById("btn-submit-create");
      if (submitBtn) {
        submitBtn.addEventListener("click", () => {
          this.handleCreateSubmit();
        });
      }
    }

    renderCreateForm() {
      const draft = this.store.state.draft;

      const titleInput = document.getElementById("create-title-input");
      const descInput = document.getElementById("create-description-input");
      const addrInput = document.getElementById("create-address-input");
      const charCounter = document.getElementById("create-char-counter");
      const anonCheck = document.getElementById("create-anon-checkbox");
      const coordsPreview = document.getElementById("create-coords-preview");

      if (titleInput) titleInput.value = draft.title || "";
      if (descInput) {
        descInput.value = draft.description || "";
        if (charCounter) charCounter.textContent = (draft.description || "").length + " caracteres";
      }
      if (addrInput) addrInput.value = draft.address || "";
      if (anonCheck) anonCheck.checked = Boolean(draft.isAnonymous);
      if (coordsPreview) coordsPreview.textContent = Number(draft.lat || BASE_LAT).toFixed(4) + ", " + Number(draft.lng || BASE_LNG).toFixed(4);

      // Activar chips
      if (draft.category) {
        document.querySelectorAll("#create-category-grid .category-tile-btn").forEach(b => {
          const isMatch = b.getAttribute("data-cat") === draft.category;
          b.classList.toggle("selected", isMatch);
          b.setAttribute("aria-checked", isMatch ? "true" : "false");
        });
      }
      if (draft.severity) {
        document.querySelectorAll("#create-severity-group .severity-pill-btn").forEach(b => {
          b.classList.toggle("selected", b.getAttribute("data-sev") === draft.severity);
        });
      }

      // Foto preview
      const photoBox = document.getElementById("create-photo-preview-box");
      const photoImg = document.getElementById("create-photo-preview-img");
      if (photoBox && photoImg) {
        if (draft.photoUrl) {
          photoImg.src = draft.photoUrl;
          photoBox.style.display = "block";
        } else {
          photoBox.style.display = "none";
        }
      }

      // Mini mapa picker
      this.initCreatePickerMap(draft.lat || BASE_LAT, draft.lng || BASE_LNG);
    }

    initCreatePickerMap(lat, lng) {
      const container = document.getElementById("create-map-picker");
      if (!container || typeof L === "undefined") return;

      if (this.createPickerMap) {
        this.createPickerMap.remove();
        this.createPickerMap = null;
      }

      container.innerHTML = "";
      this.createPickerMap = L.map("create-map-picker", {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.createPickerMap);

      let pickerMarker = L.marker([lat, lng], { draggable: true }).addTo(this.createPickerMap);

      const updateCoords = (newLat, newLng) => {
        this.store.saveDraft({ lat: newLat, lng: newLng });
        const coordsPreview = document.getElementById("create-coords-preview");
        if (coordsPreview) coordsPreview.textContent = newLat.toFixed(4) + ", " + newLng.toFixed(4);
      };

      pickerMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        updateCoords(pos.lat, pos.lng);
      });

      this.createPickerMap.on("click", (e) => {
        pickerMarker.setLatLng(e.latlng);
        updateCoords(e.latlng.lat, e.latlng.lng);
      });

      setTimeout(() => {
        if (this.createPickerMap) this.createPickerMap.invalidateSize();
      }, 250);
    }

    updateCreatePickerMap(lat, lng) {
      if (this.createPickerMap) {
        this.createPickerMap.setView([lat, lng], 16);
      } else {
        this.initCreatePickerMap(lat, lng);
      }
    }

    handleCreateSubmit() {
      const titleInput = document.getElementById("create-title-input");
      const descInput = document.getElementById("create-description-input");
      const addrInput = document.getElementById("create-address-input");
      const anonCheck = document.getElementById("create-anon-checkbox");

      const title = (titleInput ? titleInput.value : "").trim();
      const description = (descInput ? descInput.value : "").trim();
      const address = (addrInput ? addrInput.value : "").trim();
      const isAnonymous = Boolean(anonCheck && anonCheck.checked);

      let hasError = false;

      // Validación de título
      if (!title || title.length < 5) {
        document.getElementById("error-create-title").style.display = "block";
        hasError = true;
      } else {
        document.getElementById("error-create-title").style.display = "none";
      }

      // Validación de descripción
      if (!description || description.length < 10) {
        document.getElementById("error-create-desc").style.display = "block";
        hasError = true;
      } else {
        document.getElementById("error-create-desc").style.display = "none";
      }

      // Validación de dirección
      if (!address || address.length < 3) {
        document.getElementById("error-create-address").style.display = "block";
        hasError = true;
      } else {
        document.getElementById("error-create-address").style.display = "none";
      }

      if (hasError) {
        this.showToast("Por favor completá los campos obligatorios del formulario.", "error");
        return;
      }

      // Actualizar borrador con los valores exactos
      this.store.saveDraft({
        title,
        description,
        address,
        isAnonymous
      });

      // Si no tiene sesión iniciada, abrir modal de autenticación contextual
      if (!this.store.isLoggedIn()) {
        this.openAuthModal();
        return;
      }

      // Publicación directa
      this.finishReportPublication();
    }

    finishReportPublication() {
      if (this.isPublishingReport) {
        return;
      }
      this.isPublishingReport = true;

      const submitBtn = document.getElementById("create-submit-btn");
      if (submitBtn) submitBtn.disabled = true;

      try {
        const newRep = this.store.addReport(this.store.state.draft);
        this.showToast("¡Reporte #" + newRep.id + " guardado y publicado con éxito!", "success");

        // Limpiar campos visuales del formulario
        const titleInput = document.getElementById("create-title-input");
        const descInput = document.getElementById("create-description-input");
        const addrInput = document.getElementById("create-address-input");
        const photoBox = document.getElementById("create-photo-preview-box");
        const photoImg = document.getElementById("create-photo-preview-img");
        const photoFile = document.getElementById("create-photo-input");

        if (titleInput) titleInput.value = "";
        if (descInput) descInput.value = "";
        if (addrInput) addrInput.value = "";
        if (photoBox) photoBox.style.display = "none";
        if (photoImg) photoImg.src = "";
        if (photoFile) photoFile.value = "";

        this.navigate("detail", newRep.id);
      } catch (err) {
        console.error("Error al publicar reporte:", err);
        this.showToast("Ocurrió un error al publicar el reporte.", "error");
      } finally {
        setTimeout(() => {
          this.isPublishingReport = false;
          if (submitBtn) submitBtn.disabled = false;
        }, 1000);
      }
    }

    openAuthModal() {
      const authModal = document.getElementById("modal-contextual-auth");
      if (!authModal) return;

      this.selectedAuthAccount = null;

      // Restablecer vistas del modal
      const mainView = document.getElementById("auth-view-main");
      const selectedView = document.getElementById("auth-view-selected-account");
      if (mainView) mainView.style.display = "block";
      if (selectedView) selectedView.style.display = "none";

      // Limpiar errores e inputs principales
      const emailInput = document.getElementById("auth-modal-email");
      const passwordInput = document.getElementById("auth-modal-password");
      const errorMsg = document.getElementById("auth-modal-error");
      const submitBtn = document.getElementById("btn-modal-login-submit");
      const spinner = document.getElementById("btn-modal-login-spinner");
      const label = document.getElementById("btn-modal-login-label");
      const togglePass = document.getElementById("btn-toggle-modal-password");

      if (errorMsg) {
        errorMsg.style.display = "none";
        errorMsg.textContent = "";
      }
      if (emailInput) emailInput.value = "";
      if (passwordInput) {
        passwordInput.value = "";
        passwordInput.type = "password";
      }
      if (togglePass) {
        togglePass.textContent = "👁️";
        togglePass.setAttribute("aria-label", "Mostrar contraseña");
      }
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = "none";
      if (label) {
        label.style.display = "inline";
        label.textContent = "Iniciar sesión y publicar";
      }

      // Limpiar inputs de cuenta seleccionada
      const selPassInput = document.getElementById("selected-account-password");
      const selErrorMsg = document.getElementById("selected-account-error");
      const selSubmitBtn = document.getElementById("btn-selected-account-submit");
      const selSpinner = document.getElementById("btn-selected-account-spinner");
      const selLabel = document.getElementById("btn-selected-account-label");
      const selTogglePass = document.getElementById("btn-toggle-selected-password");

      if (selErrorMsg) {
        selErrorMsg.style.display = "none";
        selErrorMsg.textContent = "";
      }
      if (selPassInput) {
        selPassInput.value = "";
        selPassInput.type = "password";
      }
      if (selTogglePass) {
        selTogglePass.textContent = "👁️";
        togglePass && togglePass.setAttribute("aria-label", "Mostrar contraseña");
      }
      if (selSubmitBtn) selSubmitBtn.disabled = false;
      if (selSpinner) selSpinner.style.display = "none";
      if (selLabel) {
        selLabel.style.display = "inline";
        selLabel.textContent = "Iniciar sesión y publicar";
      }

      this.renderRememberedAccounts();

      authModal.classList.add("active");
    }

    renderRememberedAccounts() {
      const section = document.getElementById("remembered-accounts-section");
      const listEl = document.getElementById("remembered-accounts-list");
      const divider = document.getElementById("auth-other-account-divider");
      if (!section || !listEl) return;

      const accounts = this.store.getRememberedAccounts();
      if (!accounts || accounts.length === 0) {
        section.style.display = "none";
        if (divider) divider.style.display = "none";
        listEl.innerHTML = "";
        return;
      }

      section.style.display = "block";
      if (divider) divider.style.display = "flex";
      listEl.innerHTML = accounts.map(acc => {
        const initials = (acc.name || "Vecino")
          .split(" ")
          .map(p => p[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();

        const isMod = acc.role === "moderador";

        return (
          '<div class="remembered-account-card" data-email="' + acc.email + '" role="button" tabindex="0">' +
            '<div class="remembered-account-info">' +
              '<div class="remembered-avatar' + (isMod ? ' mod' : '') + '">' + initials + '</div>' +
              '<div class="remembered-text">' +
                '<div class="remembered-name-row">' +
                  '<span class="remembered-name">' + acc.name + '</span>' +
                  (isMod ? '<span class="badge badge-warning" style="font-size:10px; padding:1px 6px;">Moderador</span>' : '') +
                '</div>' +
                '<div class="remembered-email">' + acc.email + ' · ' + (acc.barrio || "Comuna 14") + '</div>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="btn-remove-remembered" data-remove-email="' + acc.email + '" aria-label="Eliminar ' + acc.name + ' de cuentas recordadas" title="Quitar de este dispositivo">' +
              '✕' +
            '</button>' +
          '</div>'
        );
      }).join("");

      // Clic en cuenta recordada
      const cards = listEl.querySelectorAll(".remembered-account-card");
      cards.forEach(card => {
        const email = card.getAttribute("data-email");
        card.addEventListener("click", (e) => {
          if (e.target.closest(".btn-remove-remembered")) return;

          const targetAcc = accounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || {
            name: card.querySelector(".remembered-name") ? card.querySelector(".remembered-name").textContent : "Vecino",
            email: email,
            barrio: "Comuna 14",
            role: "vecino"
          };

          // 3 & 4. Comprobar si existe sesión activa válida para esa cuenta
          if (this.store.isLoggedIn() && this.store.currentUser.email.toLowerCase() === email.toLowerCase()) {
            const authModal = document.getElementById("modal-contextual-auth");
            if (authModal) authModal.classList.remove("active");
            this.showToast("Sesión continuada como " + this.store.currentUser.name, "success");
            this.finishReportPublication();
            return;
          }

          // 5. Si la sesión expiró o fue cerrada, mostrar el formulario para la cuenta seleccionada
          this.showSelectedAccountAuth(targetAcc);
        });
      });

      // Eliminar cuenta de recordadas
      const removeBtns = listEl.querySelectorAll(".btn-remove-remembered");
      removeBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const email = btn.getAttribute("data-remove-email");
          this.store.removeRememberedAccount(email);
          this.renderRememberedAccounts();
          this.showToast("Cuenta eliminada de este dispositivo", "info");
        });
      });
    }

    showSelectedAccountAuth(account) {
      this.selectedAuthAccount = account;

      const mainView = document.getElementById("auth-view-main");
      const selectedView = document.getElementById("auth-view-selected-account");
      if (!mainView || !selectedView) return;

      const avatarEl = document.getElementById("selected-account-avatar");
      const nameEl = document.getElementById("selected-account-name");
      const emailEl = document.getElementById("selected-account-email");
      const badgeEl = document.getElementById("selected-account-role-badge");
      const passInput = document.getElementById("selected-account-password");
      const errorMsg = document.getElementById("selected-account-error");
      const submitBtn = document.getElementById("btn-selected-account-submit");
      const spinner = document.getElementById("btn-selected-account-spinner");
      const label = document.getElementById("btn-selected-account-label");
      const togglePass = document.getElementById("btn-toggle-selected-password");

      // Rellenar datos de la cuenta seleccionada
      const initials = (account.name || "Vecino")
        .split(" ")
        .map(p => p[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      if (avatarEl) {
        avatarEl.textContent = initials;
        if (account.role === "moderador") {
          avatarEl.classList.add("mod");
        } else {
          avatarEl.classList.remove("mod");
        }
      }
      if (nameEl) nameEl.textContent = account.name || "Vecino";
      if (emailEl) emailEl.textContent = account.email + " · " + (account.barrio || "Comuna 14");
      if (badgeEl) {
        if (account.role === "moderador") {
          badgeEl.innerHTML = '<span class="badge badge-warning" style="font-size:10px; padding:1px 6px;">Moderador</span>';
        } else {
          badgeEl.innerHTML = "";
        }
      }

      // Restablecer estados de contraseña y error
      if (errorMsg) {
        errorMsg.style.display = "none";
        errorMsg.textContent = "";
      }
      if (passInput) {
        passInput.value = "";
        passInput.type = "password";
      }
      if (togglePass) {
        togglePass.textContent = "👁️";
        togglePass.setAttribute("aria-label", "Mostrar contraseña");
      }
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = "none";
      if (label) {
        label.style.display = "inline";
        label.textContent = "Iniciar sesión y publicar";
      }

      // Cambiar a vista de cuenta seleccionada
      mainView.style.display = "none";
      selectedView.style.display = "block";

      setTimeout(() => {
        if (passInput) passInput.focus();
      }, 100);
    }

    // =========================================================================
    // MODERACIÓN
    // =========================================================================
    bindModeration() {
      // Acciones vinculadas en cola y detalle
    }

    renderModerationDashboard() {
      if (!this.store.isModerator()) {
        this.navigate("map");
        this.showToast("Sección restringida para rol de Moderador.", "error");
        return;
      }

      const all = this.store.state.reports;
      const inReview = all.filter(r => r.inReview || r.status === "en_revision");
      const pending = all.filter(r => r.status === "pendiente");
      const validated = all.filter(r => r.status === "validado");

      const kpiRev = document.getElementById("mod-kpi-review");
      const kpiPen = document.getElementById("mod-kpi-pending");
      const kpiVal = document.getElementById("mod-kpi-validated");

      if (kpiRev) kpiRev.textContent = inReview.length;
      if (kpiPen) kpiPen.textContent = pending.length;
      if (kpiVal) kpiVal.textContent = validated.length;

      // Cola de reportes
      const queueContainer = document.getElementById("mod-reports-queue");
      if (queueContainer) {
        const queueList = [...inReview, ...pending.filter(p => !inReview.includes(p))];
        if (queueList.length === 0) {
          queueContainer.innerHTML = '<div style="font-size:12px;color:#64748b;padding:8px;">✓ No hay reportes pendientes de moderación en este momento.</div>';
        } else {
          queueContainer.innerHTML = queueList.map(rep => (
            '<div class="mod-queue-item">' +
              '<div class="mod-queue-item-header">' +
                '<strong style="font-size:13px;color:#0f172a;">#' + rep.id + " · " + rep.title + "</strong>" +
                '<span class="badge ' + (rep.inReview ? "badge-warning" : "badge-info") + '">' + (rep.inReview ? "⚠️ En revisión" : "Pendiente") + "</span>" +
              "</div>" +
              '<div style="font-size:11px;color:#64748b;">📍 ' + rep.address + " · Autor: " + rep.author + "</div>" +
              (rep.reviewReason ? '<div style="font-size:11px;color:#b45309;background:#fef3c7;padding:4px 6px;border-radius:4px;">Causa señalada: ' + rep.reviewReason + "</div>" : "") +
              '<div class="mod-queue-actions">' +
                '<button onclick="window.app.navigate(&quot;detail&quot;, &quot;' + rep.id + '&quot;)" class="btn btn-sm btn-outline" style="flex:1;">Ver detalle</button>' +
                '<button onclick="window.app.quickValidate(&quot;' + rep.id + '&quot;)" class="btn btn-sm btn-emerald" style="flex:1;">✓ Validar</button>' +
                '<button onclick="window.app.quickReject(&quot;' + rep.id + '&quot;)" class="btn btn-sm btn-secondary" style="flex:1;">✕ Rechazar</button>' +
              "</div>" +
            "</div>"
          )).join("");
        }
      }

      // Registro de auditoría
      const auditList = document.getElementById("mod-audit-log-list");
      if (auditList) {
        const audits = this.store.state.moderationAudit || [];
        if (audits.length === 0) {
          auditList.innerHTML = '<div style="color:#64748b;padding:4px;">Sin registros de auditoría recientes.</div>';
        } else {
          auditList.innerHTML = audits.map(a => (
            '<div class="mod-audit-item">' +
              '<strong>' + a.moderatorName + '</strong> marcó #' + a.reportId + ' como <em>' + this.store.getStatusInfo(a.action).label + '</em> · ' +
              '<span style="color:#64748b;">' + a.date + '</span><br>' +
              '<span style="color:#475569;">Nota: ' + a.notes + '</span>' +
            '</div>'
          )).join("");
        }
      }
    }

    quickValidate(reportId) {
      const res = this.store.moderateReport(reportId, "validado", "Validación rápida desde panel");
      if (res.success) {
        this.showToast("Reporte #" + reportId + " validado con éxito.", "success");
        this.renderModerationDashboard();
        this.updateHeaderUser();
      }
    }

    quickReject(reportId) {
      const res = this.store.moderateReport(reportId, "rechazado", "Rechazado desde panel");
      if (res.success) {
        this.showToast("Reporte #" + reportId + " rechazado.", "info");
        this.renderModerationDashboard();
        this.updateHeaderUser();
      }
    }

    // =========================================================================
    // ASISTENCIA Y PUNTOS SEGUROS
    // =========================================================================
    bindEmergency() {
      const holdBtn = document.getElementById("btn-emergency-hold");
      const ringFg = document.getElementById("emergency-ring-fg");
      const ringText = document.getElementById("emergency-ring-text");
      const fillBar = document.getElementById("emergency-progress-fill");

      const duration = 3000;
      const circ = 2 * Math.PI * 16; // 100.53
      if (ringFg) {
        ringFg.style.strokeDasharray = circ;
        ringFg.style.strokeDashoffset = circ;
      }

      const resetHold = () => {
        if (this.emergencyTimer) {
          clearInterval(this.emergencyTimer);
          this.emergencyTimer = null;
        }
        if (ringFg) ringFg.style.strokeDashoffset = circ;
        if (ringText) ringText.textContent = "3s";
        if (fillBar) fillBar.style.width = "0%";
        if (holdBtn) holdBtn.classList.remove("holding");
      };

      const startHold = (e) => {
        if (e && e.type === "touchstart") e.preventDefault();
        resetHold();

        const startTime = Date.now();
        if (holdBtn) holdBtn.classList.add("holding");

        this.emergencyTimer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1.0);
          const remainingSec = Math.max(Math.ceil((duration - elapsed) / 1000), 1);

          if (ringFg) ringFg.style.strokeDashoffset = circ * (1 - progress);
          if (fillBar) fillBar.style.width = (progress * 100) + "%";
          if (ringText) ringText.textContent = remainingSec + "s";

          if (progress >= 1.0) {
            resetHold();
            this.navigate("call");
          }
        }, 50);
      };

      if (holdBtn) {
        holdBtn.addEventListener("mousedown", startHold);
        holdBtn.addEventListener("mouseup", resetHold);
        holdBtn.addEventListener("mouseleave", resetHold);
        holdBtn.addEventListener("touchstart", startHold, { passive: false });
        holdBtn.addEventListener("touchend", resetHold);
        holdBtn.addEventListener("touchcancel", resetHold);
        holdBtn.addEventListener("keydown", (e) => {
          if ((e.key === "Enter" || e.key === " ") && !this.emergencyTimer) {
            e.preventDefault();
            startHold(e);
          }
        });
        holdBtn.addEventListener("keyup", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            resetHold();
          }
        });
      }

      // Filtros por categoría en Central de Asistencia
      const filterChips = document.querySelectorAll("#view-emergency [data-assistance-filter]");
      filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
          filterChips.forEach(c => {
            c.classList.remove("active");
            c.setAttribute("aria-selected", "false");
          });
          chip.classList.add("active");
          chip.setAttribute("aria-selected", "true");

          this.activeAssistanceCategory = chip.getAttribute("data-assistance-filter") || "todos";
          this.renderSafePointsList();
          this.updateEmergencyMapMarkers();
        });
      });

      // Botón flotante de reciente centrado en mapa de emergencia
      const emergencyRecenter = document.getElementById("btn-emergency-recenter");
      if (emergencyRecenter) {
        emergencyRecenter.addEventListener("click", () => {
          this.handleRecenterClick();
        });
      }
    }

    // =========================================================================
    // LLAMADA DE EMERGENCIA (SIMULACIÓN VISUAL)
    // =========================================================================
    bindCall() {
      const endBtn = document.getElementById("btn-end-call");
      if (endBtn) {
        endBtn.addEventListener("click", () => {
          this.endCall();
        });
      }

      const muteBtn = document.getElementById("btn-call-mute");
      if (muteBtn) {
        muteBtn.addEventListener("click", () => {
          const isActive = muteBtn.classList.toggle("active");
          const label = document.getElementById("call-mute-label");
          if (label) label.textContent = isActive ? "Silenciado" : "Silenciar";
        });
      }

      const speakerBtn = document.getElementById("btn-call-speaker");
      if (speakerBtn) {
        speakerBtn.addEventListener("click", () => {
          const isActive = speakerBtn.classList.toggle("active");
          const label = document.getElementById("call-speaker-label");
          if (label) label.textContent = isActive ? "Altavoz act." : "Altavoz";
        });
      }

      const keypadBtn = document.getElementById("btn-call-keypad");
      if (keypadBtn) {
        keypadBtn.addEventListener("click", () => {
          keypadBtn.classList.toggle("active");
        });
      }
    }

    renderCallView() {
      // Detener cualquier temporizador activo previo
      this.stopCallTimer();

      const timerEl = document.getElementById("call-active-timer");
      if (timerEl) {
        timerEl.textContent = "00:00";
      }

      // Restablecer estados de botones secundarios
      const muteBtn = document.getElementById("btn-call-mute");
      if (muteBtn) {
        muteBtn.classList.remove("active");
        const label = document.getElementById("call-mute-label");
        if (label) label.textContent = "Silenciar";
      }

      const speakerBtn = document.getElementById("btn-call-speaker");
      if (speakerBtn) {
        speakerBtn.classList.remove("active");
        const label = document.getElementById("call-speaker-label");
        if (label) label.textContent = "Altavoz";
      }

      const keypadBtn = document.getElementById("btn-call-keypad");
      if (keypadBtn) {
        keypadBtn.classList.remove("active");
      }

      // Iniciar el temporizador de la llamada
      this.callDuration = 0;
      this.callInterval = setInterval(() => {
        this.callDuration += 1;
        if (timerEl) {
          const mins = String(Math.floor(this.callDuration / 60)).padStart(2, "0");
          const secs = String(this.callDuration % 60).padStart(2, "0");
          timerEl.textContent = mins + ":" + secs;
        }
      }, 1000);
    }

    stopCallTimer() {
      if (this.callInterval) {
        clearInterval(this.callInterval);
        this.callInterval = null;
      }
      this.callDuration = 0;
    }

    endCall() {
      // 1. Detener y limpiar temporizador
      this.stopCallTimer();

      // 2. Redirigir automáticamente a la sección de Asistencia (donde se muestran los lugares seguros)
      this.navigate("emergency");
      this.showToast("Llamada finalizada. Se desplegaron los puntos seguros en tu zona.", "info");
    }

    getFilteredSafePoints() {
      let points = [...this.store.state.safePoints];
      if (this.activeAssistanceCategory && this.activeAssistanceCategory !== "todos") {
        points = points.filter(sp => sp.categoryKey === this.activeAssistanceCategory);
      }

      // Referencia de distancia: ubicación GPS del usuario o centro de Río Cuarto
      const refLat = this.store.state.userLocation ? this.store.state.userLocation.lat : BASE_LAT;
      const refLng = this.store.state.userLocation ? this.store.state.userLocation.lng : BASE_LNG;

      points.forEach(sp => {
        sp._distanceMeters = this.calculateDistance(refLat, refLng, sp.lat, sp.lng);
      });

      // Ordenar por proximidad ascendente
      points.sort((a, b) => a._distanceMeters - b._distanceMeters);
      return points;
    }

    renderEmergencyView() {
      // 1. Renderizar lista filtrada y ordenada por proximidad
      this.renderSafePointsList();

      // 2. Inicializar mapa interactivo de Puntos Seguros
      this.initEmergencySafeMap();
    }

    renderSafePointsList() {
      const listContainer = document.getElementById("safe-points-list");
      const countEl = document.getElementById("safe-points-count");
      if (!listContainer) return;

      const points = this.getFilteredSafePoints();
      if (countEl) {
        countEl.textContent = points.length + (points.length === 1 ? " Punto" : " Puntos");
      }

      if (points.length === 0) {
        listContainer.innerHTML =
          '<div style="text-align:center; padding:16px; color:#64748b; font-size:13px;">' +
            'No hay instituciones en esta categoría.' +
          '</div>';
        return;
      }

      const hasGps = !!this.store.state.userLocation;

      listContainer.innerHTML = points.map(sp => {
        const distText = hasGps
          ? "a " + this.formatDistance(sp._distanceMeters) + " de vos"
          : "a " + this.formatDistance(sp._distanceMeters) + " del centro";

        const badgeHtml = sp.isSafeZone
          ? '<span class="badge" style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700;">🛡️ Zona Segura</span>'
          : '<span class="badge" style="background:#f1f5f9; color:#475569; font-size:10px; font-weight:700;">' + sp.icon + " " + sp.categoryLabel.split(" ")[0] + '</span>';

        const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=" + sp.lat + "," + sp.lng;

        return (
          '<div class="safe-point-card" data-id="' + sp.id + '">' +
            '<div class="safe-point-card-header">' +
              '<div class="safe-point-info">' +
                '<div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">' +
                  badgeHtml +
                  '<span style="font-size:11px; color:#64748b; font-weight:600;">📍 ' + distText + '</span>' +
                '</div>' +
                '<h4 class="safe-point-name" style="margin:2px 0;">' + sp.name + '</h4>' +
                '<span class="safe-point-address">📍 ' + sp.address + '</span>' +
                '<span style="font-size:11px; color:#64748b;">⏰ ' + sp.hours + ' · 📞 ' + sp.phone + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="safe-point-card-actions">' +
              '<button type="button" class="btn btn-sm btn-outline btn-locate-sp" data-id="' + sp.id + '" style="font-size:11px; padding:4px 8px;">Ver en mapa ⌖</button>' +
              '<a href="' + directionsUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size:11px; padding:4px 8px;">🧭 Cómo llegar</a>' +
              '<a href="' + sp.telLink + '" class="btn btn-sm btn-emerald" style="font-size:11px; padding:4px 10px; font-weight:700;">📞 Llamar</a>' +
            '</div>' +
          '</div>'
        );
      }).join("");

      listContainer.querySelectorAll(".btn-locate-sp").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-id");
          this.focusSafePoint(id);
        });
      });

      listContainer.querySelectorAll(".safe-point-card").forEach(card => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("a") || e.target.closest("button")) return;
          const id = card.getAttribute("data-id");
          this.focusSafePoint(id);
        });
      });
    }

    focusSafePoint(id) {
      const sp = this.store.state.safePoints.find(p => p.id === id);
      if (sp && this.emergencyMap) {
        this._isProgrammaticPan = true;
        this.emergencyMap.setView([sp.lat, sp.lng], 16, { animate: true });
        setTimeout(() => { this._isProgrammaticPan = false; }, 400);

        const marker = this.safePointMarkersMap[id];
        if (marker) {
          marker.openPopup();
        }

        const mapContainer = document.getElementById("emergency-safe-map");
        if (mapContainer) {
          mapContainer.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }

    initEmergencySafeMap() {
      const container = document.getElementById("emergency-safe-map");
      if (!container || typeof L === "undefined") return;

      if (this.emergencyMap) {
        this.emergencyMap.remove();
        this.emergencyMap = null;
      }

      container.innerHTML = "";
      this.safePointMarkersMap = {};
      this.emergencySafeAreas = [];
      this.emergencyUserMarker = null;
      this.emergencyAccuracyCircle = null;

      this.emergencyMap = L.map("emergency-safe-map", {
        center: [BASE_LAT, BASE_LNG],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.emergencyMap);

      // Comportamiento inteligente: si el usuario mueve o arrastra el mapa, pausar auto-seguimiento
      this.emergencyMap.on("movestart", () => {
        if (!this._isProgrammaticPan) {
          this.autoFollowUser = false;
          this.updateRecenterBtnState();
        }
      });
      this.emergencyMap.on("dragstart", () => {
        this.autoFollowUser = false;
        this.updateRecenterBtnState();
      });

      // Renderizar marcadores categorizados y áreas verdes seguras
      this.updateEmergencyMapMarkers();

      // Renderizar ubicación del usuario si está disponible
      if (this.store.state.userLocation) {
        this.updateEmergencyUserMarker(
          this.store.state.userLocation.lat,
          this.store.state.userLocation.lng,
          this.store.state.userLocation.accuracy
        );
      }

      setTimeout(() => {
        if (this.emergencyMap) this.emergencyMap.invalidateSize();
      }, 250);
    }

    updateEmergencyMapMarkers() {
      if (!this.emergencyMap) return;

      // Limpiar marcadores y áreas anteriores
      for (const id in this.safePointMarkersMap) {
        this.emergencyMap.removeLayer(this.safePointMarkersMap[id]);
      }
      this.safePointMarkersMap = {};

      this.emergencySafeAreas.forEach(area => this.emergencyMap.removeLayer(area));
      this.emergencySafeAreas = [];

      const points = this.getFilteredSafePoints();

      points.forEach(sp => {
        const popupHtml = this.createSafePointPopupHtml(sp);

        // 1. Área verde representativa ÚNICAMENTE para puntos seguros verificados (isSafeZone === true)
        if (sp.isSafeZone) {
          const deltaLat = 0.0008;
          const deltaLng = 0.0011;
          const bounds = [
            [sp.lat - deltaLat, sp.lng - deltaLng],
            [sp.lat + deltaLat, sp.lng + deltaLng]
          ];

          const safeArea = L.rectangle(bounds, {
            color: "#16a34a",
            weight: 2,
            fillColor: "#22c55e",
            fillOpacity: 0.18,
            dashArray: "4, 4"
          }).addTo(this.emergencyMap);

          safeArea.bindPopup(popupHtml);
          safeArea.on("click", () => marker.openPopup());
          this.emergencySafeAreas.push(safeArea);
        }

        // 2. Marcador categorizado con ícono y color oficial
        const safeIcon = this.createSafePointMarkerIcon(sp);
        const marker = L.marker([sp.lat, sp.lng], { icon: safeIcon }).addTo(this.emergencyMap);
        marker.bindPopup(popupHtml);

        this.safePointMarkersMap[sp.id] = marker;
      });
    }

    // =========================================================================
    // PERFIL Y AUTENTICACIÓN
    // =========================================================================
    bindProfile() {
      // Toggle tabs Login vs Register
      const tabLogin = document.getElementById("tab-auth-login");
      const tabReg = document.getElementById("tab-auth-register");
      const formLogin = document.getElementById("form-login");
      const formRegister = document.getElementById("form-register");

      if (tabLogin && tabReg && formLogin && formRegister) {
        tabLogin.addEventListener("click", () => {
          tabLogin.classList.add("active");
          tabReg.classList.remove("active");
          formLogin.style.display = "flex";
          formRegister.style.display = "none";
        });

        tabReg.addEventListener("click", () => {
          tabReg.classList.add("active");
          tabLogin.classList.remove("active");
          formLogin.style.display = "none";
          formRegister.style.display = "flex";
        });
      }

      // Formulario de login
      if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
          e.preventDefault();
          const email = document.getElementById("login-email").value;
          const pass = document.getElementById("login-password").value;
          const errorMsg = document.getElementById("login-error-msg");

          const res = this.store.login(email, pass);
          if (res.success) {
            if (errorMsg) errorMsg.style.display = "none";
            this.showToast("Sesión iniciada como " + res.user.name + " (" + res.user.role + ").", "success");
            this.renderProfile();
            this.updateHeaderUser();
          } else {
            if (errorMsg) {
              errorMsg.textContent = res.error;
              errorMsg.style.display = "block";
            }
          }
        });
      }

      // Formulario de registro
      if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.getElementById("reg-name").value;
          const email = document.getElementById("reg-email").value;
          const barrio = document.getElementById("reg-barrio").value;
          const pass = document.getElementById("reg-password").value;
          const errorMsg = document.getElementById("register-error-msg");

          const res = this.store.register({ name, email, barrio, password: pass });
          if (res.success) {
            if (errorMsg) errorMsg.style.display = "none";
            this.showToast("¡Cuenta creada con éxito! Bienvenido, " + res.user.name + ".", "success");
            this.renderProfile();
            this.updateHeaderUser();
          } else {
            if (errorMsg) {
              errorMsg.textContent = res.error;
              errorMsg.style.display = "block";
            }
          }
        });
      }

      // Cuentas rápidas de demostración
      const btnQVecino = document.getElementById("btn-quick-vecino");
      const btnQMod = document.getElementById("btn-quick-moderador");

      if (btnQVecino) {
        btnQVecino.addEventListener("click", () => {
          this.store.login("vecino@alerta.org", "vecino123");
          this.showToast("Sesión iniciada como Facundo Rullo (Vecino).", "success");
          this.renderProfile();
          this.updateHeaderUser();
        });
      }

      if (btnQMod) {
        btnQMod.addEventListener("click", () => {
          this.store.login("moderador@alerta.org", "admin123");
          this.showToast("Sesión iniciada como Laura Paz (Moderadora).", "success");
          this.renderProfile();
          this.updateHeaderUser();
        });
      }

      // Cerrar sesión
      const logoutBtn = document.getElementById("btn-profile-logout");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          this.store.logout();
          this.showToast("Sesión cerrada.", "info");
          this.renderProfile();
          this.updateHeaderUser();
        });
      }
    }

    renderProfile() {
      const loggedSection = document.getElementById("profile-logged-in-section");
      const guestSection = document.getElementById("profile-guest-section");

      if (!loggedSection || !guestSection) return;

      if (this.store.isLoggedIn()) {
        loggedSection.style.display = "block";
        guestSection.style.display = "none";

        const u = this.store.currentUser;
        const nameEl = document.getElementById("profile-user-name");
        const emailEl = document.getElementById("profile-user-email");
        const roleBadge = document.getElementById("profile-role-badge");
        const avatarEl = document.getElementById("profile-avatar");
        const barrioEl = document.getElementById("profile-user-barrio");

        if (nameEl) nameEl.textContent = u.name;
        if (emailEl) emailEl.textContent = u.email;
        if (barrioEl) barrioEl.textContent = u.barrio || "Centro · Río Cuarto";

        if (roleBadge) {
          roleBadge.textContent = "Rol: " + (u.role === "moderador" ? "🛡️ Moderador Comunitario" : "👤 Vecino");
          roleBadge.className = "badge " + (u.role === "moderador" ? "badge-warning" : "badge-info");
        }

        if (avatarEl) {
          const initials = u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
          avatarEl.textContent = initials;
        }

        // Mis reportes
        const myReports = this.store.state.reports.filter(r => r.authorId === u.id);
        const myCountEl = document.getElementById("profile-my-reports-count");
        if (myCountEl) myCountEl.textContent = myReports.length;

        // Mis votos
        let myVotesCount = 0;
        for (const k in this.store.state.userVotes) {
          if (k.startsWith(u.id)) myVotesCount++;
        }
        const myVotesEl = document.getElementById("profile-my-votes-count");
        if (myVotesEl) myVotesEl.textContent = myVotesCount;

        const myReportsList = document.getElementById("profile-my-reports-list");
        if (myReportsList) {
          if (myReports.length === 0) {
            myReportsList.innerHTML = '<div style="font-size:12px;color:#64748b;padding:6px;">Todavía no creaste reportes. Podés crear uno desde el mapa o la lista.</div>';
          } else {
            myReportsList.innerHTML = myReports.map(r => {
              const statusInfo = this.store.getStatusInfo(r.status);
              return (
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;cursor:pointer;" onclick="window.app.navigate(&quot;detail&quot;, &quot;' + r.id + '&quot;)">' +
                  '<div>' +
                    '<strong style="font-size:13px;color:#0f172a;">#' + r.id + ' ' + r.title + '</strong><br>' +
                    '<span style="font-size:11px;color:#64748b;">📍 ' + r.address + '</span>' +
                  '</div>' +
                  '<span class="badge ' + statusInfo.badgeClass + '">' + statusInfo.label + '</span>' +
                '</div>'
              );
            }).join("");
          }
        }
      } else {
        loggedSection.style.display = "none";
        guestSection.style.display = "block";
      }
    }

    // =========================================================================
    // MODALES (AUTH CONTEXTUAL Y DENUNCIAS)
    // =========================================================================
    bindModals() {
      // Modal Auth Contextual
      const authModal = document.getElementById("modal-contextual-auth");
      const closeAuth = document.getElementById("auth-modal-close");
      const backDraft = document.getElementById("btn-back-to-draft");
      const authForm = document.getElementById("auth-modal-form");
      const togglePass = document.getElementById("btn-toggle-modal-password");
      const passInput = document.getElementById("auth-modal-password");
      const emailInput = document.getElementById("auth-modal-email");
      const errorMsg = document.getElementById("auth-modal-error");
      const submitBtn = document.getElementById("btn-modal-login-submit");
      const spinner = document.getElementById("btn-modal-login-spinner");
      const label = document.getElementById("btn-modal-login-label");

      const hideAuth = () => {
        if (authModal) authModal.classList.remove("active");
      };

      if (closeAuth) closeAuth.addEventListener("click", hideAuth);
      if (backDraft) backDraft.addEventListener("click", hideAuth);

      if (authModal) {
        authModal.addEventListener("click", (e) => {
          if (e.target === authModal) hideAuth();
        });
      }

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && authModal && authModal.classList.contains("active")) {
          hideAuth();
        }
      });

      if (togglePass && passInput) {
        togglePass.addEventListener("click", () => {
          const isPass = passInput.type === "password";
          passInput.type = isPass ? "text" : "password";
          togglePass.textContent = isPass ? "🙈" : "👁️";
          togglePass.setAttribute("aria-label", isPass ? "Ocultar contraseña" : "Mostrar contraseña");
        });
      }

      if (authForm) {
        authForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.isSubmittingAuth) return;

          const email = (emailInput ? emailInput.value : "").trim();
          const pass = (passInput ? passInput.value : "").trim();

          if (!email) {
            if (errorMsg) {
              errorMsg.textContent = "Por favor, ingresá tu correo electrónico.";
              errorMsg.style.display = "block";
            }
            if (emailInput) emailInput.focus();
            return;
          }

          if (!email.includes("@") || !email.includes(".")) {
            if (errorMsg) {
              errorMsg.textContent = "Ingresá un formato de correo electrónico válido (ej. usuario@dominio.com).";
              errorMsg.style.display = "block";
            }
            if (emailInput) emailInput.focus();
            return;
          }

          if (!pass) {
            if (errorMsg) {
              errorMsg.textContent = "Por favor, ingresá tu contraseña.";
              errorMsg.style.display = "block";
            }
            if (passInput) passInput.focus();
            return;
          }

          if (errorMsg) errorMsg.style.display = "none";
          this.isSubmittingAuth = true;
          if (submitBtn) submitBtn.disabled = true;
          if (spinner) spinner.style.display = "inline-block";
          if (label) label.textContent = "Verificando...";

          setTimeout(() => {
            const res = this.store.login(email, pass);
            this.isSubmittingAuth = false;
            if (submitBtn) submitBtn.disabled = false;
            if (spinner) spinner.style.display = "none";
            if (label) label.textContent = "Iniciar sesión y publicar";

            if (res.success) {
              if (errorMsg) errorMsg.style.display = "none";
              hideAuth();
              this.updateHeaderUser();
              this.renderProfile();
              this.showToast("Sesión iniciada como " + res.user.name, "success");
              this.finishReportPublication();
            } else {
              if (errorMsg) {
                errorMsg.textContent = res.error || "Credenciales incorrectas. Verificá tu correo y contraseña.";
                errorMsg.style.display = "block";
              }
              if (passInput) passInput.focus();
            }
          }, 350);
        });
      }

      // Controles y formulario de Cuenta Recordada Seleccionada
      const selForm = document.getElementById("selected-account-form");
      const selPassInput = document.getElementById("selected-account-password");
      const toggleSelPass = document.getElementById("btn-toggle-selected-password");
      const selErrorMsg = document.getElementById("selected-account-error");
      const selSubmitBtn = document.getElementById("btn-selected-account-submit");
      const selSpinner = document.getElementById("btn-selected-account-spinner");
      const selLabel = document.getElementById("btn-selected-account-label");
      const btnSwitchAccount = document.getElementById("btn-switch-account");

      if (toggleSelPass && selPassInput) {
        toggleSelPass.addEventListener("click", () => {
          const isPass = selPassInput.type === "password";
          selPassInput.type = isPass ? "text" : "password";
          toggleSelPass.textContent = isPass ? "🙈" : "👁️";
          toggleSelPass.setAttribute("aria-label", isPass ? "Ocultar contraseña" : "Mostrar contraseña");
        });
      }

      if (btnSwitchAccount) {
        btnSwitchAccount.addEventListener("click", () => {
          this.selectedAuthAccount = null;
          const mainView = document.getElementById("auth-view-main");
          const selectedView = document.getElementById("auth-view-selected-account");
          if (mainView) mainView.style.display = "block";
          if (selectedView) selectedView.style.display = "none";
          this.renderRememberedAccounts();
        });
      }

      if (selForm) {
        selForm.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.isSubmittingAuth) return;

          if (!this.selectedAuthAccount || !this.selectedAuthAccount.email) {
            if (selErrorMsg) {
              selErrorMsg.textContent = "No se ha seleccionado ninguna cuenta.";
              selErrorMsg.style.display = "block";
            }
            return;
          }

          const password = (selPassInput ? selPassInput.value : "").trim();
          if (!password) {
            if (selErrorMsg) {
              selErrorMsg.textContent = "Por favor, ingresá la contraseña para continuar.";
              selErrorMsg.style.display = "block";
            }
            if (selPassInput) selPassInput.focus();
            return;
          }

          if (selErrorMsg) selErrorMsg.style.display = "none";
          this.isSubmittingAuth = true;
          if (selSubmitBtn) selSubmitBtn.disabled = true;
          if (selSpinner) selSpinner.style.display = "inline-block";
          if (selLabel) selLabel.textContent = "Verificando...";

          setTimeout(() => {
            const res = this.store.login(this.selectedAuthAccount.email, password);
            this.isSubmittingAuth = false;
            if (selSubmitBtn) selSubmitBtn.disabled = false;
            if (selSpinner) selSpinner.style.display = "none";
            if (selLabel) selLabel.textContent = "Iniciar sesión y publicar";

            if (res.success) {
              if (selErrorMsg) selErrorMsg.style.display = "none";
              hideAuth();
              this.updateHeaderUser();
              this.renderProfile();
              this.showToast("Sesión iniciada como " + res.user.name, "success");
              this.finishReportPublication();
            } else {
              if (selErrorMsg) {
                selErrorMsg.textContent = res.error || "Contraseña incorrecta. Verificá tus credenciales.";
                selErrorMsg.style.display = "block";
              }
              if (selPassInput) {
                selPassInput.value = "";
                selPassInput.focus();
              }
            }
          }, 350);
        });
      }

      // Modal Denuncia
      const flagModal = document.getElementById("modal-flag-report");
      const closeFlag = document.getElementById("flag-modal-close");
      const cancelFlag = document.getElementById("btn-cancel-flag");
      const submitFlag = document.getElementById("btn-submit-flag-confirm");

      const hideFlag = () => {
        if (flagModal) {
          flagModal.classList.remove("active");
          flagModal.classList.remove("open");
        }
      };
      if (closeFlag) closeFlag.addEventListener("click", hideFlag);
      if (cancelFlag) cancelFlag.addEventListener("click", hideFlag);
      if (flagModal) {
        flagModal.addEventListener("click", (e) => {
          if (e.target === flagModal) hideFlag();
        });
      }

      if (submitFlag) {
        submitFlag.addEventListener("click", () => {
          const selected = document.querySelector('input[name="flag-reason"]:checked');
          const reason = selected ? selected.value : "Contenido señalado para revisión";
          const notesEl = document.getElementById("flag-modal-notes");
          const notes = notesEl ? notesEl.value.trim() : "";

          const targetId = this.flagTargetReportId || this.currentDetailId || this.store.state.selectedReportId;
          if (targetId) {
            this.store.flagReport(targetId, reason, notes);
            hideFlag();
            this.showToast("Denuncia registrada. El reporte #" + targetId + " quedó en estado «En revisión».", "warning");
            this.renderDetail(targetId);
            this.updateHeaderUser();
          } else {
            this.showToast("No se pudo identificar el reporte para denunciar.", "error");
          }
        });
      }
    }

    // =========================================================================
    // SISTEMA CONTEXTUAL DE TOASTS
    // =========================================================================
    showToast(message, type = "info") {
      const container = document.getElementById("toast-container");
      if (!container) return;

      const toast = document.createElement("div");
      toast.className = "toast toast-" + type;

      const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠️",
        info: "ℹ️"
      };

      toast.innerHTML =
        '<span style="font-size:14px;font-weight:bold;">' + (icons[type] || "●") + '</span>' +
        '<span>' + message + '</span>';

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => toast.remove(), 250);
      }, 3500);
    }
  }

  // Inicializar al cargar el DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.app = new AlertaVecinosApp();
    });
  } else {
    window.app = new AlertaVecinosApp();
  }
})();
