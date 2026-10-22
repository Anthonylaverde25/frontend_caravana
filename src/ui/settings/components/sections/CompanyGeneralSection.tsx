import { ReactNode, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useCompany } from '@/contexts/CompanyContext';
import { formatCuit } from '@/core/shared/domain/cuit';
import CompanyCuitDialog from '../../CompanyCuitDialog';
import SettingsSection from '../SettingsSection';

function Fact({ label, caption, action, children }: { label: string; caption?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr auto', sm: '200px minmax(0, 1fr) auto' },
        columnGap: 2,
        alignItems: 'center',
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography component="dt" sx={{ fontSize: '0.82rem', color: 'text.secondary', gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0, minWidth: 0 }}>
        <Box sx={{ fontSize: '0.85rem' }}>{children}</Box>
        {caption && (
          <Typography component="span" sx={{ display: 'block', fontSize: '0.7rem', color: 'text.secondary' }}>
            {caption}
          </Typography>
        )}
      </Box>
      <Box sx={{ textAlign: 'right' }}>{action}</Box>
    </Box>
  );
}

const monoSx = { fontFamily: 'monospace', fontWeight: 700 } as const;

/** The active company's identification, one fact per row; only the CUIT is changed from here. */
export default function CompanyGeneralSection() {
  const { activeCompanyId, companies } = useCompany();
  const company = companies.find((c) => c.id === activeCompanyId);
  const [editingCuit, setEditingCuit] = useState(false);

  return (
    <SettingsSection id="company">
      <Box component="dl" sx={{ m: 0, mt: -2 }}>
        <Fact label="Nombre">
          <Box component="span" sx={{ fontWeight: 600 }}>
            {company?.name ?? '—'}
          </Box>
        </Fact>
        <Fact
          label="CUIT"
          caption="Receptor fiscal de las facturas; se consulta en ARCA al cambiarlo."
          action={
            company && (
              <Button size="small" onClick={() => setEditingCuit(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                {company.cuit ? 'Cambiar' : 'Cargar CUIT'}
              </Button>
            )
          }
        >
          {company?.cuit ? (
            <Box component="span" sx={monoSx}>
              {formatCuit(company.cuit)}
            </Box>
          ) : (
            <Box component="span" sx={{ color: 'warning.dark', fontWeight: 600 }}>
              Sin cargar
            </Box>
          )}
        </Fact>
        <Fact label="RENSPA" caption="Registro de SENASA; va en las planillas y en los documentos de traslado.">
          <Box component="span" sx={{ ...monoSx, color: 'primary.main' }}>
            {company?.renspa || '—'}
          </Box>
        </Fact>
        <Fact label="Ubicación">{company?.location || '—'}</Fact>
      </Box>

      {company && (
        <CompanyCuitDialog open={editingCuit} onClose={() => setEditingCuit(false)} companyName={company.name} cuit={company.cuit ?? null} />
      )}
    </SettingsSection>
  );
}
