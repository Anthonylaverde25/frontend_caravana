import { ComponentType } from 'react';

/** Grid footprint of a widget: S = 1 column, M = 2 columns, L = full row (4 columns). */
export type WidgetSize = 'S' | 'M' | 'L';

export type WidgetCategory = 'STOCK' | 'REPRODUCTIVE' | 'WEIGHTS' | 'HEALTH' | 'GENETICS_OPERATIONS';

/**
 * Where a widget's numbers come from today.
 * - LIVE: already wired to the API through feature hooks.
 * - STATIC_MOCK: layout is final, data is a typed mock until its hook exists.
 * - REQUIRES_NEW_DATA: the domain model does not record the parameter yet; not renderable.
 */
export type WidgetDataStatus = 'LIVE' | 'STATIC_MOCK' | 'REQUIRES_NEW_DATA';

export type BoardTemplateType = 'BLANK' | 'GENERAL' | 'REPRODUCTIVE' | 'WEIGHTS' | 'HEALTH' | 'PASTURE';

/** Batch type codes as seeded in the tenant `batch_types` catalog. */
export type BatchTypeCode =
	| 'SERVICE'
	| 'WEANING'
	| 'GROWING_HEIFERS'
	| 'GROWING_STEERS'
	| 'GROWING_REPLACEMENT_FEMALES'
	| 'GROWING_REPLACEMENT_BULLS'
	| 'GROWING_MIXED';

/** Default scope declared by a board. Every widget on the board inherits it. */
export interface BoardScope {
	campaign: string;
	batchTypeCode: BatchTypeCode | null;
}

export interface BoardWidgetInstance {
	instanceId: string;
	widgetId: string;
	size: WidgetSize;
	title?: string;
	/** Only the parameters the board scope does not already define. */
	config?: Record<string, string>;
}

export interface DashboardBoard {
	id: string;
	name: string;
	icon: string;
	/** System boards ship with the product and cannot be edited or deleted. */
	isSystem: boolean;
	scope: BoardScope;
	widgets: BoardWidgetInstance[];
}

export interface WidgetRenderProps {
	instance: BoardWidgetInstance;
	scope: BoardScope;
}

export interface WidgetConfigOption {
	value: string;
	label: string;
	helper?: string;
}

export interface WidgetConfigField {
	key: string;
	label: string;
	helper?: string;
	required: boolean;
	options: WidgetConfigOption[];
}

export interface WidgetDefinition {
	id: string;
	name: string;
	description: string;
	category: WidgetCategory;
	sizes: WidgetSize[];
	defaultSize: WidgetSize;
	/** Tables and fields that feed the widget, shown in the catalog for traceability. */
	source: string;
	dataStatus: WidgetDataStatus;
	/** For REQUIRES_NEW_DATA: what has to be modeled before the widget can exist. */
	missingData?: string;
	/** Explains why a size is not offered (e.g. a histogram needs two columns). */
	sizeHint?: string;
	configFields?: WidgetConfigField[];
	component?: ComponentType<WidgetRenderProps>;
}
