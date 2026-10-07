import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Box,
	CircularProgress
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';

export interface CaravanFormData {
	id: number;
	identification: string;
	category: string;
	category_id: number | '';
	subcategory_id: number | '';
	breed: string;
	sex: 'M' | 'H';
	teeth: number;
	entry_weight: string;
	entry_date: string;
	batch_id: number;
	farm_id: number;
	is_empty: boolean;
}

interface CaravanFormDialogProps {
	open: boolean;
	mode: 'create' | 'edit' | 'view';
	caravanData?: any;
	defaultBatchId?: number;
	ownBatches: any[];
	onClose: () => void;
	onSubmit: (payload: any) => void;
	isSubmitting: boolean;
}

/**
 * CaravanFormDialog
 * Modular dialog for Creating, Editing, or Viewing an individual Caravan.
 */
export function CaravanFormDialog({
	open,
	mode,
	caravanData,
	defaultBatchId,
	ownBatches,
	onClose,
	onSubmit,
	isSubmitting
}: CaravanFormDialogProps) {
	const { getCategoryOptions, getSubcategoryOptions, getCategoryById } = useAnimalCategories();

	const [formData, setFormData] = useState<CaravanFormData>({
		id: 0,
		identification: '',
		category: '',
		category_id: '',
		subcategory_id: '',
		breed: '',
		sex: 'M',
		teeth: 0,
		entry_weight: '',
		entry_date: new Date().toISOString().split('T')[0],
		batch_id: 0,
		farm_id: 0,
		is_empty: true
	});

	useEffect(() => {
		if (open) {
			if (caravanData) {
				setFormData({
					id: caravanData.id || 0,
					identification: caravanData.identification || '',
					category: caravanData.category || '',
					category_id: caravanData.category_id || '',
					subcategory_id: caravanData.subcategory_id || '',
					breed: caravanData.breed || '',
					teeth: caravanData.teeth ?? 0,
					entry_weight: caravanData.entry_weight?.toString() || '',
					sex: caravanData.sex || 'M',
					entry_date: caravanData.entry_date || new Date().toISOString().split('T')[0],
					batch_id: caravanData.batch_id || 0,
					farm_id: caravanData.farm_id || 0,
					is_empty: caravanData.female_details?.is_empty ?? true
				});
			} else {
				setFormData({
					id: 0,
					identification: '',
					category: '',
					category_id: '',
					subcategory_id: '',
					breed: '',
					teeth: 0,
					entry_weight: '',
					sex: 'M',
					entry_date: new Date().toISOString().split('T')[0],
					batch_id: defaultBatchId || ownBatches[0]?.id || 0,
					farm_id: 0,
					is_empty: true
				});
			}
		}
	}, [open, caravanData, defaultBatchId, ownBatches]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = { ...prev, [name]: value };

			if (name === 'category_id') {
				const catIdNum = Number(value);
				const catObj = getCategoryById(catIdNum);
				if (catObj) {
					updated.category = catObj.code.toLowerCase();
					updated.subcategory_id = '';
					if (catObj.sex === 'M') {
						updated.sex = 'M';
						updated.is_empty = true;
					} else if (catObj.sex === 'H') {
						updated.sex = 'H';
						if (!catObj.is_reproductive) {
							updated.is_empty = true;
						}
					}
				}
			}

			const cat = (updated.category || '').toLowerCase();
			if (
				updated.sex === 'H' &&
				(cat === 'vaquillona' || cat === 'ternera' || cat === 'vaca vacia' || cat === 'vaca_vacia')
			) {
				updated.is_empty = true;
			}

			return updated;
		});
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (mode === 'view') return;

		const payload = {
			...formData,
			category_id: formData.category_id ? Number(formData.category_id) : undefined,
			subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : undefined,
			entry_weight: formData.entry_weight ? parseFloat(formData.entry_weight) : null,
			teeth: Number(formData.teeth),
			batch_id: formData.batch_id ? Number(formData.batch_id) : undefined
		};

		onSubmit(payload);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			scroll="paper"
			PaperProps={{ sx: { borderRadius: '16px' } }}
		>
			<form onSubmit={handleFormSubmit}>
				<DialogTitle sx={{ p: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<FuseSvgIcon color="primary" size={24}>
						{mode === 'create'
							? 'heroicons-outline:plus-circle'
							: mode === 'edit'
								? 'heroicons-outline:pencil-alt'
								: 'heroicons-outline:information-circle'}
					</FuseSvgIcon>
					{mode === 'create'
						? 'Insertar Nueva Caravana'
						: mode === 'edit'
							? 'Editar Caravana'
							: 'Detalles de la Caravana'}
				</DialogTitle>
				<DialogContent dividers sx={{ p: 3 }}>
					<Box className="grid grid-cols-1 gap-16 sm:grid-cols-2">
						<Box>
							<TextField
								name="identification"
								label="Identificación"
								required
								fullWidth
								disabled={mode === 'view'}
								value={formData.identification}
								onChange={handleChange}
							/>
						</Box>
						<Box>
							<TextField
								name="category_id"
								label="Categoría"
								select
								required
								fullWidth
								disabled={mode === 'view'}
								value={formData.category_id || ''}
								onChange={handleChange}
							>
								<MenuItem value="">
									<em>Seleccionar Categoría</em>
								</MenuItem>
								{getCategoryOptions().map((opt) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label} ({opt.sex === 'BOTH' ? 'M/H' : opt.sex === 'M' ? 'Macho' : 'Hembra'})
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box>
							<TextField
								name="subcategory_id"
								label="Subcategoría"
								select
								fullWidth
								disabled={mode === 'view' || !formData.category_id || getSubcategoryOptions(Number(formData.category_id)).length === 0}
								value={formData.subcategory_id || ''}
								onChange={handleChange}
								helperText={
									formData.category_id && getSubcategoryOptions(Number(formData.category_id)).length === 0
										? 'Sin subcategorías obligatorias'
										: undefined
								}
							>
								<MenuItem value="">
									<em>Ninguna / Rodeo General</em>
								</MenuItem>
								{getSubcategoryOptions(Number(formData.category_id)).map((opt) => (
									<MenuItem key={opt.value} value={opt.value}>
										{opt.label}
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box>
							<TextField
								name="breed"
								label="Raza"
								fullWidth
								disabled={mode === 'view'}
								value={formData.breed}
								onChange={handleChange}
							/>
						</Box>
						<Box>
							<TextField
								name="sex"
								label="Sexo"
								select
								fullWidth
								disabled={
									mode === 'view' ||
									(Boolean(formData.category_id) &&
										getCategoryById(Number(formData.category_id))?.sex !== 'BOTH')
								}
								value={formData.sex}
								onChange={handleChange}
							>
								<MenuItem value="M">Macho</MenuItem>
								<MenuItem value="H">Hembra</MenuItem>
							</TextField>
						</Box>
						{formData.sex === 'H' ? (
							<Box>
								<TextField
									name="is_empty"
									label="Estado Reproductivo"
									select
									fullWidth
									disabled={
										mode === 'view' ||
										(Boolean(formData.category_id) &&
											!getCategoryById(Number(formData.category_id))?.is_reproductive)
									}
									value={formData.is_empty.toString()}
									onChange={(e) =>
										setFormData((p) => ({ ...p, is_empty: e.target.value === 'true' }))
									}
								>
									<MenuItem value="true">Vacía</MenuItem>
									<MenuItem value="false">Preñada</MenuItem>
								</TextField>
							</Box>
						) : (
							<Box>
								<TextField
									label="Estado Reproductivo"
									fullWidth
									disabled
									value="No Aplica"
								/>
							</Box>
						)}
						<Box className="sm:col-span-2">
							<TextField
								name="batch_id"
								label="Lote Propio Asignado"
								select
								fullWidth
								disabled={mode === 'view'}
								value={formData.batch_id || ''}
								onChange={handleChange}
								helperText="Solo se listan los lotes operativos propios de tus fincas"
							>
								{ownBatches.map((b) => (
									<MenuItem key={b.id} value={b.id}>
										{b.name} ({b.farm_name || 'Finca Propia'})
									</MenuItem>
								))}
							</TextField>
						</Box>
						<Box className="grid grid-cols-1 gap-16 sm:col-span-2 sm:grid-cols-3">
							<Box>
								<TextField
									name="teeth"
									label="Dientes"
									type="number"
									fullWidth
									disabled={mode === 'view'}
									value={formData.teeth}
									onChange={handleChange}
								/>
							</Box>
							<Box>
								<TextField
									name="entry_weight"
									label="Peso (Kg)"
									type="number"
									fullWidth
									disabled={mode === 'view'}
									value={formData.entry_weight}
									onChange={handleChange}
								/>
							</Box>
							<Box>
								<TextField
									name="entry_date"
									label="Fecha"
									type="date"
									fullWidth
									disabled={mode === 'view'}
									value={formData.entry_date}
									onChange={handleChange}
									InputLabelProps={{ shrink: true }}
								/>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 3 }}>
					<Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
						{mode === 'view' ? 'Cerrar' : 'Cancelar'}
					</Button>
					{mode !== 'view' && (
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={isSubmitting}
							sx={{ px: 4, fontWeight: 700 }}
							startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
						>
							{mode === 'create' ? 'Guardar Registro' : 'Actualizar Cambios'}
						</Button>
					)}
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default CaravanFormDialog;
