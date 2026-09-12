import React from "react";
import { Navigate, useSearchParams } from "react-router";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import Logo from "@/components/theme-layouts/components/Logo";

/**
 * Public portal entry point handler for query-param access links (?token=...).
 * Redirects seamlessly to the canonical route /vet-portal/:token/home.
 */
export const PublicVeterinaryPortalView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const act = searchParams.get("act");

  if (!token) {
    return (
      <Box className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <Container maxWidth="xs">
          <Card className="rounded-xl border border-slate-200 shadow-lg text-center p-2">
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <Logo size="medium" />
              <div className="mt-2 text-left w-full rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-900">
                <Typography variant="subtitle2" className="font-bold mb-1">
                  Enlace de Acceso No Proporcionado
                </Typography>
                <Typography variant="body2" className="text-xs leading-relaxed text-amber-800">
                  El enlace de acceso es inválido o no contiene un token de autenticación. Por favor solicite un enlace oficial al administrador del establecimiento agropecuario.
                </Typography>
              </div>
              <Typography variant="caption" className="text-slate-400 mt-2">
                RXNA Sistema Ganadero · Portal de Profesionales
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Preserve act deep-link if present
  if (act) {
    return <Navigate to={`/vet-portal/${token}/actas/${act}/firmar`} replace />;
  }

  return <Navigate to={`/vet-portal/${token}/home`} replace />;
};

export default PublicVeterinaryPortalView;
