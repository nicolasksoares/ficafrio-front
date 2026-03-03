export type UserType = 'admin' | 'cliente';

export type SpaceStatus = 'em_analise' | 'aprovado' | 'rejeitado';

export type ChamberType = 'resfriado' | 'congelado' | 'seco';

export interface User {
  id: number;
  trade_name: string;
  legal_name: string;
  cnpj: string;
  email: string;
  phone: string;
  type: UserType;
  active: boolean;
  city?: string;
  state?: string;
  created_at: string;
}

export interface Space {
  id: number;
  company_id: number;
  name: string;
  description?: string;
  
  // Endereço
  zip_code: string;
  address: string;     // Usado pelo backend novo
  street_address?: string; // Usado por componentes antigos (compatibilidade)
  number: string;
  district: string;
  city: string;
  state: string;

  // Campos Técnicos (Backend Laravel)
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  total_pallet_positions: number;
  available_pallet_positions: number;
  chamber_type: string;
  
  // Campos de Compatibilidade (Front antigo)
  temp_min?: number;
  temp_max?: number;
  capacity?: number;
  type?: string;
  
  // Booleanos
  has_anvisa: boolean;
  has_security: boolean;
  has_generator: boolean;
  has_dock: boolean;
  
  status: SpaceStatus;
  active: boolean;
  
  available_from: string;
  available_until: string;
  operating_hours?: string;

  // Mídia: Aceita string (caminho relativo) ou array de objetos (formato antigo)
  main_image?: string;
  photos?: string[] | { id: number; url: string }[]; 

  company?: {
    id: number;
    trade_name: string;
    email: string;
  };

  created_at: string;
  updated_at?: string;
}

export interface NotificationData {
  id: string;
  type: string;
  data: {
    message: string;
    status?: SpaceStatus;
    space_id?: number;
    space_name?: string;
  };
  read_at: string | null;
  created_at: string;
}