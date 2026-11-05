import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('tr', 'navigation', tr);
i18n.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	// ─── Home ────────────────────────────────────────────────────────────────
	{
		id: 'dashboard-component',
		title: 'Dashboard',
		type: 'item',
		icon: 'heroicons-outline:squares-2x2',
		url: '/dashboard'
	},
	{
		// The Virtual Assistant at full width: charts and tables over the herd's records (read-only).
		id: 'assistant-workspace',
		title: 'Análisis XIMON',
		subtitle: 'Gráficos y consultas con IA',
		type: 'item',
		icon: 'heroicons-outline:presentation-chart-line',
		url: '/assistant'
	},

	// ─── GESTIÓN GANADERA ────────────────────────────────────────────────────
	{
		id: 'livestock-management',
		title: 'GESTIÓN GANADERA',
		subtitle: 'Rodeo y Stock',
		type: 'group',
		icon: 'heroicons-outline:building-storefront',
		children: [
			{
				// Own batches, production stages and movement traceability in one consolidated view.
				id: 'livestock.herd',
				title: 'Hacienda Propia',
				subtitle: 'Lotes, Producción y Trazabilidad',
				type: 'item',
				icon: 'heroicons-outline:rectangle-stack',
				url: '/herd',
				end: true
			},
			// Operational orders and administrative batch management
			{
				id: 'gestion.batches-collapse',
				title: 'Lotes y Órdenes',
				subtitle: 'Ingresos, Egresos, Traslados e Internos',
				type: 'collapse',
				icon: 'heroicons-outline:view-columns',
				children: [
					{
						id: 'gestion.batches.entry-orders',
						title: 'Órdenes de Ingreso',
						subtitle: 'Compras · Sin DTE',
						type: 'item',
						icon: 'heroicons-outline:arrow-down-tray',
						url: '/entry-orders'
					},
					{
						id: 'gestion.batches.exit-orders',
						title: 'Órdenes de Egreso',
						subtitle: 'Ventas · Sin DTE',
						type: 'item',
						icon: 'heroicons-outline:arrow-up-tray',
						url: '/exit-orders'
					},
					{
						id: 'gestion.batches.transfer-orders',
						title: 'Órdenes de Transferencia',
						type: 'item',
						icon: 'heroicons-outline:arrows-right-left',
						url: '/transfer-orders'
					},
					// Internal and administrative system batches consolidated into a tabbed Hub
					{
						id: 'internal-batches.hub',
						title: 'Lotes Administrativos',
						subtitle: 'Consumo, Muertes, Egresos, Cuarentena, Reserva y Asignación',
						type: 'item',
						icon: 'heroicons-outline:archive-box',
						url: '/internal-batches'
					}
				]
			}
		]
	},

	// ─── GESTIÓN REPRODUCTIVA ────────────────────────────────────────────────
	{
		id: 'gestational-management',
		title: 'GESTIÓN REPRODUCTIVA',
		subtitle: 'Ciclo de Cría',
		type: 'group',
		icon: 'heroicons-outline:heart',
		children: [
			// Service planning collapse
			{
				id: 'gestation.planning-submenu',
				title: 'Entore',
				subtitle: 'Servicios y Toros',
				type: 'collapse',
				icon: 'heroicons-outline:calendar-days',
				children: [
					
					{
						id: 'gestation.service-orders',
						title: 'Órdenes de servicio',
						subtitle: 'Registro por lote',
						type: 'item',
						icon: 'heroicons-outline:document-text',
						url: '/gestation/service-orders'
					},
					{
						id: 'gestation.services',
						title: 'Servicios y Tacto (Beta)',
						subtitle: 'Cola de trabajo e historial',
						type: 'item',
						icon: 'heroicons-outline:squares-2x2',
						url: '/gestation/services/conventional'
					}
				]
			},
			// Monitoring & births collapse
			{
				id: 'gestation.control-submenu',
				title: 'Seguimiento',
				subtitle: 'Preñez y Partos',
				type: 'collapse',
				icon: 'heroicons-outline:clipboard-document-check',
				children: [
					{
						id: 'gestation.tacto',
						title: 'Bandeja de tacto',
						subtitle: 'Órdenes abiertas por diagnosticar',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-check',
						url: '/gestation/tacto'
					},
					{
						id: 'gestation.list',
						title: 'Monitoreo por Lotes',
						type: 'item',
						icon: 'heroicons-outline:queue-list',
						url: '/gestation/list'
					},
					{
						id: 'gestation.births',
						title: 'Crías al Pie y Destete',
						type: 'item',
						icon: 'heroicons-outline:sparkles',
						url: '/gestation/births'
					},
					{
						id: 'gestation.paternity',
						title: 'Paternidad pendiente',
						subtitle: 'Confirmar padre de las crías',
						type: 'item',
						icon: 'heroicons-outline:finger-print',
						url: '/gestation/paternity'
					},
					{
						id: 'gestation.birth-orders',
						title: 'Órdenes de Parición',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-list',
						url: '/birth-orders'
					},
					{
						id: 'gestation.weaning-batches',
						title: 'Lotes de Destete',
						subtitle: 'Desmadre y Recría',
						type: 'item',
						icon: 'heroicons-outline:clock',
						url: '/gestation/weaning-batches'
					},
					{
						id: 'gestation.pedigree',
						title: 'Árbol Genealógico',
						type: 'item',
						icon: 'heroicons-outline:academic-cap',
						url: '/gestation/pedigree'
					}
				]
			}
		]
	},

	// ─── SANIDAD ─────────────────────────────────────────────────────────────
	{
		id: 'health-management',
		title: 'SANIDAD',
		subtitle: 'Control Veterinario y Diagnósticos',
		type: 'group',
		icon: 'heroicons-outline:shield-check',
		children: [
			{
				id: 'health.hub',
				title: 'Sanidad & Veterinaria',
				subtitle: 'Pre-servicio, protocolos y portal',
				type: 'item',
				icon: 'heroicons-outline:shield-check',
				url: '/health'
			}
		]
	},

	// ─── COMPRAS E INSUMOS ───────────────────────────────────────────────────
	{
		id: 'supplies-management',
		title: 'COMPRAS E INSUMOS',
		subtitle: 'Clientes, proveedores y catálogo',
		type: 'group',
		icon: 'heroicons-outline:shopping-bag',
		children: [
			{
				// A partner sells to us, buys from us or both (egreso plan v5, fase A).
				id: 'supplies.partners',
				title: 'Clientes y proveedores',
				subtitle: 'Quién nos vende y quién nos compra',
				type: 'item',
				icon: 'heroicons-outline:user-group',
				url: '/partners'
			},
			{
				// Provider papers (DS14): their stocked lines enter the warehouse when registered.
				id: 'supplies.fiscal-documents',
				title: 'Comprobantes de proveedores',
				subtitle: 'Facturas, notas de crédito, tickets y remitos',
				type: 'item',
				icon: 'heroicons-outline:receipt-percent',
				url: '/fiscal-documents'
			},
			{
				// Delivery C: what arrived with a delivery note and waits for its invoice (DC12).
				id: 'supplies.delivery-notes',
				title: 'Remitos a facturar',
				subtitle: 'Recibido sin factura',
				type: 'item',
				icon: 'heroicons-outline:truck',
				url: '/fiscal-documents/delivery-notes'
			},
			{
				id: 'supplies.items',
				title: 'Artículos y servicios',
				subtitle: 'Catálogo y stock',
				type: 'item',
				icon: 'heroicons-outline:cube',
				url: '/items',
				end: true
			},
			{
				id: 'supplies.item-documents',
				title: 'Movimientos de stock',
				subtitle: 'Ingresos, consumos y conteos',
				type: 'item',
				icon: 'heroicons-outline:arrows-up-down',
				url: '/item-documents'
			}
			// Warehouses, units and item categories live in Settings (/settings, "Insumos").
		]
	},

	// ─── PLANTILLAS & DIGITALIZACIÓN ────────────────────────────────────────
	{
		id: 'template-management',
		title: 'PLANTILLAS',
		subtitle: 'Zootécnica y OCR',
		type: 'group',
		icon: 'heroicons-outline:document-text',
		children: [
			{
				id: 'work-templates.hub',
				title: 'Plantillas & OCR',
				subtitle: 'Escaneo con IA y catálogo zootécnico',
				type: 'item',
				icon: 'heroicons-outline:camera',
				url: '/work-templates'
			}
		]
	},
];

export default navigationConfig;
