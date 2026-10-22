import type { AssistantSimulationPreset } from './assistantSimulationPresets';

/**
 * Tables whose cells open a record's drawer. The ids belong to the development tenant's seeded
 * records; the missing-record preset points at an id that does not exist.
 */
export const ENTITY_LINK_PRESETS: AssistantSimulationPreset[] = [
	{
		key: 'linked-caravans',
		label: 'Caravanas con detalle (clic)',
		flow: 'happy',
		question: 'Listame las caravanas del lote Testing Lector BLE',
		response: {
			grounded: true,
			tools_used: ['resolver_lote', 'buscar_caravanas', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'text',
					markdown: 'Estas son las caravanas del lote. Tocá una caravana o el lote para ver su detalle.'
				},
				{
					type: 'table',
					title: 'Caravanas',
					columns: [
						{ key: 'caravana', label: 'Caravana', entity: 'caravan' },
						{ key: 'sexo', label: 'Sexo' },
						{ key: 'categoria', label: 'Categoría' },
						{ key: 'lote', label: 'Lote', entity: 'batch' }
					],
					rows: [
						{
							caravana: '032000000000001',
							sexo: 'Hembra',
							categoria: 'Ternero',
							lote: 'Lote Testing Lector BLE'
						},
						{
							caravana: '032000000000002',
							sexo: 'Macho',
							categoria: 'Ternero',
							lote: 'Lote Testing Lector BLE'
						},
						{ caravana: 'SIN-VINCULO', sexo: 'Macho', categoria: 'Ternero', lote: null }
					],
					// The last row has no ids: its cells stay plain text.
					refs: [{ caravana: 492, lote: 46 }, { caravana: 493, lote: 46 }, {}],
					total_rows: 3
				}
			]
		}
	},
	{
		key: 'linked-orders',
		label: 'Órdenes con detalle (clic)',
		flow: 'happy',
		question: '¿Qué órdenes tengo en curso?',
		response: {
			grounded: true,
			tools_used: ['ordenes_de_servicio', 'ordenes', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Órdenes de servicio',
					columns: [
						{ key: 'codigo', label: 'Orden', entity: 'service_order' },
						{ key: 'lote', label: 'Lote', entity: 'batch' },
						{ key: 'estado', label: 'Estado' }
					],
					rows: [{ codigo: 'SO-2026-903', lote: 'Srv Rodeo Espera Tacto', estado: 'Toros retirados' }],
					refs: [{ codigo: 5, lote: 67 }],
					total_rows: 1
				},
				{
					type: 'table',
					title: 'Órdenes de manejo',
					columns: [
						{ key: 'tipo', label: 'Tipo' },
						{ key: 'ingreso', label: 'Ingreso', entity: 'entry_order' },
						{ key: 'paricion', label: 'Parición', entity: 'birth_order' },
						{ key: 'traslado', label: 'Traslado', entity: 'transfer_order' },
						{ key: 'destete', label: 'Destete', entity: 'weaning_order' }
					],
					rows: [
						{
							tipo: 'Última',
							ingreso: 'EN-20260928-0017',
							paricion: 'PA-20261020-0002',
							traslado: 'TR-20260615-0004',
							destete: 'DS-20260915-0003'
						}
					],
					refs: [{ ingreso: 17, paricion: 7, traslado: 4, destete: 3 }],
					total_rows: 1
				}
			]
		}
	},
	{
		key: 'linked-missing',
		label: 'Registro inexistente (clic)',
		flow: 'error',
		question: 'Mostrame la caravana 999999',
		response: {
			grounded: true,
			tools_used: ['buscar_caravanas', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Registros borrados',
					columns: [
						{ key: 'caravana', label: 'Caravana', entity: 'caravan' },
						{ key: 'articulo', label: 'Artículo', entity: 'item' },
						{ key: 'deposito', label: 'Depósito', entity: 'warehouse' }
					],
					rows: [{ caravana: '999999', articulo: 'Artículo borrado', deposito: 'Depósito borrado' }],
					// Ids the API no longer knows: each drawer must say so, not break.
					refs: [{ caravana: 999999, articulo: 999999, deposito: 999999 }],
					total_rows: 1
				}
			]
		}
	}
];
