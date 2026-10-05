export interface ZootechnicalFieldMetric {
	label: string;
	hint?: string;
}

export interface ZootechnicalTemplateMeta {
	code: string;
	stageKey: 'breeding' | 'gestation' | 'calving' | 'weaning' | 'transition' | 'growth' | 'entry';
	stageName: string;
	stageColor: string;
	stageBadgeBg: string;
	stageIcon: string;
	zootechnicalSummary: string;
	biologicalObjective: string;
	fieldMetrics: ZootechnicalFieldMetric[];
	orderContext: string;
	hasScanAi: boolean;
	hasPrintSheet: boolean;
	isArchived?: boolean;
}

export const ZOOTECHNICAL_STAGES = [
	{ key: 'all', label: 'Todos los Procesos', icon: 'heroicons-outline:squares-2x2', color: '#4b5563' },
	{ key: 'breeding', label: 'Servicio & Andrología', icon: 'heroicons-outline:shield-check', color: '#8b5cf6' },
	{ key: 'gestation', label: 'Diagnóstico de Gestación', icon: 'heroicons-outline:sparkles', color: '#0284c7' },
	{ key: 'calving', label: 'Maternidad & Parición', icon: 'heroicons-outline:heart', color: '#ec4899' },
	{ key: 'weaning', label: 'Destete & Desmadre', icon: 'heroicons-outline:arrows-pointing-out', color: '#d97706' },
	{ key: 'transition', label: 'Transición Productiva', icon: 'heroicons-outline:arrows-right-left', color: '#059669' },
	{ key: 'growth', label: 'Control de Peso & Crecimiento', icon: 'heroicons-outline:scale', color: '#2563eb' },
	{ key: 'entry', label: 'Ingresos & Cuarentena', icon: 'heroicons-outline:arrow-down-tray', color: '#16a34a' }
] as const;

