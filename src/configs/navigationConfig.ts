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
						url: 'livestock/records',
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
				]
			},
		]
	},
];

export default navigationConfig;
