/* ==========================================================================
   Horarios semanales de Barré Studio Uruguay
   --------------------------------------------------------------------------
   Editá este archivo para cambiar la grilla de clases. No hace falta tocar
   nada más: la agenda se genera sola a partir de esta lista.

   dia: 1 = lunes, 2 = martes, 3 = miércoles, 4 = jueves, 5 = viernes,
        6 = sábado, 0 = domingo.
   Todas las clases duran 50 minutos.
   ========================================================================== */

window.TIPOS_DE_CLASE = [
  {
    id: "playa-mansa",
    nombre: "Playa Mansa",
    nivel: "Ritmo calmo",
    descripcion: "El lado más relax del barré: técnica, postura y control a un ritmo amable. Entrenás y quemás igual, sin apuro."
  },
  {
    id: "playa-brava",
    nombre: "Playa Brava",
    nivel: "Alta intensidad",
    descripcion: "La versión más intensa, estilo sculpt: tonificación profunda con bandas, pelotas y pesas livianas. Para salir sintiendo cada músculo."
  }
];

/* GRILLA PROVISORIA — clases todos los días menos domingos.
   Cuando estén los horarios definitivos, se reemplazan estas líneas. */
window.GRILLA_SEMANAL = [
  // Lunes
  { dia: 1, hora: "08:00", claseId: "playa-mansa" },
  { dia: 1, hora: "09:00", claseId: "playa-brava" },
  { dia: 1, hora: "18:00", claseId: "playa-mansa" },
  { dia: 1, hora: "19:00", claseId: "playa-brava" },
  // Martes
  { dia: 2, hora: "08:00", claseId: "playa-brava" },
  { dia: 2, hora: "09:00", claseId: "playa-mansa" },
  { dia: 2, hora: "18:00", claseId: "playa-brava" },
  { dia: 2, hora: "19:00", claseId: "playa-mansa" },
  // Miércoles
  { dia: 3, hora: "08:00", claseId: "playa-mansa" },
  { dia: 3, hora: "09:00", claseId: "playa-brava" },
  { dia: 3, hora: "18:00", claseId: "playa-mansa" },
  { dia: 3, hora: "19:00", claseId: "playa-brava" },
  // Jueves
  { dia: 4, hora: "08:00", claseId: "playa-brava" },
  { dia: 4, hora: "09:00", claseId: "playa-mansa" },
  { dia: 4, hora: "18:00", claseId: "playa-brava" },
  { dia: 4, hora: "19:00", claseId: "playa-mansa" },
  // Viernes
  { dia: 5, hora: "08:00", claseId: "playa-mansa" },
  { dia: 5, hora: "09:00", claseId: "playa-brava" },
  { dia: 5, hora: "18:00", claseId: "playa-mansa" },
  // Sábado
  { dia: 6, hora: "09:00", claseId: "playa-brava" },
  { dia: 6, hora: "10:00", claseId: "playa-mansa" }
];
