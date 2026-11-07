import {
  Alert,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ApiError, api, downloadDocument } from '../services/api';
import type { DocumentRecord, LegalCase } from '../types/api';

export default function CaseDetailPage() {
  const { caseId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const detail = useQuery({
    queryKey: ['case', caseId],
    queryFn: () =>
      api<{ case: LegalCase; documents: DocumentRecord[] }>(`/api/cases/${caseId}`),
  });

  useEffect(() => {
    if (detail.data) {
      setTitle(detail.data.case.title);
      setDescription(detail.data.case.description ?? '');
    }
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () =>
      api(`/api/cases/${caseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, description: description || null }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/api/cases/${caseId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      const clientId = detail.data?.case.clientId;
      if (clientId) {
        await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      }
      navigate(clientId ? `/clients/${clientId}` : '/');
    },
  });
  const upload = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return api(`/api/cases/${caseId}/documents`, { method: 'POST', body });
    },
    onSuccess: async () => {
      setUploadError(null);
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
    onError: (error) => {
      setUploadError(error instanceof ApiError ? error.message : 'Could not upload the file.');
    },
  });
  const removeDocument = useMutation({
    mutationFn: (id: string) => api(`/api/documents/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['case', caseId] });
    },
  });

  function saveCase(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          {detail.data?.case.title ?? 'Case'}
        </Typography>
        {detail.isLoading ? <Typography>Loading case...</Typography> : null}
        {detail.error ? <Alert severity="error">Could not load this case.</Alert> : null}
        {detail.data ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack component="form" spacing={2} onSubmit={saveCase}>
              <Typography variant="h6">Case details</Typography>
              {save.error || remove.error ? (
                <Alert severity="error">
                  {(save.error ?? remove.error) instanceof ApiError
                    ? (save.error ?? remove.error)?.message
                    : 'Could not update the case.'}
                </Alert>
              ) : null}
              <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              <TextField
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={3}
              />
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={save.isPending}>
                  Save
                </Button>
                <Button
                  color="error"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm('Delete this case and its documents?')) {
                      remove.mutate();
                    }
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : null}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Documents</Typography>
            {uploadError ? <Alert severity="error">{uploadError}</Alert> : null}
            <Button variant="outlined" component="label" disabled={upload.isPending} sx={{ alignSelf: 'flex-start' }}>
              {upload.isPending ? 'Uploading...' : 'Upload PDF or DOCX'}
              <input
                hidden
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) {
                    upload.mutate(file);
                  }
                }}
              />
            </Button>
            <Stack spacing={1}>
              {detail.data?.documents.map((document) => (
                <Stack key={document.id} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ flexGrow: 1 }}>
                    {document.originalFilename} ({formatSize(document.sizeBytes)}) ·{' '}
                    {formatUploadedAt(document.uploadedAt)}
                  </Typography>
                  <Button onClick={() => void downloadDocument(document.id, document.originalFilename)}>
                    Download
                  </Button>
                  <Button
                    color="error"
                    onClick={() => {
                      if (window.confirm('Remove this document?')) {
                        removeDocument.mutate(document.id);
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
              {detail.data?.documents.length === 0 ? (
                <Typography color="text.secondary">No documents yet.</Typography>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

function formatUploadedAt(value: string): string {
  return new Date(value).toLocaleString();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
