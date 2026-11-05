# 🎬 Vegas-Cap — Editor de Vídeo Multiplataforma (Web & Mobile)

**Vegas-Cap** es un editor de vídeo multiplataforma diseñado para combinar la rapidez, agilidad y efectos intuitivos de **CapCut** con la precisión de edición multipista y atajos de teclado profesionales de **Sony Vegas (VEGAS Pro)**.

El proyecto está estructurado como un **Monorepo** que divide la aplicación en una versión **Web (PC)** y una versión **Móvil (Android/iOS)**.

---

## 🛠️ Tecnologías Utilizadas

### 🌐 Cliente Web (`/web`)
* **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
* **Gestión de Estado (Engine Timeline):** [Zustand](https://github.com/pmndrs/zustand)
* **Estilos & UI:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Linter:** [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (Ultrarrápido basado en Rust)
* **Iconos:** [Lucide React](https://lucide.dev/)

### 📱 Aplicación Móvil (`/app`)
* **Plataforma:** Android (Jetpack Compose + Kotlin)
* **Build System:** Gradle (Kotlin DSL)

---

## 📁 Estructura del Proyecto

```text
.
├── app/                        # Aplicación Móvil (Android Native)
│   ├── app/
│   │   ├── build.gradle.kts
│   │   └── src/
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml
│   │       │   ├── java/com/example/video/
│   │       │   │   ├── MainActivity.kt
│   │       │   │   └── ui/theme/         # Tema visual (Color, Type, Theme)
│   │       │   └── res/                  # Recursos gráficos y layouts
│   │       ├── androidTest/             # Tests de integración Android
│   │       └── test/                    # Tests unitarios Kotlin
│   ├── gradle/                          # Wrapper y versiones de Gradle
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── web/                        # Aplicación Web (Editor PC)
│   ├── public/                 # Recursos estáticos web
│   ├── src/
│   │   ├── assets/             # Imágenes y SVGs
│   │   ├── store/
│   │   │   └── useTimelineStore.ts  # Estado global de la línea de tiempo
│   │   ├── App.css
│   │   ├── App.tsx             # Layout principal (Editor CapCut/Vegas)
│   │   ├── index.css           # Configuración Tailwind CSS
│   │   └── main.tsx            # Punto de entrada de React
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json           # Configuración de TypeScript
│   └── vite.config.ts          # Plugins de Vite (React + Tailwind)
│
└── README.md
```

---

## 🚀 Inicio Rápido

### Requisitos Previos
* **Node.js** (v18 o superior)
* **JDK 17+** y **Android Studio** (para el desarrollo en `/app`)

---

### 💻 Ejecutar la versión Web (`/web`)

1. Entra en el directorio del cliente web:
   ```bash
   cd web
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador en `http://localhost:5173`.

#### ⌨️ Atajos de Teclado en la Web:
* `Espacio`: Play / Pausa.
* `S`: Dividir / Cortar clip seleccionado en la posición del cabezal de reproducción (*Split*).

---

### 📱 Ejecutar la versión Móvil (`/app`)

1. Abre el directorio `app/` en **Android Studio**.
2. Sincroniza los archivos Gradle (`Sync Project with Gradle Files`).
3. Ejecuta el proyecto en un emulador Android o dispositivo físico conectado.

---

## ⚡ Linter y Verificación de Código

Para pasar el linter ultrarrápido con **Oxlint** en el cliente web:

```bash
cd web
npx oxlint .
```

---

## 📌 Próximos Pasos (Roadmap)
- [ ] Importación y decodificación de vídeo real vía HTML5 Canvas / WebCodecs.
- [ ] Arrastrar y soltar (*Drag & Drop*) clips dentro de la línea de tiempo multipista.
- [ ] Sincronización del archivo de proyecto JSON entre Web y Móvil.
- [ ] Exportación de vídeo mediante FFmpeg.wasm / Renderizado en nube.