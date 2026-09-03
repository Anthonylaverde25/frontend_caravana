import { useState } from 'react';
import { TextField, MenuItem } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Batch {
	id: number;
	name: string;
	farm_id?: number | null;
	farm_name?: string;
	provider_id?: number | null;
	provider_name?: string;
	activity_id?: number;
	activity_name?: string;
	activity_code?: string;
}

interface SireRotationFormFieldsProps {
	dbBatches: Batch[];
	selectedBatchId: number | 'all';
	setSelectedBatchId: (id: number | 'all') => void;
	orderCode: string;
	setOrderCode: (code: string) => void;
	startDate: string;
	setStartDate: (date: string) => void;
	serviceType: 'single' | 'rotation' | 'multi';
	setServiceType: (type: 'single' | 'rotation' | 'multi') => void;
	isControlledService: boolean;
	setIsControlledService: (val: boolean) => void;
	observations: string;
	setObservations: (val: string) => void;
	setSelectedSireIds: (ids: number[]) => void;
	setFemaleSireAssignments: (assignments: Map<number, number>) => void;
}

function SireRotationFormFields({
	dbBatches,
	selectedBatchId,
	setSelectedBatchId,
	orderCode,
	startDate,
	setStartDate,
	serviceType,
	setServiceType,
	isControlledService,
	setIsControlledService,
	observations,
	setObservations,
	setSelectedSireIds,
	setFemaleSireAssignments
}: SireRotationFormFieldsProps) {
	const [showObservations, setShowObservations] = useState(false);

	const criaBatches = dbBatches.filter((b) => {
		const isOwn = b.provider_id === null || b.provider_id === undefined;
		const code = (b.activity_code || '').toUpperCase();
		const name = (b.activity_name || '').toLowerCase();
		const isCria = code === 'CRIA' || name.includes('cría') || name.includes('cria');
		return isOwn && isCria;
	});

	return (
		<section className="p-6">
			{/* Section Header */}
			<div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center gap-3">
					<div className="w-9 h-9 rounded-lg bg-[#0a6ed1]/10 dark:bg-[#60a5fa]/15 text-[#0a6ed1] dark:text-[#60a5fa] flex items-center justify-center">
						<FuseSvgIcon size={17}>heroicons-outline:document-text</FuseSvgIcon>
					</div>
					<div>
						<h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Información de la Orden</h2>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
							Lote de trabajo (Cría), modalidad y fechas programadas del entore.
						</p>
					</div>
				</div>
				<span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 font-mono">
					<FuseSvgIcon size={14}>heroicons-outline:tag</FuseSvgIcon>
					{orderCode}
				</span>
			</div>

			{/* Form Layout */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Lote de Trabajo */}
				<div>
					<TextField
						id="lote-trabajo"
						select
						label="Lote de Trabajo (Actividad Cría)"
						value={selectedBatchId}
						onChange={(e) => {
							const val = e.target.value;
							setSelectedBatchId(val === 'all' ? 'all' : Number(val));
						}}
						variant="filled"
						size="small"
						fullWidth
						error={criaBatches.length === 0}
						helperText={
							criaBatches.length === 0
								? 'No hay lotes con actividad Cría disponibles. Cree un lote de Cría para continuar.'
								: undefined
						}
					>
						<MenuItem value="all">
							<em>-- Seleccione un Lote de Cría --</em>
						</MenuItem>
						{criaBatches.map((b) => (
							<MenuItem key={b.id} value={b.id}>
								{b.name} {b.farm_name ? `(${b.farm_name})` : ''}
							</MenuItem>
						))}
					</TextField>
				</div>

				{/* Código de la Orden */}
				<div>
					<TextField
						id="codigo-orden"
						label="Código de la Orden"
						value={orderCode}
						variant="filled"
						size="small"
						fullWidth
						InputProps={{
							readOnly: true
						}}
					/>
				</div>

				{/* Fecha Programada */}
				<div>
					<TextField
						id="fecha-programada"
						label="Fecha Programada de Inicio"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						variant="filled"
						size="small"
						fullWidth
						InputLabelProps={{
							shrink: true
						}}
					/>
				</div>

				{/* Modalidad de Servicio */}
				<div>
					<TextField
						id="modalidad-servicio"
						select
						label="Modalidad de Servicio"
						value={serviceType === 'rotation' ? 'multi' : serviceType}
						onChange={(e) => {
							const val = e.target.value as 'single' | 'multi';
							setServiceType(val);
							setSelectedSireIds([]);
							setIsControlledService(false);
							setFemaleSireAssignments(new Map());
						}}
						variant="filled"
						size="small"
						fullWidth
					>
						<MenuItem value="single">Toro Único</MenuItem>
						<MenuItem value="multi">Multi-Toro</MenuItem>
					</TextField>

					{/* Controlled Service Switch */}
					{serviceType === 'multi' && (
						<div className="flex items-center gap-2 mt-3 transition-opacity duration-300">
							<button
								type="button"
								role="switch"
								aria-checked={isControlledService}
								onClick={() => {
									const val = !isControlledService;
									setIsControlledService(val);
									if (!val) {
										setFemaleSireAssignments(new Map());
									}
								}}
								className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0a6ed1] focus:ring-offset-2 ${
									isControlledService ? 'bg-[#0a6ed1]' : 'bg-gray-200 dark:bg-gray-700'
								}`}
							>
								<span
									aria-hidden="true"
									className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										isControlledService ? 'translate-x-4' : 'translate-x-0'
									}`}
								/>
							</button>
							<span className="text-sm text-gray-750 dark:text-gray-300 font-medium">
								Servicio Controlado — Asignar toros específicos a cada vientre
							</span>
						</div>
					)}
				</div>

				{/* Observaciones */}
				<div className="md:col-span-2 flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<input
							id="toggle-observaciones"
							type="checkbox"
							checked={showObservations}
							onChange={(e) => {
								const checked = e.target.checked;
								setShowObservations(checked);
								if (!checked) {
									setObservations('');
								}
							}}
							className="rounded border-gray-300 dark:border-gray-600 text-[#0a6ed1] dark:text-[#60a5fa] focus:ring-[#0a6ed1] h-4 w-4"
						/>
						<label htmlFor="toggle-observaciones" className="text-sm font-medium text-gray-750 dark:text-gray-300 cursor-pointer">
							Habilitar observaciones de la orden
						</label>
					</div>

					{showObservations && (
						<TextField
							id="observaciones"
							label="Observaciones de la Orden"
							variant="filled"
							multiline
							rows={3}
							value={observations}
							onChange={(e) => setObservations(e.target.value)}
							placeholder="Escriba observaciones adicionales..."
							size="small"
							fullWidth
						/>
					)}
				</div>
			</div>
		</section>
	);
}

export default SireRotationFormFields;
