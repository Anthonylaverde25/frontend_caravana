import { useState, useMemo } from 'react';
import { TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import {
	simulateMating,
	InbreedingRisk
} from '@/core/caravans/domain/services/pedigreeAnalysis';

interface CategoryCounts {
	all: number;
	vaca: number;
	vaquillona: number;
	vaca_vacia: number;
}

export interface FemaleInbreedingEvaluation {
	femaleId: number;
	fx: number | null;
	risk: InbreedingRisk | 'UNKNOWN';
	riskLabel: string;
	evaluatedSireDesc: string;
	evaluatedSireId: number | null;
	commonAncestors: string[];
	recommendationTitle: string;
	recommendationDesc: string;
	isMultiSireRotation: boolean;
	riskySiresList: { sireId: number; identification: string; fx: number; commonAncestors: string[] }[];
}

interface SireRotationFemaleSelectorProps {
	selectedBatchId: number | 'all';
	serviceType: 'single' | 'rotation' | 'multi';
	isControlledService: boolean;
	selectedFemaleIds: number[];
	setSelectedFemaleIds: (ids: number[]) => void;
	selectedSireIds: number[];
	availableBulls: Caravan[];
	filteredFemales: Caravan[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategoryFilter: string;
	setSelectedCategoryFilter: (filter: string) => void;
	categoryCounts: CategoryCounts;
	femaleSireAssignments: Map<number, number>;
	setFemaleSireAssignments: (assignments: Map<number, number>) => void;
	handleSelectFemale: (id: number) => void;
	handleSelectAllFemales: () => void;
	caravansMap?: Map<number, Caravan>;
	onOpenMatingAdvisor?: (damId?: number, sireId?: number) => void;
}

function SireRotationFemaleSelector({
	selectedBatchId,
	serviceType,
	isControlledService,
	selectedFemaleIds,
	setSelectedFemaleIds,
	selectedSireIds,
	availableBulls,
	filteredFemales,
	searchQuery,
	setSearchQuery,
	selectedCategoryFilter,
	setSelectedCategoryFilter,
	categoryCounts,
	femaleSireAssignments,
	setFemaleSireAssignments,
	handleSelectFemale,
	handleSelectAllFemales,
	caravansMap = new Map(),
	onOpenMatingAdvisor
}: SireRotationFemaleSelectorProps) {
	// Genetic risk filter pill state ('all' | 'safe' | 'risky' | 'critical')
	const [geneticRiskFilter, setGeneticRiskFilter] = useState<'all' | 'safe' | 'risky' | 'critical'>('all');

	// 1. Evaluate inbreeding for every female against selected sires/assignments
	const inbreedingMap = useMemo(() => {
		const map = new Map<number, FemaleInbreedingEvaluation>();

		filteredFemales.forEach((female) => {
			if (selectedSireIds.length === 0) {
				map.set(female.id, {
					femaleId: female.id,
					fx: null,
					risk: 'UNKNOWN',
					riskLabel: 'Sin sementales asignados',
					evaluatedSireDesc: 'No hay toros asignados en Reproductores',
					evaluatedSireId: null,
					commonAncestors: [],
					recommendationTitle: 'Pendiente de Asignación',
					recommendationDesc: 'Asigne al menos un toro en Reproductores para auditar la consanguinidad.',
					isMultiSireRotation: false,
					riskySiresList: []
				});
				return;
			}

			// Mode A: Single Bull
			if (serviceType === 'single') {
				const sireId = selectedSireIds[0];
				const sim = simulateMating(female.id, sireId, caravansMap);
				const sireObj = caravansMap.get(sireId);
				const sireIdent = sireObj?.identification || `#${sireId}`;

				if (sim) {
					map.set(female.id, {
						femaleId: female.id,
						fx: sim.projectedInbreeding,
						risk: sim.risk,
						riskLabel: sim.riskLabel,
						evaluatedSireDesc: `Toro #${sireIdent}`,
						evaluatedSireId: sireId,
						commonAncestors: sim.commonAncestors,
						recommendationTitle: sim.agronomicRecommendation.title,
						recommendationDesc: sim.agronomicRecommendation.description,
						isMultiSireRotation: false,
						riskySiresList:
							sim.projectedInbreeding > 0
								? [{ sireId, identification: sireIdent, fx: sim.projectedInbreeding, commonAncestors: sim.commonAncestors }]
								: []
					});
				}
				return;
			}

			// Mode B: Controlled Multi-Sire (individual assignment per cow)
			if (serviceType === 'multi' && isControlledService) {
				const assignedSireId = femaleSireAssignments.get(female.id);
				if (assignedSireId) {
					const sim = simulateMating(female.id, assignedSireId, caravansMap);
					const sireObj = caravansMap.get(assignedSireId);
					const sireIdent = sireObj?.identification || `#${assignedSireId}`;

					if (sim) {
						map.set(female.id, {
							femaleId: female.id,
							fx: sim.projectedInbreeding,
							risk: sim.risk,
							riskLabel: sim.riskLabel,
							evaluatedSireDesc: `Toro #${sireIdent} (Asignado)`,
							evaluatedSireId: assignedSireId,
							commonAncestors: sim.commonAncestors,
							recommendationTitle: sim.agronomicRecommendation.title,
							recommendationDesc: sim.agronomicRecommendation.description,
							isMultiSireRotation: false,
							riskySiresList:
								sim.projectedInbreeding > 0
									? [{ sireId: assignedSireId, identification: sireIdent, fx: sim.projectedInbreeding, commonAncestors: sim.commonAncestors }]
									: []
						});
					}
				} else {
					// No sire assigned yet in controlled mode
					map.set(female.id, {
						femaleId: female.id,
						fx: null,
						risk: 'UNKNOWN',
						riskLabel: 'Sin toro asignado',
						evaluatedSireDesc: 'Seleccione un toro en la columna "Toro Asignado"',
						evaluatedSireId: null,
						commonAncestors: [],
						recommendationTitle: 'Asignación Individual Pendiente',
						recommendationDesc: 'Asigne un toro específico a este vientre para auditar la compatibilidad.',
						isMultiSireRotation: false,
						riskySiresList: []
					});
				}
				return;
			}

			// Mode C: Multi-Sire Collective / Bull Rotation (all bulls in pasture)
			const riskySires: { sireId: number; identification: string; fx: number; commonAncestors: string[] }[] = [];
			let maxFx = 0;
			let worstSim = simulateMating(female.id, selectedSireIds[0], caravansMap);

			selectedSireIds.forEach((sId) => {
				const sim = simulateMating(female.id, sId, caravansMap);
				const sObj = caravansMap.get(sId);
				const sIdent = sObj?.identification || `#${sId}`;

				if (sim) {
					if (sim.projectedInbreeding > maxFx) {
						maxFx = sim.projectedInbreeding;
						worstSim = sim;
					}
					if (sim.projectedInbreeding > 0) {
						riskySires.push({
							sireId: sId,
							identification: sIdent,
							fx: sim.projectedInbreeding,
							commonAncestors: sim.commonAncestors
						});
					}
				}
			});

			if (worstSim) {
				map.set(female.id, {
					femaleId: female.id,
					fx: maxFx,
					risk: worstSim.risk,
					riskLabel: worstSim.riskLabel,
					evaluatedSireDesc: `Batería de ${selectedSireIds.length} toros (Riesgo Máximo)`,
					evaluatedSireId: worstSim.sire.id,
					commonAncestors: worstSim.commonAncestors,
					recommendationTitle: worstSim.agronomicRecommendation.title,
					recommendationDesc: worstSim.agronomicRecommendation.description,
					isMultiSireRotation: true,
					riskySiresList: riskySires
				});
			}
		});

		return map;
	}, [filteredFemales, selectedSireIds, serviceType, isControlledService, femaleSireAssignments, caravansMap]);

	// 2. Filter females by Genetic Risk Filter (All / Safe / Risky / Critical)
	const displayedFemales = useMemo(() => {
		if (geneticRiskFilter === 'all') return filteredFemales;

		return filteredFemales.filter((f) => {
			const evalInfo = inbreedingMap.get(f.id);
			if (!evalInfo || evalInfo.fx === null) return false;

			if (geneticRiskFilter === 'safe') {
				return evalInfo.fx <= 3.125;
			}
			if (geneticRiskFilter === 'risky') {
				return evalInfo.fx > 3.125;
			}
			if (geneticRiskFilter === 'critical') {
				return evalInfo.fx > 12.5;
			}
			return true;
		});
	}, [filteredFemales, inbreedingMap, geneticRiskFilter]);

	// 3. Live counts for selected females (KPIs)
	const selectedGeneticStats = useMemo(() => {
		let safe = 0;
		let moderate = 0;
		let high = 0;
		let critical = 0;
		let unassessed = 0;

		selectedFemaleIds.forEach((fId) => {
			const evalInfo = inbreedingMap.get(fId);
			if (!evalInfo || evalInfo.fx === null) {
				unassessed++;
			} else if (evalInfo.fx === 0 || evalInfo.fx <= 3.125) {
				safe++;
			} else if (evalInfo.fx <= 6.25) {
				moderate++;
			} else if (evalInfo.fx <= 12.5) {
				high++;
			} else {
				critical++;
			}
		});

		return {
			total: selectedFemaleIds.length,
			safe,
			moderate,
			high,
			critical,
			totalRisky: moderate + high + critical
		};
	}, [selectedFemaleIds, inbreedingMap]);

	// 4. Quick Assisted Exclusion Handlers (1-Click)
	const handleExcludeCritical = () => {
		const criticalIds = new Set<number>();
		filteredFemales.forEach((f) => {
			const info = inbreedingMap.get(f.id);
			if (info && info.fx !== null && info.fx > 12.5) {
				criticalIds.add(f.id);
			}
		});

		if (criticalIds.size === 0) {
			toast.info('No hay vientres con consanguinidad crítica (>12.5%) en este lote.');
			return;
		}

		const newSelected = selectedFemaleIds.filter((id) => !criticalIds.has(id));
		setSelectedFemaleIds(newSelected);
		toast.success(`${criticalIds.size} vientre(s) con consanguinidad crítica fueron excluidos.`);
	};

	const handleExcludeAllRisk = () => {
		const riskyIds = new Set<number>();
		filteredFemales.forEach((f) => {
			const info = inbreedingMap.get(f.id);
			if (info && info.fx !== null && info.fx >= 6.25) {
				riskyIds.add(f.id);
			}
		});

		if (riskyIds.size === 0) {
			toast.info('No hay vientres con riesgo alto o moderado (≥6.25%) en este lote.');
			return;
		}

		const newSelected = selectedFemaleIds.filter((id) => !riskyIds.has(id));
		setSelectedFemaleIds(newSelected);
		toast.success(`${riskyIds.size} vientre(s) con riesgo de endogamia (≥6.25%) fueron excluidos.`);
	};

	const handleRestoreAllSelection = () => {
		setSelectedFemaleIds(filteredFemales.map((f) => f.id));
		toast.info('Todos los vientres aptos del lote han sido seleccionados.');
	};

	const getCategoryBadgeClass = (category: string) => {
		const lowerCategory = (category || '').toLowerCase();
		if (lowerCategory === 'vaca') {
			return {
				className:
					'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-600/10 dark:bg-green-500/15 text-green-700 dark:text-green-400',
				label: 'Vaca'
			};
		}
		if (lowerCategory === 'vaquillona') {
			return {
				className:
					'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#0a6ed1]/10 dark:bg-[#60a5fa]/15 text-[#0a6ed1] dark:text-[#60a5fa]',
				label: 'Vaquillona'
			};
		}
		return {
			className:
				'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-600/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
			label: 'Vaca Vacía'
		};
	};

	const renderInbreedingBadge = (info?: FemaleInbreedingEvaluation) => {
		if (!info || info.fx === null) {
			return (
				<span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
					<FuseSvgIcon size={12}>heroicons-outline:question-mark-circle</FuseSvgIcon>
					Sin semental
				</span>
			);
		}

		const fx = info.fx;
		let badgeClass = '';
		let icon = 'heroicons-outline:check-circle';
		let label = '';

		if (fx === 0) {
			badgeClass = 'bg-green-600/10 dark:bg-green-500/15 text-green-700 dark:text-green-400';
			icon = 'heroicons-outline:check-circle';
			label = '0.0% Exogamia';
		} else if (fx <= 3.125) {
			badgeClass = 'bg-green-600/10 dark:bg-green-500/15 text-green-700 dark:text-green-400';
			icon = 'heroicons-outline:check-circle';
			label = `${fx}% Seguro`;
		} else if (fx <= 6.25) {
			badgeClass = 'bg-yellow-600/10 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-400';
			icon = 'heroicons-outline:exclamation';
			label = `${fx}% Moderado`;
		} else if (fx <= 12.5) {
			badgeClass = 'bg-orange-600/10 dark:bg-orange-500/15 text-orange-800 dark:text-orange-400';
			icon = 'heroicons-outline:exclamation-triangle';
			label = `${fx}% Alto Riesgo`;
		} else {
			badgeClass = 'bg-red-600/10 dark:bg-red-500/15 text-red-700 dark:text-red-400 font-semibold';
			icon = 'heroicons-outline:x-circle';
			label = `${fx}% Crítico`;
		}

		const tooltipContent = (
			<div className="flex flex-col gap-1 p-1 max-w-xs text-xs">
				<div className="font-semibold">
					Consanguinidad {fx}% ({info.evaluatedSireDesc})
				</div>
				<p className="text-[11px] opacity-90 leading-tight">{info.recommendationDesc}</p>
				{info.commonAncestors.length > 0 && (
					<p className="text-[11px] text-red-300 font-semibold mt-0.5">
						Ancestros compartidos: {info.commonAncestors.join(', ')}
					</p>
				)}
				{info.isMultiSireRotation && info.riskySiresList.length > 0 && (
					<div className="pt-1 mt-1 border-t border-gray-600 text-[10px]">
						<span className="font-semibold block text-amber-300">Toros con parentesco en la rotación:</span>
						{info.riskySiresList.map((rs, i) => (
							<span key={i} className="block">• Toro #{rs.identification} ({rs.fx}%)</span>
						))}
					</div>
				)}
				<span className="text-[10px] italic text-gray-300 mt-1">Ref: Carrillo, Cap. XV &amp; XVI</span>
			</div>
		);

		return (
			<Tooltip title={tooltipContent} arrow>
				<span
					className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold cursor-help ${badgeClass}`}
				>
					<FuseSvgIcon size={12}>{icon}</FuseSvgIcon>
					<span>{label}</span>
				</span>
			</Tooltip>
		);
	};

	return (
		<section className="p-6 flex flex-col gap-5">
			{/* Section Header */}
			<div className="flex items-start justify-between flex-wrap gap-4 pb-5 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-[#0a6ed1]/10 dark:bg-[#60a5fa]/15 text-[#0a6ed1] dark:text-[#60a5fa] flex items-center justify-center">
						<FuseSvgIcon size={17}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
					</div>
					<div>
						<h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Vientres Aptos</h2>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							Hembras del lote aptas para integrar la orden de servicio.
						</p>
					</div>
				</div>

				{/* Header Actions */}
				{selectedBatchId !== 'all' && filteredFemales.length > 0 && (
					<div className="flex items-center gap-2.5 flex-wrap">
						{serviceType === 'multi' && isControlledService && selectedFemaleIds.length > 0 && selectedSireIds.length > 0 && (
							<select
								value=""
								onChange={(e) => {
									const sireId = Number(e.target.value);
									if (sireId) {
										const newAssignments = new Map(femaleSireAssignments);
										selectedFemaleIds.forEach((femaleId) => {
											newAssignments.set(femaleId, sireId);
										});
										setFemaleSireAssignments(newAssignments);
										toast.info(
											`Vientres asignados al toro: ${availableBulls.find((b) => b.id === sireId)?.identification}`
										);
									}
								}}
								className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs py-1.5 px-2 pr-8 focus:border-[#0a6ed1] focus:ring-[#0a6ed1]"
							>
								<option value="" disabled>Asignación Rápida a Todos</option>
								{selectedSireIds.map((id) => {
									const bull = availableBulls.find((b) => b.id === id);
									return (
										<option key={id} value={id}>
											{bull?.identification || `#${id}`}
										</option>
									);
								})}
							</select>
						)}

						<button
							type="button"
							onClick={handleSelectAllFemales}
							className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
						>
							{selectedFemaleIds.length === filteredFemales.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
						</button>
					</div>
				)}
			</div>

			{selectedBatchId === 'all' ? (
				<div className="py-10 flex flex-col justify-center items-center text-center">
					<div className="text-gray-400 dark:text-gray-600 mb-2">
						<FuseSvgIcon size={44}>heroicons-outline:information-circle</FuseSvgIcon>
					</div>
					<h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">
						Seleccione un Lote de Trabajo
					</h4>
					<p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
						Por favor, seleccione un lote de origen en la sección Información de la Orden para listar y elegir los vientres disponibles en esta orden.
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{/* Live Consanguinity KPI Ribbon & 1-Click Exclusion Actions */}
					{selectedSireIds.length > 0 && (
						<div className="p-4 rounded-lg border border-[#0a6ed1]/15 dark:border-[#60a5fa]/25 bg-[#0a6ed1]/5 dark:bg-[#60a5fa]/10 flex flex-col gap-3">
							<div className="flex items-center justify-between flex-wrap gap-2">
								<div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
									<FuseSvgIcon size={16} className="text-[#0a6ed1] dark:text-[#60a5fa]">
										heroicons-outline:shield-check
									</FuseSvgIcon>
									<span>Auditoría de Consanguinidad del Entore (Wright $F_X$)</span>
								</div>

								{/* 1-Click Fast Exclusion Actions */}
								<div className="flex items-center gap-2 flex-wrap">
									<button
										type="button"
										onClick={handleExcludeCritical}
										disabled={selectedGeneticStats.critical === 0}
										className="px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-600/10 dark:bg-red-500/15 hover:bg-red-600/20 dark:hover:bg-red-500/25 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
										title="Desmarca automáticamente las hembras con consanguinidad > 12.5%"
									>
										<FuseSvgIcon size={14}>heroicons-outline:no-symbol</FuseSvgIcon>
										Excluir Críticas (&gt;12.5%)
									</button>

									<button
										type="button"
										onClick={handleExcludeAllRisk}
										disabled={selectedGeneticStats.totalRisky === 0}
										className="px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-600/10 dark:bg-amber-500/15 hover:bg-amber-600/20 dark:hover:bg-amber-500/25 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
										title="Desmarca hembras con consanguinidad moderada, alta o crítica (≥ 6.25%)"
									>
										<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
										Excluir Todo Riesgo (≥6.25%)
									</button>

									<button
										type="button"
										onClick={handleRestoreAllSelection}
										className="px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-300 dark:border-gray-700 rounded-md transition-colors"
									>
										Restaurar Todas
									</button>
								</div>
							</div>

							{/* Live KPI Cards */}
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
								<div className="p-2.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col">
									<span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Seguras / Exogamia
									</span>
									<span className="text-lg font-bold text-green-700 dark:text-green-300">
										{selectedGeneticStats.safe}{' '}
										<span className="text-xs font-medium text-gray-500 dark:text-gray-400">
											({selectedGeneticStats.total > 0 ? Math.round((selectedGeneticStats.safe / selectedGeneticStats.total) * 100) : 0}%)
										</span>
									</span>
								</div>

								<div className="p-2.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col">
									<span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Moderadas (≤6.25%)
									</span>
									<span className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
										{selectedGeneticStats.moderate}
									</span>
								</div>

								<div className="p-2.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col">
									<span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Alto Riesgo (≤12.5%)
									</span>
									<span className="text-lg font-bold text-orange-700 dark:text-orange-400">
										{selectedGeneticStats.high}
									</span>
								</div>

								<div className="p-2.5 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col">
									<span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Críticas (&gt;12.5%)
									</span>
									<span className="text-lg font-bold text-red-700 dark:text-red-400">
										{selectedGeneticStats.critical}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Search, Category Filters & Genetic Risk Pills */}
					<div className="flex flex-col gap-3">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="flex-1 max-w-md">
								<TextField
									id="buscar-caravana"
									label="Buscar por caravana"
									placeholder="Escriba la identificación..."
									variant="filled"
									size="small"
									fullWidth
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									InputProps={{
										startAdornment: (
											<div className="text-gray-400 mr-2 flex items-center">
												<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
											</div>
										)
									}}
								/>
							</div>

							{/* Category Filters */}
							<div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 p-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
								<button
									type="button"
									onClick={() => setSelectedCategoryFilter('all')}
									className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
										selectedCategoryFilter === 'all'
											? 'bg-white dark:bg-gray-700 text-[#0a6ed1] dark:text-[#60a5fa] font-semibold'
											: 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
									}`}
								>
									Todas ({categoryCounts.all})
								</button>
								<button
									type="button"
									onClick={() => setSelectedCategoryFilter('vaca')}
									className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
										selectedCategoryFilter === 'vaca'
											? 'bg-white dark:bg-gray-700 text-[#0a6ed1] dark:text-[#60a5fa] font-semibold'
											: 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
									}`}
								>
									Vacas ({categoryCounts.vaca})
								</button>
								<button
									type="button"
									onClick={() => setSelectedCategoryFilter('vaquillona')}
									className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
										selectedCategoryFilter === 'vaquillona'
											? 'bg-white dark:bg-gray-700 text-[#0a6ed1] dark:text-[#60a5fa] font-semibold'
											: 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
									}`}
								>
									Vaquillonas ({categoryCounts.vaquillona})
								</button>
								<button
									type="button"
									onClick={() => setSelectedCategoryFilter('vaca_vacia')}
									className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
										selectedCategoryFilter === 'vaca_vacia'
											? 'bg-white dark:bg-gray-700 text-[#0a6ed1] dark:text-[#60a5fa] font-semibold'
											: 'text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/40'
									}`}
								>
									Vacías ({categoryCounts.vaca_vacia})
								</button>
							</div>
						</div>

						{/* Genetic Risk Quick Filter Strip */}
						{selectedSireIds.length > 0 && (
							<div className="flex items-center gap-1 pt-3 border-t border-gray-200/60 dark:border-gray-800 overflow-x-auto">
								<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mr-2">
									Filtro Genético:
								</span>
								<button
									type="button"
									onClick={() => setGeneticRiskFilter('all')}
									className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
										geneticRiskFilter === 'all'
											? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
											: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
									}`}
								>
									Todas ({filteredFemales.length})
								</button>
								<button
									type="button"
									onClick={() => setGeneticRiskFilter('safe')}
									className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
										geneticRiskFilter === 'safe'
											? 'bg-green-600/15 dark:bg-green-500/20 text-green-700 dark:text-green-300'
											: 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30'
									}`}
								>
									Solo Seguras
								</button>
								<button
									type="button"
									onClick={() => setGeneticRiskFilter('risky')}
									className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
										geneticRiskFilter === 'risky'
											? 'bg-amber-600/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
											: 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
									}`}
								>
									Con Riesgo
								</button>
								<button
									type="button"
									onClick={() => setGeneticRiskFilter('critical')}
									className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
										geneticRiskFilter === 'critical'
											? 'bg-red-600/15 dark:bg-red-500/20 text-red-700 dark:text-red-300'
											: 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
									}`}
								>
									Críticas
								</button>
							</div>
						)}
					</div>

					{/* Responsive Scrollable Table */}
					<div className="overflow-auto border border-gray-200 dark:border-gray-800 rounded-lg max-h-[420px]">
						<table className="min-w-full border-collapse">
							<thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
								<tr className="bg-gray-100 dark:bg-gray-850">
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10 text-center">
										<input
											type="checkbox"
											checked={displayedFemales.length > 0 && selectedFemaleIds.length === displayedFemales.length}
											onChange={handleSelectAllFemales}
											className="rounded border-gray-300 dark:border-gray-600 text-[#0a6ed1] dark:text-[#60a5fa] focus:ring-[#0a6ed1]"
										/>
									</th>
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
										Caravana
									</th>
									{serviceType === 'multi' && isControlledService && (
										<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
											Toro Asignado
										</th>
									)}
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
										Consanguinidad ($F_X$)
									</th>
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
										Categoría
									</th>
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
										Raza
									</th>
									<th className="border-b border-r border-gray-200 dark:border-gray-800 px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
										Peso Act.
									</th>
									<th className="border-b border-gray-200 dark:border-gray-800 px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16">
										Auditar
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
								{displayedFemales.length === 0 ? (
									<tr>
										<td
											colSpan={serviceType === 'multi' && isControlledService ? 8 : 7}
											className="px-3 py-8 text-center text-gray-400 dark:text-gray-500 italic text-sm"
										>
											{searchQuery || selectedCategoryFilter !== 'all' || geneticRiskFilter !== 'all'
												? 'No se encontraron vientres con esos criterios de búsqueda o filtros genéticos.'
												: 'No hay vientres aptos disponibles en este lote (vacías, sin preñez activa).'}
										</td>
									</tr>
								) : (
									displayedFemales.map((female) => {
										const isChecked = selectedFemaleIds.includes(female.id);
										const badge = getCategoryBadgeClass(female.category || '');
										const evalInfo = inbreedingMap.get(female.id);

										// Determine background color based on selection and inbreeding severity
										const isCritical = isChecked && evalInfo && evalInfo.fx !== null && evalInfo.fx > 12.5;
										const isHigh = isChecked && evalInfo && evalInfo.fx !== null && evalInfo.fx > 6.25 && evalInfo.fx <= 12.5;

									let rowBgClass = 'bg-white dark:bg-gray-900';
									if (isCritical) {
										rowBgClass = 'bg-red-50/40 dark:bg-red-950/20';
									} else if (isHigh) {
										rowBgClass = 'bg-amber-50/40 dark:bg-amber-950/15';
									} else if (isChecked) {
										rowBgClass = 'bg-[#0a6ed1]/5 dark:bg-[#60a5fa]/10';
									}

										return (
											<tr
												key={female.id}
												onClick={() => handleSelectFemale(female.id)}
												className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors ${rowBgClass}`}
											>
												<td
													className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap text-center"
													onClick={(e) => e.stopPropagation()}
												>
													<input
														type="checkbox"
														checked={isChecked}
														onChange={() => handleSelectFemale(female.id)}
														className="rounded border-gray-300 dark:border-gray-600 text-[#0a6ed1] dark:text-[#60a5fa] focus:ring-[#0a6ed1]"
													/>
												</td>
												<td className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap text-sm font-semibold text-[#0a6ed1] dark:text-[#60a5fa] font-mono">
													#{female.identification}
												</td>

												{/* Controlled Service Dropdown */}
												{serviceType === 'multi' && isControlledService && (
													<td
														className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap text-sm"
														onClick={(e) => e.stopPropagation()}
													>
														{selectedSireIds.length === 0 ? (
															<span className="text-xs font-semibold text-red-500 inline-flex items-center gap-1">
																<FuseSvgIcon size={12}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
																	Asigne toros en Reproductores
															</span>
														) : (
															<div className="flex items-center gap-1">
																<select
																	value={femaleSireAssignments.get(female.id) || ''}
																	disabled={!isChecked}
																	onChange={(e) => {
																		const newAssignments = new Map(femaleSireAssignments);
																		if (e.target.value) {
																			newAssignments.set(female.id, Number(e.target.value));
																		} else {
																			newAssignments.delete(female.id);
																		}
																		setFemaleSireAssignments(newAssignments);
																	}}
																	className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs py-0.5 pl-2 pr-8 focus:border-[#0a6ed1] focus:ring-[#0a6ed1]"
																>
																	<option value="">-- Seleccionar --</option>
																	{selectedSireIds.map((id) => {
																		const bull = availableBulls.find((b) => b.id === id);
																		return (
																			<option key={id} value={id}>
																				{bull?.identification || `#${id}`}
																			</option>
																		);
																	})}
																</select>
																{!femaleSireAssignments.has(female.id) && isChecked && (
																	<span className="text-amber-500" title="Vientre sin toro asignado">
																		<FuseSvgIcon size={16}>
																			heroicons-outline:exclamation-triangle
																		</FuseSvgIcon>
																	</span>
																)}
															</div>
														)}
													</td>
												)}

												{/* Inbreeding Fx Evaluation Column */}
												<td className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap">
													{renderInbreedingBadge(evalInfo)}
												</td>

												<td className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap">
													<span className={badge.className}>{badge.label}</span>
												</td>
												<td className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
													{female.breed || 'N/A'}
												</td>
												<td className="border-r border-gray-200 dark:border-gray-800 px-3 py-1.5 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 text-right font-mono">
													{female.current_weight ? `${female.current_weight.toFixed(2)} kg` : 'N/A'}
												</td>

												{/* Mating Simulation Action Button */}
												<td
													className="px-2 py-1.5 whitespace-nowrap text-center"
													onClick={(e) => e.stopPropagation()}
												>
													{onOpenMatingAdvisor && (
														<Tooltip title="Abrir Simulador de Apareamiento para este vientre">
															<button
																type="button"
																onClick={() =>
																	onOpenMatingAdvisor(
																		female.id,
																		evalInfo?.evaluatedSireId || (selectedSireIds.length > 0 ? selectedSireIds[0] : undefined)
																	)
																}
																className="p-1 text-gray-400 hover:text-[#0a6ed1] dark:text-gray-500 dark:hover:text-[#60a5fa] transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
															>
																<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>
															</button>
														</Tooltip>
													)}
												</td>
											</tr>
										);
									})
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</section>
	);
}

export default SireRotationFemaleSelector;

