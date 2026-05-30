import { IInstitutionRepository, QRValidationResult } from './IInstitutionRepository';
import { QR_TYPE_ENTRY, QR_INSTITUTION_ID } from '../../models/QRPayload';

export class MockInstitutionRepository implements IInstitutionRepository {
  async validateEntryQR(rawQRContent: string): Promise<QRValidationResult> {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(rawQRContent) as Record<string, string>;
    } catch {
      return { valid: false, error: 'QR con formato inválido' };
    }

    if (parsed.type !== QR_TYPE_ENTRY) {
      return { valid: false, error: 'QR no corresponde a un ingreso' };
    }

    if (parsed.institutionId !== QR_INSTITUTION_ID) {
      return { valid: false, error: 'QR de otro establecimiento' };
    }

    return { valid: true, institutionId: parsed.institutionId };
  }
}
