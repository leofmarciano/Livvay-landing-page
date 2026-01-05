'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, ExternalLink, Trash2, Ticket } from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  visit_count: number;
  unique_visitors: number;
  claim_count: number;
  conversion_count: number;
  plus_count: number;
  max_count: number;
  upgrade_count: number;
  active_subscribers: number;
  cancel_count: number;
  last_visit: string | null;
  last_claim: string | null;
  last_conversion: string | null;
}

export default function AffiliatesSettingsCodesPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [prefix, setPrefix] = useState('');
  const [description, setDescription] = useState('');
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [codeToDelete, setCodeToDelete] = useState<ReferralCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCodes = useCallback(async () => {
    try {
      const response = await fetch('/api/affiliates/codes');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao carregar códigos');
      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar códigos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const validatePrefix = (value: string): boolean => {
    if (value.length < 3) {
      setPrefixError('Mínimo de 3 caracteres');
      return false;
    }
    if (value.length > 10) {
      setPrefixError('Máximo de 10 caracteres');
      return false;
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      setPrefixError('Apenas letras e números');
      return false;
    }
    setPrefixError(null);
    return true;
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setPrefix(value);
    if (value) validatePrefix(value);
    else setPrefixError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validatePrefix(prefix)) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/affiliates/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, description: description || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar código');

      setSuccess(`Código ${data.code.code} criado com sucesso`);
      setPrefix('');
      setDescription('');
      setShowCreateForm(false);
      fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar código');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!codeToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/affiliates/codes?id=${codeToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir código');
      }
      setSuccess(`Código ${codeToDelete.code} excluído`);
      setCodeToDelete(null);
      fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir código');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-surface-100 border border-border">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Códigos de indicação</h2>
              <p className="text-sm text-foreground-light mt-1">
                Crie códigos únicos para compartilhar com seus indicados
              </p>
            </div>
            {!showCreateForm && codes.length > 0 && (
              <Button type="primary" size="small" icon={<Plus />} onClick={() => setShowCreateForm(true)}>
                Criar código
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 rounded-md bg-brand/10 border border-brand/20 text-brand text-sm">
              {success}
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreate} className="mt-6 p-4 rounded-lg bg-surface-200 border border-border">
              <h3 className="font-medium text-foreground mb-4">Novo código</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="prefix" className="block text-sm font-medium text-foreground-light mb-1.5">
                    Prefixo do código
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="prefix"
                      type="text"
                      value={prefix}
                      onChange={handlePrefixChange}
                      placeholder="Ex: LEONA"
                      maxLength={10}
                      className="uppercase max-w-[200px]"
                    />
                    <span className="text-foreground-muted">-</span>
                    <span className="text-foreground-muted font-mono">XXXXX</span>
                  </div>
                  {prefixError && <p className="text-destructive text-xs mt-1">{prefixError}</p>}
                  <p className="text-foreground-muted text-xs mt-1">3 a 10 caracteres (letras e números)</p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground-light mb-1.5">
                    Descrição (opcional)
                  </label>
                  <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Instagram, TikTok, etc."
                    maxLength={200}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="primary" htmlType="submit" loading={isCreating} disabled={!prefix || !!prefixError}>
                    Criar código
                  </Button>
                  <Button
                    type="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setPrefix('');
                      setDescription('');
                      setPrefixError(null);
                    }}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Codes list */}
      {isLoading ? (
        <div className="rounded-xl bg-surface-100 border border-border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-surface-200 rounded" />
            <div className="h-12 bg-surface-200 rounded" />
            <div className="h-12 bg-surface-200 rounded" />
          </div>
        </div>
      ) : codes.length === 0 ? (
        <div className="rounded-xl bg-surface-100 border border-border p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-200 mb-4">
            <Ticket className="w-6 h-6 text-foreground-muted" />
          </div>
          <h3 className="text-foreground font-medium mb-1">Crie seu primeiro código</h3>
          <p className="text-foreground-light text-sm mb-4 max-w-sm mx-auto">
            Códigos de indicação permitem rastrear cadastros e assinaturas geradas por você
          </p>
          <Button type="primary" icon={<Plus />} onClick={() => setShowCreateForm(true)}>
            Criar código
          </Button>
        </div>
      ) : (
        <div className="rounded-xl bg-surface-100 border border-border divide-y divide-border">
          {codes.map((code) => (
            <div key={code.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <code className="text-foreground font-mono font-medium text-base">{code.code}</code>
                <div className="flex items-center gap-3 mt-1 text-sm text-foreground-light">
                  {code.description && <span className="truncate max-w-[200px]">{code.description}</span>}
                  <span>Visitas: {code.visit_count}</span>
                  <span>Cadastros: {code.claim_count}</span>
                  <span>Plus: {code.plus_count}</span>
                  <span>Max: {code.max_count}</span>
                  <span>{formatDate(code.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button type="outline" size="small" icon={<ExternalLink />}>
                  Copiar link
                </Button>
                <Button type="ghost" size="small" icon={<Trash2 />} className="text-foreground-muted hover:text-destructive" onClick={() => setCodeToDelete(code)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!codeToDelete} onOpenChange={(open) => !open && setCodeToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir código</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o código <strong>{codeToDelete?.code}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="outline" onClick={() => setCodeToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="destructive" onClick={handleDelete} loading={isDeleting}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
