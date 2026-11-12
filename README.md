# KineGen Pro — Plataforma Clínica de Prescripción de Ejercicio Terapéutico

Aplicación web **Single Page Application (SPA)** diseñada para **Kinesiólogos, Fisioterapeutas y Fisiatras**, inspirada en el flujo de trabajo de **KineGen**. Permite crear, dosificar, gestionar y exportar planes de rehabilitación kinésica personalizados e historias clínicas en formato PDF, funcionando **100% en el navegador del usuario** (Offline-First) mediante persistencia en `localStorage`.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS (sistema de diseño clínico responsivo)
- **Gestión de Estado y Persistencia:** Zustand con middleware `persist` en `localStorage` (`kinegen-pro-storage`)
- **Firma Manuscrita Digital:** `react-signature-canvas`
- **Generación de Documentos PDF (A4):** `jspdf` + `html2canvas`
- **Iconografía:** `lucide-react`

---

## ⚙️ Funcionalidades Principales

1. **Perfil del Profesional y Consultorio (Settings):**
   - Registro persistente de Nombre, Matrícula Profesional (`M.N. / M.P.`), Nombre del Consultorio, Especialidad y Contacto.
   - Subida de **Logo institucional** convertido y optimizado automáticamente en Base64.
   - Lienzo interactivo (`react-signature-canvas`) para dibujar la **firma manuscrita** del profesional e imprimirla automáticamente en los reportes PDF.

2. **Gestión del Paciente Actual:**
   - Datos de filiación: Nombre y apellido, edad, fecha de evaluación, diagnóstico kinésico y notas semiológicas.
   - **Escala EVA (Visual Analógica del Dolor 0 a 10):** Deslizador interactivo y botonera rápida con clasificación clínica cromática.
   - Botón **"Nuevo Paciente"** que limpia la ficha actual y el plan activo conservando intactos la biblioteca de ejercicios, las plantillas y el perfil del profesional.

3. **Biblioteca Kinésica y Generador Inteligente de Planes:**
   - **16 ejercicios pre-cargados** en [`src/utils/initialExercises.ts`](src/utils/initialExercises.ts) con ilustraciones biomecánicas vectoriales embebidas (sin dependencias externas ni errores CORS).
   - Filtros combinables en tiempo real: **Zona del cuerpo** (Cervical, Hombro, Dorsal, Lumbar, Cadera, Rodilla, Tobillo y Pie), **Patología**, **Fase** (Aguda, Subaguda, Fortalecimiento), **Objetivo** (Dolor, Movilidad, Fuerza, Propiocepción, Control Motor) y **Tipo de trabajo**.
   - Configuración de frecuencia semanal (**Días por semana** y **Ejercicios por sesión**) y botón **"Generar Plan Automático"**.
   - Módulo **"Mi Ejercicio"**: Permite añadir nuevos ejercicios personalizados con fotografía propia en Base64.

4. **Editor del Plan de Ejercicios:**
   - Edición en vivo por tarjeta: **Series**, **Repeticiones / Duración**, **Tiempo de descanso**, **Días de la semana (`L, M, X, J, V, S, D`)** e indicaciones específicas.
   - Botón **"Cambiar"** en cada ejercicio para reemplazarlo aleatoriamente por otro de la misma zona anatómica.
   - Gestión de **Plantillas Clínicas**: Guarda combinaciones de ejercicios con **"Guardar como Plantilla"** para reutilizarlas con futuros pacientes.

5. **Exportación Dual de PDFs:**
   - **Plan para el Paciente:** Diseño visual y amigable con ilustraciones grandes, lenguaje claro, grilla semanal `L-D` y firma del profesional.
   - **Ficha de Registro Profesional:** Resumen técnico para historia clínica con diagnóstico, escala EVA inicial graduada y tabla técnica dosificada.

6. **Sincronización Manual (Import / Export JSON):**
   - **Exportar Biblioteca:** Descarga todo el estado de `localStorage` en un archivo `.json`.
   - **Importar:** Restaura el estado completo desde un archivo `.json` para trasladar datos entre PC, tablet y celular.

---

## 🚀 Instalación y Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar versión de producción
npm run build
```
