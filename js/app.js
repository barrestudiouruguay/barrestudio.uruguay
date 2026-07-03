/* ==========================================================================
   Lógica de interfaz — Barré Studio Uruguay
   ========================================================================== */

const CFG = window.BARRE_CONFIG;
const TIPOS = window.TIPOS_DE_CLASE;
const GRILLA = window.GRILLA_SEMANAL;

const $ = (sel) => document.querySelector(sel);

let Store = null;
let usuaria = null;
let fechaSeleccionada = null;

/* ---------- helpers de fecha (hora local del dispositivo) ---------- */

const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

function aISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function desdeISO(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function proximosDias() {
  const dias = [];
  const hoy = new Date();
  for (let i = 0; dias.length < CFG.diasVisibles; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    if (d.getDay() === 0) continue; // el estudio no abre los domingos
    dias.push(d);
  }
  return dias;
}

function etiquetaDia(d, i) {
  if (i === 0 && aISO(d) === aISO(new Date())) return "hoy";
  return DIAS_CORTOS[d.getDay()];
}

function claseYaPaso(fechaISO, hora) {
  const [h, m] = hora.split(":").map(Number);
  const inicio = desdeISO(fechaISO);
  inicio.setHours(h, m, 0, 0);
  return inicio.getTime() < Date.now();
}

function fechaLarga(fechaISO) {
  const d = desdeISO(fechaISO);
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
}

/* ---------- toast ---------- */

let toastTimer = null;
function avisar(mensaje, esError = false) {
  const t = $("#toast");
  t.textContent = mensaje;
  t.classList.toggle("toast--error", esError);
  t.classList.remove("oculto");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("oculto"), 3500);
}

/* ---------- tarjetas de tipos de clase ---------- */

function pintarTiposDeClase() {
  $("#gridClases").innerHTML = TIPOS.map(t => `
    <article class="clase-tipo">
      <h3>${t.nombre}</h3>
      <span class="nivel">${t.nivel}</span>
      <p>${t.descripcion}</p>
    </article>
  `).join("");
}

/* ---------- selector de días ---------- */

function pintarSelectorDias() {
  const dias = proximosDias();
  if (!fechaSeleccionada) fechaSeleccionada = aISO(dias[0]);
  $("#selectorDias").innerHTML = dias.map((d, i) => {
    const iso = aISO(d);
    return `
      <button class="dia-chip ${iso === fechaSeleccionada ? "activo" : ""}" data-fecha="${iso}">
        <span class="dia-nombre">${etiquetaDia(d, i)}</span>
        <span class="dia-fecha">${d.getDate()} ${MESES[d.getMonth()]}</span>
      </button>`;
  }).join("");

  document.querySelectorAll(".dia-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      fechaSeleccionada = chip.dataset.fecha;
      pintarSelectorDias();
      pintarAgenda();
    });
  });
}

/* ---------- agenda del día ---------- */

