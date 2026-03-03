export const UserType = {
    ADMIN: 'admin',
    PARCEIRO: 'parceiro',
    CLIENTE: 'cliente'
  } as const;
  
  export type UserType = typeof UserType[keyof typeof UserType];
  
  export const ChamberType = {
    RESFRIADO: 'resfriado',
    CONGELADO: 'congelado',
  } as const;
  
  export type ChamberType = typeof ChamberType[keyof typeof ChamberType];
  
  export const CHAMBER_TYPE_LABELS = {
    [ChamberType.RESFRIADO]: 'Resfriado',
    [ChamberType.CONGELADO]: 'Congelado',
};