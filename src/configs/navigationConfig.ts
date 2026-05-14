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
		id: 'example-component',
		title: 'Example',
		translate: 'EXAMPLE',
		type: 'item',
		icon: 'lucide:star',
		url: 'example'
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
				id: 'gestion.breeds',
				title: 'Razas',
				subtitle: 'Genética',
				type: 'item',
				icon: 'heroicons-outline:collection',
				url: '/breeds'
			},
			{
				id: 'gestion.activities',
				title: 'Actividades',
				subtitle: 'Actividades Ganaderas',
				type: 'item',
				icon: 'heroicons-outline:clipboard-document-list',
				url: '/activities'
			},
			{
				id: 'livestock-operations',
				title: 'Operaciones',
				type: 'collapse',
				icon: 'heroicons-outline:clipboard-list',
				children: [
					{
						id: 'livestock.records',
						title: 'Lista de Caravanas',
						type: 'item',
						icon: 'heroicons-outline:table',
						url: '/caravans',
						end: true,
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

		]
	},
];

export default navigationConfig;
