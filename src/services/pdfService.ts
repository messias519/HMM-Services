import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import mapping from '../data/mapping.json';

// Types for the data input
export interface AIHData {
    [key: string]: string | boolean | undefined;
}

export const generateAIHPDF = async (data: AIHData): Promise<Uint8Array> => {
    // 1. Load the template
    const baseUrl = import.meta.env.BASE_URL;
    const templatePath = `${baseUrl}template_aih.pdf`;
    const existingPdfBytes = await fetch(templatePath).then((res) => {
        if (!res.ok) throw new Error(`Failed to load template PDF from ${templatePath}`);
        return res.arrayBuffer();
    });

    // 2. Load the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize(); // Should be 842 for A4

    // 3. Embed font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;

    // 4. Draw data based on mapping
    mapping.forEach((field: any) => {
        const key = field.label;
        const value = data[key];

        if (!value && field.type !== 'checkbox') return;

        // Coordinate conversion: Mapping is Top-Left, PDF-Lib is Bottom-Left
        // Python Logic: draw_y = 842 - y - height + 2
        // We use the same logic roughly.
        const fieldHeight = field.height || 10;
        const x = field.x;
        const y = height - field.y - fieldHeight + 2;

        if (field.type === 'spaced') {
            // Handle spaced text (e.g. Dates, CNS)
            const strValue = String(value).replace(/[^a-zA-Z0-9]/g, '').substring(0, field.count || 20);
            const count = field.count || 1;

            // Heuristic for Date: count === 3 usually suggests Day / Month / Year
            // But checking if value is actually a date string like "DD/MM/YYYY"
            if (count === 3 && typeof value === 'string' && value.includes('/')) {
                const parts = value.split('/');
                if (parts.length === 3) {
                    const partWidth = field.width / 3;
                    parts.forEach((part, i) => {
                        // Center text in part
                        const textWidth = helveticaFont.widthOfTextAtSize(part, fontSize);
                        // x + (i * partWidth) + (partWidth/2) - (textWidth/2)
                        const partX = x + (i * partWidth) + (partWidth / 2) - (textWidth / 2);
                        firstPage.drawText(part, {
                            x: partX,
                            y,
                            size: fontSize,
                            font: helveticaFont,
                            color: rgb(0, 0, 0),
                        });
                    });
                }
            } else {
                // Standard character spacing
                const boxWidth = field.width / count;
                strValue.split('').forEach((char, i) => {
                    const textWidth = helveticaFont.widthOfTextAtSize(char, fontSize);
                    const charX = x + (i * boxWidth) + (boxWidth / 2) - (textWidth / 2);
                    firstPage.drawText(char, {
                        x: charX,
                        y,
                        size: fontSize,
                        font: helveticaFont,
                        color: rgb(0, 0, 0),
                    });
                });
            }

        } else if (field.type === 'checkbox') {
            if (value === true || value === 'true') {
                firstPage.drawText('X', {
                    x: x + 2,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            }
        } else {
            // Standard Text
            firstPage.drawText(String(value), {
                x: x + 2,
                y: y, // Adjust for baseline if needed
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
        }
    });

    // 5. Serialize
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
};

export const viewPDF = (pdfBytes: Uint8Array) => {
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
};
