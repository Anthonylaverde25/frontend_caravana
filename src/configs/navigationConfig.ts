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
	{
		id: 'dashboard-component',
		title: 'Dashboard',
		type: 'item',
		icon: 'heroicons-outline:squares-2x2',
		url: '/dashboard'
	},
	{
		id: 'example-component',
		title: 'Ejemplo de Ruta',
		type: 'item',
		icon: 'lucide:star',
		url: '/example'
	},

	{
		id: 'gestational-management',
		title: 'GESTIÓN GESTACIONAL',
		subtitle: 'Control de Gestación',
		type: 'group',
		icon: 'heroicons-outline:heart',
		children: [
			{
				id: 'gestation.dashboard',
				title: 'Panel Gestacional',
				subtitle: 'Resumen de Preñez',
				type: 'item',
				icon: 'heroicons-outline:presentation-chart-line',
				url: '/gestation'
			},
			{
				id: 'gestation.planning-submenu',
				title: 'Planificación de Servicios',
				type: 'collapse',
				icon: 'heroicons-outline:calendar-days',
				children: [
					{
						id: 'gestation.bull-rotation',
						title: 'Rotación de Toros',
						subtitle: 'Asignación Reproductiva',
						type: 'item',
						icon: 'heroicons-outline:arrow-path-round-square',
						url: '/gestation/bull-rotation'
					},
					{
						id: 'gestation.service-orders',
						title: 'Órdenes de Servicio',
						subtitle: 'Historial y Estados',
						type: 'item',
						icon: 'heroicons-outline:document-text',
						url: '/gestation/service-orders'
					}
				]
			},
			{
				id: 'gestation.control-submenu',
				title: 'Control y Diagnósticos',
				type: 'collapse',
				icon: 'heroicons-outline:clipboard-document-check',
				children: [
					{
						id: 'gestation.tacto',
						title: 'Tacto / Ecografías',
						subtitle: 'Diagnósticos',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-check',
						url: '/gestation/tacto'
					},
					{
						id: 'gestation.list',
						title: 'Monitoreo por Lotes',
						subtitle: 'Seguimiento de Vientres',
						type: 'item',
						icon: 'heroicons-outline:queue-list',
						url: '/gestation/list'
					},
					{
						id: 'gestation.births',
						title: 'Partossss',
						subtitle: 'Nacimientos',
						type: 'item',
						icon: 'heroicons-outline:sparkles',
						url: '/gestation/births'
					},
					{
						id: 'gestation.pedigree',
						title: 'Árbol Genealógico',
						subtitle: 'Líneas de Pedigree',
						type: 'item',
						icon: 'heroicons-outline:academic-cap',
						url: '/gestation/pedigree'
					}
				]
			}
		]
	},
	{
		id: 'livestock-management',
		title: 'GESTIÓN GANADERA',
		subtitle: 'Control de Caravanas',
		type: 'group',
		icon: 'heroicons-outline:collection',
		children: [
			{
				id: 'gestion.providers',
				title: 'Proveedores',
				subtitle: 'Gestión de Orígenes',
				type: 'item',
				icon: 'heroicons-outline:user-group',
				url: '/providers'
			},
			{
				id: 'gestion.farms',
				title: 'Establecimientos',
				subtitle: 'Sedes y Campos',
				type: 'item',
				icon: 'heroicons-outline:home-modern',
				url: '/farms'
			},
			{
				id: 'gestion.batches',
				title: 'Lotes',
				subtitle: 'Tropas y Grupos',
				type: 'item',
				icon: 'heroicons-outline:view-columns',
				url: '/batches'
			},
			{
				id: 'livestock.records',
				title: 'Lista de Caravanas',
				subtitle: 'Stock e Historial',
				type: 'item',
				icon: 'heroicons-outline:square-3-stack-3d',
				url: '/caravans',
				end: true
			},
			{
				id: 'livestock-operations',
				title: 'Operaciones',
				type: 'collapse',
				icon: 'heroicons-outline:briefcase',
				children: [
					{
						id: 'gestion.activities',
						title: 'Actividades',
						type: 'item',
						icon: 'heroicons-outline:clipboard-document-list',
						url: '/activities'
					},
					{
						id: 'livestock.upload',
						title: 'Carga de Documento (OCR)',
						type: 'item',
						icon: 'heroicons-outline:cloud-upload',
						url: 'livestock/upload',
					},
					{
						id: 'livestock.generator',
						title: 'Generador de Plantillas',
						type: 'item',
						icon: 'heroicons-outline:document-text',
						url: 'livestock/generator',
					},
					{
						id: 'livestock.movements',
						title: 'Movimientos',
						type: 'item',
						icon: 'heroicons-outline:arrow-path',
						url: '/caravans/movements',
					}
				]
			},

			{
				id: 'internal-batches',
				title: 'Lotes Internos',
				type: 'collapse',
				icon: 'heroicons-outline:view-columns',
				children: [
					{
						id: 'internal-batches.internal-consumption',
						title: 'Lote Consumo',
						subtitle: 'Lotes dedicados al consumo interno',
						type: 'item',
						icon: 'heroicons-outline:plus-circle',
						url: '/internal-batches/internal-consumption'
					},
					{
						id: 'internal-batches.internal-death',
						title: 'Lotes de Muertes',
						subtitle: 'Lotes dedicados a muertes internas',
						type: 'item',
						icon: 'heroicons-outline:view-columns',
						url: '/internal-batches/internal-death'
					},
					{
						id: 'internal-batches.quarantine',
						title: 'Lotes de Cuarentena',
						subtitle: 'Lotes dedicados a cuarentena',
						type: 'item',
						icon: 'heroicons-outline:view-columns',
						url: '/internal-batches/quarantine'
					}

				]
			}

		]
	},
	{
		id: 'template-management',
		title: 'GESTIÓN DE PLANTILLAS',
		subtitle: 'Plantillas de Trabajo',
		type: 'group',
		icon: 'heroicons-outline:document-text',
		children: [
			{
				id: 'work-templates',
				title: 'Lista de Plantillas',
				subtitle: 'Explorar y Editar',
				type: 'item',
				icon: 'heroicons-outline:table',
				url: 'work-templates'
			},

			{
				id: 'templates.ops',
				title: 'Operaciones de Diseño',
				type: 'collapse',
				icon: 'heroicons-outline:pencil-square',
				children: [
					{
						id: 'templates.create',
						title: 'Crear Plantilla',
						type: 'item',
						icon: 'heroicons-outline:plus-circle',
						url: '/templates/create'
					},
					{
						id: 'templates.import',
						title: 'Importar / OCR',
						type: 'item',
						icon: 'heroicons-outline:arrow-up-tray',
						url: '/templates/import'
					}
				]
			}
		]
	},
];

export default navigationConfig;
