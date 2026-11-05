import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TableBlock, TableCell } from '@/core/assistant/domain/AssistantTypes';
import { formatCell } from '../components/blocks/formatCell';

/**
 * Sanitizes a title string into a clean, lowercase file slug.
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}

/**
 * Returns today's ISO date string (YYYY-MM-DD).
 */
function getTodayIso(): string {
	return new Date().toISOString().split('T')[0];
}

/**
 * Converts a raw table cell into a clean CSV string, escaping quotes and handling newlines.
 */
function escapeCsvValue(val: TableCell): string {
	if (val === null || val === undefined) {
		return '""';
	}
	const str = String(val);
	return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Exports a TableBlock dataset to CSV with a UTF-8 Byte Order Mark (BOM)
 * to ensure Microsoft Excel and other spreadsheet editors parse accents and special characters correctly.
 */
export function exportDatasetToCsv(block: TableBlock, customFilename?: string): void {
	if (!block.columns.length || !block.rows.length) {
		return;
	}

	const headerRow = block.columns.map((c) => escapeCsvValue(c.label)).join(',');
	const dataRows = block.rows.map((row) =>
		block.columns.map((col) => escapeCsvValue(row[col.key])).join(',')
	);

	// Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
	const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	const baseName = slugify(block.title || 'dataset_asistente');
	link.href = url;
	link.download = customFilename || `${baseName}_${getTodayIso()}.csv`;
	link.click();

	URL.revokeObjectURL(url);
}

/**
 * Exports a TableBlock dataset into a styled PDF document using jsPDF and autoTable.
 */
export function exportDatasetToPdf(block: TableBlock, customFilename?: string): void {
	if (!block.columns.length || !block.rows.length) {
		return;
	}

	const isWide = block.columns.length > 5;
	const doc = new jsPDF({
		orientation: isWide ? 'landscape' : 'portrait',
		unit: 'mm',
		format: 'a4'
	});

	const title = block.title || 'Reporte de Datos - Asistente XIMON';
	const dateStr = new Date().toLocaleDateString('es-AR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Header banner
	doc.setFillColor(30, 41, 59); // Slate 800
	const pageWidth = doc.internal.pageSize.getWidth();
	doc.rect(0, 0, pageWidth, 20, 'F');

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(11);
	doc.setTextColor(255, 255, 255);
	doc.text('GANADERO | Sistema de Gestión Ganadera', 14, 12);

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(8);
	doc.setTextColor(203, 213, 225); // Slate 300
	doc.text(`Generado por XIMON AI · ${dateStr}`, pageWidth - 14, 12, { align: 'right' });

	// Document Title
	doc.setTextColor(15, 23, 42); // Slate 900
	doc.setFont('helvetica', 'bold');
	doc.setFontSize(14);
	doc.text(title, 14, 30);

	// Subtitle / row summary
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9);
	doc.setTextColor(100, 116, 139); // Slate 500
	doc.text(`Total registros: ${block.total_rows} ${block.total_rows === 1 ? 'fila' : 'filas'}`, 14, 36);

	const headers = [block.columns.map((c) => c.label)];
	const body = block.rows.map((row) =>
		block.columns.map((col) => formatCell(row[col.key]))
	);

	autoTable(doc, {
		startY: 40,
		head: headers,
		body: body,
		theme: 'striped',
		headStyles: {
			fillColor: [51, 65, 85], // Slate 700
			textColor: [255, 255, 255],
			fontStyle: 'bold',
			fontSize: 8,
			cellPadding: 2.5
		},
		bodyStyles: {
			textColor: [30, 41, 59],
			fontSize: 8,
			cellPadding: 2
		},
		alternateRowStyles: {
			fillColor: [248, 250, 252] // Slate 50
		},
		margin: { left: 14, right: 14, bottom: 18 },
		didDrawPage: (data) => {
			// Footer on each page
			const pageNumber = (doc as any).internal.getNumberOfPages();
			const currentPage = data.pageNumber;
			const pageHeight = doc.internal.pageSize.getHeight();

			doc.setFont('helvetica', 'normal');
			doc.setFontSize(7.5);
			doc.setTextColor(148, 163, 184); // Slate 400
			doc.text(
				`Página ${currentPage} de ${pageNumber}`,
				pageWidth / 2,
				pageHeight - 8,
				{ align: 'center' }
			);
			doc.text('Documento operativo confidencial', 14, pageHeight - 8);
		}
	});

	const baseName = slugify(block.title || 'reporte_asistente');
	doc.save(customFilename || `${baseName}_${getTodayIso()}.pdf`);
}

