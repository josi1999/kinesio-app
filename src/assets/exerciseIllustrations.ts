// Generador de ilustraciones biomecánicas y anatómicas en formato SVG Data URI (Base64)
// Garantiza renderizado instantáneo offline y compatibilidad 100% libre de errores CORS con html2canvas / jsPDF.

function toSvgDataUri(svgString: string): string {
  const encoded = encodeURIComponent(svgString.trim())
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export const DEFAULT_CLINIC_LOGO = toSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" rx="36" fill="#0f766e"/>
  <rect x="12" y="12" width="156" height="156" rx="28" stroke="#5eead4" stroke-width="2" stroke-opacity="0.4"/>
  <!-- Spine / Joint geometric motif -->
  <path d="M90 34V146" stroke="#99f6e4" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 10"/>
  <circle cx="90" cy="60" r="11" fill="#14b8a6" stroke="#ffffff" stroke-width="4"/>
  <circle cx="90" cy="90" r="15" fill="#0d9488" stroke="#ffffff" stroke-width="5"/>
  <circle cx="90" cy="120" r="11" fill="#14b8a6" stroke="#ffffff" stroke-width="4"/>
  <path d="M52 90C52 69.0132 69.0132 52 90 52C110.987 52 128 69.0132 128 90" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
  <path d="M58 106C65 122 76.5 130 90 130C103.5 130 115 122 122 106" stroke="#5eead4" stroke-width="4" stroke-linecap="round"/>
</svg>
`);

export interface IllustrationSpec {
  id: string;
  zoneLabel: string;
  title: string;
  accentColor: string;
  bgTint: string;
  pose:
    | 'cervical-retraction'
    | 'cervical-stretch'
    | 'shoulder-pendulum'
    | 'shoulder-external-rotation'
    | 'shoulder-wall-slide'
    | 'dorsal-cat-camel'
    | 'lumbar-bird-dog'
    | 'lumbar-glute-bridge'
    | 'lumbar-mckenzie'
    | 'hip-clamshell'
    | 'hip-monster-walk'
    | 'knee-isometric-quad'
    | 'knee-spanish-squat'
    | 'knee-step-down'
    | 'ankle-proprioception'
    | 'ankle-eccentric-calf';
}

function renderPosePaths(pose: IllustrationSpec['pose'], accent: string): string {
  switch (pose) {
    case 'cervical-retraction':
      return `
        <!-- Silla / Respaldo -->
        <path d="M180 120V250H235" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Torso erguido -->
        <path d="M210 140V235" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <!-- Cabeza en posición adelantada (fantasma) -->
        <circle cx="236" cy="96" r="24" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="5 5"/>
        <!-- Cabeza retraída (activa) -->
        <circle cx="210" cy="96" r="24" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <path d="M210 120V142" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
        <!-- Punto focal cervical -->
        <circle cx="210" cy="126" r="7" fill="${accent}"/>
        <!-- Flecha de retracción axial -->
        <path d="M275 96H242" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
        <path d="M252 86L240 96L252 106" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Línea de plomada biomecánica -->
        <line x1="210" y1="52" x2="210" y2="255" stroke="${accent}" stroke-width="2" stroke-dasharray="6 6"/>
      `;
    case 'cervical-stretch':
      return `
        <!-- Hombros y torso frontal -->
        <path d="M150 220C150 185 185 170 240 170C295 170 330 185 330 220" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <!-- Cuello inclinado -->
        <path d="M240 170L258 130" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <!-- Cabeza inclinada lateralmente -->
        <circle cx="268" cy="102" r="26" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Brazo asistiendo suavemente -->
        <path d="M312 190C330 150 315 95 275 78" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
        <!-- Fascículos trapecio superior en elongación -->
        <path d="M185 175C205 155 225 142 245 132" stroke="#ef4444" stroke-width="5" stroke-linecap="round" stroke-dasharray="4 6"/>
        <!-- Flecha de descenso escapular -->
        <path d="M175 190V230" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
        <path d="M166 220L175 232L184 220" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'shoulder-pendulum':
      return `
        <!-- Camilla / apoyo -->
        <rect x="285" y="165" width="75" height="80" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="4"/>
        <!-- Piernas y torso inclinado -->
        <path d="M155 245L175 155L275 135" stroke="#1e293b" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Brazo de apoyo -->
        <path d="M275 135L305 165" stroke="#475569" stroke-width="9" stroke-linecap="round"/>
        <!-- Cabeza -->
        <circle cx="305" cy="125" r="20" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Hombro activo -->
        <circle cx="255" cy="138" r="9" fill="${accent}"/>
        <!-- Brazo pendular -->
        <path d="M255 138L248 222" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>
        <path d="M255 138L272 220" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-dasharray="5 5"/>
        <!-- Elipse de movimiento pendular de Codman -->
        <ellipse cx="258" cy="228" rx="34" ry="12" fill="none" stroke="${accent}" stroke-width="4"/>
        <path d="M286 222L294 228L284 234" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'shoulder-external-rotation':
      return `
        <!-- Torso frontal -->
        <rect x="205" y="130" width="66" height="105" rx="22" fill="#f8fafc" stroke="#1e293b" stroke-width="5"/>
        <circle cx="238" cy="92" r="23" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Hombro activo derecho -->
        <circle cx="272" cy="148" r="9" fill="${accent}"/>
        <!-- Brazo pegado al cuerpo con toalla (rollo axilar) -->
        <rect x="266" y="168" width="12" height="24" rx="5" fill="#94a3b8"/>
        <path d="M274 148V192" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
        <!-- Antebrazo en rotación externa -->
        <path d="M274 192L332 178" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <!-- Banda elástica anclada -->
        <line x1="135" y1="185" x2="332" y2="178" stroke="#f59e0b" stroke-width="4" stroke-dasharray="8 4"/>
        <circle cx="135" cy="185" r="7" fill="#f59e0b"/>
        <!-- Arco de rotación -->
        <path d="M295 212C318 208 335 195 342 172" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
        <path d="M334 176L343 169L347 180" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'shoulder-wall-slide':
      return `
        <!-- Pared vertical -->
        <line x1="315" y1="45" x2="315" y2="255" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
        <!-- Torso bipedestación frente a pared -->
        <path d="M225 250V145" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <circle cx="225" cy="106" r="22" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Hombro y brazo deslizando hacia arriba -->
        <circle cx="232" cy="148" r="9" fill="${accent}"/>
        <path d="M232 148L285 142L308 88" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Flecha ascendente en pared -->
        <path d="M338 155V75" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
        <path d="M328 87L338 73L348 87" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'dorsal-cat-camel':
      return `
        <!-- Suelo / Colchoneta -->
        <line x1="115" y1="238" x2="365" y2="238" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Cuadrupedia: brazos y muslos -->
        <path d="M175 235V165" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
        <path d="M295 235V165" stroke="#1e293b" stroke-width="10" stroke-linecap="round"/>
        <!-- Curva cifótica dorsal (Gato) -->
        <path d="M175 165C205 110 265 110 295 165" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>
        <!-- Curva lordótica suave (Camello - punteada) -->
        <path d="M175 165C205 192 265 192 295 165" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" stroke-dasharray="7 7"/>
        <!-- Cabeza -->
        <circle cx="318" cy="168" r="18" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Flechas bidireccionales -->
        <path d="M235 95V150" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
        <path d="M227 104L235 92L243 104" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'lumbar-bird-dog':
      return `
        <!-- Colchoneta -->
        <line x1="95" y1="238" x2="385" y2="238" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Pierna de apoyo y brazo de apoyo -->
        <path d="M195 165L185 235" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <path d="M285 165L295 235" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <!-- Columna neutra estabilizada -->
        <line x1="190" y1="165" x2="290" y2="165" stroke="#0f172a" stroke-width="13" stroke-linecap="round"/>
        <!-- Pierna extendida atrás y brazo extendido adelante -->
        <line x1="190" y1="165" x2="108" y2="162" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <line x1="290" y1="165" x2="368" y2="158" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>
        <!-- Cabeza neutra -->
        <circle cx="312" cy="148" r="17" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Núcleo lumbopélvico activo -->
        <circle cx="235" cy="165" r="11" fill="${accent}"/>
      `;
    case 'lumbar-glute-bridge':
      return `
        <!-- Colchoneta -->
        <line x1="105" y1="235" x2="375" y2="235" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Cabeza y hombros apoyados -->
        <circle cx="145" cy="216" r="17" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Línea alineada Hombro - Cadera - Rodilla -->
        <path d="M170 225L245 182L305 150" stroke="${accent}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Pierna flexionada apoyada en suelo -->
        <path d="M305 150L335 232" stroke="#1e293b" stroke-width="11" stroke-linecap="round"/>
        <!-- Articulación coxofemoral activa -->
        <circle cx="245" cy="182" r="10" fill="#ffffff" stroke="${accent}" stroke-width="5"/>
        <!-- Flecha de elevación pélvica -->
        <path d="M245 225V198" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
        <path d="M236 207L245 195L254 207" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'lumbar-mckenzie':
      return `
        <!-- Colchoneta -->
        <line x1="100" y1="235" x2="380" y2="235" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Pelvis y piernas en decúbito prono -->
        <line x1="125" y1="224" x2="235" y2="224" stroke="#1e293b" stroke-width="13" stroke-linecap="round"/>
        <!-- Extensión progresiva dorso-lumbar -->
        <path d="M235 224C268 222 295 195 312 145" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
        <!-- Antebrazos / manos apoyadas -->
        <path d="M308 158L322 228" stroke="#334155" stroke-width="9" stroke-linecap="round"/>
        <!-- Cabeza -->
        <circle cx="320" cy="118" r="19" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Punto bisagra lumbar -->
        <circle cx="245" cy="220" r="9" fill="${accent}"/>
      `;
    case 'hip-clamshell':
      return `
        <!-- Colchoneta -->
        <line x1="100" y1="235" x2="380" y2="235" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>
        <!-- Torso en decúbito lateral -->
        <circle cx="135" cy="195" r="18" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <line x1="158" y1="205" x2="238" y2="215" stroke="#1e293b" stroke-width="13" stroke-linecap="round"/>
        <!-- Pierna inferior apoyada -->
        <path d="M238 215L302 225L345 215" stroke="#64748b" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Pierna superior en abducción + rotación externa (Clamshell) -->
        <path d="M238 212L295 152L345 212" stroke="${accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Glúteo medio destacado -->
        <circle cx="238" cy="212" r="10" fill="${accent}"/>
        <!-- Arco de apertura -->
        <path d="M312 208C318 188 314 168 302 152" stroke="${accent}" stroke-width="4" stroke-dasharray="5 5"/>
      `;
    case 'hip-monster-walk':
      return `
        <!-- Posición semi-sentadilla atlética frontal -->
        <circle cx="240" cy="82" r="20" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <rect x="216" y="108" width="48" height="62" rx="14" fill="#f8fafc" stroke="#1e293b" stroke-width="5"/>
        <!-- Piernas separadas con control valgo -->
        <path d="M222 168L192 208L185 250" stroke="${accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M258 168L288 208L295 250" stroke="${accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Banda circular en rodillas / tobillos -->
        <line x1="190" y1="212" x2="290" y2="212" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
        <!-- Flechas de desplazamiento lateral -->
        <path d="M320 212H355" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
        <path d="M344 202L356 212L344 222" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'knee-isometric-quad':
      return `
        <!-- Camilla -->
        <line x1="95" y1="232" x2="385" y2="232" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
        <!-- Torso sedente largo -->
        <path d="M135 125L155 215" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <circle cx="130" cy="92" r="20" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Rodillo / toalla bajo hueco poplíteo -->
        <circle cx="255" cy="214" r="16" fill="#99f6e4" stroke="${accent}" stroke-width="4"/>
        <!-- Miembro inferior en extensión completa activa -->
        <line x1="155" y1="212" x2="255" y2="202" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
        <line x1="255" y1="202" x2="352" y2="198" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>
        <!-- Pie en dorsiflexión -->
        <line x1="352" y1="198" x2="358" y2="174" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
        <!-- Flecha de presión hacia el rodillo -->
        <path d="M255 155V188" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
        <path d="M246 178L255 190L264 178" stroke="#ef4444" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'knee-spanish-squat':
      return `
        <!-- Poste de anclaje -->
        <line x1="135" y1="65" x2="135" y2="255" stroke="#475569" stroke-width="9" stroke-linecap="round"/>
        <!-- Cincha rígida en tercio proximal de tibia -->
        <line x1="135" y1="195" x2="238" y2="195" stroke="#f59e0b" stroke-width="8"/>
        <!-- Tibia vertical, fémur horizontal y tronco erguido -->
        <line x1="238" y1="250" x2="238" y2="182" stroke="#1e293b" stroke-width="11" stroke-linecap="round"/>
        <line x1="238" y1="182" x2="308" y2="175" stroke="${accent}" stroke-width="13" stroke-linecap="round"/>
        <line x1="308" y1="175" x2="298" y2="105" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <circle cx="295" cy="74" r="20" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Articulación de rodilla y tendón rotuliano -->
        <circle cx="238" cy="182" r="10" fill="${accent}"/>
      `;
    case 'knee-step-down':
      return `
        <!-- Cajón / Step clínico -->
        <rect x="175" y="205" width="95" height="45" rx="6" fill="#cbd5e1" stroke="#475569" stroke-width="4"/>
        <!-- Pierna de apoyo en control excéntrico sobre step -->
        <path d="M225 205L238 158L222 115" stroke="${accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Pierna libre descendiendo el talón al suelo -->
        <path d="M222 115L268 175L292 242" stroke="#64748b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Torso y cabeza -->
        <line x1="222" y1="115" x2="228" y2="68" stroke="#1e293b" stroke-width="13" stroke-linecap="round"/>
        <circle cx="228" cy="44" r="17" fill="#f8fafc" stroke="#0f172a" stroke-width="4"/>
        <!-- Rodilla controlada -->
        <circle cx="238" cy="158" r="9" fill="${accent}"/>
      `;
    case 'ankle-proprioception':
      return `
        <!-- Domo / Superficie inestable (BOSU) -->
        <path d="M180 242C180 212 295 212 295 242Z" fill="#99f6e4" stroke="${accent}" stroke-width="5"/>
        <!-- Apoyo monopodal -->
        <line x1="238" y1="222" x2="238" y2="145" stroke="${accent}" stroke-width="11" stroke-linecap="round"/>
        <!-- Pierna contralateral en flexión -->
        <path d="M238 148L278 162L272 198" stroke="#64748b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Tronco y brazos en equilibrio -->
        <line x1="238" y1="145" x2="238" y2="85" stroke="#1e293b" stroke-width="13" stroke-linecap="round"/>
        <line x1="175" y1="108" x2="302" y2="108" stroke="#334155" stroke-width="8" stroke-linecap="round"/>
        <circle cx="238" cy="58" r="18" fill="#f8fafc" stroke="#0f172a" stroke-width="5"/>
        <!-- Tobillo activo -->
        <circle cx="238" cy="218" r="9" fill="${accent}"/>
      `;
    case 'ankle-eccentric-calf':
      return `
        <!-- Escalón -->
        <path d="M125 245H245V195H355" fill="none" stroke="#475569" stroke-width="6" stroke-linejoin="round"/>
        <!-- Antepié apoyado en borde del escalón, talón descendiendo -->
        <line x1="252" y1="192" x2="212" y2="216" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
        <!-- Pierna recta/semiflexionada -->
        <line x1="226" y1="205" x2="238" y2="102" stroke="#1e293b" stroke-width="12" stroke-linecap="round"/>
        <!-- Tendón de Aquiles destacado -->
        <line x1="216" y1="212" x2="228" y2="155" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
        <!-- Flecha de descenso excéntrico del talón -->
        <path d="M188 182V228" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
        <path d="M179 218L188 230L197 218" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
  }
}

