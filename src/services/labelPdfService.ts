
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from 'pdf-lib';

export type LabelType = 'PACIENTE' | 'ACOMPANHANTE' | 'VISITANTE';

export interface LabelData {
    type: LabelType;
    patientName: string;
    personName?: string; // For companion/visitor
    dob?: string;
    age?: string;
    admissionDate: string;
    sector?: string; // Optional
}

export const generateLabelPDF = async (data: LabelData): Promise<Uint8Array> => {
    const width = 283.5; // 100mm
    const height = 141.7; // 50mm
    const margin = 10;
    const contentWidth = width - (margin * 2);
    const centerX = width / 2;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([width, height]);

    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // --- 1. HEADER (Logo + Hospital Name) ---
    const baseUrl = import.meta.env.BASE_URL;
    const logoUrl = `${baseUrl}logo.png`;

    let logoImage = null;
    let logoDims = { width: 0, height: 0 };

    try {
        // Load Image
        const imageBlob = await fetch(logoUrl).then(res => res.blob());
        const bitmap = await createImageBitmap(imageBlob);

        // Convert to Grayscale via Canvas
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;     // R
                data[i + 1] = avg; // G
                data[i + 2] = avg; // B
            }
            ctx.putImageData(imageData, 0, 0);

            // Convert back to buffer for pdf-lib
            const pngDataUrl = canvas.toDataURL('image/png');
            const pngBytes = await fetch(pngDataUrl).then(res => res.arrayBuffer());
            logoImage = await pdfDoc.embedPng(pngBytes);
            logoDims = logoImage.scaleToFit(50, 25); // Max height 25
        }
    } catch (e) {
        console.error("Logo processing failed", e);
    }

    // Measure Hospital Name
    const hospName = 'HOSPITAL MUNICIPAL DE MOZARLÂNDIA';
    const hospSize = 9;
    const hospWidth = fontBold.widthOfTextAtSize(hospName, hospSize);

    // Calculate Centering Group
    const gap = 10;
    const totalHeaderWidth = logoDims.width + gap + hospWidth;
    const startX = (width - totalHeaderWidth) / 2;

    // Vertical Alignment center point for the header area
    const headerCenterY = height - 20;

    // Draw Logo
    if (logoImage) {
        // Center logo at headerCenterY
        const logoY = headerCenterY - (logoDims.height / 2);
        page.drawImage(logoImage, {
            x: startX,
            y: logoY,
            width: logoDims.width,
            height: logoDims.height,
        });
    }

    // Draw Hospital Name
    // Center text at headerCenterY. 
    // Cap height is roughly 0.7 * size. To center: y = centerY - (capHeight/2)
    const textY = headerCenterY - (hospSize * 0.35);
    page.drawText(hospName, {
        x: startX + logoDims.width + gap,
        y: textY,
        size: hospSize,
        font: fontBold,
        color: rgb(0, 0, 0),
    });

    // Divider Line
    // Divider Line
    // Place line below the header area. 
    // headerCenterY is the middle of the logo/text.
    // The logo is roughly 25-30 units high. The text is approx 9 units.
    const lineY = headerCenterY - (logoDims.height / 2) - 8;
    page.drawLine({
        start: { x: margin, y: lineY },
        end: { x: width - margin, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
    });


    // --- 2. MAIN CONTENT ---
    const contentTopY = lineY - 15;

    if (data.type === 'PACIENTE') {
        // Label Type
        drawCenteredText(page, 'PACIENTE', contentTopY, 14, fontBold, centerX);

        // Name Box
        // We can draw a subtle background or just large text
        const nameY = contentTopY - 25;
        // Auto-scale name to max width
        drawTextFitCentered(page, data.patientName.toUpperCase(), nameY, contentWidth, 16, fontBold, centerX);

        // Info Row (DOB - Age)
        const infoY = nameY - 20;
        const infoText = `NASC: ${data.dob || '-'}    IDADE: ${data.age || '-'}`;
        drawCenteredText(page, infoText, infoY, 10, font, centerX);

        // Footer Row (Admission)
        drawFullWidthFooter(page, `INTERNAÇÃO: ${data.admissionDate}`, 10, width, height, font);

    } else if (data.type === 'ACOMPANHANTE') {
        drawCenteredText(page, 'ACOMPANHANTE', contentTopY, 14, fontBold, centerX);

        // Name
        const nameY = contentTopY - 20;
        drawTextFitCentered(page, (data.personName || '').toUpperCase(), nameY, contentWidth, 14, fontBold, centerX);

        // Relation
        const relY = nameY - 15;
        drawTextFitCentered(page, `PACIENTE: ${(data.patientName || '').toUpperCase()}`, relY, contentWidth, 9, font, centerX);

        // Footer
        drawFullWidthFooter(page, `DATA: ${data.admissionDate}`, 10, width, height, font);

    } else if (data.type === 'VISITANTE') {
        drawCenteredText(page, 'VISITANTE', contentTopY, 14, fontBold, centerX);

        // Name
        const nameY = contentTopY - 20;
        drawTextFitCentered(page, (data.personName || '').toUpperCase(), nameY, contentWidth, 14, fontBold, centerX);

        // Relation
        const relY = nameY - 15;
        drawTextFitCentered(page, `VISITANDO: ${(data.patientName || '').toUpperCase()}`, relY, contentWidth, 9, font, centerX);

        // Footer
        drawFullWidthFooter(page, `DATA: ${data.admissionDate}`, 10, width, height, font);
    }

    return await pdfDoc.save();
};

const drawCenteredText = (page: PDFPage, text: string, y: number, size: number, font: PDFFont, centerX: number) => {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: centerX - (width / 2), y, size, font, color: rgb(0, 0, 0) });
};

const drawTextFitCentered = (page: PDFPage, text: string, y: number, maxWidth: number, initialSize: number, font: PDFFont, centerX: number) => {
    let size = initialSize;
    let textWidth = font.widthOfTextAtSize(text, size);
    while (textWidth > maxWidth && size > 6) {
        size -= 0.5;
        textWidth = font.widthOfTextAtSize(text, size);
    }
    page.drawText(text, { x: centerX - (textWidth / 2), y, size, font, color: rgb(0, 0, 0) });
};

const drawFullWidthFooter = (page: PDFPage, text: string, margin: number, pageWidth: number, pageHeight: number, font: PDFFont) => {
    // Draw a black bar at bottom? Or just bottom text with line.
    // Let's do a top line for footer.
    const footerY = 15;
    const lineY = footerY + 12;
    page.drawLine({
        start: { x: margin, y: lineY },
        end: { x: pageWidth - margin, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    // Center text in footer
    const size = 8;
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
        x: (pageWidth - textWidth) / 2,
        y: footerY,
        size,
        font,
        color: rgb(0, 0, 0),
    });
};
