import { useState, useCallback } from 'react';

// Google Drive / Picker Constants
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface UseGoogleDriveReturn {
  openPicker: () => void;
  isDriveLoading: boolean;
  driveError: string | null;
}

export const useGoogleDrive = (onFileReady: (file: File) => void): UseGoogleDriveReturn => {
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Debug check
  console.log('Google Drive Config:', { 
    hasApiKey: !!API_KEY, 
    hasClientId: !!CLIENT_ID, 
    hasAppId: !!APP_ID 
  });

  // Helper to load binary data from Drive
  const downloadDriveFile = async (fileId: string, token: string, fileName: string, mimeType: string) => {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to download file from Drive');

      const blob = await response.blob();
      const file = new File([blob], fileName, { type: mimeType });
      onFileReady(file);
    } catch (err) {
      setDriveError(err instanceof Error ? err.message : 'Error downloading file');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const createPicker = useCallback((token: string) => {
    const pickerCallback = (data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
        const doc = data.docs[0];
        setIsDriveLoading(true);
        downloadDriveFile(doc.id, token, doc.name, doc.mimeType);
      }
    };

    const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
      .setMimeTypes('image/png,image/jpeg,image/tiff,application/pdf')
      .setMode(window.google.picker.DocsViewMode.LIST);

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(APP_ID)
      .setOAuthToken(token)
      .setDeveloperKey(API_KEY)
      .addView(view)
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
  }, [onFileReady]);

  const disconnect = useCallback(() => {
    if (accessToken && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        setAccessToken(null);
      });
    } else {
      setAccessToken(null);
    }
  }, [accessToken]);

  const openPicker = useCallback(() => {
    if (!window.gapi || !window.google) {
      console.error('Google scripts missing:', { gapi: !!window.gapi, google: !!window.google });
      setDriveError('Google scripts not loaded yet. Please refresh the page.');
      return;
    }

    const handleAuthResponse = (response: any) => {
      if (response.access_token) {
        setAccessToken(response.access_token);
        // Load picker library before showing
        window.gapi.load('picker', () => {
          createPicker(response.access_token);
        });
      } else {
        setDriveError('Authentication failed');
      }
    };

    // Use GIS (Google Identity Services) for auth
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: handleAuthResponse,
    });

    if (accessToken) {
      window.gapi.load('picker', () => {
        createPicker(accessToken);
      });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  }, [accessToken, createPicker]);

  return { openPicker, disconnect, isConnected: !!accessToken, isDriveLoading, driveError };
};
