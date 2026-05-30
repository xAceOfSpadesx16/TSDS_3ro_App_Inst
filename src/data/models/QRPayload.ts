export interface QRPayload {
  type: string;
  institutionId: string;
}

export const QR_TYPE_ENTRY = 'INSTITUTION_ENTRY';
export const QR_INSTITUTION_ID = 'inst_001';
