import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import axiosInstance from '@/utils/axios';

interface InvitationSummary {
  email: string;
  veterinarian_name: string | null;
  license_number: string | null;
  expires_at: string;
}

/**
 * ADR-33: where the professional takes ownership of their access.
 *
 * The producer never sees this password, and never chose it. That is the whole point of the
 * invitation: a credential in somebody else's establishment should belong to the person who
 * uses it, not to the person who handed it out.
 */
export const InvitationAcceptView: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  const [invitation, setInvitation] = useState<InvitationSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    axiosInstance
      .get<{ data: InvitationSummary }>(`/invitations/${token}`)
      .then((response) => {
        if (cancelled) return;
        setInvitation(response.data?.data ?? null);
        setName(response.data?.data?.veterinarian_name ?? '');
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadError(
          error?.response?.data?.message ??
            'Esta invitación ya fue utilizada o venció. Solicite una nueva al establecimiento.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const passwordsMatch = password.length >= 8 && password === confirmation;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await axiosInstance.post(`/invitations/${token}/accept`, {
        name,
        password,
        password_confirmation: confirmation,
      });
      setDone(true);
    } catch (error: unknown) {
      setSubmitError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'No se pudo activar el acceso. Intente de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 460,
          width: '100%',
          mx: 'auto',
          p: 4,
          border: 1,
          borderColor: 'divider',
          borderRadius: '8px',
          bgcolor: 'background.paper',
        }}
      >
        {loading && (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Verificando la invitación…
            </Typography>
          </Stack>
        )}

        {!loading && loadError && <Alert severity="error" sx={{ borderRadius: '6px' }}>{loadError}</Alert>}

        {!loading && !loadError && done && (
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              Acceso activado
            </Typography>
            <Alert severity="success" sx={{ borderRadius: '6px' }}>
              Ya puede entrar con <strong>{invitation?.email}</strong> y la contraseña que acaba de
              elegir. Desde el portal firma sus actas, registra los envíos de muestras y carga los
              informes.
            </Alert>
          </Stack>
        )}

        {!loading && !loadError && !done && invitation && (
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1.15rem', fontWeight: 600 }}>
                Active su acceso al portal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {invitation.veterinarian_name}
                {invitation.license_number ? ` — M.P. ${invitation.license_number}` : ''}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ borderRadius: '6px' }}>
              La contraseña la elige usted y no la conoce el establecimiento. La invitación vence
              el <strong>{invitation.expires_at}</strong>.
            </Alert>

            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="filled"
              size="small"
              fullWidth
              sx={{ bgcolor: 'action.hover' }}
            />

            <TextField
              label="Correo"
              value={invitation.email}
              InputProps={{ readOnly: true }}
              variant="filled"
              size="small"
              fullWidth
              sx={{ bgcolor: 'action.hover' }}
              helperText="Es con el que va a entrar."
            />

            <TextField
              type="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="filled"
              size="small"
              fullWidth
              sx={{ bgcolor: 'action.hover' }}
              helperText="Al menos 8 caracteres."
            />

            <TextField
              type="password"
              label="Repetir contraseña"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              variant="filled"
              size="small"
              fullWidth
              error={confirmation.length > 0 && !passwordsMatch}
              sx={{ bgcolor: 'action.hover' }}
              helperText={
                confirmation.length > 0 && !passwordsMatch ? 'Las contraseñas no coinciden.' : undefined
              }
            />

            {submitError && <Alert severity="error" sx={{ borderRadius: '6px' }}>{submitError}</Alert>}

            <Button
              variant="contained"
              disabled={!passwordsMatch || submitting}
              onClick={handleSubmit}
              sx={{ fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', py: 1 }}
            >
              {submitting ? 'Activando…' : 'Activar mi acceso'}
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default InvitationAcceptView;
