import { useMemo, useState } from 'react';
import { Autocomplete, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
	detectSireBatteryKinship,
	calculateWrightInbreeding
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface SireRotationMaleSelectorProps {
	availableBulls: Caravan[];
	selectedSireIds: number[];
	handleAddBull: (bullId: number) => void;
	handleRemoveBull: (bullId: number) => void;
	caravansMap?: Map<number, Caravan>;
	eligibleFemales?: Caravan[];
	onOpenMatingAdvisor?: (damId?: number, sireId?: number) => void;
}

function SireRotationMaleSelector({
	availableBulls,
	selectedSireIds,
	handleAddBull,
	handleRemoveBull,
	caravansMap = new Map(),
	eligibleFemales = [],
	onOpenMatingAdvisor
}: SireRotationMaleSelectorProps) {
	const [showBatteryDetails, setShowBatteryDetails] = useState<boolean>(true);
	const [onlyRescueBulls, setOnlyRescueBulls] = useState<boolean>(false);

	// 1. Detect kinship between the selected bulls (Full brothers, Half brothers, etc.)
	const batteryKinship = useMemo(() => {
		return detectSireBatteryKinship(selectedSireIds, caravansMap);
	}, [selectedSireIds, caravansMap]);

	// 2. Audit kinship of each selected bull with females in the active batch
	const bullBatchKinshipMap = useMemo(() => {
		const map = new Map<number, { relatedCount: number; criticalCount: number; isPureRescue: boolean; relatedFemales: string[] }>();

		availableBulls.forEach((bull) => {
			let related = 0;
			let critical = 0;
			let zeroFxCount = 0;
			const relatedNames: string[] = [];

			eligibleFemales.forEach((female) => {
				const { fx } = calculateWrightInbreeding(female.id, bull.id, caravansMap);
				if (fx === 0.0) {
					zeroFxCount++;
				}
				if (fx >= 6.25) {
					related++;
					if (fx >= 12.5) critical++;
					relatedNames.push(`#${female.identification} (${fx}%)`);
				}
			});

			const isPureRescue = eligibleFemales.length > 0 && zeroFxCount === eligibleFemales.length;

			map.set(bull.id, {
				relatedCount: related,
				criticalCount: critical,
				isPureRescue,
				relatedFemales: relatedNames
			});
		});

		return map;
	}, [availableBulls, eligibleFemales, caravansMap]);

	// Filtered available bulls based on onlyRescueBulls toggle
	const displayedAvailableBulls = useMemo(() => {
		if (!onlyRescueBulls) return availableBulls;
		return availableBulls.filter((b) => bullBatchKinshipMap.get(b.id)?.isPureRescue);
	}, [availableBulls, onlyRescueBulls, bullBatchKinshipMap]);


	return (
		<section className="p-6 flex flex-col gap-6">
			{/* Section Header */}
			<div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-[#0a6ed1]/10 dark:bg-[#60a5fa]/15 text-[#0a6ed1] dark:text-[#60a5fa] flex items-center justify-center">
						<FuseSvgIcon size={17}>heroicons-outline:shield-check</FuseSvgIcon>
					</div>
					<div>
						<h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Reproductores (Toros)</h2>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							Asigne los sementales que participarán en el entore.
						</p>
					</div>
				</div>
				{selectedSireIds.length > 0 && (
					<span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
						<FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>
						{selectedSireIds.length} {selectedSireIds.length === 1 ? 'toro asignado' : 'toros asignados'}
					</span>
				)}
			</div>

			{/* Rescue Mode Toggle */}
			{eligibleFemales.length > 0 && (
				<div className="flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 p-2.5 rounded-lg">
					<div className="flex items-center gap-2">
						<span className="text-emerald-600 dark:text-emerald-400 flex">
							<FuseSvgIcon size={16}>heroicons-outline:leaf</FuseSvgIcon>
						</span>
						<div>
							<p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
								Garantía de Rescate Exogámico ($F_X = 0.0\%$)
							</p>
							<p className="text-[11px] text-gray-500 dark:text-gray-400">
								Filtra únicamente los toros que no comparten ningún ancestro común con las {eligibleFemales.length} hembras del lote.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setOnlyRescueBulls(!onlyRescueBulls)}
						className={`text-xs font-semibold px-3 py-1 rounded-md border transition-colors ${
							onlyRescueBulls
								? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
								: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
						}`}
					>
						{onlyRescueBulls ? 'Solo Rescate Activo' : 'Filtrar Toros Fx = 0%'}
					</button>
				</div>
			)}

			{/* Dropdown Selector */}
			<div>
				<Autocomplete
					options={displayedAvailableBulls.filter((bull) => !selectedSireIds.includes(bull.id))}
					getOptionLabel={(option) => {
						const isPure = bullBatchKinshipMap.get(option.id)?.isPureRescue;
						return `${option.identification} - ${option.breed || 'Sin Raza'} ${isPure ? '(Rescate Fx 0.0%)' : ''}`;
					}}
					onChange={(event, value) => {
						if (value) {
							handleAddBull(value.id);
						}
					}}
					value={null}
					blurOnSelect
					clearOnBlur
					renderInput={(params) => (
						<TextField
							{...params}
							placeholder={onlyRescueBulls ? "Buscar Toro de Rescate Exogámico (Fx = 0.0%)..." : "Buscar y Asignar Semental (Toro)..."}
							size="small"
							variant="filled"
						/>
					)}
				/>
			</div>


			{/* Assigned Sires List */}
			<div>
				<h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
					Sementales Asignados ({selectedSireIds.length})
				</h3>

				{selectedSireIds.length === 0 ? (
					<div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg text-center bg-gray-50/50 dark:bg-gray-950/20">
						<p className="text-sm text-gray-400 dark:text-gray-500 italic">
							No hay toros asignados. Utilice el selector de arriba para buscar y agregar reproductores.
						</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{selectedSireIds.map((id) => {
								const bull = availableBulls.find((b) => b.id === id) || caravansMap.get(id);
								if (!bull) return null;

								const batchKinship = bullBatchKinshipMap.get(id);
								const hasBatchRisk = batchKinship && batchKinship.relatedCount > 0;

								return (
									<div
										key={id}
										className="flex flex-col justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/70 dark:bg-gray-800/40 transition-colors hover:border-[#0a6ed1]/40 gap-2"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<span className="w-6 h-6 rounded-md bg-[#0a6ed1]/10 dark:bg-[#60a5fa]/15 text-[#0a6ed1] dark:text-[#60a5fa] flex items-center justify-center">
													<FuseSvgIcon size={14}>heroicons-outline:user</FuseSvgIcon>
												</span>
												<div>
													<span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
														#{bull.identification}
													</span>
													<span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
														{bull.breed || 'Sin Raza'}
													</span>
												</div>
											</div>

											<div className="flex items-center gap-1">
												{onOpenMatingAdvisor && (
													<Tooltip title="Simular cruces para este reproductor">
														<button
															type="button"
															onClick={() => onOpenMatingAdvisor(undefined, id)}
															className="p-1 text-gray-400 hover:text-[#0a6ed1] dark:text-gray-500 dark:hover:text-[#60a5fa] transition-colors"
														>
															<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>
														</button>
													</Tooltip>
												)}
												<button
													type="button"
													onClick={() => handleRemoveBull(id)}
													className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
													title="Remover Semental"
												>
													<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
												</button>
											</div>
										</div>

										{/* Kinship with batch female indicators */}
										{eligibleFemales.length > 0 && (
											<div className="pt-1 border-t border-gray-200/60 dark:border-gray-750 flex items-center justify-between text-xs">
												{hasBatchRisk ? (
													<Tooltip
														title={`Vientres emparentados en el lote: ${batchKinship.relatedFemales.join(', ')}`}
													>
														<span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400 bg-amber-600/10 dark:bg-amber-500/15 px-2 py-0.5 rounded text-[11px]">
															<FuseSvgIcon size={13}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
															{batchKinship.relatedCount} vientres emparentados
														</span>
													</Tooltip>
												) : batchKinship?.isPureRescue ? (
													<span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-600/10 dark:bg-emerald-500/15 px-2 py-0.5 rounded text-[11px]">
														<FuseSvgIcon size={13}>heroicons-outline:sparkles</FuseSvgIcon>
														100% Rescate Exogámico ($F_X = 0.0\%$)
													</span>
												) : (
													<span className="inline-flex items-center gap-1 font-medium text-green-700 dark:text-green-400 bg-green-600/10 dark:bg-green-500/15 px-2 py-0.5 rounded text-[11px]">
														<FuseSvgIcon size={13}>heroicons-outline:check-circle</FuseSvgIcon>
														Exogamia completa en el lote
													</span>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>

				)}
			</div>

			{/* Kinship between Selected Bulls Warning / Insight Panel */}
			{batteryKinship.length > 0 && (
				<div className="p-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/15 flex flex-col gap-2.5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs uppercase tracking-wider">
							<FuseSvgIcon size={16} className="text-amber-600 dark:text-amber-400">
								heroicons-outline:identification
							</FuseSvgIcon>
							<span>Homogeneidad Genética en la Batería ({batteryKinship.length} {batteryKinship.length === 1 ? 'vínculo' : 'vínculos'})</span>
						</div>
						<button
							type="button"
							onClick={() => setShowBatteryDetails(!showBatteryDetails)}
							className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
						>
							{showBatteryDetails ? 'Ocultar Detalle' : 'Ver Detalle'}
						</button>
					</div>

					{showBatteryDetails && (
						<div className="flex flex-col gap-2 pt-1">
							{batteryKinship.map((rel, idx) => (
								<div
									key={idx}
									className="p-2.5 rounded-md bg-white/80 dark:bg-gray-900/60 border border-amber-200 dark:border-amber-900/50 text-xs flex flex-col gap-1"
								>
									<div className="flex items-center justify-between flex-wrap gap-1">
										<span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">
											#{rel.bullA.identification} ↔ #{rel.bullB.identification}
										</span>
										<span className="font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px]">
											{rel.relationshipLabel}
										</span>
									</div>
									<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
										{rel.description}
									</p>
									<p className="text-gray-500 dark:text-gray-400 italic text-[11px] leading-relaxed flex items-start gap-1">
										<FuseSvgIcon size={12}>heroicons-outline:light-bulb</FuseSvgIcon>
										<span><strong className="font-semibold">Impacto zootécnico:</strong> {rel.progenyImpact}</span>
									</p>
								</div>
							))}
							<p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium italic mt-1 flex items-center gap-1">
								<FuseSvgIcon size={12}>heroicons-outline:book-open</FuseSvgIcon>
								Ref: Dr. Jorge Carrillo (*Manejo de un Rodeo de Cría*, INTA Balcarce, Cap. XV &amp; XVI).
							</p>
						</div>
					)}
				</div>
			)}
		</section>
	);
}

export default SireRotationMaleSelector;