async function pintarAgenda() {
  const cont = $("#listaClases");
  const d = desdeISO(fechaSeleccionada);
  const clasesDelDia = GRILLA
    .filter(c => c.dia === d.getDay())
    .sort((a, b) => a.hora.localeCompare(b.hora));

  if (!clasesDelDia.length) {
    cont.innerHTML = `<div class="sin-clases">No hay clases programadas este día.</div>`;
    return;
  }

  cont.innerHTML = `<div class="sin-clases">Cargando agenda…</div>`;

  let reservas = [];
  try {
    reservas = await Store.reservasDelDia(fechaSeleccionada);
  } catch (e) {
    cont.innerHTML = `<div class="sin-clases">No se pudo cargar la agenda. Revisá tu conexión.</div>`;
    return;
  }

  const esAdmin = usuaria && CFG.adminEmails.includes(usuaria.email);

  cont.innerHTML = clasesDelDia.map(c => {
    const tipo = TIPOS.find(t => t.id === c.claseId);
    const deClase = reservas.filter(r => r.claseId === c.claseId);
    const anotada = usuaria && deClase.some(r => r.uid === usuaria.uid);
    const libres = CFG.cupoMaximo - deClase.length;
    const pasada = claseYaPaso(fechaSeleccionada, c.hora);

    let accion;
    if (pasada) {
      accion = `<button class="btn btn--fantasma" disabled>Finalizada</button>`;
    } else if (anotada) {
      accion = `<button class="btn--cancelar" data-accion="cancelar" data-clase="${c.claseId}">Cancelar reserva</button>`;
    } else if (libres <= 0) {
      accion = `<button class="btn btn--fantasma" disabled>Sin cupos</button>`;
    } else {
      accion = `<button class="btn btn--primario" data-accion="reservar" data-clase="${c.claseId}">Reservar</button>`;
    }

    const listaAdmin = esAdmin && deClase.length ? `
      <div class="lista-anotadas">
        <strong>Anotadas (${deClase.length}/${CFG.cupoMaximo})</strong>
        <ol>${deClase.map(r => `<li>${r.nombre} — ${r.email}</li>`).join("")}</ol>
      </div>` : "";

    return `
      <div class="clase-fila ${pasada ? "clase-fila--pasada" : ""}">
        <div class="clase-fila__hora">${c.hora}</div>
        <div class="clase-fila__info">
          <h4>${tipo.nombre}${anotada ? " · reservada ✓" : ""}</h4>
          <p>${tipo.nivel} · 50 min · cupo ${CFG.cupoMaximo}</p>
        </div>
        <div class="clase-fila__cupos ${libres <= 0 ? "lleno" : ""}">
          ${pasada ? "—" : libres <= 0 ? "COMPLETA" : `${libres} ${libres === 1 ? "CUPO" : "CUPOS"}`}
        </div>
        ${accion}
        ${listaAdmin}
      </div>`;
  }).join("");

  cont.querySelectorAll("[data-accion]").forEach(btn => {
    btn.addEventListener("click", () => manejarReserva(btn.dataset.accion, btn.dataset.clase));
  });
}

async function manejarReserva(accion, claseId) {
  if (!usuaria) {
    abrirModal();
    avisar("Iniciá sesión para reservar tu lugar.");
    return;
  }
  const tipo = TIPOS.find(t => t.id === claseId);
  try {
    if (accion === "reservar") {
      await Store.reservar({
        fecha: fechaSeleccionada,
        claseId,
        uid: usuaria.uid,
        nombre: usuaria.nombre,
        email: usuaria.email,
        creada: Date.now()
      });
      avisar(`Reserva confirmada: ${tipo.nombre} · ${fechaLarga(fechaSeleccionada)}. Modo barré ON.`);
    } else {
      await Store.cancelar(fechaSeleccionada, claseId, usuaria.uid);
      avisar("Reserva cancelada. Te esperamos en otra clase.");
    }
    await pintarAgenda();
    await pintarMisReservas();
  } catch (e) {
    avisar(e.message, true);
  }
}

/* ---------- mis reservas ---------- */

async function pintarMisReservas() {
  const panel = $("#panelReservas");
  if (!usuaria) {
    panel.innerHTML = `<p class="aviso-login">Iniciá sesión para ver tus reservas.</p>`;
    return;
  }

  let reservas = [];
  try {
    reservas = await Store.misReservas(usuaria.uid);
  } catch (e) {
    panel.innerHTML = `<p class="aviso-login">No se pudieron cargar tus reservas.</p>`;
    return;
  }

  const hoyISO = aISO(new Date());
  const proximas = reservas
    .filter(r => r.fecha >= hoyISO)
    .sort((a, b) => (a.fecha + a.claseId).localeCompare(b.fecha + b.claseId));

  if (!proximas.length) {
    panel.innerHTML = `<p class="aviso-login">Todavía no tenés reservas próximas. Elegí tu clase en la agenda.</p>`;
    return;
  }

  panel.innerHTML = proximas.map(r => {
    const tipo = TIPOS.find(t => t.id === r.claseId);
    const horario = GRILLA.find(c => c.claseId === r.claseId && c.dia === desdeISO(r.fecha).getDay());
    return `
      <div class="reserva-item">
        <span class="reserva-item__fecha">${fechaLarga(r.fecha)}${horario ? " · " + horario.hora : ""}</span>
        <span class="reserva-item__clase">${tipo ? tipo.nombre : r.claseId}</span>
        <button class="btn--cancelar" data-fecha="${r.fecha}" data-clase="${r.claseId}">Cancelar</button>
      </div>`;
  }).join("");

  panel.querySelectorAll(".btn--cancelar").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await Store.cancelar(btn.dataset.fecha, btn.dataset.clase, usuaria.uid);
        avisar("Reserva cancelada.");
        await pintarMisReservas();
        await pintarAgenda();
      } catch (e) {
        avisar(e.message, true);
      }
    });
  });
}

