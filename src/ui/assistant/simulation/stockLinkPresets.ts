import type { AssistantSimulationPreset } from './assistantSimulationPresets';

/**
 * Stock records and categories that open a drawer. Ids of the development tenant's seeded records;
 * the batch composition carries a scope, so its category lists only that batch.
 */
export const STOCK_LINK_PRESETS: AssistantSimulationPreset[] = [
	{
		key: 'linked-stock',
		label: 'Stock con detalle (clic)',
		flow: 'happy',
		question: '¿Qué stock tengo de sanidad y combustibles?',
		response: {
			grounded: true,
			tools_used: ['consultar_stock_articulos', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Stock de Artículos e Insumos',
					columns: [
						{ key: 'articulo', label: 'Artículo / Insumo', entity: 'item' },
						{ key: 'categoria', label: 'Categoría', entity: 'item_category' },
						{ key: 'stock_actual', label: 'Stock actual' },
						{ key: 'unidad', label: 'Unidad' }
					],
					rows: [
						{ articulo: 'Ivermectina 1%', categoria: 'Endectocidas', stock_actual: 8800, unidad: 'ml' },
						{ articulo: 'Gasoil', categoria: 'Combustibles', stock_actual: 1500, unidad: 'l' },
						{ articulo: 'Poste quebracho 2,20 m', categoria: '—', stock_actual: 40, unidad: 'u' }
					],
					refs: [{ articulo: 1, categoria: 20 }, { articulo: 7, categoria: 5 }, { articulo: 10 }],
					total_rows: 3
				}
			]
		}
	},
	{
		key: 'linked-kardex',
		label: 'Movimientos con detalle (clic)',
		flow: 'happy',
		question: 'Mostrame los últimos movimientos de stock',
		response: {
			grounded: true,
			tools_used: ['movimientos_stock', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Operaciones de Stock',
					columns: [
						{ key: 'numero', label: 'Nº Operación', entity: 'item_document' },
						{ key: 'tipo', label: 'Tipo de Operación' },
						{ key: 'deposito', label: 'Depósito', entity: 'warehouse' },
						{ key: 'lote', label: 'Lote', entity: 'batch' },
						{ key: 'comprobante', label: 'Comprobante', entity: 'fiscal_document' }
					],
					rows: [
						{
							numero: 23,
							tipo: 'Ingreso por compra',
							deposito: 'Almacén principal',
							lote: null,
							comprobante: 'Factura A 0004-00001250'
						},
						{
							numero: 21,
							tipo: 'Consumo',
							deposito: 'Galpón de sanidad',
							lote: 'Vaquillonas',
							comprobante: null
						}
					],
					refs: [
						{ numero: 23, deposito: 1, comprobante: 12 },
						{ numero: 21, deposito: 3, lote: 15 }
					],
					total_rows: 2
				}
			]
		}
	},
	{
		key: 'linked-categories',
		label: 'Categorías con detalle (clic)',
		flow: 'happy',
		question: '¿Cuántas cabezas tengo por categoría y cómo se compone el lote Testing Lector BLE?',
		response: {
			grounded: true,
			tools_used: ['resumen_rodeo', 'resumen_lote', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Existencias por categoría',
					columns: [
						{ key: 'categoria', label: 'Categoría', entity: 'animal_category' },
						{ key: 'cabezas', label: 'Cabezas' }
					],
					rows: [
						{ categoria: 'Vaca Adulta', cabezas: 219 },
						{ categoria: 'Ternero', cabezas: 56 },
						{ categoria: 'Hembra sin categoría', cabezas: 30 }
					],
					// "Sin categoría" is no record: no link.
					refs: [{ categoria: 3 }, { categoria: 1 }, {}],
					total_rows: 3
				},
				{
					type: 'table',
					title: 'Composición por categoría — Lote Testing Lector BLE',
					columns: [
						{ key: 'categoria', label: 'Categoría', entity: 'animal_category', scope: { batch_id: 46 } },
						{ key: 'cabezas', label: 'Cabezas' }
					],
					rows: [{ categoria: 'Ternero', cabezas: 10 }],
					refs: [{ categoria: 1 }],
					total_rows: 1
				}
			]
		}
	},
	{
		key: 'linked-empty-warehouse',
		label: 'Depósito sin stock (clic)',
		flow: 'warning',
		question: '¿Qué hay en cada depósito?',
		response: {
			grounded: true,
			tools_used: ['resumen_depositos', 'emit_table'],
			model: 'simulación',
			blocks: [
				{
					type: 'table',
					title: 'Depósitos del Establecimiento',
					columns: [
						{ key: 'deposito', label: 'Depósito', entity: 'warehouse' },
						{ key: 'articulos_con_stock', label: 'Ítems con saldo' }
					],
					rows: [
						{ deposito: 'Almacén principal', articulos_con_stock: 6 },
						{ deposito: 'Depósito viejo', articulos_con_stock: 0 }
					],
					refs: [{ deposito: 1 }, { deposito: 4 }],
					total_rows: 2
				}
			]
		}
	}
];
