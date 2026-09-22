import React from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferPalette } from './transferPalette';
import { BatchFigures, formatAverage, formatKg } from './transferMath';

interface TransferOutcomePanelProps {
	sourceName: string;
	sourceColor?: string | null;
	sourceBefore: BatchFigures;
	sourceAfter: BatchFigures;
	destinationName: string | null;
	destinationColor?: string | null;
	isNewDestination: boolean;
	destinationBefore: BatchFigures | null;
	destinationAfter: BatchFigures;
	moved: BatchFigures;
	mode?: 'existing' | 'new';
	onModeChange?: (mode: 'existing' | 'new') => void;
	activityName?: string | null;
	typeName?: string | null;
}

/**
 * Simulación de Impacto Side Panel
 * Following SAP Fiori Horizon Enterprise specification in code.html & screen.png.
 */
export const TransferOutcomePanel: React.FC<TransferOutcomePanelProps> = ({
	sourceName,
	sourceColor,
	sourceBefore,
	sourceAfter,
	destinationName,
	destinationColor,
	isNewDestination,
	destinationBefore,
	destinationAfter,
	moved,
	mode = isNewDestination ? 'new' : 'existing',
	onModeChange,
	activityName,
	typeName
}) => {
	const palette = useTransferPalette();

	const hasDestination = Boolean(destinationName);
	const hasSelection = moved.count > 0;

	return (
		<section
			className="rounded p-3.5 shadow-xs flex flex-col justify-between border transition-colors h-full"
			style={{
				backgroundColor: palette.cardBg,
				borderColor: palette.cardBorder
			}}
		>
			{/* Header */}
			<div>
				<div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
					<div className="flex items-center gap-2">
						<div
							className="w-6 h-6 rounded flex items-center justify-center"
							style={{
								backgroundColor: 'rgba(5, 150, 105, 0.1)',
								color: palette.sapEmerald
							}}
						>
							<FuseSvgIcon size={14}>heroicons-outline:arrows-up-down</FuseSvgIcon>
						</div>
						<h3 className="text-xs font-bold text-slate-800 tracking-tight">
							Simulación de Impacto
						</h3>
					</div>
					<span
						className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border"
						style={{
							backgroundColor: 'rgba(5, 150, 105, 0.08)',
							color: '#065f46',
							borderColor: 'rgba(5, 150, 105, 0.2)'
						}}
					>
						En vivo
					</span>
				</div>

				<div className="space-y-3">
					{/* Mode Toggle inside Panel */}
					{onModeChange && (
						<div className="flex items-center justify-between gap-2">
							<span className="text-[11px] font-semibold text-slate-600">
								Modo Asignación
							</span>
							<div
								className="inline-flex rounded shadow-2xs border divide-x text-xs font-medium overflow-hidden"
								style={{
									backgroundColor: palette.cardBg,
									borderColor: palette.sapBorder
								}}
								role="group"
							>
								<button
									type="button"
									onClick={() => onModeChange('new')}
									className="inline-flex items-center gap-1 px-2.5 py-1 transition-colors text-[11px]"
									style={{
										backgroundColor: mode === 'new' ? palette.sapGreen : 'transparent',
										color: mode === 'new' ? '#ffffff' : '#334155',
										fontWeight: mode === 'new' ? 600 : 500
									}}
								>
									{mode === 'new' && (
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
									)}
									Crear nuevo
								</button>
								<button
									type="button"
									onClick={() => onModeChange('existing')}
									className="inline-flex items-center gap-1 px-2.5 py-1 transition-colors text-[11px]"
									style={{
										backgroundColor: mode === 'existing' ? palette.sapGreen : 'transparent',
										color: mode === 'existing' ? '#ffffff' : '#334155',
										fontWeight: mode === 'existing' ? 600 : 500
									}}
								>
									{mode === 'existing' && (
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
									)}
									Existente
								</button>
							</div>
						</div>
					)}

					{/* Destination Target Preview Box */}
					<div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5 min-w-0">
								<span
									className="w-2 h-2 rounded-full flex-shrink-0"
									style={{ backgroundColor: destinationColor || '#059669' }}
								/>
								<span className="font-bold text-slate-900 text-xs truncate">
									{destinationName || (isNewDestination ? 'Lote sin nombrar' : 'Sin destino')}
								</span>
							</div>
							<span
								className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 border"
								style={{
									backgroundColor: isNewDestination ? 'rgba(5, 150, 105, 0.12)' : 'rgba(37, 99, 235, 0.12)',
									color: isNewDestination ? '#065f46' : '#1d4ed8',
									borderColor: isNewDestination ? 'rgba(5, 150, 105, 0.25)' : 'rgba(37, 99, 235, 0.25)'
								}}
							>
								{isNewDestination ? 'Nuevo Lote' : 'Existente'}
							</span>
						</div>
						<div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-200/80 pt-1.5">
							<span>Destino propuesto:</span>
							<span className="font-medium text-slate-700">
								{activityName && typeName
									? `${activityName} / ${typeName}`
									: activityName || typeName || 'Definiendo…'}
							</span>
						</div>
					</div>

					{/* Comparative Metrics Table */}
					<div className="border border-slate-200 rounded overflow-hidden shadow-2xs">
						<div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center">
							<span>Métrica</span>
							<div className="flex items-center gap-3 font-mono">
								<span className="text-slate-400 font-normal">Antes</span>
								<span className="text-emerald-700 font-bold">Después</span>
							</div>
						</div>

						<div className="divide-y divide-slate-100 bg-white text-xs">
							{/* Cabezas */}
							<div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
								<span className="text-slate-600 font-medium">Cabezas</span>
								<div className="flex items-center gap-2 font-mono text-[11px]">
									<span className="text-slate-400 w-6 text-right">
										{isNewDestination ? '0' : (destinationBefore?.count ?? 0)}
									</span>
									<FuseSvgIcon size={12} className="text-slate-300">
										heroicons-outline:arrow-right
									</FuseSvgIcon>
									<span className="font-bold w-8 text-right bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded">
										{destinationAfter.count}
									</span>
								</div>
							</div>

							{/* Kilos Totales */}
							<div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
								<span className="text-slate-600 font-medium">Kilos Totales</span>
								<div className="flex items-center gap-2 font-mono text-[11px]">
									<span className="text-slate-400 w-16 text-right">
										{isNewDestination ? '0 kg' : `${formatKg(destinationBefore?.kg ?? 0)} kg`}
									</span>
									<FuseSvgIcon size={12} className="text-slate-300">
										heroicons-outline:arrow-right
									</FuseSvgIcon>
									<span className="font-bold w-18 text-right bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded">
										{formatKg(destinationAfter.kg)} kg
									</span>
								</div>
							</div>

							{/* Peso Promedio */}
							<div className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
								<span className="text-slate-600 font-medium">Peso Promedio</span>
								<div className="flex items-center gap-2 font-mono text-[11px]">
									<span className="text-slate-400 w-16 text-right">
										{isNewDestination || !destinationBefore?.average
											? '--'
											: `${formatAverage(destinationBefore.average)} kg`}
									</span>
									<FuseSvgIcon size={12} className="text-slate-300">
										heroicons-outline:arrow-right
									</FuseSvgIcon>
									<span className="font-bold w-18 text-right bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded">
										{destinationAfter.average != null
											? `${formatAverage(destinationAfter.average)} kg`
											: '--'}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Validation Box */}
					{hasDestination && hasSelection ? (
						<div
							className="p-2.5 rounded border text-[11px] space-y-1"
							style={{
								backgroundColor: 'rgba(5, 150, 105, 0.08)',
								borderColor: 'rgba(5, 150, 105, 0.25)',
								color: '#065f46'
							}}
						>
							<div className="flex items-center gap-1.5 font-semibold text-emerald-800">
								<FuseSvgIcon size={14} className="text-emerald-700 flex-shrink-0">
									heroicons-outline:check-circle
								</FuseSvgIcon>
								<span>Transferencia Válida</span>
							</div>
							<p className="text-slate-600 text-[10px] leading-tight">
								{isNewDestination
									? `Curva base inicial establecida en ${destinationAfter.average != null ? formatAverage(destinationAfter.average) : '—'} kg/cab para los ${moved.count} animales transferidos.`
									: `Se incorporan ${moved.count} cabezas al lote ${destinationName}.`}
							</p>
						</div>
					) : (
						<div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-500 text-center">
							{!hasDestination
								? 'Completá los datos de destino arriba para simular el impacto.'
								: 'Seleccioná al menos un animal para proyectar.'}
						</div>
					)}
				</div>
			</div>

			{/* Net Balance Footer */}
			<div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
				<span className="text-slate-500 font-sans">Balance neto:</span>
				<span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
					+{formatKg(moved.kg)} kg
				</span>
			</div>
		</section>
	);
};

export default TransferOutcomePanel;
