import { TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import SettingsSection from '../SettingsSection';
import { DENTITION_SCALE } from './dentitionScale';

/** The dental chronometry scale: a fixed reference of the system, read-only. */
export default function DentitionScaleSection() {
  const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
  const wrapSx = { ...textCellSx, height: 'auto', py: 0.75 } as const;

  return (
    <SettingsSection id="dentition">
      <SheetGrid minWidth={900}>
        <TableHead>
          <TableRow>
            <TableCell sx={indexSx}>#</TableCell>
            <TableCell sx={{ ...headSx, width: 80 }}>Código</TableCell>
            <TableCell sx={{ ...headSx, width: 150 }}>Estado dentario</TableCell>
            <TableCell sx={{ ...headSx, width: 150 }}>Edad estimada</TableCell>
            <TableCell sx={{ ...headSx, width: 190 }}>Categoría típica</TableCell>
            <TableCell sx={headSx}>Criterio</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {DENTITION_SCALE.map((item, index) => (
            <TableRow key={item.code} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
              <TableCell sx={indexSx}>{index + 1}</TableCell>
              <SheetGridTagCell tag={item.code} />
              <TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{item.state}</TableCell>
              <TableCell sx={textCellSx}>{item.ageRange}</TableCell>
              <TableCell sx={textCellSx}>{item.category}</TableCell>
              <TableCell sx={wrapSx}>
                {item.criterion}
                <Typography component="span" sx={{ display: 'block', fontSize: '0.72rem', color: 'text.secondary' }}>
                  {item.note}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </SheetGrid>
      <Typography variant="caption" color="text.secondary">
        Escala de referencia del sistema: se usa en las planillas de campo y en la clasificación en manga. No se edita.
      </Typography>
    </SettingsSection>
  );
}
