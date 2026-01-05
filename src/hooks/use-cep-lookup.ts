'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { unformatCEP } from '@/lib/validators/brazilian';

/**
 * ViaCEP API response type
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Normalized address data from CEP lookup
 */
export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Hook state
 */
export interface UseCepLookupState {
  isLoading: boolean;
  error: string | null;
  address: AddressData | null;
}

/**
 * Hook return type
 */
export interface UseCepLookupReturn extends UseCepLookupState {
  lookupCEP: (cep: string) => Promise<AddressData | null>;
  clearAddress: () => void;
}

/**
 * Custom hook for Brazilian CEP (postal code) lookup using ViaCEP API
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 500)
 * @returns Hook state and functions
 *
 * @example
 * ```tsx
 * const { isLoading, error, address, lookupCEP } = useCepLookup();
 *
 * const handleCEPChange = (cep: string) => {
 *   if (cep.replace(/\D/g, '').length === 8) {
 *     lookupCEP(cep);
 *   }
 * };
 * ```
 */
export function useCepLookup(debounceMs: number = 500): UseCepLookupReturn {
  const [state, setState] = useState<UseCepLookupState>({
    isLoading: false,
    error: null,
    address: null,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Looks up address data from a Brazilian CEP using ViaCEP API
   */
  const lookupCEP = useCallback(
    async (cep: string): Promise<AddressData | null> => {
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Abort any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const cleanCEP = unformatCEP(cep);

      // Validate CEP length
      if (cleanCEP.length !== 8) {
        setState((prev) => ({
          ...prev,
          error: 'CEP deve ter 8 dígitos',
          address: null,
        }));
        return null;
      }

      return new Promise((resolve) => {
        debounceTimeoutRef.current = setTimeout(async () => {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));

          // Create new abort controller for this request
          abortControllerRef.current = new AbortController();

          try {
            const response = await fetch(
              `https://viacep.com.br/ws/${cleanCEP}/json/`,
              { signal: abortControllerRef.current.signal }
            );

            if (!response.ok) {
              throw new Error('Erro ao buscar CEP');
            }

            const data: ViaCEPResponse = await response.json();

            if (data.erro) {
              setState({
                isLoading: false,
                error: 'CEP não encontrado',
                address: null,
              });
              resolve(null);
              return;
            }

            const address: AddressData = {
              street: data.logradouro || '',
              neighborhood: data.bairro || '',
              city: data.localidade || '',
              state: data.uf || '',
            };

            setState({
              isLoading: false,
              error: null,
              address,
            });

            resolve(address);
          } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'AbortError') {
              resolve(null);
              return;
            }

            setState({
              isLoading: false,
              error: 'Erro ao buscar CEP. Tente novamente.',
              address: null,
            });
            resolve(null);
          }
        }, debounceMs);
      });
    },
    [debounceMs]
  );

  /**
   * Clears the current address data
   */
  const clearAddress = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      address: null,
    });
  }, []);

  return {
    ...state,
    lookupCEP,
    clearAddress,
  };
}
