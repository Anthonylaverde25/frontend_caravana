import { TableRow, TableCell, Box, Typography, TextField, MenuItem, IconButton } from '@mui/material';
import { Controller, Control, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTheme } from '@mui/material/styles';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface Caravan {
  id: number;
  identification: string;
  category?: string | null;
}

interface DiagnosisRowValues {
  caravan_id: number;
  is_pregnant: boolean;
  gestation_stage?: 'head' | 'body' | 'tail' | null;
  gestation_months?: number | null;
  confirmed_sire_id?: string | number | null;
  diagnosis_date: string;
}

interface BulkDiagnosisFormValues {
  diagnoses: DiagnosisRowValues[];
}

interface BulkDiagnosisRowProps {
  index: number;
  fieldId: string;
  control: Control<any>;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
  watchedRow: any;
  caravans: Caravan[];
  orderBulls: Caravan[];
  order: ServiceOrder;
  onRemove: () => void;
  fieldsLength: number;
  zebraBg: string;
  headerBg: string;
}

const PREGNANCY_OPTIONS = [
  { value: true, label: 'Preñada 🟢' },
  { value: false, label: 'Vacía 🔴' }
];

const STAGE_OPTIONS = [
  { value: 'head', label: 'Cabeza (> 2 meses)' },
  { value: 'body', label: 'Cuerpo (1-2 meses)' },
  { value: 'tail', label: 'Cola (< 1 mes)' }
];

export default function BulkDiagnosisRow({
  index,
  fieldId,
  control,
  register,
  setValue,
  errors,
  watchedRow,
  caravans,
  orderBulls,
  order,
  onRemove,
  fieldsLength,
  zebraBg,
  headerBg
}: BulkDiagnosisRowProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const focusBorder = theme.palette.primary.main;

  const isPregnant = watchedRow?.is_pregnant ?? true;

  const cellStyle = {
    p: 0,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    '&:last-child': { borderRight: 0 }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      borderRadius: 0,
      fontSize: '0.875rem',
      backgroundColor: 'transparent',
      height: '40px',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `inset 0 0 0 2px ${focusBorder}`,
        zIndex: 1
      },
      '&.Mui-error': {
        boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}`
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none'
    },
    '& input': {
      padding: '8px 12px'
    }
  };

  const femaleId = watchedRow?.caravan_id;
  const cow = caravans.find((c) => c.id === femaleId);

  return (
    <TableRow key={fieldId} sx={{ '&:nth-of-type(even)': { bgcolor: zebraBg } }}>
      {/* 1. Index */}
      <TableCell
        align="center"
        sx={{ ...cellStyle, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.75rem' }}
      >
        {index + 1}
      </TableCell>

      {/* 2. Caravan Identifier */}
      <TableCell sx={cellStyle}>
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
          <input type="hidden" {...register(`diagnoses.${index}.caravan_id` as const)} />
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0a6ed1' }}>
            {cow ? cow.identification : '-'}
          </Typography>
        </Box>
      </TableCell>

      {/* 3. Category */}
      <TableCell sx={cellStyle}>
        <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', minHeight: '40px' }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {cow?.category || 'Vientre'}
          </Typography>
        </Box>
      </TableCell>

      {/* 4. Pregnancy Diagnosis Selection */}
      <TableCell sx={cellStyle}>
        <Controller
          control={control}
          name={`diagnoses.${index}.is_pregnant` as const}
          render={({ field: controllerField }) => (
            <TextField
              select
              fullWidth
              variant="outlined"
              sx={inputSx}
              value={String(controllerField.value)}
              onChange={(e) => {
                const val = e.target.value === 'true';
                controllerField.onChange(val);
                // If they mark empty, nullify stage/months/sire
                if (!val) {
                  setValue(`diagnoses.${index}.gestation_stage`, null);
                  setValue(`diagnoses.${index}.gestation_months`, null);
                  setValue(`diagnoses.${index}.confirmed_sire_id`, '');
                } else {
                  setValue(`diagnoses.${index}.gestation_stage`, 'head');
                  setValue(`diagnoses.${index}.gestation_months`, 3);

                  let defaultSire: string | number = '';
                  if (order.service_type === 'single') {
                    defaultSire = order.male_caravan_ids[0] || '';
                  } else if (
                    order.service_type === 'multi' &&
                    order.is_controlled_service &&
                    order.female_sire_assignments
                  ) {
                    const assignment = order.female_sire_assignments.find(
                      (a) => a.female_caravan_id === femaleId
                    );
                    defaultSire = assignment ? assignment.assigned_male_caravan_id : '';
                  }
                  setValue(`diagnoses.${index}.confirmed_sire_id`, defaultSire);
                }
              }}
            >
              {PREGNANCY_OPTIONS.map((option) => (
                <MenuItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>

      {/* 5. Gestation Stage Selection */}
      <TableCell sx={cellStyle}>
        <Controller
          control={control}
          name={`diagnoses.${index}.gestation_stage` as const}
          render={({ field: controllerField }) => (
            <TextField
              select
              fullWidth
              variant="outlined"
              sx={inputSx}
              disabled={!isPregnant}
              value={controllerField.value ?? ''}
              onChange={(e) => {
                const stage = e.target.value;
                controllerField.onChange(stage);
                // Auto set default months
                if (stage === 'head') setValue(`diagnoses.${index}.gestation_months`, 3);
                else if (stage === 'body') setValue(`diagnoses.${index}.gestation_months`, 2);
                else if (stage === 'tail') setValue(`diagnoses.${index}.gestation_months`, 1);
              }}
            >
              <MenuItem value="">
                <em>-- N/A --</em>
              </MenuItem>
              {STAGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>

      {/* 6. Gestation Months Input */}
      <TableCell sx={cellStyle}>
        <Controller
          control={control}
          name={`diagnoses.${index}.gestation_months` as const}
          render={({ field: controllerField }) => (
            <TextField
              fullWidth
              variant="outlined"
              type="number"
              placeholder="Meses"
              disabled={!isPregnant}
              error={!!errors.diagnoses?.[index]?.gestation_months}
              sx={{ ...inputSx, '& input': { textAlign: 'right' } }}
              value={controllerField.value ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                controllerField.onChange(val);
              }}
            />
          )}
        />
      </TableCell>

      {/* 7. Confirmed Sire Selection */}
      <TableCell sx={cellStyle}>
        <Controller
          control={control}
          name={`diagnoses.${index}.confirmed_sire_id` as const}
          render={({ field: controllerField }) => (
            <TextField
              select
              fullWidth
              variant="outlined"
              sx={inputSx}
              disabled={!isPregnant}
              value={controllerField.value ?? ''}
              onChange={controllerField.onChange}
            >
              <MenuItem value="">
                <em>-- Colectivo / Indeterminado --</em>
              </MenuItem>
              {orderBulls.map((bull) => (
                <MenuItem key={bull.id} value={bull.id}>
                  {bull.identification}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </TableCell>

      {/* 8. Diagnosis Date Input */}
      <TableCell sx={cellStyle}>
        <TextField
          {...register(`diagnoses.${index}.diagnosis_date` as const)}
          fullWidth
          variant="outlined"
          type="date"
          error={!!errors.diagnoses?.[index]?.diagnosis_date}
          sx={inputSx}
        />
      </TableCell>

      {/* 9. Actions Column */}
      <TableCell align="center" sx={{ ...cellStyle, borderRight: 0 }}>
        <IconButton
          size="small"
          onClick={onRemove}
          disabled={fieldsLength === 1}
          sx={{ color: theme.palette.text.disabled, '&:hover': { color: theme.palette.error.main } }}
        >
          <FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