export const ZOOTECHNICAL_CATALOG: Record<string, ZootechnicalTemplateMeta> = {
	'TOR-01': {
		code: 'TOR-01',
		stageKey: 'breeding',
		stageName: 'Servicio & Andrología',
		stageColor: '#8b5cf6',
		stageBadgeBg: '#f5f3ff',
		stageIcon: 'heroicons-outline:shield-check',
		zootechnicalSummary:
			'Examen clínico-sanitario de la torada 60 días antes del servicio. Evalúa circunferencia escrotal (CE ≥ 28-30 cm, directamente ligada a volumen seminal y precocidad de hijas), condición corporal (3.0 a 3.5), integridad de aplomos y doble raspaje prepucial seriado para erradicar ETS (Tricomoniasis y Campylobacteriosis genital bovina).',
		biologicalObjective:
			'Garantizar la fertilidad potencial de los reproductores machos y evitar la transmisión de venéreas al rodeo de vientres.',
		fieldMetrics: [
			{ label: 'Circunferencia Escrotal (cm)', hint: 'Mínimo 28-30 cm según edad' },
			{ label: 'Condición Corporal (1 a 5)', hint: 'Rango óptimo 3.0 - 3.5' },
			{ label: 'Aplomos & Locomoción', hint: 'Verificación de tarsos y pezuñas' },
			{ label: 'Raspaje Prepucial ETS', hint: 'Doble muestreo serológico' },
			{ label: 'Serología Sangre', hint: 'Brucelosis bovina' },
			{ label: 'Dictamen en Manga', hint: 'Apto, Rechazo o Tratamiento' }
		],
		orderContext: 'Manejo Pre-Servicio (60 días antes del entore)',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'LSER-01': {
		code: 'LSER-01',
		stageKey: 'breeding',
		stageName: 'Entore Controlado',
		stageColor: '#7c3aed',
		stageBadgeBg: '#f5f3ff',
		stageIcon: 'heroicons-outline:user-group',
		zootechnicalSummary:
			'Conformación de lote de servicio uniparental. Asigna un toro específico a un conjunto cerrado de vientres seleccionados con fecha de inicio fija. Otorga certeza de paternidad para selección genética y cálculo de DEPs, permitiendo una carga controlada (2.5 a 4% de toros) y sincronía en la preñez.',
		biologicalObjective:
			'Trazabilidad genealógica paternal estricta y sincronización de curvas de preñez en grupos homogéneos de hembras.',
		fieldMetrics: [
			{ label: 'Caravana del Toro', hint: 'Identificador del reproductor padre' },
			{ label: 'Caravanas de Vientres', hint: 'Lista de hembras asignadas' },
			{ label: 'Fecha Inicio Entore', hint: 'Inicio de la temporada de servicio' },
			{ label: 'Fecha Estimada Retiro', hint: 'Fin de permanencia del reproductor' },
			{ label: 'Lote de Servicio', hint: 'Potrero delimitado para el rodeo' }
		],
		orderContext: 'Inicio de Temporada de Entore',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'MON-01': {
		code: 'MON-01',
		stageKey: 'breeding',
		stageName: 'Servicio a Campo',
		stageColor: '#9333ea',
		stageBadgeBg: '#faf5ff',
		stageIcon: 'heroicons-outline:clipboard-document-check',
		zootechnicalSummary:
			'Planilla oficial de seguimiento de montas a campo o entore colectivo. Registra la condición corporal (CC 1-5) del vientre al momento del servicio (parámetro determinante para superar el anestro postparto) y monitorea la líbido y comportamiento de los toros en pastoreo.',
		biologicalObjective:
			'Monitorear la actividad de celo a campo y correlacionar la preñez temprana con el estado nutricional del vientre.',
		fieldMetrics: [
			{ label: 'Caravana Vientre', hint: 'Hembra receptiva en celo' },
			{ label: 'Condición Corporal (1-5)', hint: 'Clave para reactivación ovárica' },
			{ label: 'Toro Detectado / Asignado', hint: 'Reproductor que realizó la monta' },
			{ label: 'Fecha de Monta', hint: 'Día observado en el potrero' },
			{ label: 'Modalidad de Servicio', hint: 'Colectivo, Rotación o Individual' }
		],
		orderContext: 'Durante la Temporada de Entore',
		hasScanAi: false,
		hasPrintSheet: true
	},
	'REP-01': {
		code: 'REP-01',
		stageKey: 'gestation',
		stageName: 'Diagnóstico de Gestación',
		stageColor: '#0284c7',
		stageBadgeBg: '#f0f9ff',
		stageIcon: 'heroicons-outline:sparkles',
		zootechnicalSummary:
			'Palpación rectal y ecografía transrectal realizada a los 60-90 días post-entore. Clasifica la preñez en Cabeza (mayor peso al destete), Cuerpo y Cola de parición. Identifica vientres vacíos para su descarte inmediato o clasificación como Vaca CUT (Cría Último Ternero), optimizando la carga forrajera del invierno.',
		biologicalObjective:
			'Maximizar la tasa de destete y eliminar bocas improductivas (vacías) que consumen forraje sin generar ternero.',
		fieldMetrics: [
			{ label: 'Diagnóstico (Preñada/Vacía)', hint: 'Confirmación tacto/ecografía' },
			{ label: 'Estadio (Cabeza/Cuerpo/Cola)', hint: 'Segmentación fetal por edad' },
			{ label: 'Condición Uterina / Ovárica', hint: 'Detección de patologías' },
			{ label: 'Dentición / Categoría', hint: 'Evaluación de desgaste dental' }
		],
		orderContext: 'Post-Entore (Otoño / Fin de Servicio)',
		hasScanAi: false,
		hasPrintSheet: true
	},
	'PAR-01': {
		code: 'PAR-01',
		stageKey: 'calving',
		stageName: 'Maternidad & Parición',
		stageColor: '#ec4899',
		stageBadgeBg: '#fdf2f8',
		stageIcon: 'heroicons-outline:heart',
		zootechnicalSummary:
			'Registro de recorrida diaria de potreros de maternidad durante la parición. Verifica viabilidad neonatal (Parió vivo, Nacido Muerto, Aborto), registra peso al nacer (alerta de distocia y peso materno), fija la caravana de la cría al pie de su madre biológica y vigila calostrado e instinto maternal.',
		biologicalObjective:
			'Minimizar la mortalidad perinatal (merma tacto-nacimiento) y consolidar la filiación madre-cría en la base genealógica.',
		fieldMetrics: [
			{ label: 'Resultado (V/M/A)', hint: 'Vivo, Nacido Muerto o Aborto' },
			{ label: 'Caravana de la Cría', hint: 'Identificación colocada al nacer' },
			{ label: 'Caravana Madre', hint: 'Filiación materna biológica' },
			{ label: 'Sexo (M/H)', hint: 'Macho o Hembra' },
			{ label: 'Peso al Nacer (kg)', hint: 'Control de distocia y vitalidad' },
			{ label: 'Fecha de Parto', hint: 'Día exacto de nacimiento' }
		],
		orderContext: 'Temporada de Parición (Primavera / Fin Invierno)',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'DEST-01': {
		code: 'DEST-01',
		stageKey: 'weaning',
		stageName: 'Destete & Desmadre',
		stageColor: '#d97706',
		stageBadgeBg: '#fffbeb',
		stageIcon: 'heroicons-outline:arrows-pointing-out',
		zootechnicalSummary:
			'Desmadre zootécnico del ternero. Corta la lactancia (que absorbe más del 40% de la energía de la madre), permitiendo a la vaca recuperar estado corporal antes del próximo invierno y servicio. Registra peso individual de destete (medición de habilidad materna), clasifica por sexo y asigna tropa a recría en pastura o corral.',
		biologicalObjective:
			'Recuperar condición corporal de la vaca de cría y clasificar homogéneamente la camada de terneros para su fase de crecimiento.',
		fieldMetrics: [
			{ label: 'Tipo de Destete', hint: 'Tradicional, Anticipado o Precoz' },
			{ label: 'Peso Balanza (kg)', hint: 'Peso individual al desmadre' },
			{ label: 'Manejo (Corral / Pastura)', hint: 'Destino nutricional de la cría' },
			{ label: 'C/S Nueva', hint: 'Reclasificación a Novillito / Vaquillona' },
			{ label: 'Lote Destino', hint: 'Potrero o corral de recría' }
		],
		orderContext: 'Otoño / Fin de Lactancia',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'CACT-01': {
		code: 'CACT-01',
		stageKey: 'transition',
		stageName: 'Transición Productiva',
		stageColor: '#059669',
		stageBadgeBg: '#ecfdf5',
		stageIcon: 'heroicons-outline:arrows-right-left',
		zootechnicalSummary:
			'Movimiento y reclasificación de animales entre actividades productivas (Cría ➔ Recría ➔ Invernada/Terminación). Registra peso real de ingreso a la nueva fase, evalúa dentición (DL, 2D, 4D) como indicador de madurez biológica y asigna el sistema de alimentación correspondiente (pastoril intensivo, verdeo o feedlot).',
		biologicalObjective:
			'Alinear la oferta nutricional y el manejo con el estadio de desarrollo corporal del animal para optimizar la eficiencia de conversión.',
		fieldMetrics: [
			{ label: 'Actividad Origen / Destino', hint: 'Pase entre ciclos productivos' },
			{ label: 'Peso Actual Entrada (kg)', hint: 'Pesaje de ingreso en balanza' },
			{ label: 'Dentición', hint: 'DL, 2D, 4D, 6D, 8D, Boca Llena' },
			{ label: 'Sexo (M/H)', hint: 'Macho o Hembra' },
			{ label: 'C/S Nueva', hint: 'Categoría productiva actualizada' },
			{ label: 'Manejo (Corral / Pastura)', hint: 'Régimen de la nueva tropa' }
		],
		orderContext: 'Transición entre Ciclos del Establecimiento',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'OP-01': {
		code: 'OP-01',
		stageKey: 'growth',
		stageName: 'Control de Crecimiento',
		stageColor: '#2563eb',
		stageBadgeBg: '#eff6ff',
		stageIcon: 'heroicons-outline:scale',
		zootechnicalSummary:
			'Pesaje mensual de rutina en lotes de recría e invernada. Permite calcular la Ganancia Diaria de Peso Vivo (GDPV = ΔP / días) por cabeza y por lote, detectando desvíos de ganancia esperada, ajustando la suplementación o carga forrajera y proyectando la fecha óptima de faena o primer entore en vaquillonas (65% del peso adulto).',
		biologicalObjective:
			'Monitorear curvas de crecimiento y eficiencia de conversión forrajera en tropas en desarrollo.',
		fieldMetrics: [
			{ label: 'Caravana / ID', hint: 'Identificación individual' },
			{ label: 'Peso Actual (kg)', hint: 'Pesaje directo en balanza de manga' },
			{ label: 'Ganancia Diaria (GDPV)', hint: 'Velocidad de aumento de peso' },
			{ label: 'Condición Corporal', hint: 'Puntaje de engrasamiento' },
			{ label: 'Días entre Pesajes', hint: 'Intervalo de control' }
		],
		orderContext: 'Rutina Mensual en Recría e Invernada',
		hasScanAi: false,
		hasPrintSheet: true
	},
	'ING-01': {
		code: 'ING-01',
		stageKey: 'entry',
		stageName: 'Ingreso Compra Directa',
		stageColor: '#16a34a',
		stageBadgeBg: '#f0fdf4',
		stageIcon: 'heroicons-outline:arrow-down-tray',
		zootechnicalSummary:
			'Recepción individualizada en manga de animales adquiridos directamente a productores. Asigna caravana oficial, valida biotipo racial, sexo, dentición para edad cronológica y pesaje inicial de balanza. Establece el punto cero para control sanitario de arribo y conformación de tropa propia.',
		biologicalObjective:
			'Trazabilidad individual desde el arribo y verificación física/sanitaria contra especificaciones de compra.',
		fieldMetrics: [
			{ label: 'Caravana / Botón', hint: 'Identificador asignado en manga' },
			{ label: 'Categoría', hint: 'Ternero, Novillito, Vaquillona, etc.' },
			{ label: 'Raza / Pelaje', hint: 'Biotipo racial predominante' },
			{ label: 'Dentición', hint: 'DL, 2D, 4D, 6D, 8D' },
			{ label: 'Peso Ingreso (kg)', hint: 'Pesaje de báscula en descarga' },
			{ label: 'Estatus Sanitario', hint: 'Vacunaciones y marcas líquidas' }
		],
		orderContext: 'Recepción y Cuarentena de Hacienda',
		hasScanAi: false,
		hasPrintSheet: true
	},
	'ING-02': {
		code: 'ING-02',
		stageKey: 'entry',
		stageName: 'Orden de Ingreso Externa',
		stageColor: '#0d9488',
		stageBadgeBg: '#f0fdfa',
		stageIcon: 'heroicons-outline:truck',
		zootechnicalSummary:
			'Documento agronómico y comercial de compra de tropas en remates o consignaciones. Registra porcentaje de desbaste en transporte, estatus sanitario de garrapata (vacunación/despacho), aptitud de comedero ("sabe comer" para prevenir timpanismo o acidosis en encierre) y rangos de peso promedio por raza.',
		biologicalObjective:
			'Control logístico-sanitario y adaptación nutricional de tropas adquiridas antes de la distribución en lotes internos.',
		fieldMetrics: [
			{ label: 'Cabezas Totales', hint: 'Cantidad de animales de la tropa' },
			{ label: 'Categoría', hint: 'Categorización comercial' },
			{ label: '% Desbaste Flete', hint: 'Pérdida de peso por viaje' },
			{ label: 'Sabe Comer (SI/NO)', hint: 'Aptitud para suplementación' },
			{ label: 'Garrapata (SI/NO)', hint: 'Estatus del predio de origen' },
			{ label: 'Peso Aprox (Mín/Máx/Prom)', hint: 'Homogeneidad de la tropa' },
			{ label: 'Composición Racial', hint: 'Desglose de razas y cruzas' }
		],
		orderContext: 'Liquidación de Compra y Remate Feria',
		hasScanAi: true,
		hasPrintSheet: true
	},
	'OP-02': {
		code: 'OP-02',
		stageKey: 'transition',
		stageName: 'Pase a Invernada [Histórica]',
		stageColor: '#6b7280',
		stageBadgeBg: '#f3f4f6',
		stageIcon: 'heroicons-outline:archive-box',
		zootechnicalSummary:
			'Planilla histórica de movimiento de hacienda a terminación. Reemplazada y consolidada por CACT-01, que incorpora pesaje balanza por cabeza, dentición individual y asignación multi-destino.',
		biologicalObjective:
			'Registro histórico conservado para trazabilidad de tropas pasadas.',
		fieldMetrics: [
			{ label: 'Caravana / ID', hint: 'Identificador del animal' },
			{ label: 'Categoría', hint: 'Categoría de origen' },
			{ label: 'Lote Origen', hint: 'Lote de recría saliente' },
			{ label: 'Lote Destino', hint: 'Lote de invernada entrante' }
		],
		orderContext: 'Archivada (Sustituida por CACT-01)',
		hasScanAi: false,
		hasPrintSheet: false,
		isArchived: true
	}
};
