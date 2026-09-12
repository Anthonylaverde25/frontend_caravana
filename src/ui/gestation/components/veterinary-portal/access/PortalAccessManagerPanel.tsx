import React, { useState } from "react";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  useIssueVeterinaryPortalToken,
  useReissueVeterinaryPortalToken,
  useRevokeVeterinaryPortalToken,
  useVeterinarians,
  useVeterinaryPortalTokens,
} from "@/features/gestation/hooks/useVeterinaryProtocols";
import {
  IssuedPortalToken,
  VeterinaryPortalAccessToken,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";
import {
  PortalAccessIssueForm,
  IssueFormValues,
} from "./PortalAccessIssueForm";
import { PortalAccessIssuedBanner } from "./PortalAccessIssuedBanner";
import { PortalAccessTokensTable } from "./PortalAccessTokensTable";

/**
 * The establishment's side of the veterinary portal: who holds a key, and how one is handed out.
 *
 * It lives on the portal page rather than behind a dialog in another screen, because "which
 * external professionals can reach my sanitary data" is a standing question, not a step of some
 * other workflow.
 */
export const PortalAccessManagerPanel: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { data: veterinarians = [] } = useVeterinarians();
  const { data: tokens = [], isLoading } = useVeterinaryPortalTokens();
  const issueToken = useIssueVeterinaryPortalToken();
  const reissueToken = useReissueVeterinaryPortalToken();
  const revokeToken = useRevokeVeterinaryPortalToken();

  const [issued, setIssued] = useState<IssuedPortalToken | null>(null);
  const [busyTokenId, setBusyTokenId] = useState<number | null>(null);
  const [form, setForm] = useState<IssueFormValues>({
    veterinarian_id: "",
    label: "",
    ttl_hours: 72,
    send_email: true,
    recipient_email: "",
    sender_note: "",
  });

  const handleChange = (
    field: keyof IssueFormValues,
    value: string | number | boolean,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const announce = (result: IssuedPortalToken) => {
    setIssued(result);

    if (result.email.sent) {
      enqueueSnackbar(`Enlace enviado a ${result.email.recipient}.`, {
        variant: "success",
      });
    } else if (result.email.error) {
      enqueueSnackbar(
        "El acceso se emitió, pero el correo no salió. Copie el enlace.",
        {
          variant: "warning",
        },
      );
    } else {
      enqueueSnackbar(
        "Acceso emitido. Copie el enlace: no vuelve a mostrarse.",
        { variant: "success" },
      );
    }
  };

  const handleIssue = async () => {
    if (form.veterinarian_id === "") return;

    try {
      const result = await issueToken.mutateAsync({
        veterinarian_id: Number(form.veterinarian_id),
        label: form.label.trim() || null,
        ttl_hours: form.ttl_hours,
        send_email: form.send_email,
        recipient_email: form.recipient_email.trim() || null,
        sender_note: form.sender_note.trim() || null,
      });

      announce(result);
      setForm((prev) => ({
        ...prev,
        label: "",
        recipient_email: "",
        sender_note: "",
      }));
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, "No se pudo emitir el acceso."), {
        variant: "error",
      });
    }
  };

  const handleReissue = async (token: VeterinaryPortalAccessToken) => {
    setBusyTokenId(token.id);

    try {
      const result = await reissueToken.mutateAsync({
        id: token.id,
        input: {
          send_email: true,
          sender_note:
            "Enlace reemitido a pedido del profesional. El anterior quedó revocado.",
        },
      });

      announce(result);
    } catch (error: unknown) {
      enqueueSnackbar(
        apiErrorMessage(error, "No se pudo reemitir el acceso."),
        { variant: "error" },
      );
    } finally {
      setBusyTokenId(null);
    }
  };

  const handleRevoke = async (token: VeterinaryPortalAccessToken) => {
    setBusyTokenId(token.id);

    try {
      await revokeToken.mutateAsync({
        id: token.id,
        reason: "Revocado desde el panel del establecimiento.",
      });
      enqueueSnackbar("Acceso revocado.", { variant: "success" });
    } catch (error: unknown) {
      enqueueSnackbar(apiErrorMessage(error, "No se pudo revocar el acceso."), {
        variant: "error",
      });
    } finally {
      setBusyTokenId(null);
    }
  };

  const handleCopy = async () => {
    if (!issued?.token.access_url) return;

    await navigator.clipboard.writeText(issued.token.access_url);
    enqueueSnackbar("Enlace copiado al portapapeles.", { variant: "success" });
  };

  return (
    <Stack spacing={2.5}>
      {issued && (
        <PortalAccessIssuedBanner
          issued={issued}
          onCopy={handleCopy}
          onDismiss={() => setIssued(null)}
        />
      )}

      <PortalAccessIssueForm
        values={form}
        veterinarians={veterinarians}
        isSubmitting={issueToken.isPending}
        onChange={handleChange}
        onSubmit={handleIssue}
      />

      <PortalAccessTokensTable
        tokens={tokens}
        isLoading={isLoading}
        busyTokenId={busyTokenId}
        onReissue={handleReissue}
        onRevoke={handleRevoke}
      />
    </Stack>
  );
};
