/**
 * Utilitários para gerenciar URLs de imagens no frontend
 * 
 * Benefícios:
 * - Consistência em toda aplicação
 * - Suporte para CDN
 * - Fallback para placeholder
 * - Type safety
 */

// Obtém a URL base do servidor Laravel (sem /api)
// As imagens estão em /storage que é servido pela raiz do Laravel, não pela API
const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // Remove /api do final se existir
  // Ex: http://localhost:8000/api -> http://localhost:8000
  let baseUrl = apiUrl.replace(/\/api\/?$/, '');
  
  // Garante que tenha porta se for localhost
  // Trata tanto http://localhost quanto http://localhost:8000
  if (baseUrl.includes('localhost')) {
    if (!baseUrl.match(/localhost:\d+/)) {
      // Se não tem porta, adiciona :8000
      baseUrl = baseUrl.replace('localhost', 'localhost:8000');
    }
  }
  
  return baseUrl;
};

const API_URL = getBaseUrl();

/**
 * Garante que uma URL de imagem seja absoluta
 * 
 * @param url URL da imagem (pode ser relativa ou absoluta)
 * @returns URL absoluta
 */
export const ensureAbsoluteImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Se já é URL absoluta, verifica e corrige se necessário
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // CORREÇÃO: Se for localhost sem porta, adiciona :8000
    if (url.includes('localhost') && !url.match(/localhost:\d+/)) {
      return url.replace('localhost', 'localhost:8000');
    }
    return url;
  }
  
  // Converte relativa para absoluta usando a base do servidor Laravel
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanUrl}`;
};

/**
 * Obtém URL de imagem com fallback para placeholder
 * 
 * @param url URL da imagem
 * @param placeholder URL do placeholder (padrão: '/placeholder.svg')
 * @returns URL da imagem ou placeholder
 */
export const getImageUrlWithFallback = (
  url: string | null | undefined,
  placeholder: string = '/placeholder.svg'
): string => {
  const absoluteUrl = ensureAbsoluteImageUrl(url);
  return absoluteUrl || placeholder;
};

/**
 * Obtém a primeira imagem disponível de um espaço
 * 
 * @param mainImage Imagem principal
 * @param photos Array de fotos
 * @returns URL da primeira imagem disponível ou null
 */
export const getSpaceImageUrl = (
  mainImage: string | null | undefined,
  photos: (string | null | undefined)[] | null | undefined
): string | null => {
  if (mainImage) {
    return ensureAbsoluteImageUrl(mainImage);
  }
  
  if (photos && photos.length > 0) {
    const firstPhoto = photos.find(p => p);
    return ensureAbsoluteImageUrl(firstPhoto || null);
  }
  
  return null;
};

/**
 * Gera URL otimizada para CDN (com parâmetros de query)
 * 
 * @param url URL base da imagem
 * @param width Largura desejada
 * @param height Altura desejada
 * @param quality Qualidade (0-100)
 * @returns URL com parâmetros de otimização
 */
export const getOptimizedImageUrl = (
  url: string | null | undefined,
  width?: number,
  height?: number,
  quality: number = 80
): string | null => {
  const baseUrl = ensureAbsoluteImageUrl(url);
  if (!baseUrl) return null;
  
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
};

/**
 * Verifica se uma URL é de CDN/externa
 * 
 * @param url URL para verificar
 * @returns true se for URL externa
 */
export const isExternalImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  const absoluteUrl = ensureAbsoluteImageUrl(url);
  if (!absoluteUrl) return false;
  
  try {
    const urlObj = new URL(absoluteUrl);
    const baseUrlObj = new URL(API_URL);
    return urlObj.origin !== baseUrlObj.origin;
  } catch {
    return false;
  }
};

/**
 * Preload de imagens para melhor performance
 * 
 * @param urls Array de URLs para preload
 * @returns Promise que resolve quando todas as imagens carregarem
 */
export const preloadImages = (urls: (string | null | undefined)[]): Promise<void[]> => {
  const validUrls = urls
    .map(url => ensureAbsoluteImageUrl(url))
    .filter((url): url is string => url !== null);
  
  return Promise.all(
    validUrls.map(
      url =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        })
    )
  );
};

