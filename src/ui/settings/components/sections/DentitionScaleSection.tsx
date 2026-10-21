import { Box, Paper, Typography, Grid, Stack, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface DentitionScaleItem {
  value: number;
  label: string;
  category: string;
  ageRange: string;
  desc: string;
  zootechnicalNote: string;
}

const DENTITION_SCALE: DentitionScaleItem[] = [
  {
    value: 0,
    label: '0 Dientes (Boca de Leche)',
    category: 'Ternero / Ternera',
    ageRange: '< 18 - 20 meses',
    desc: 'Piezas de leche temporarias sin erupción de incisivos permanentes.',
    zootechnicalNote: 'Animal joven en lactancia o recría inicial. Sin aptitud reproductiva ni terminación pesada.',
  },
  {
    value: 2,
    label: '2 Dientes',
    category: 'Vaquillona / Novillito (Invernada)',
    ageRange: '18 a 24 meses',
    desc: 'Erupción y nivelación de pinzas centrales definitivas.',
    zootechnicalNote: 'Edad estándar de entore (primer servicio a los 2 años) o entrada a terminación intensiva.',
  },
  {
    value: 4,
    label: '4 Dientes',
    category: 'Desarrollo Intermedio',
    ageRange: '24 a 32 meses',
    desc: 'Erupción de los primeros medianos permanentes.',
    zootechnicalNote: 'Vaca de segunda parición o novillo terminado para faena de exportación.',
  },
  {
    value: 6,
    label: '6 Dientes',
    category: 'Pre-Adultez',
    ageRange: '32 a 40 meses',
    desc: 'Erupción de los segundos medianos definitivos.',
    zootechnicalNote: 'Rodeo adulto en plena capacidad reproductiva y productiva.',
  },
  {
    value: 8,
    label: '8 Dientes (Boca Llena)',
    category: 'Adulto Completo',
    ageRange: '40 a 48 meses en adelante',
    desc: 'Erupción de extremos permanentes. Cronometría dentaria completa.',
    zootechnicalNote: 'Dentición permanente completa. Determinación subsiguiente por enrase, desgaste y descarte (CUT).',
  },
];

export default function DentitionScaleSection() {
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
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <FuseSvgIcon size={24} sx={{ color: 'primary.main' }}>
          heroicons-outline:identification
        </FuseSvgIcon>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Escala de Dentición & Cronometría Bovina
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Referencia zootécnica de determinación etaria por cronometría dentaria utilizada en planillas de campo y clasificación en manga.
          </Typography>
        </Box>
      </Paper>

      {/* Structured Enterprise Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
        }}
      >
        <Table size="medium">
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5, width: 80 }}>
                CRONO
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5, width: 220 }}>
                ESTADO DENTARIO
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5, width: 140 }}>
                EDAD ESTIMADA
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#475569', py: 1.5 }}>
                CARACTERÍSTICAS & CRITERIO ZOOTÉCNICO
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DENTITION_SCALE.map((item, index) => (
              <TableRow
                key={item.value}
                sx={{
                  bgcolor: index % 2 === 0 ? '#ffffff' : '#fcfcfd',
                  '&:last-child td': { borderBottom: 0 },
                }}
              >
                <TableCell sx={{ py: 1.75 }}>
                  <Box
                    sx={{
                      display: 'inline-block',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      color: 'primary.main',
                      bgcolor: '#f1f5f9',
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                    }}
                  >
                    {item.value}D
                  </Box>
                </TableCell>

                <TableCell sx={{ py: 1.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {item.category}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 1.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.82rem' }}>
                    {item.ageRange}
                  </Typography>
                </TableCell>

                <TableCell sx={{ py: 1.75 }}>
                  <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.82rem' }}>
                    {item.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                    {item.zootechnicalNote}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
