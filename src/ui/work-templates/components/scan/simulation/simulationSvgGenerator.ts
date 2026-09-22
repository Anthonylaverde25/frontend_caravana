import { SimulationPreset } from './types';

/**
 * Generates an SVG Data URI representing an authentic, high-resolution scanned A4 worksheet
 * corresponding to the specified Work Template preset.
 */
export function generateSimulationSvg(preset: SimulationPreset, pageNumber: number = 1, totalPages: number = 1): string {
  const { templateCode, templateTitle, context, rows } = preset;

  // Header metadata formatting
  const establishment = context.establecimiento || context.farm_name || 'ESTANCIA LA PRIMAVERA';
  const renspa = context.renspa || context.provider_renspa || '02.001.0.00001/01';
  const date = context.fecha || context.evaluation_date || context.entry_date || context.fecha_destete || context.fecha_movimiento || context.planned_start_date || new Date().toISOString().slice(0, 10);

  // Determine columns and cell format based on templateCode
  let columns: Array<{ label: string; width: number; align?: 'left' | 'center' | 'right' }> = [];
  let formatRowCells: (row: any, index: number) => string[] = () => [];
  let secondaryContextText = '';

  switch (templateCode) {
    case 'TOR-01':
      secondaryContextText = `VET: ${context.veterinarian_name || 'Dr. Esteban Rossi'} | MP: ${context.veterinarian_license || '4892-BA'} | RONDA: ${context.sample_round || 1} | EVALUACIÓN: Manga Central`;
      columns = [
        { label: '#', width: 35, align: 'center' },
        { label: 'TORO / TAG', width: 110, align: 'left' },
        { label: 'CE (CM)', width: 75, align: 'center' },
        { label: 'CC', width: 55, align: 'center' },
        { label: 'LÍBIDO', width: 65, align: 'center' },
        { label: 'APLOMOS', width: 90, align: 'left' },
        { label: 'RASPAJE', width: 80, align: 'center' },
        { label: 'SEROLOG.', width: 80, align: 'center' },
        { label: 'DICT.', width: 50, align: 'center' },
        { label: 'OBSERVACIONES', width: 100, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.ce_cm ? `${r.ce_cm} cm` : '-',
        r.bcs ? String(r.bcs) : '-',
        r.libido || 'MEDIA',
        r.aplomos || 'Correctos',
        r.scrape_collected ? `[X] ${r.scrape_tube || 'R-01'}` : '[ ] -',
        r.serology_collected ? `[X] ${r.serology_tube || 'S-01'}` : '[ ] -',
        r.physical_verdict || 'A',
        r.observations || '',
      ];
      break;

    case 'LSER-01':
      secondaryContextText = `TORO EXCLUSIVO: [ ${context.toro_caravana || 'ANTHONY-TORO-004'} ] | LOTE: ${context.lote || 'Entore Vaquillonas'} | INICIO: ${context.planned_start_date || date}`;
      columns = [
        { label: '#', width: 45, align: 'center' },
        { label: 'CARAVANA VIENTRE', width: 180, align: 'left' },
        { label: 'CATEGORÍA', width: 130, align: 'left' },
        { label: 'CC (1-5)', width: 80, align: 'center' },
        { label: 'ESTADO SANITARIO', width: 120, align: 'center' },
        { label: 'OBSERVACIONES DE MANGA', width: 185, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Vaquillona',
        r.bcs ? String(r.bcs) : '3.5',
        'VACUNADO',
        r.observations || '',
      ];
      break;

    case 'DEST-01':
      secondaryContextText = `LOTE DESTETE: [ ${context.lote_destete || 'Destete Marzo 2026'} ] | TIPO: ${context.tipo_destete || 'TRADICIONAL'} | ORIGEN: ${context.lote_origen || 'Rodeo Cría 1'}`;
      columns = [
        { label: '#', width: 45, align: 'center' },
        { label: 'CARAVANA CRÍA', width: 160, align: 'left' },
        { label: 'CARAVANA MADRE', width: 160, align: 'left' },
        { label: 'PESO DESTETE (KG)', width: 140, align: 'right' },
        { label: 'SEXO', width: 70, align: 'center' },
        { label: 'OBSERVACIONES', width: 165, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.caravana_madre || '-',
        r.peso ? `${r.peso} kg` : '-',
        r.sexo || 'M',
        r.observations || '',
      ];
      break;

    case 'CACT-01': {
      // The destination column is printed only when the sheet works per animal; when a
      // single destination applies it lives in the header, where the schema puts it.
      const perRow = (rows as any[]).some((r) => String(r.lote_destino || '').trim() !== '');
      const destino = perRow ? '— POR ANIMAL —' : context.lote_destino || 'Recría Otoño 2026';
      const manejo = context.sistema_manejo === 'CORRAL'
        ? '[X] CORRAL  [ ] PASTURA'
        : context.sistema_manejo === 'PASTURA'
          ? '[ ] CORRAL  [X] PASTURA'
          : '[ ] CORRAL  [ ] PASTURA';

      secondaryContextText = `ORIGEN: [ ${context.lote_origen || 'Rodeo Cría 1'} ] → DESTINO: [ ${destino} ] | ${context.actividad_origen || 'Cría'} → ${context.actividad_destino || 'Recría'} | ${manejo} | CABEZAS: ${context.total_cabezas ?? '__'} | KG: ${context.peso_total ?? '__'}`;

      columns = perRow
        ? [
            { label: '#', width: 40, align: 'center' },
            { label: 'CARAVANA', width: 135, align: 'left' },
            { label: 'PESO ACTUAL (KG)', width: 120, align: 'right' },
            { label: 'SEXO', width: 55, align: 'center' },
            { label: 'CATEGORÍA', width: 105, align: 'left' },
            { label: 'DENT.', width: 65, align: 'center' },
            { label: 'LOTE DESTINO', width: 150, align: 'left' },
            { label: 'OBSERV.', width: 130, align: 'left' },
          ]
        : [
            { label: '#', width: 45, align: 'center' },
            { label: 'CARAVANA', width: 165, align: 'left' },
            { label: 'PESO ACTUAL (KG)', width: 150, align: 'right' },
            { label: 'SEXO', width: 70, align: 'center' },
            { label: 'CATEGORÍA', width: 130, align: 'left' },
            { label: 'DENTICIÓN', width: 100, align: 'center' },
            { label: 'OBSERVACIONES', width: 140, align: 'left' },
          ];

      formatRowCells = (r, idx) =>
        perRow
          ? [
              String(idx + 1),
              r.caravana || '',
              r.peso_actual ? `${r.peso_actual} kg` : '-',
              r.sexo || 'M',
              r.categoria || '-',
              r.dientes || '-',
              r.lote_destino || '-',
              r.observations || '',
            ]
          : [
              String(idx + 1),
              r.caravana || '',
              r.peso_actual ? `${r.peso_actual} kg` : '-',
              r.sexo || 'M',
              r.categoria || '-',
              r.dientes || '-',
              r.observations || '',
            ];
      break;
    }

    case 'REP-01':
      secondaryContextText = `RODEO DE VIENTRES | MÉTODO: Tacto Rectal & Ultrasonografía | LOTE: ${context.lote || 'Vientres Cabeza'}`;
      columns = [
        { label: '#', width: 45, align: 'center' },
        { label: 'CARAVANA VIENTRE', width: 150, align: 'left' },
        { label: 'CATEGORÍA', width: 130, align: 'left' },
        { label: 'DIAGNÓSTICO', width: 130, align: 'center' },
        { label: 'ESTADIO GESTACIONAL', width: 140, align: 'center' },
        { label: 'OBSERVACIONES', width: 145, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Vaca de Cría',
        r.diagnosis === 'PREGNANT' ? '[X] PREÑADA' : '[X] VACÍA',
        r.gestational_stage || '-',
        r.observations || '',
      ];
      break;

    case 'REP-02':
      secondaryContextText = `PLANILLA DE PARICIÓN | POTRERO MATERNIDAD | REGISTRO AL NACER`;
      columns = [
        { label: '#', width: 40, align: 'center' },
        { label: 'MADRE', width: 120, align: 'left' },
        { label: 'FECHA PARTO', width: 110, align: 'center' },
        { label: 'CARAVANA CRÍA', width: 130, align: 'left' },
        { label: 'SEXO', width: 60, align: 'center' },
        { label: 'PESO (KG)', width: 90, align: 'right' },
        { label: 'OBSERVACIONES', width: 190, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.calving_date || date,
        r.calf_caravan || '-',
        r.calf_sex || 'H',
        r.calf_weight ? `${r.calf_weight} kg` : '-',
        r.observations || '',
      ];
      break;

    case 'MON-01':
      secondaryContextText = `SERVICIO DE MONTA A CAMPO | POTRERO 4 | INICIO: ${context.planned_start_date || date}`;
      columns = [
        { label: '#', width: 40, align: 'center' },
        { label: 'VIENTRE / TAG', width: 140, align: 'left' },
        { label: 'CATEGORÍA', width: 110, align: 'left' },
        { label: 'CC (1-5)', width: 70, align: 'center' },
        { label: 'TORO DETECTADO', width: 140, align: 'left' },
        { label: 'FECHA MONTA', width: 100, align: 'center' },
        { label: 'OBSERVACIONES', width: 140, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Vaquillona',
        r.body_condition ? String(r.body_condition) : '3.0',
        r.sire_caravan || 'TORO-01',
        r.service_date || date,
        r.observations || '',
      ];
      break;

    case 'OP-01':
      secondaryContextText = `CONTROL MENSUAL DE PESAJES | BÁSCULA MANGA | TROPA RECRÍA`;
      columns = [
        { label: '#', width: 45, align: 'center' },
        { label: 'CARAVANA / ID', width: 160, align: 'left' },
        { label: 'CATEGORÍA', width: 140, align: 'left' },
        { label: 'PESO ACTUAL (KG)', width: 140, align: 'right' },
        { label: 'COND. CORP.', width: 95, align: 'center' },
        { label: 'OBSERVACIONES', width: 160, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Novillito',
        r.weight ? `${r.weight} kg` : '-',
        r.body_condition || '3.5',
        r.observations || '',
      ];
      break;

    case 'OP-02':
      secondaryContextText = `TRANSFERENCIA A INVERNADA | MOVIMIENTO OPERATIVO`;
      columns = [
        { label: '#', width: 45, align: 'center' },
        { label: 'CARAVANA / ID', width: 140, align: 'left' },
        { label: 'CATEGORÍA', width: 120, align: 'left' },
        { label: 'LOTE ORIGEN', width: 130, align: 'left' },
        { label: 'LOTE DESTINO', width: 140, align: 'left' },
        { label: 'OBSERVACIONES', width: 165, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Novillo',
        r.source_batch || 'Recría 1',
        r.target_batch || 'Feedlot 2',
        r.observations || '',
      ];
      break;

    case 'ING-01':
    default:
      secondaryContextText = `PROVEEDOR: ${context.provider_name || 'Estancia Las Lilas'} | CUIT: ${context.provider_cuit || '30-71234567-9'} | GUIA: ${context.guia_dte || 'DTE-884920'}`;
      columns = [
        { label: '#', width: 35, align: 'center' },
        { label: 'CARAVANA / TAG', width: 155, align: 'left' },
        { label: 'CATEGORÍA', width: 130, align: 'left' },
        { label: 'SEXO', width: 55, align: 'center' },
        { label: 'RAZA / PELAJE', width: 115, align: 'left' },
        { label: 'DTE', width: 55, align: 'center' },
        { label: 'PESO (KG)', width: 85, align: 'right' },
        { label: 'OBSERVACIONES', width: 110, align: 'left' },
      ];
      formatRowCells = (r, idx) => [
        String(idx + 1),
        r.caravana || '',
        r.category || 'Vaca de Cría',
        r.sex || 'H',
        r.breed || 'Angus',
        r.teeth !== undefined && r.teeth !== null ? String(r.teeth) : '4',
        r.entry_weight ? `${r.entry_weight} kg` : '-',
        r.observations || '',
      ];
      break;
  }

  // Calculate table positions
  const tableX = 40;
  const tableY = 230;
  const rowHeight = 36;
  const maxRowsOnPage = 14;
  const displayRows = rows.slice(0, maxRowsOnPage);

  // SVG Markup Generation
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1130" viewBox="0 0 800 1130" style="background:#FAF8F5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <defs>
    <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Sheet Background -->
  <rect width="800" height="1130" fill="#FAF8F5"/>
  <rect x="25" y="25" width="750" height="1080" fill="none" stroke="#0E3D26" stroke-width="2.5" rx="4"/>
  <rect x="30" y="30" width="740" height="1070" fill="none" stroke="#0E3D26" stroke-width="0.8" rx="2" stroke-dasharray="6,3"/>

  <!-- Header Section -->
  <rect x="40" y="45" width="720" height="85" fill="#FFFFFF" stroke="#0E3D26" stroke-width="1.8" rx="3"/>
  <text x="60" y="78" font-size="20" font-weight="900" fill="#0E3D26" letter-spacing="0.5">${templateTitle.toUpperCase()} (${templateCode})</text>
  <text x="60" y="105" font-size="12" font-weight="700" fill="#555555">ESTABLECIMIENTO: ${establishment} | RENSPA: ${renspa} | FECHA: ${date}</text>
  
  <!-- Template Badge (Right Header) -->
  <rect x="625" y="55" width="120" height="65" fill="#0E3D26" rx="3"/>
  <text x="685" y="85" font-size="18" font-weight="900" fill="#FFFFFF" text-anchor="middle">${templateCode}</text>
  <text x="685" y="105" font-size="10" font-weight="700" fill="#A7F3D0" text-anchor="middle">HOJA ${pageNumber} DE ${totalPages}</text>

  <!-- Secondary Metadata Box -->
  <rect x="40" y="145" width="720" height="65" fill="#F4F2EB" stroke="#CBD5E1" stroke-width="1.2" rx="3"/>
  <text x="60" y="172" font-size="12" font-weight="800" fill="#0E3D26">DATOS DEL LOTE Y PARÁMETROS OPERATIVOS:</text>
  <text x="60" y="194" font-size="11.5" font-weight="600" fill="#334155">${secondaryContextText}</text>

  <!-- Table Header -->
  <rect x="${tableX}" y="${tableY}" width="720" height="34" fill="#0E3D26" rx="2"/>
  ${(() => {
    let curX = tableX;
    return columns.map((col) => {
      const textX = col.align === 'center' ? curX + col.width / 2 : col.align === 'right' ? curX + col.width - 8 : curX + 8;
      const anchor = col.align === 'center' ? 'middle' : col.align === 'right' ? 'end' : 'start';
      const result = `<text x="${textX}" y="${tableY + 22}" font-size="10.5" font-weight="800" fill="#FFFFFF" text-anchor="${anchor}">${col.label}</text>`;
      curX += col.width;
      return result;
    }).join('\n');
  })()}

  <!-- Table Rows -->
  ${displayRows.map((row, rIdx) => {
    const rowY = tableY + 34 + rIdx * rowHeight;
    const isZebra = rIdx % 2 === 1;
    const rowBg = isZebra ? '#F8F6F0' : '#FFFFFF';
    const cells = formatRowCells(row, rIdx);

    let cellX = tableX;
    const cellsSvg = columns.map((col, cIdx) => {
      const val = cells[cIdx] || '';
      const textX = col.align === 'center' ? cellX + col.width / 2 : col.align === 'right' ? cellX + col.width - 8 : cellX + 8;
      const anchor = col.align === 'center' ? 'middle' : col.align === 'right' ? 'end' : 'start';
      const cellMarkup = `
        <text x="${textX}" y="${rowY + 23}" font-size="11" font-weight="600" font-family="'Courier New', monospace" fill="#1E3A8A" text-anchor="${anchor}">${val}</text>
      `;
      cellX += col.width;
      return cellMarkup;
    }).join('');

    return `
      <rect x="${tableX}" y="${rowY}" width="720" height="${rowHeight}" fill="${rowBg}" stroke="#E2E8F0" stroke-width="0.8"/>
      ${cellsSvg}
    `;
  }).join('')}

  <!-- Footer & Signatures -->
  <rect x="40" y="930" width="720" height="135" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2" rx="3"/>
  <text x="60" y="955" font-size="11.5" font-weight="800" fill="#0E3D26">OBSERVACIONES Y NOTAS SANITARIAS DE CAMPO:</text>
  <text x="60" y="978" font-size="11" font-style="italic" fill="#475569">${context.observaciones || 'Planilla de manga completada satisfactoriamente. Sanidad y caravaneo verificado conforme a protocolo.'}</text>
  
  <line x1="80" y1="1035" x2="330" y2="1035" stroke="#334155" stroke-width="1.2"/>
  <text x="205" y="1052" font-size="10.5" font-weight="700" fill="#64748B" text-anchor="middle">FIRMA RESPONSABLE DE MANGA</text>

  <line x1="470" y1="1035" x2="700" y2="1035" stroke="#334155" stroke-width="1.2"/>
  <text x="585" y="1052" font-size="10.5" font-weight="700" fill="#64748B" text-anchor="middle">FIRMA Y MATRÍCULA VETERINARIO</text>

  <text x="400" y="1098" font-size="9.5" font-weight="700" fill="#94A3B8" text-anchor="middle">JHOANGEL GANADERO • SISTEMA INTEGRAL DE REGISTRO ZOOTÉCNICO Y TRAZABILIDAD</text>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}
