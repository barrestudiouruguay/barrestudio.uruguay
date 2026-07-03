# Barré Studio Uruguay — Reservas online

Aplicación web para que las alumnas de **Barré Studio Uruguay** se registren,
inicien sesión y reserven su lugar en las clases. Diseñada según la
[Guía de Marca 2026] del estudio: paleta *azul bruma / crema lino / noche*,
tipografías Cormorant Garamond, Manrope y JetBrains Mono, y voz rioplatense.

**Una nueva forma de moverse en Uruguay.**

---

## ¿Qué incluye?

- **Landing** con la identidad del estudio: disciplina, tipos de clase, precios y contacto.
- **Registro e inicio de sesión** (nombre, email, celular opcional y contraseña).
- **Agenda semanal** (lunes a sábado) con reserva y cancelación de cupos.
  Clases de 50 minutos, cupo máximo de 12 alumnas.
- **Mis reservas**: cada alumna ve y cancela sus próximas clases.
- **Vista de administración**: al ingresar con `barreuruguay@gmail.com`
  se ve la lista de anotadas de cada clase.

## Los dos modos de funcionamiento

| | Modo demo (activo hoy) | Modo real (Firebase) |
|---|---|---|
| Configuración | Ninguna | ~15 minutos, gratis |
| Cuentas y reservas | Solo en el navegador de cada persona | Compartidas entre todos los dispositivos |
| ¿Para qué sirve? | Probar y mostrar la app | Lanzarla al público |

La app arranca en **modo demo**. Para lanzarla en serio hay que activar el
modo real (abajo).

## Cómo publicar la página (GitHub Pages, gratis)

1. En GitHub, entrá a **Settings → Pages** de este repositorio.
2. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
3. En unos minutos la página queda en línea en la URL que te muestra GitHub.
   Después podés conectar el dominio propio `barreuruguay.com.uy` desde esa misma pantalla.

## Cómo activar el modo real (Firebase)

1. Entrá a [console.firebase.google.com](https://console.firebase.google.com)
   con la cuenta de Google del estudio y creá un proyecto (ej. `barre-studio-uruguay`).
2. **Authentication → Comenzar → Email/contraseña → Habilitar.**
3. **Firestore Database → Crear base de datos → modo producción.**
4. En **Reglas** de Firestore pegá:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarias/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
       match /reservas/{reservaId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
         allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
       }
     }
   }
   ```

5. En la portada del proyecto tocá el ícono **Web (`</>`)**, registrá la app y
   copiá el bloque `firebaseConfig`.
6. Abrí **`js/config.js`** en este repositorio y pegá esos valores dentro de
   `firebase: { ... }`. Guardá el cambio: la app pasa sola al modo real.

## Cómo editar los horarios y precios

- **Horarios y tipos de clase:** todo está en **`js/horarios.js`**, con
  comentarios que explican el formato. Cambiás la lista y listo.
- **Cupo máximo y administradoras:** en **`js/config.js`**.
- **Precios:** en la sección *Precios* de **`index.html`**.

## Estructura

```
index.html        Página principal (única página)
css/styles.css    Sistema visual según la guía de marca
js/config.js      Configuración (Firebase, admins, cupos)
js/horarios.js    Grilla semanal de clases — editable
js/store.js       Datos: modo demo (navegador) o Firebase
js/app.js         Lógica de la interfaz
assets/logo.png   Logotipo oficial
```