/* ---------- sesión ---------- */

function reflejarSesion() {
  const logueada = Boolean(usuaria);
  $("#btnAbrirAuth").classList.toggle("oculto", logueada);
  $("#chipUsuaria").classList.toggle("oculto", !logueada);
  document.querySelectorAll(".solo-logueada").forEach(el => el.classList.toggle("oculto", !logueada));
  if (logueada) {
    $("#nombreUsuaria").textContent = usuaria.nombre.split(" ")[0];
  }
}

/* ---------- modal de autenticación ---------- */

function abrirModal() {
  // siempre se abre en la pestaña "Ingresar"
  document.querySelectorAll(".modal__tab").forEach(t => t.classList.toggle("activo", t.dataset.tab === "login"));
  $("#formLogin").classList.remove("oculto");
  $("#formRegistro").classList.add("oculto");
  $("#modalAuth").classList.remove("oculto");
}
function cerrarModal() {
  $("#modalAuth").classList.add("oculto");
  $("#errorLogin").classList.add("oculto");
  $("#errorRegistro").classList.add("oculto");
}

function prepararModal() {
  $("#btnAbrirAuth").addEventListener("click", abrirModal);
  $("#btnCerrarAuth").addEventListener("click", cerrarModal);
  $("#modalAuth").addEventListener("click", (e) => { if (e.target.id === "modalAuth") cerrarModal(); });

  document.querySelectorAll(".modal__tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".modal__tab").forEach(t => t.classList.remove("activo"));
      tab.classList.add("activo");
      $("#formLogin").classList.toggle("oculto", tab.dataset.tab !== "login");
      $("#formRegistro").classList.toggle("oculto", tab.dataset.tab !== "registro");
    });
  });

  $("#formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const error = $("#errorLogin");
    error.classList.add("oculto");
    try {
      await Store.ingresar(f.get("email"), f.get("password"));
      cerrarModal();
      e.target.reset();
    } catch (err) {
      error.textContent = err.message;
      error.classList.remove("oculto");
    }
  });

  $("#formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const error = $("#errorRegistro");
    error.classList.add("oculto");
    try {
      await Store.registrar({
        nombre: f.get("nombre"),
        email: f.get("email"),
        telefono: f.get("telefono"),
        password: f.get("password")
      });
      cerrarModal();
      e.target.reset();
      avisar("Cuenta creada. Bienvenida a la comunidad Barré.");
    } catch (err) {
      error.textContent = err.message;
      error.classList.remove("oculto");
    }
  });

  $("#btnSalir").addEventListener("click", async () => {
    await Store.salir();
    avisar("Cerraste sesión. Nos vemos pronto.");
  });

  $("#notaModo").textContent = Store.esDemo
    ? "Versión de prueba: tu cuenta y reservas se guardan solo en este navegador."
    : "Tus datos se usan únicamente para gestionar tus reservas.";
}

/* ---------- menú móvil ---------- */

function prepararMenu() {
  $("#btnMenu").addEventListener("click", () => $("#navLinks").classList.toggle("abierto"));
  document.querySelectorAll("#navLinks a").forEach(a =>
    a.addEventListener("click", () => $("#navLinks").classList.remove("abierto"))
  );
}

/* ---------- arranque ---------- */

(async function iniciar() {
  Store = await window.storeListo;

  $("#anio").textContent = new Date().getFullYear();
  pintarTiposDeClase();
  pintarSelectorDias();
  prepararModal();
  prepararMenu();

  Store.onAuthChange(async (u) => {
    usuaria = u;
    reflejarSesion();
    await pintarAgenda();
    await pintarMisReservas();
  });
})();
