import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import {
  buildPedigreeRecord,
  PedigreeRecord,
} from '@/core/caravans/domain/services/pedigreeAnalysis';
import PedigreeBracketViewer from '../components/pedigree/PedigreeBracketViewer';
import MatingAdvisorDialog from '../components/pedigree/MatingAdvisorDialog';

export default function CaravanPedigreeDetailView() {
  const { caravanId } = useParams<{ caravanId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [loading, setLoading] = useState(true);
  const [caravans, setCaravans] = useState<Caravan[]>([]);
  const [matingAdvisorOpen, setMatingAdvisorOpen] = useState(false);
  const [advisorInitialDamId, setAdvisorInitialDamId] = useState<number | null>(null);
  const [advisorInitialSireId, setAdvisorInitialSireId] = useState<number | null>(null);

  const caravanRepository = useMemo(() => new ApiCaravanRepository(), []);

  // Fetch all caravans to enable seamless tree navigation and switcher
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    caravanRepository
      .findAll()
      .then((data) => {
        if (mounted) {
          setCaravans(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading caravans for pedigree view:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [caravanRepository]);

  // Fast lookup map
  const caravansMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  // Map of children
  const childrenMap = useMemo(() => {
    const map = new Map<number, number[]>();
    caravans.forEach((c) => {
      const fId = c.lineage?.father_id;
      const mId = c.lineage?.mother_id;
      if (fId) {
        const list = map.get(fId) || [];
        list.push(c.id);
        map.set(fId, list);
      }
      if (mId) {
        const list = map.get(mId) || [];
        list.push(c.id);
        map.set(mId, list);
      }
    });
    return map;
  }, [caravans]);

  // Full Pedigree Records for all caravans
  const pedigreeRecords: PedigreeRecord[] = useMemo(() => {
    return caravans.map((c) => buildPedigreeRecord(c, caravansMap, childrenMap));
  }, [caravans, caravansMap, childrenMap]);

  const targetId = caravanId ? parseInt(caravanId, 10) : null;
  const currentCaravan = targetId ? caravansMap.get(targetId) : null;
  const currentRecord = targetId ? pedigreeRecords.find((r) => r.id === targetId) : null;

  const handleOpenMatingAdvisor = (record?: PedigreeRecord) => {
    if (record) {
      if (record.sex === 'H') {
        setAdvisorInitialDamId(record.id);
        setAdvisorInitialSireId(null);
      } else if (record.sex === 'M') {
        setAdvisorInitialSireId(record.id);
        setAdvisorInitialDamId(null);
      }
    } else {
      setAdvisorInitialDamId(null);
      setAdvisorInitialSireId(null);
    }
    setMatingAdvisorOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 2 }}>
        <CircularProgress size={36} color="primary" />
        <Typography variant="body2" color="text.secondary">
          Consultando análisis genealógico y consanguinidad del animal a la API...
        </Typography>
      </Box>
    );
  }

  return (
    <FusePageSimple
      header={
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'background.paper' : '#ffffff',
          }}
        >
          {/* Breadcrumb Navigation */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Breadcrumbs separator={<FuseSvgIcon size={14}>heroicons-outline:chevron-right</FuseSvgIcon>}>
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate('/gestation/pedigree')}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem', fontWeight: 600 }}
              >
                <FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-in</FuseSvgIcon>
                Pedigree y Genealogía
              </Link>
              <Typography color="text.primary" sx={{ fontSize: '0.8rem', fontWeight: 800 }}>
                #{currentCaravan?.identification || caravanId}
              </Typography>
            </Breadcrumbs>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-left</FuseSvgIcon>}
              onClick={() => navigate('/gestation/pedigree')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '4px' }}
            >
              Volver a Lista
            </Button>
          </Stack>

          {/* Title and Top Header */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                  Ficha de Consanguinidad y Árbol 3G
                </Typography>
                {currentCaravan && (
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 900, color: 'primary.main' }}>
                    #{currentCaravan.identification}
                  </Typography>
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                Evaluación individual de homocigosis, ancestros repetidos y dictamen zootécnico de campo.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                color="warning"
                size="small"
                startIcon={<FuseSvgIcon size={16}>heroicons-outline:sparkles</FuseSvgIcon>}
                onClick={() => handleOpenMatingAdvisor(currentRecord || undefined)}
                sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '4px', boxShadow: 'none' }}
              >
                Simular Cruza
              </Button>
            </Stack>
          </Stack>
        </Box>
      }
      content={
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <PedigreeBracketViewer
            caravans={caravans}
            pedigreeRecords={pedigreeRecords}
            initialSelectedId={targetId}
            onOpenMatingAdvisor={handleOpenMatingAdvisor}
          />

          {/* Mating Advisor Simulation Dialog */}
          <MatingAdvisorDialog
            open={matingAdvisorOpen}
            onClose={() => setMatingAdvisorOpen(false)}
            caravans={caravans}
            initialDamId={advisorInitialDamId}
            initialSireId={advisorInitialSireId}
          />
        </Box>
      }
    />
  );
}
