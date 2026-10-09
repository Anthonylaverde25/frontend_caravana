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

	// ─── GESTIÓN GANADERA ────────────────────────────────────────────────────
	{
		id: 'livestock-management',
		title: 'GESTIÓN GANADERA',
		subtitle: 'Rodeo y Stock',
		type: 'group',
		icon: 'heroicons-outline:building-storefront',
		children: [
			{
				id: 'livestock.records',
				title: 'Caravanas',
				subtitle: 'Stock e Historial',
				type: 'item',
				icon: 'heroicons-outline:square-3-stack-3d',
				url: '/caravans',
				end: true
			},
			// {
			// 	id: 'gestion.farms',
			// 	title: 'Establecimientos',
			// 	subtitle: 'Sedes y Campos',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:home-modern',
			// 	url: '/farms'
			// },
			{
				id: 'gestion.providers',
				title: 'Proveedores',
				subtitle: 'Orígenes de Hacienda',
				type: 'item',
				icon: 'heroicons-outline:user-group',
				url: '/providers'
			},
			// All batch types consolidated under one collapse
			{
				id: 'gestion.batches-collapse',
				title: 'Lotes',
				subtitle: 'Tropas, Grupos e Internos',
				type: 'collapse',
				icon: 'heroicons-outline:view-columns',
				children: [
					{
						id: 'gestion.batches.own',
						title: 'Lotes Propios',
						type: 'item',
						icon: 'heroicons-outline:home',
						url: '/batches/own'
					},
					{
						id: 'gestion.batches.external',
						title: 'Lotes Externos',
						subtitle: 'De Proveedores',
						type: 'item',
						icon: 'heroicons-outline:truck',
						url: '/batches/external'
					},
					{
						id: 'gestion.batches.entry-orders',
						title: 'Órdenes de Ingreso',
						subtitle: 'ING-02 · Espera de DTE',
						type: 'item',
						icon: 'heroicons-outline:arrow-down-tray',
						url: '/entry-orders'
					},
					{
						id: 'gestion.batches.assignment',
						title: 'Asignar a Lote Propio',
						type: 'item',
						icon: 'heroicons-outline:arrow-right-start-on-rectangle',
						url: '/batches/external-assignment'
					},
					// Internal system batches
					{
						id: 'internal-batches.internal-consumption',
						title: 'Lote Consumo',
						type: 'item',
						icon: 'heroicons-outline:fire',
						url: '/internal-batches/internal-consumption'
					},
					{
						id: 'internal-batches.internal-death',
						title: 'Lote Muertes',
						type: 'item',
						icon: 'heroicons-outline:x-circle',
						url: '/internal-batches/internal-death'
					},
					{
						id: 'internal-batches.quarantine',
						title: 'Lote Cuarentena',
						type: 'item',
						icon: 'heroicons-outline:shield-exclamation',
						url: '/internal-batches/quarantine'
					},
					{
						id: 'internal-batches.reserve',
						title: 'Lote Reserva',
						subtitle: 'Animales Apartados',
						type: 'item',
						icon: 'heroicons-outline:archive-box',
						url: '/internal-batches/reserve'
					}
				]
			},
			// Operational items
			{
				id: 'livestock.movements',
				title: 'Movimientos',
				type: 'item',
				icon: 'heroicons-outline:arrow-path',
				url: '/caravans/movements'
			},
			{
				id: 'gestion.activities',
				title: 'Actividades',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-list',
				url: '/activities'
			},
			{
				id: 'gestion.transfer-orders',
				title: 'Órdenes de Transferencia',
				type: 'item',
				icon: 'heroicons-outline:arrows-right-left',
				url: '/transfer-orders'
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
			{
				id: 'gestation.dashboard',
				title: 'Panel Reproductivo',
				type: 'item',
				icon: 'heroicons-outline:presentation-chart-line',
				url: '/gestation'
			},
			// Service planning collapse
			{
				id: 'gestation.planning-submenu',
				title: 'Entore',
				subtitle: 'Servicios y Toros',
				type: 'collapse',
				icon: 'heroicons-outline:calendar-days',
				children: [
					{
						id: 'gestation.pre-service',
						title: 'Pre-Servicio & Toros',
						subtitle: 'Selección y planilla de manga',
						type: 'item',
						icon: 'heroicons-outline:shield-check',
						url: '/gestation/pre-service'
					},
					{
						id: 'gestation.service-batches',
						title: 'Lotes de Servicio',
						subtitle: 'Entore y Categorías',
						type: 'item',
						icon: 'heroicons-outline:rectangle-group',
						url: '/gestation/service-batches'
					},
					{
						id: 'gestation.bull-rotation',
						title: 'Rotación de Toros',
						type: 'item',
						icon: 'heroicons-outline:arrow-path-round-square',
						url: '/gestation/bull-rotation'
					},
					{
						id: 'gestation.service-orders',
						title: 'Órdenes de Servicio',
						type: 'item',
						icon: 'heroicons-outline:document-text',
						url: '/gestation/service-orders'
					},
					{
						id: 'gestation.veterinary-portal',
						title: 'Portales Veterinarios',
						type: 'item',
						icon: 'heroicons-outline:users',
						url: '/gestation/veterinary-portal'
					},
					{
						id: 'gestation.diagnostic-protocols',
						title: 'Protocolos Diagnósticos',
						subtitle: 'Actas e Informes',
						type: 'item',
						icon: 'heroicons-outline:document-check',
						url: '/gestation/diagnostic-protocols'
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
						title: 'Tacto / Ecografías',
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
						title: 'Partos',
						type: 'item',
						icon: 'heroicons-outline:sparkles',
						url: '/gestation/births'
					},
					{
						id: 'gestation.birth-orders',
						title: 'Órdenes de Parición',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-list',
						url: '/birth-orders'
					},
					{
						id: 'gestation.weaning-orders',
						title: 'Órdenes de Destete',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-check',
						url: '/weaning-orders'
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

	// ─── PLANTILLAS & DIGITALIZACIÓN ────────────────────────────────────────
	{
		id: 'template-management',
		title: 'PLANTILLAS',
		subtitle: 'Zootécnica y OCR',
		type: 'group',
		icon: 'heroicons-outline:document-text',
		children: [
			{
				id: 'work-templates',
				title: 'Galería de Plantillas',
				subtitle: 'Biblioteca Zootécnica',
				type: 'item',
				icon: 'heroicons-outline:squares-2x2',
				url: 'work-templates'
			},
			{
				id: 'work-templates.scan',
				title: 'Escanear Planilla (AI)',
				subtitle: 'Extracción y Carga OCR',
				type: 'item',
				icon: 'heroicons-outline:camera',
				url: 'work-templates/scan'
			},
			// {
			// 	id: 'templates.create',
			// 	title: 'Crear Plantilla',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:plus-circle',
			// 	url: '/templates/create'
			// },
			// {
			// 	id: 'livestock.generator',
			// 	title: 'Generador de Plantillas',
			// 	type: 'item',
			// 	icon: 'heroicons-outline:document-duplicate',
			// 	url: 'livestock/generator'
			// }
		]
	},
];

export default navigationConfig;
