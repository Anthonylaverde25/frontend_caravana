import axiosInstance from 'src/utils/axios';
import { WorkTemplate } from '../types/TemplateModels';

const MOCK_REP_02: WorkTemplate = {
	id: 9999,
	title: 'Planilla de Parición',
	description: 'Registro de partos en campo, caravanas de terneros nacidos, sexo, peso y observaciones.',
	code: 'REP-02',
	category: 'REPRODUCTIVE',
	status: 'active',
	schema_definition: [
		{ name: 'caravana', label: 'Caravana Madre', type: 'string', required: true },
		{ name: 'category', label: 'Categoría', type: 'string', required: true },
		{ name: 'calving_date', label: 'Fecha Parición', type: 'date', required: true },
		{ name: 'calf_caravan', label: 'Caravana Ternero', type: 'string', required: false },
		{ name: 'calf_sex', label: 'Sexo Ternero', type: 'select', required: false, options: [{ value: 'M', label: 'M' }, { value: 'H', label: 'H' }] },
		{ name: 'calf_weight', label: 'Peso Nacer (kg)', type: 'number', required: false },
		{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
	],
	created_at: new Date().toISOString()
};

const MOCK_ING_01: WorkTemplate = {
	id: 9998,
	title: 'Ingreso de Caravanas y Creación de Lote',
	description: 'Registro de ingreso de tropa/caravanas, asignación de potrero, pesaje inicial y creación directa de lote.',
	code: 'ING-01',
	category: 'ENTRY',
	status: 'active',
	schema_definition: [
		{ name: 'caravana', label: 'Caravana / ID', type: 'string', required: true },
		{ name: 'category', label: 'Categoría', type: 'string', required: true },
		{ name: 'breed', label: 'Raza / Pelaje', type: 'string', required: false },
		{ name: 'weight', label: 'Peso Inicial (kg)', type: 'number', required: false },
		{ name: 'health_status', label: 'Vacunación', type: 'select', required: false, options: [{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }] },
		{ name: 'brand_signal', label: 'Marca / Señal', type: 'string', required: false },
		{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
	],
	created_at: new Date().toISOString()
};

const MOCK_TOR_01: WorkTemplate = {
	id: 9995,
	title: 'Revisación Andrológica y Muestreo en Manga',
	description: 'Evaluación andrológica en corral (CE, CC, aplomos) y doble muestreo de raspaje prepucial (ETS) y serología de sangre.',
	code: 'TOR-01',
	category: 'REPRODUCTIVE',
	status: 'active',
	schema_definition: [
		{ name: 'caravana', label: 'Caravana / Toro', type: 'string', required: true },
		{ name: 'ce_cm', label: 'Circunferencia Escrotal (cm)', type: 'number', required: false },
		{ name: 'bcs', label: 'Condición Corporal (1-5)', type: 'string', required: false },
		{ name: 'libido', label: 'Líbido', type: 'string', required: false },
		{ name: 'aplomos', label: 'Aplomos', type: 'string', required: false },
		{ name: 'scrape_collected', label: 'Raspaje ETS', type: 'string', required: false },
		{ name: 'scrape_tube', label: 'Tubo Raspaje', type: 'string', required: false },
		{ name: 'serology_collected', label: 'Serología Sangre', type: 'string', required: false },
		{ name: 'serology_tube', label: 'Tubo Serología', type: 'string', required: false },
		{ name: 'physical_verdict', label: 'Dictamen', type: 'string', required: false },
		{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
	],
	created_at: new Date().toISOString()
};

const MOCK_TEMPLATES: WorkTemplate[] = [
	{
		id: 1001,
		title: 'Planilla de Tacto y Ecografía',
		description: 'Registro de diagnóstico de gestación, tacto rectal y ecografía en vientres.',
		code: 'REP-01',
		category: 'REPRODUCTIVE',
		status: 'active',
		schema_definition: [
			{ name: 'caravana', label: 'Caravana', type: 'string', required: true },
			{ name: 'category', label: 'Categoría', type: 'string', required: true },
			{ name: 'diagnosis', label: 'Diagnóstico', type: 'select', required: true, options: [{ value: 'PREGNANT', label: 'Preñada' }, { value: 'EMPTY', label: 'Vacía' }] },
			{ name: 'gestational_stage', label: 'Estadio', type: 'select', required: false, options: [{ value: 'CABEZA', label: 'Cabeza' }, { value: 'CUERPO', label: 'Cuerpo' }, { value: 'COLA', label: 'Cola' }] },
			{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
		],
		created_at: new Date().toISOString()
	},
	MOCK_REP_02,
	MOCK_ING_01,
	MOCK_TOR_01,
	{
		id: 9997,
		title: 'Control Mensual de Lotes',
		description: 'Planilla para el pesaje de rutina mensual de tropas en recría.',
		code: 'OP-01',
		category: 'WEIGHT',
		status: 'active',
		schema_definition: [
			{ name: 'caravana', label: 'Caravana / ID', type: 'string', required: true },
			{ name: 'category', label: 'Categoría', type: 'string', required: true },
			{ name: 'weight', label: 'Peso Actual (kg)', type: 'number', required: true },
			{ name: 'body_condition', label: 'Cond. Corporal', type: 'string', required: false },
			{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
		],
		created_at: new Date().toISOString()
	},
	{
		id: 9996,
		title: 'Transferencia a Invernada',
		description: 'Movimiento de lotes que finalizan la recría y pasan a terminación.',
		code: 'OP-02',
		category: 'ACTIVITY',
		status: 'active',
		schema_definition: [
			{ name: 'caravana', label: 'Caravana / ID', type: 'string', required: true },
			{ name: 'category', label: 'Categoría', type: 'string', required: true },
			{ name: 'source_batch', label: 'Lote Origen', type: 'string', required: true },
			{ name: 'target_batch', label: 'Lote Destino', type: 'string', required: true },
			{ name: 'observations', label: 'Observaciones', type: 'text', required: false }
		],
		created_at: new Date().toISOString()
	}
];

class TemplateService {
	async getWorkTemplates(): Promise<WorkTemplate[]> {
		try {
			const response = await axiosInstance.get<WorkTemplate[]>('/work-templates');
			const templates = response.data;
			
			// Append mock templates if they don't already exist in backend response
			MOCK_TEMPLATES.forEach((mock) => {
				if (!templates.some((t) => t.code === mock.code)) {
					templates.push(mock);
				}
			});
			return templates;
		} catch (error) {
			console.error('Failed fetching templates from backend, falling back to mocks.', error);
			return MOCK_TEMPLATES;
		}
	}

	async getWorkTemplateByCode(code: string): Promise<WorkTemplate> {
		if (code === 'REP-02') return MOCK_REP_02;
		if (code === 'ING-01') return MOCK_ING_01;
		if (code === 'TOR-01') return MOCK_TOR_01;
		
		const foundMock = MOCK_TEMPLATES.find((t) => t.code === code);
		
		try {
			const response = await axiosInstance.get<WorkTemplate>(`/work-templates/${code}`);
			return response.data || foundMock || MOCK_ING_01;
		} catch (error) {
			console.warn(`Backend fetch failed for template code: ${code}, using fallback.`, error);
			if (foundMock) return foundMock;
			throw error;
		}
	}
}

const templateService = new TemplateService();
export default templateService;

