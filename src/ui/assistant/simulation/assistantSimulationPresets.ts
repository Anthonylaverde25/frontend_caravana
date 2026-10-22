import type { AssistantResponse } from '@/core/assistant/domain/AssistantTypes';
import { ENTITY_LINK_PRESETS } from './entityLinkPresets';
import { STOCK_LINK_PRESETS } from './stockLinkPresets';

/**
 * Canned assistant answers to review the drawer without ai-agent or the model (development only).
 * They cover the flows the assistant must handle: a grounded answer with blocks, a warning that
 * separates composition from real change, a missing-data answer, a refused sensitive topic, and
 * tables whose cells open a record's drawer.
 */
export interface AssistantSimulationPreset {
	key: string;
	label: string;
	flow: 'happy' | 'warning' | 'error' | 'refusal';
	question: string;
	response: AssistantResponse;
}

export const ASSISTANT_SIMULATION_PRESETS: AssistantSimulationPreset[] = [
	{
		key: 'herd-stock',
		label: 'Existencias por categoría',
		flow: 'happy',
		question: '¿Cuántas cabezas tengo por categoría?',
		response: {
			grounded: true,
			tools_used: ['resumen_rodeo', 'emit_kpis', 'emit_table', 'emit_action'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'Tenés **1.243 cabezas**: 812 hembras (65,3 %) y 431 machos. La categoría más numerosa es **Vaca** con 520 cabezas.'
				},
				{
					type: 'kpis',
					items: [
						{ label: 'Total', value: 1243, unit: 'cabezas' },
						{ label: 'Hembras', value: 812, unit: 'cabezas' },
						{ label: 'Machos', value: 431, unit: 'cabezas' },
						{ label: 'Hembras', value: 65.3, unit: '%' }
					]
				},
				{
					type: 'table',
					title: 'Existencias por categoría',
					columns: [
						{ key: 'sexo', label: 'Sexo' },
						{ key: 'categoria', label: 'Categoría' },
						{ key: 'cabezas', label: 'Cabezas' }
					],
					rows: [
						{ sexo: 'Hembra', categoria: 'Vaca', cabezas: 520 },
						{ sexo: 'Hembra', categoria: 'Vaquillona', cabezas: 210 },
						{ sexo: 'Hembra', categoria: 'Ternera', cabezas: 82 },
						{ sexo: 'Macho', categoria: 'Novillo', cabezas: 300 },
						{ sexo: 'Macho', categoria: 'Ternero', cabezas: 105 },
						{ sexo: 'Macho', categoria: 'Toro', cabezas: 26 }
					],
					total_rows: 6
				},
				{ type: 'action', label: 'Ver rodeo', route: '/herd' }
			]
		}
	},
	{
		key: 'composition-effect',
		label: 'Peso que baja por transferencia',
		flow: 'warning',
		question: '¿Por qué bajó el peso promedio del lote Recría 2025?',
		response: {
			grounded: true,
			tools_used: ['resolver_lote', 'resumen_lote', 'historial_caravana'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'⚠️ El promedio bajó de **238 kg** a **221 kg**, pero **no es pérdida de peso**: el 12/10 salieron los 18 animales más pesados hacia Invernada 3.\n\n' +
						'- Los 32 que quedaron pesaban 219 kg en la pesada anterior y hoy 221 kg (n = 32).\n' +
						'- La caída del promedio es un **efecto de composición** del lote, no del desempeño.\n\n' +
						'Para ver la evolución real, conviene comparar siempre los mismos animales.'
				},
				{
					type: 'kpis',
					title: 'Recría 2025',
					items: [
						{ label: 'Promedio actual', value: 221, unit: 'kg', n: 32 },
						{ label: 'Promedio anterior', value: 238, unit: 'kg', n: 50 }
					]
				},
				{ type: 'action', label: 'Abrir lote', route: '/batches/3' }
			]
		}
	},
	{
		key: 'missing-data',
		label: 'Dato que el sistema no registra',
		flow: 'error',
		question: '¿Cuál fue la mortandad por causa este año?',
		response: {
			grounded: false,
			tools_used: [],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'No puedo responder eso con tus registros: el sistema **no guarda el motivo de egreso** de los animales, así que no se puede separar mortandad de venta o traslado.\n\n' +
						'Para tenerlo habría que registrar el motivo en cada baja. Mientras tanto, puedo mostrarte las existencias actuales por categoría.'
				}
			]
		}
	},
	{
		key: 'price-refusal',
		label: 'Pregunta de precios (rechazo)',
		flow: 'refusal',
		question: '¿Cuánto valen mis novillos hoy? ¿Conviene vender?',
		response: {
			grounded: false,
			tools_used: [],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'No doy orientación comercial ni financiera; para precios y momento de venta conviene consultar a tu asesor. ' +
						'Lo que sí puedo mostrarte es el peso actual y la cantidad de novillos por lote, para que lo evalúes con él.'
				}
			]
		}
	},
	{
		key: 'weight-histogram',
		label: 'Histograma de pesos de hembras',
		flow: 'happy',
		question: 'Graficame la distribución de pesos de las hembras',
		response: {
			grounded: true,
			tools_used: ['padron_caravanas', 'distribucion', 'estadisticas', 'emit_chart', 'emit_kpis'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'De **326 hembras**, **183 tienen peso registrado**; 143 quedaron afuera por no tener el dato. La mayoría está entre **400 y 500 kg**.'
				},
				{
					type: 'kpis',
					items: [
						{ label: 'Peso medio', value: 412.6, unit: 'kg', n: 183 },
						{ label: 'Mediana', value: 431, unit: 'kg', n: 183 }
					]
				},
				{
					type: 'chart',
					title: 'Distribución de pesos de hembras',
					kind: 'histogram',
					x: 'rango',
					y: ['cabezas'],
					x_label: 'Rango de peso (kg)',
					y_label: 'Cabezas',
					unit: 'cabezas',
					n: 183,
					rows: [
						{ rango: '150–200', cabezas: 23 },
						{ rango: '200–250', cabezas: 18 },
						{ rango: '250–300', cabezas: 12 },
						{ rango: '300–350', cabezas: 15 },
						{ rango: '350–400', cabezas: 21 },
						{ rango: '400–450', cabezas: 44 },
						{ rango: '450–500', cabezas: 37 },
						{ rango: '500–550', cabezas: 13 }
					]
				}
			]
		}
	},
	{
		key: 'batch-curve',
		label: 'Curva de lote con composición',
		flow: 'warning',
		question: '¿Cómo viene el peso del lote ejemplo peso 1?',
		response: {
			grounded: true,
			tools_used: ['resolver_lote', 'pesadas_lote', 'tendencia', 'emit_chart'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown:
						'En las pesadas de control el promedio subió de **203 kg** a **252 kg** en 92 días (**+0,53 kg/día**, n = 4 pesadas).\n\n' +
						'⚠️ Los rombos sueltos son **ingresos de animales**: bajan o suben el promedio sin que nadie gane ni pierda peso.'
				},
				{
					type: 'chart',
					title: 'Peso promedio del lote ejemplo peso 1',
					kind: 'line',
					x: 'fecha',
					y: ['peso_promedio_kg'],
					series_by: 'naturaleza',
					x_label: 'Fecha',
					y_label: 'Peso promedio (kg)',
					unit: 'kg',
					n: 10,
					rows: [
						{ fecha: '2026-05-15', peso_promedio_kg: 175.8, naturaleza: 'composicion' },
						{ fecha: '2026-06-18', peso_promedio_kg: 203.0, naturaleza: 'pesada' },
						{ fecha: '2026-06-25', peso_promedio_kg: 195.6, naturaleza: 'composicion' },
						{ fecha: '2026-07-20', peso_promedio_kg: 221.4, naturaleza: 'pesada' },
						{ fecha: '2026-08-02', peso_promedio_kg: 214.9, naturaleza: 'composicion' },
						{ fecha: '2026-08-19', peso_promedio_kg: 236.2, naturaleza: 'pesada' },
						{ fecha: '2026-09-18', peso_promedio_kg: 251.9, naturaleza: 'pesada' }
					]
				}
			]
		}
	},
	{
		key: 'caravan-timeline',
		label: 'Línea de tiempo de una caravana',
		flow: 'happy',
		question: 'Mostrame la historia de la caravana 4521',
		response: {
			grounded: true,
			tools_used: ['emit_timeline'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown: 'La **4521** entró por compra en enero, tuvo tres pesadas y pasó a Recría 2025 en marzo.'
				},
				{
					type: 'timeline',
					title: 'Historia de la caravana 4521',
					events: [
						{ date: '2026-01-02', kind: 'movimiento', label: 'Compra', detail: 'Remate Rosario' },
						{ date: '2026-01-03', kind: 'pesada', label: 'Pesada: 182 kg', detail: 'Pesada de ingreso' },
						{ date: '2026-02-01', kind: 'pesada', label: 'Pesada: 205 kg', detail: 'Control' },
						{ date: '2026-03-10', kind: 'movimiento', label: 'Traslado', detail: 'A Recría 2025' },
						{ date: '2026-04-12', kind: 'pesada', label: 'Pesada: 241 kg', detail: 'Control' }
					]
				}
			]
		}
	},
	{
		key: 'broken-chart',
		label: 'Gráfico sin valores (fallback)',
		flow: 'error',
		question: 'Graficame algo que no tiene datos',
		response: {
			grounded: true,
			tools_used: ['padron_caravanas', 'emit_chart'],
			model: 'simulación',
			blocks: [
				{ type: 'text', markdown: 'El gráfico no tiene valores numéricos para mostrar.' },
				{
					type: 'chart',
					title: 'Gráfico vacío',
					kind: 'bar',
					x: 'categoria',
					y: ['valor'],
					rows: [{ categoria: 'Vaca', valor: null }]
				}
			]
		}
	},
	...ENTITY_LINK_PRESETS,
	...STOCK_LINK_PRESETS
];
