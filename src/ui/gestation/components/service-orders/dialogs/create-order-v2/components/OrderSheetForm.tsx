import React from 'react';
import { Alert, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { filledInputProps, sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { isFutureDay, todayLocal } from '../orderSheetDates';
import { OrderSheetDetails } from '../useOrderSheetDetails';
import { OrderSheetMode, ServiceMethodType } from '../types';

interface OrderSheetFormProps {
	mode: OrderSheetMode;
	type: ServiceMethodType;
	hasLots: boolean;
	onTypeChange: (type: ServiceMethodType) => void;
	details: OrderSheetDetails;
}

const TYPE_HINT: Record<ServiceMethodType, string> = {
	TRADITIONAL: 'Monta natural a campo con torada.',
	AI: 'IA / IATF con pajuelas de semen.'
};

/** What the order says as a whole: the kind of service and its days. The first day says what happens. */
export const OrderSheetForm: React.FC<OrderSheetFormProps> = ({ mode, type, hasLots, onTypeChange, details }) => {
	const registering = mode === 'register';
	const hasEnd = registering || type !== 'AI';
	const planned = !registering && isFutureDay(details.startDate);

	return (
		<>
			<Paper
				variant="outlined"
				sx={{ p: 2, borderRadius: '8px' }}
			>
				<Typography sx={sectionTitleSx}>1. Servicio</Typography>
				<Stack
					spacing={1.5}
					sx={{ mt: 1.5 }}
				>
					<TextField
						select
						fullWidth
						variant="filled"
						label="Modalidad"
						value={type}
						onChange={(e) => onTypeChange(e.target.value as ServiceMethodType)}
						InputProps={filledInputProps}
						helperText={
							hasLots ? `${TYPE_HINT[type]} Cambiarla reinicia los lotes marcados.` : TYPE_HINT[type]
						}
					>
						<MenuItem value="TRADITIONAL">Tradicional</MenuItem>
						<MenuItem value="AI">Inseminación</MenuItem>
					</TextField>
				</Stack>
			</Paper>

			<Paper
				variant="outlined"
				sx={{ p: 2, borderRadius: '8px' }}
			>
				<Typography sx={sectionTitleSx}>2. Cuándo</Typography>
				<Stack
					spacing={1.5}
					sx={{ mt: 1.5 }}
				>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="flex-start"
					>
						<TextField
							variant="filled"
							type="date"
							label="Inicio"
							value={details.startDate}
							onChange={(e) => details.setStartDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							InputProps={filledInputProps}
							inputProps={registering ? { max: todayLocal() } : undefined}
							sx={{ flex: 1 }}
						/>
						{hasEnd && (
							<TextField
								variant="filled"
								type="date"
								label={registering ? 'Fin (retiro de toros)' : 'Fin previsto'}
								value={details.endDate}
								onChange={(e) => details.setEndDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								InputProps={filledInputProps}
								inputProps={registering ? { max: todayLocal() } : undefined}
								helperText={registering ? undefined : 'Recomendado: 90 días (entore estacionado)'}
								sx={{ flex: 1 }}
							/>
						)}
					</Stack>

					<TextField
						fullWidth
						multiline
						minRows={2}
						variant="filled"
						label="Observaciones"
						value={details.observations}
						onChange={(e) => details.setObservations(e.target.value)}
						InputProps={filledInputProps}
					/>

					<Alert
						severity={planned ? 'info' : registering ? 'info' : 'success'}
						sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}
					>
						{registering
							? 'Las fechas reales valen para todos los lotes marcados; en cada toro se pueden corregir.'
							: planned
								? 'Con fecha futura, la orden queda Planificada: no mueve animales ni ocupa el lote. Llegado el día, alguien la inicia con la fecha real.'
								: type === 'AI'
									? 'Con esta fecha, la inseminación empieza al confirmar.'
									: 'Con esta fecha, el servicio empieza al confirmar y los toros pasan a cada lote.'}
					</Alert>
				</Stack>
			</Paper>
		</>
	);
};

export default OrderSheetForm;
