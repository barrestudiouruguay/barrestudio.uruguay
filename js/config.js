/* ==========================================================================
   Configuración de Barré Studio Uruguay
   --------------------------------------------------------------------------
   MODO DEMO (por defecto): las cuentas y reservas se guardan solo en el
   navegador de cada persona. Sirve para probar la app.

   MODO REAL (recomendado para lanzar): creá un proyecto gratuito en
   https://console.firebase.google.com, activá Authentication (Email/Password)
   y Cloud Firestore, y pegá acá abajo la configuración de tu proyecto.
   Instrucciones paso a paso en el README.md.
   ========================================================================== */

window.BARRE_CONFIG = {

  // Pegá acá la configuración de Firebase para activar el modo real.
  // Mientras apiKey esté vacío, la app funciona en modo demo.
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  // Emails con acceso de administración (ven la lista de anotadas por clase).
  adminEmails: ["barreuruguay@gmail.com"],

  // Cupo máximo por clase (formato boutique).
  cupoMaximo: 12,

  // Días hacia adelante que se muestran en la agenda.
  diasVisibles: 7
};
