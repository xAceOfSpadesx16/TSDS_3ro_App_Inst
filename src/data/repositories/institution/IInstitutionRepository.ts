export interface QRValidationResult {
  valid: boolean;
  institutionId?: string;
  error?: string;
}

export interface IInstitutionRepository {
  validateEntryQR(rawQRContent: string): Promise<QRValidationResult>;
}
