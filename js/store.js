/* ==========================================================================
   Capa de datos de Barré Studio Uruguay
   --------------------------------------------------------------------------
   Expone una API única (window.Store) con dos implementaciones:

   · DEMO  — localStorage: cuentas y reservas viven en el navegador de cada
             persona. Ideal para probar la app sin configurar nada.
   · REAL  — Firebase Auth + Cloud Firestore: cuentas y reservas compartidas
             entre todos los dispositivos. Se activa completando js/config.js.
   ========================================================================== */

const cfg = window.BARRE_CONFIG;
const usaFirebase = Boolean(cfg.firebase && cfg.firebase.apiKey);

/* ---------- utilidades comunes ---------- */

async function hashTexto(texto) {
  const data = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function normalizarEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/* ==========================================================================
   MODO DEMO — localStorage
   ========================================================================== */

const demo = (() => {
  const K_USERS = "barre_usuarias";
  const K_SESION = "barre_sesion";
  const K_RESERVAS = "barre_reservas";

  const leer = (k, def) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; }
    catch { return def; }
  };
  const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  let cbSesion = null;

  return {
    esDemo: true,

    onAuthChange(cb) {
      cbSesion = cb;
      cb(this.usuariaActual());
    },

    usuariaActual() {
      return leer(K_SESION, null);
    },

    async registrar({ nombre, email, telefono, password }) {
      email = normalizarEmail(email);
      const usuarias = leer(K_USERS, {});
      if (usuarias[email]) throw new Error("Ya existe una cuenta con ese email.");
      usuarias[email] = {
        nombre: nombre.trim(),
        email,
        telefono: (telefono || "").trim(),
        hash: await hashTexto(password)
      };
      guardar(K_USERS, usuarias);
      const sesion = { uid: email, nombre: usuarias[email].nombre, email };
      guardar(K_SESION, sesion);
      cbSesion && cbSesion(sesion);
      return sesion;
    },

    async ingresar(email, password) {
      email = normalizarEmail(email);
      const usuarias = leer(K_USERS, {});
      const u = usuarias[email];
      if (!u || u.hash !== await hashTexto(password)) {
        throw new Error("Email o contraseña incorrectos.");
      }
      const sesion = { uid: email, nombre: u.nombre, email };
      guardar(K_SESION, sesion);
      cbSesion && cbSesion(sesion);
      return sesion;
    },

    async salir() {
      localStorage.removeItem(K_SESION);
      cbSesion && cbSesion(null);
    },

    async reservasDelDia(fecha) {
      const todas = leer(K_RESERVAS, []);
      return todas.filter(r => r.fecha === fecha);
    },

    async misReservas(uid) {
      const todas = leer(K_RESERVAS, []);
      return todas.filter(r => r.uid === uid);
    },

    async reservar(reserva) {
      const todas = leer(K_RESERVAS, []);
      const clave = r => `${r.fecha}|${r.claseId}|${r.uid}`;
      if (todas.some(r => clave(r) === clave(reserva))) {
        throw new Error("Ya tenés una reserva en esta clase.");
      }
      const enClase = todas.filter(r => r.fecha === reserva.fecha && r.claseId === reserva.claseId);
      if (enClase.length >= cfg.cupoMaximo) throw new Error("No quedan cupos en esta clase.");
      todas.push(reserva);
      guardar(K_RESERVAS, todas);
    },

    async cancelar(fecha, claseId, uid) {
      const todas = leer(K_RESERVAS, []);
      guardar(K_RESERVAS, todas.filter(r => !(r.fecha === fecha && r.claseId === claseId && r.uid === uid)));
    }
  };
})();

/* ==========================================================================
   MODO REAL — Firebase (se carga solo si hay configuración)
   ========================================================================== */

async function crearStoreFirebase() {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
  const {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
    signInWithEmailAndPassword, signOut, updateProfile
  } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
  const {
    getFirestore, collection, doc, setDoc, deleteDoc, getDocs, query, where
  } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const app = initializeApp(cfg.firebase);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const aSesion = (u) => u ? { uid: u.uid, nombre: u.displayName || u.email, email: u.email } : null;

  const MENSAJES = {
    "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/wrong-password": "Email o contraseña incorrectos.",
    "auth/user-not-found": "Email o contraseña incorrectos.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El email no es válido."
  };
  const traducir = (e) => new Error(MENSAJES[e.code] || "Ocurrió un error. Probá de nuevo.");

  return {
    esDemo: false,

    onAuthChange(cb) {
      onAuthStateChanged(auth, u => cb(aSesion(u)));
    },

    usuariaActual() {
      return aSesion(auth.currentUser);
    },

    async registrar({ nombre, email, telefono, password }) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizarEmail(email), password);
        await updateProfile(cred.user, { displayName: nombre.trim() });
        await setDoc(doc(db, "usuarias", cred.user.uid), {
          nombre: nombre.trim(),
          email: normalizarEmail(email),
          telefono: (telefono || "").trim(),
          creada: Date.now()
        });
        return aSesion(cred.user);
      } catch (e) { throw traducir(e); }
    },

    async ingresar(email, password) {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalizarEmail(email), password);
        return aSesion(cred.user);
      } catch (e) { throw traducir(e); }
    },

    async salir() {
      await signOut(auth);
    },

    async reservasDelDia(fecha) {
      const q = query(collection(db, "reservas"), where("fecha", "==", fecha));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    },

    async misReservas(uid) {
      const q = query(collection(db, "reservas"), where("uid", "==", uid));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    },

    async reservar(reserva) {
      const enClase = await this.reservasDelDia(reserva.fecha);
      const misma = enClase.filter(r => r.claseId === reserva.claseId);
      if (misma.some(r => r.uid === reserva.uid)) throw new Error("Ya tenés una reserva en esta clase.");
      if (misma.length >= cfg.cupoMaximo) throw new Error("No quedan cupos en esta clase.");
      const id = `${reserva.fecha}_${reserva.claseId}_${reserva.uid}`;
      await setDoc(doc(db, "reservas", id), reserva);
    },

    async cancelar(fecha, claseId, uid) {
      await deleteDoc(doc(db, "reservas", `${fecha}_${claseId}_${uid}`));
    }
  };
}

/* ---------- inicialización ---------- */

window.storeListo = (async () => {
  if (usaFirebase) {
    try {
      window.Store = await crearStoreFirebase();
    } catch (e) {
      console.error("No se pudo iniciar Firebase; se usa el modo demo.", e);
      window.Store = demo;
    }
  } else {
    window.Store = demo;
  }
  return window.Store;
})();
