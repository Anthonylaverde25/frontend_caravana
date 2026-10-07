import type { IssueGuide, ScanIssue } from '../types';
import { CACT01_GUIDES } from './cact01';
import { COMMON_GUIDES } from './common';
import { DEST01_GUIDES } from './dest01';
import { ING03_GUIDES } from './ing03';
import { LSER01_GUIDES } from './lser01';
import { PAR01_GUIDES } from './par01';

const BY_TEMPLATE: Record<string, Record<string, IssueGuide>> = {
  'PAR-01': PAR01_GUIDES,
  'CACT-01': CACT01_GUIDES,
  'DEST-01': DEST01_GUIDES,
  'LSER-01': LSER01_GUIDES,
  'ING-02': ING03_GUIDES,
  'ING-03': ING03_GUIDES
};

/**
 * What a problem means and what to do about it: the template's own entry, then the shared one. A
 * code neither knows still shows, under "Otros", with the server's message as its explanation —
 * a code added on the backend is never hidden.
 */
export function guideFor(templateCode: string, issue: Pick<ScanIssue, 'code' | 'message'>): IssueGuide {
  const code = issue.code ?? 'LOCAL_CHECK';
  const known = BY_TEMPLATE[templateCode]?.[code] ?? COMMON_GUIDES[code];

  if (known) return known;

  return { category: 'other', title: code, solution: 'Leé el detalle de cada fila: el mensaje dice qué corregir.' };
}
