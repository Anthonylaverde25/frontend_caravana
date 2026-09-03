/**
 * INTA CSV & Plain Text Livestock Caravan Parser
 * Parses standard INTA, Tru-Test, Gallagher, and Allflex field reader export files (.csv, .txt)
 * and normalizes animal records for field work templates (e.g. ING-01).
 */

export interface ParsedCaravanItem {
  id?: string | number;
  identification: string;
  category_name?: string;
  sex?: 'M' | 'H' | string;
  breed?: string;
  teeth?: string | number;
  entry_weight?: string | number;
  observations?: string;
}

export function parseIntaCsvText(content: string): ParsedCaravanItem[] {
  if (!content || !content.trim()) {
    return [];
  }

  // Normalize line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Detect delimiter: comma, semicolon, or tab
  const sampleLine = lines[0];
  let delimiter = ',';
  if (sampleLine.includes(';')) {
    delimiter = ';';
  } else if (sampleLine.includes('\t')) {
    delimiter = '\t';
  } else if (!sampleLine.includes(',') && sampleLine.includes(' ')) {
    delimiter = ' ';
  }

  // Split line helper
  const splitLine = (line: string): string[] => {
    return line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
  };

  const headerCells = splitLine(lines[0]);
  const hasHeader = detectHasHeader(headerCells);

  let dataLines = lines;
  let headerIndexMap: Record<string, number> = {};

  if (hasHeader) {
    headerIndexMap = buildHeaderIndexMap(headerCells);
    dataLines = lines.slice(1);
  }

  const result: ParsedCaravanItem[] = [];

  dataLines.forEach((line, index) => {
    const cells = splitLine(line);
    if (cells.length === 0 || (cells.length === 1 && !cells[0])) return;

    let identification = '';
    let category_name = '';
    let sex = '';
    let breed = '';
    let teeth = '';
    let entry_weight = '';
    let observations = '';

    if (hasHeader && Object.keys(headerIndexMap).length > 0) {
      if (headerIndexMap.identification !== undefined) identification = cells[headerIndexMap.identification] || '';
      if (headerIndexMap.category !== undefined) category_name = cells[headerIndexMap.category] || '';
      if (headerIndexMap.sex !== undefined) sex = cells[headerIndexMap.sex] || '';
      if (headerIndexMap.breed !== undefined) breed = cells[headerIndexMap.breed] || '';
      if (headerIndexMap.teeth !== undefined) teeth = cells[headerIndexMap.teeth] || '';
      if (headerIndexMap.weight !== undefined) entry_weight = cells[headerIndexMap.weight] || '';
      if (headerIndexMap.observations !== undefined) observations = cells[headerIndexMap.observations] || '';
    } else {
      // Index positional fallback: col0=tag, col1=category, col2=sex, col3=breed, col4=teeth, col5=weight, col6=obs
      identification = cells[0] || '';
      category_name = cells[1] || '';
      sex = cells[2] || '';
      breed = cells[3] || '';
      teeth = cells[4] || '';
      entry_weight = cells[5] || '';
      observations = cells[6] || '';
    }

    if (!identification) return; // Skip rows without identification

    // Normalize Sex
    let normalizedSex = sex.toUpperCase();
    if (normalizedSex.startsWith('H') || normalizedSex.startsWith('F') || normalizedSex.includes('HEMBRA')) {
      normalizedSex = 'H';
    } else if (normalizedSex.startsWith('M') || normalizedSex.includes('MACHO')) {
      normalizedSex = 'M';
    } else {
      normalizedSex = sex;
    }

    result.push({
      id: `custom_${index + 1}_${Date.now()}`,
      identification: identification.toUpperCase(),
      category_name: category_name,
      sex: normalizedSex,
      breed: breed,
      teeth: teeth,
      entry_weight: entry_weight,
      observations: observations
    });
  });

  return result;
}

function detectHasHeader(cells: string[]): boolean {
  const lowerCells = cells.map(c => c.toLowerCase());
  const knownKeywords = [
    'caravana', 'tag', 'rfid', 'identificacion', 'id', 'categoria', 
    'sexo', 'raza', 'denticion', 'teeth', 'peso', 'weight', 'observaciones'
  ];
  return lowerCells.some(cell => knownKeywords.some(kw => cell.includes(kw)));
}

function buildHeaderIndexMap(headerCells: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  headerCells.forEach((rawCell, index) => {
    const cell = rawCell.toLowerCase().trim();

    if (/caravana|tag|rfid|identificac|visual|num|nro|^id$/.test(cell)) {
      if (map.identification === undefined) map.identification = index;
    } else if (/categor|subcategor|cat/.test(cell)) {
      if (map.category === undefined) map.category = index;
    } else if (/sexo|sex|m\/h|genero|género/.test(cell)) {
      if (map.sex === undefined) map.sex = index;
    } else if (/raza|breed|pelaje/.test(cell)) {
      if (map.breed === undefined) map.breed = index;
    } else if (/dentic|teeth|dient/.test(cell)) {
      if (map.teeth === undefined) map.teeth = index;
    } else if (/peso|weight|kilos|kg/.test(cell)) {
      if (map.weight === undefined) map.weight = index;
    } else if (/observ|notes|obs|detalles/.test(cell)) {
      if (map.observations === undefined) map.observations = index;
    }
  });

  return map;
}
