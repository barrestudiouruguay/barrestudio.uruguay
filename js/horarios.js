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
    id: "barre-principiante",
    nombre: "Barré Principiante",
    nivel: "Principiante",
    descripcion: "La puerta de entrada a la disciplina: técnica de base en barra, alineación y control. No hace falta experiencia previa."
  },
  {
    id: "barre-intermedio",
    nombre: "Barré Intermedio",
    nivel: "Intermedio",
    descripcion: "Secuencias más largas y trabajo isométrico profundo para quienes ya dominan la base."
  },
  {
    id: "barre-avanzado",
    nombre: "Barré Avanzado",
    nivel: "Avanzado",
    descripcion: "Máxima intensidad y precisión: combinaciones complejas en barra y centro."
  },
  {
    id: "barre-sculpt",
    nombre: "Barré Sculpt",
    nivel: "Todos los niveles",
    descripcion: "Foco en tonificación con bandas, pelotas y pesas livianas. Esculpe y fortalece todo el cuerpo."
  },
  {
    id: "barre-cardio",
    nombre: "Barré Cardio",
    nivel: "Todos los niveles",
    descripcion: "El costado más dinámico del barré: series al ritmo de la música que elevan pulsaciones sin impacto."
  },
  {
    id: "barre-mayores",
    nombre: "Barré para Mayores",
    nivel: "Adaptada",
    descripcion: "Movilidad, postura y fuerza a un ritmo amable, pensada para adultas mayores."
  }
];

window.GRILLA_SEMANAL = [
  // Lunes
  { dia: 1, hora: "08:00", claseId: "barre-principiante" },
  { dia: 1, hora: "09:00", claseId: "barre-sculpt" },
  { dia: 1, hora: "18:00", claseId: "barre-intermedio" },
  { dia: 1, hora: "19:00", claseId: "barre-cardio" },
  // Martes
  { dia: 2, hora: "08:00", claseId: "barre-intermedio" },
  { dia: 2, hora: "09:00", claseId: "barre-mayores" },
  { dia: 2, hora: "18:00", claseId: "barre-principiante" },
  { dia: 2, hora: "19:00", claseId: "barre-sculpt" },
  // Miércoles
  { dia: 3, hora: "08:00", claseId: "barre-principiante" },
  { dia: 3, hora: "09:00", claseId: "barre-cardio" },
  { dia: 3, hora: "18:00", claseId: "barre-avanzado" },
  { dia: 3, hora: "19:00", claseId: "barre-sculpt" },
  // Jueves
  { dia: 4, hora: "08:00", claseId: "barre-sculpt" },
  { dia: 4, hora: "09:00", claseId: "barre-mayores" },
  { dia: 4, hora: "18:00", claseId: "barre-intermedio" },
  { dia: 4, hora: "19:00", claseId: "barre-cardio" },
  // Viernes
  { dia: 5, hora: "08:00", claseId: "barre-principiante" },
  { dia: 5, hora: "09:00", claseId: "barre-sculpt" },
  { dia: 5, hora: "18:00", claseId: "barre-avanzado" },
  // Sábado
  { dia: 6, hora: "09:00", claseId: "barre-sculpt" },
  { dia: 6, hora: "10:00", claseId: "barre-principiante" }
];
