import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { ApiWeighingTypeRepository } from '@/core/weighing/infrastructure/repositories/ApiWeighingTypeRepository';
import { WeighingType } from '@/core/weighing/domain/entities/Weighing';

const repository = new ApiWeighingTypeRepository();

export default function WeighingTypesSection() {
  const queryClient = useQueryClient();

  // Query ALL weighing types (active and inactive)
  const { data: weighingTypes = [], isLoading, isError } = useQuery<WeighingType[]>({
    queryKey: ['weighing-types', false],
    queryFn: () => repository.findAll(false),
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: toggleActive, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      repository.setActive(id, isActive),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['weighing-types'] });
      toast.success(`Tipo de pesaje "${updated.name}" actualizado`);
    },
    onError: () => {
      toast.error('No se pudo actualizar el tipo de pesaje');
    },
  });

  const activeCount = weighingTypes.filter((t) => t.is_active).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Header Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <FuseSvgIcon size={24} sx={{ color: 'primary.main' }}>
            heroicons-outline:scale
          </FuseSvgIcon>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Tipos de Pesaje & Eventos de Báscula
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Propósitos de pesaje zootécnico disponibles en las planillas de manga, báscula y control periódico.
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={`${activeCount} de ${weighingTypes.length} Activos`}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 24,
            color: '#334155',
            borderColor: '#cbd5e1',
          }}
        />
      </Paper>

      {/* List of Weighing Types */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
            <Typography variant="body2">Error al cargar los tipos de pesaje.</Typography>
          </Box>
        ) : (
          <Box>
            {weighingTypes.map((type, index) => (
              <Box
                key={type.id}
                sx={{
                  p: 2,
                  px: 2.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  bgcolor: index % 2 === 0 ? '#ffffff' : '#fcfcfd',
                  borderBottom: index < weighingTypes.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {type.name}
                    </Typography>
                    <Box
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#64748b',
                        bgcolor: '#f1f5f9',
                        px: 0.75,
                        py: 0.15,
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {type.code}
                    </Box>
                    {type.affects_adpv && (
                      <Chip
                        label="Calcula ADPV"
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, borderColor: '#cbd5e1' }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {type.description || 'Sin descripción adicional para este propósito.'}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 0.25 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      Condición desbaste: <strong>{type.default_shrunk_condition}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                      Modalidad:{' '}
                      <strong>
                        {type.allows_individual && type.allows_group
                          ? 'Individual y Tropa'
                          : type.allows_individual
                          ? 'Individual'
                          : 'Tropa'}
                      </strong>
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: type.is_active ? 'success.main' : '#94a3b8',
                      fontSize: '0.75rem',
                    }}
                  >
                    {type.is_active ? 'Habilitado' : 'Inactivo'}
                  </Typography>
                  <Switch
                    checked={type.is_active}
                    disabled={isUpdating}
                    onChange={(e) => toggleActive({ id: type.id, isActive: e.target.checked })}
                    size="small"
                    color="primary"
                  />
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
