import { formatCuit } from '@/core/shared/domain/cuit';
import { ProviderRecognition, RecognitionReason } from '@/core/fiscal/domain/entities/ProviderRecognition';

/** The texts of the "Leído de la imagen" panel, in one place (Delivery F, part 05). */
const REASONS: Record<RecognitionReason, (r: ProviderRecognition) => string> = {
	NO_CUIT: () => 'No se encontró el CUIT del emisor en la imagen.',
	ISSUER_BLOCK_UNCERTAIN: () => 'No se pudo distinguir cuál de los CUIT es el del emisor.',
	INVALID_CHECK_DIGIT: (r) =>
		`El CUIT leído del emisor (${formatCuit(r.issuer.cuit)}) no cierra el dígito verificador.`,
	SAME_AS_RECEIVER: () => 'El emisor y el receptor tienen el mismo CUIT.',
	ISSUED_BY_OWN_COMPANY: () =>
		'El QR dice que este comprobante lo emitió tu empresa: parece una venta, no una compra.',
	ISSUER_IS_OWN_COMPANY: () => 'El CUIT leído como emisor es el de tu empresa.'
};

export const headline = (r: ProviderRecognition): string => {
	const name = r.provider?.name ?? r.issuer.legalName ?? r.issuer.name ?? 'El emisor';

	switch (r.status) {
		case 'MATCHED':
			return `Proveedor reconocido: ${name}`;
		case 'NEW':
			return `${name} no está en tu cartera de proveedores.`;
		case 'ROLE_MISSING':
			return `${name} está en tu cartera sólo como proveedor de hacienda.`;
		default:
			return r.reason ? REASONS[r.reason](r) : 'No se pudo reconocer al proveedor.';
	}
};

export const sourceLabel = (r: ProviderRecognition): string | null =>
	r.issuer.source === 'qr' ? 'CUIT del QR de ARCA' : r.issuer.source === 'vision' ? 'CUIT leído por IA' : null;

/** Non-blocking notes: shown in amber (warn) or grey (hint). Nothing is said about an absent receiver. */
export const notes = (r: ProviderRecognition): { tone: 'warn' | 'hint'; text: string }[] => {
	const list: { tone: 'warn' | 'hint'; text: string }[] = [];

	if (r.issuer.discrepancyCuit) {
		list.push({
			tone: 'warn',
			text: `La IA leyó ${formatCuit(r.issuer.discrepancyCuit)}; se usa el del QR (${formatCuit(r.issuer.cuit)}).`
		});
	}

	if (r.receiverMismatch && r.receiver) {
		list.push({
			tone: 'warn',
			text: `Está a nombre de ${formatCuit(r.receiver.cuit)}, no de tu empresa (${formatCuit(r.companyCuit)}).`
		});
	}

	if (r.companyCuitMissing) {
		list.push({
			tone: 'hint',
			text: 'Cargá el CUIT de tu empresa en Configuración para controlar el receptor.'
		});
	}

	const lines = linesSummary(r);

	if (lines) list.push(lines);

	return list;
};

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export interface LinesBreakdown {
	total: number;
	exact: number;
	ai: number;
	none: number;
	unavailable: boolean;
}

/** Structured count of read lines for minimalist pill indicators. */
export const getLinesBreakdown = (r: ProviderRecognition): LinesBreakdown | null => {
	if (r.lines.length === 0) return null;

	const unavailable = r.lines.some((l) => l.resolution.note === 'MATCHER_UNAVAILABLE');
	const exact = r.lines.filter((l) => l.resolution.source === 'EXACT').length;
	const ai = r.lines.filter((l) => l.resolution.source === 'AI').length;
	const none = r.lines.filter((l) => l.resolution.source === 'NONE').length;

	return {
		total: r.lines.length,
		exact,
		ai,
		none,
		unavailable
	};
};

/** What was done with the lines read (Delivery G): how many were found, and how sure. */
const linesSummary = (r: ProviderRecognition): { tone: 'warn' | 'hint'; text: string } | null => {
	const bd = getLinesBreakdown(r);

	if (!bd) return null;

	if (bd.unavailable) {
		return {
			tone: 'warn',
			text: `Se leyeron ${count(bd.total, 'renglón', 'renglones')}, pero no se pudieron comparar con tu catálogo: elegí los ítems a mano.`
		};
	}

	const parts = [
		bd.exact && count(bd.exact, 'exacto', 'exactos'),
		bd.ai && count(bd.ai, 'sugerido', 'sugeridos'),
		bd.none && count(bd.none, 'sin resolver', 'sin resolver')
	].filter(Boolean);

	return {
		tone: 'hint',
		text: `Se leyeron ${count(bd.total, 'renglón', 'renglones')}: ${parts.join(', ')}. Revisá los ítems, las unidades y los precios.`
	};
};

