import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import type { ITicketData } from '../../../../shared/types/index.js';

const PDF_TEMPLATE_FILENAME =
  'Modern Typography Simple Art Exhibition Concert Ticket.pdf';

@Injectable()
export class TicketsService {
  private templatePath: string;

  constructor() {
    this.templatePath =
      process.env.TICKET_TEMPLATE_PATH ||
      path.join(process.cwd(), 'assets', PDF_TEMPLATE_FILENAME);
  }

  async generatePdfBuffer(data: ITicketData): Promise<Buffer> {
    if (!fs.existsSync(this.templatePath)) {
      throw new NotFoundException(
        `Ticket template not found at ${this.templatePath}. Place "${PDF_TEMPLATE_FILENAME}" in api/assets/ or set TICKET_TEMPLATE_PATH.`,
      );
    }

    const templateBytes = fs.readFileSync(this.templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const page = pages[0];
    const width = page.getWidth();
    const height = page.getHeight();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const textColor = rgb(0.2, 0.2, 0.2);

    const leftMargin = 50;
    const lineHeight = 18;
    const titleColor = rgb(1, 1, 1); // blanc
    let y = height - 30;

    const title = (data.eventTitle || 'Event').toUpperCase();
    page.drawText(title, {
      x: leftMargin,
      y,
      size: 27,
      font: fontBold,
      color: titleColor,
      maxWidth: width - leftMargin - 120,
    });
    y -= lineHeight * 1.5;

    const rawDesc = (data.eventDescription || '').trim();
    const desc = rawDesc.length > 180 ? rawDesc.slice(0, 177) + '...' : rawDesc;
    if (desc) {
      page.drawText(desc, {
        x: leftMargin,
        y,
        size: 10,
        font,
        color: titleColor,
        maxWidth: width - leftMargin - 120,
      });
      y -= lineHeight;
    }

    page.drawText(data.eventLocation || '-', {
      x: leftMargin,
      y,
      size: 11,
      font: fontBold,
      color: titleColor,
    });
    y -= lineHeight + 12;

    page.drawText(`Participant: ${data.participantName}`, {
      x: leftMargin,
      y,
      size: 13,
      font: fontBold,
      color: titleColor,
    });
    y -= lineHeight + 14;

    // Price ta7t chwya, text 7ayad (bold)
    const priceStr =
      data.eventPrice != null
        ? `${Number(data.eventPrice).toFixed(2)} DH`
        : '-';
    page.drawText(priceStr, {
      x: leftMargin,
      y,
      size: 12,
      font: fontBold,
      color: titleColor,
    });

    const dateStr = data.eventDate
      ? data.eventDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '-';
    const timeStr = data.eventTime || '-';
    const rightX = width - 255;
    const lineH = 14;
    page.drawText(dateStr, {
      x: rightX,
      y: height - 48,
      size: 14,
      font: fontBold,
      color: titleColor,
    });
    page.drawText(timeStr, {
      x: rightX,
      y: height - 54 - lineH,
      size: 20,
      font: fontBold,
      color: titleColor,
    });

    const ticketNumX = width - 12;
    const ticketNumY = height - 40;
    page.drawText(data.ticketNumber, {
      x: ticketNumX,
      y: ticketNumY,
      size: 8,
      font,
      color: titleColor,
      rotate: degrees(90),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
