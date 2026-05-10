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
		id: 'suppliers',
		title: 'Proveedores',
		translate: 'SUPPLIERS',
		type: 'item',
		icon: 'lucide:star',
		url: 'suppliers'
	},
	{
		id: 'batches',
		title: 'Lotes',
		translate: 'BATCHES',
		type: 'item',
		icon: 'heroicons-outline:collection',
		url: 'batches'
	},
	{
		id: 'livestock-app',
		title: 'Cuadro de Mando Ganadero',
		type: 'item',
		icon: 'heroicons-outline:chart-bar',
		url: 'livestock'
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