export function createExerciseIllustration(spec: IllustrationSpec): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300" fill="none">
  <rect width="480" height="300" rx="16" fill="${spec.bgTint}"/>
  <!-- Sutil cuadrícula clínica de fondo -->
  <g stroke="#cbd5e1" stroke-width="1" stroke-opacity="0.45">
    <line x1="0" y1="60" x2="480" y2="60"/>
    <line x1="0" y1="120" x2="480" y2="120"/>
    <line x1="0" y1="180" x2="480" y2="180"/>
    <line x1="0" y1="240" x2="480" y2="240"/>
    <line x1="96" y1="0" x2="96" y2="300"/>
    <line x1="192" y1="0" x2="192" y2="300"/>
    <line x1="288" y1="0" x2="288" y2="300"/>
    <line x1="384" y1="0" x2="384" y2="300"/>
  </g>
  <!-- Etiqueta de Zona Anatómica -->
  <rect x="20" y="18" width="136" height="30" rx="8" fill="#ffffff" stroke="${spec.accentColor}" stroke-width="1.5"/>
  <circle cx="36" cy="33" r="5" fill="${spec.accentColor}"/>
  <text x="48" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0f172a">${spec.zoneLabel.toUpperCase()}</text>

  <!-- Diagrama Biomecánico -->
  <g>
    ${renderPosePaths(spec.pose, spec.accentColor)}
  </g>

  <!-- Barra inferior informativa -->
  <rect x="16" y="256" width="448" height="32" rx="8" fill="#ffffff" fill-opacity="0.9"/>
  <text x="28" y="276" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#334155">${spec.title}</text>
</svg>`;
  return toSvgDataUri(svg);
}
