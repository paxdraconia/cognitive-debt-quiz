import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { getDimensionSummary } from '../utils/scoring';
import questionsData from '../data/questions.json';
import { ZONE_LABELS, DIMENSION_LABELS, groupAndSortResources } from '../utils/constants';
import styles from './ShareCard.module.css';

export default function ShareCard({ profile, scores, resources }) {
  const handleDownload = useCallback(() => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const teal = [0, 196, 204];
    const navy = [26, 42, 69];
    const charcoal = [51, 51, 51];
    const marigold = [255, 199, 89];
    const coral = [255, 107, 107];

    // --- Header ---
    doc.setTextColor(...teal);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('NERD OUT', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setTextColor(...navy);
    doc.setFontSize(24);
    doc.text('Cognitive Debt Profile', pageWidth / 2, y, { align: 'center' });
    y += 12;

    // Profile title
    doc.setFontSize(18);
    doc.text(profile.title, pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Divider
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Profile summary
    doc.setTextColor(...charcoal);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = doc.splitTextToSize(profile.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // --- Dimension Breakdown ---
    doc.setTextColor(...navy);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Dimension Breakdown', margin, y);
    y += 8;

    for (const dim of questionsData.dimensions) {
      const score = scores[dim.id];
      if (!score) continue;

      // Check page overflow
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      // Dimension name + zone badge
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text(dim.label, margin, y);

      // Zone badge
      const zoneLabel = ZONE_LABELS[score.zone];
      const badgeX = margin + doc.getTextWidth(dim.label) + 4;
      const badgeColor = score.zone === 'compounding' ? coral
        : score.zone === 'accumulating' ? marigold : teal;
      doc.setFontSize(8);
      const badgeWidth = doc.getTextWidth(zoneLabel) + 6;
      doc.setFillColor(...badgeColor);
      doc.roundedRect(badgeX, y - 3.5, badgeWidth, 5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(zoneLabel, badgeX + 3, y);

      // Score value
      doc.setTextColor(...charcoal);
      doc.setFontSize(11);
      doc.text(String(score.normalized), pageWidth - margin, y, { align: 'right' });
      y += 6;

      // Dimension summary
      const dimSummary = getDimensionSummary(dim.id, score.zone);
      if (dimSummary) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const dimLines = doc.splitTextToSize(dimSummary, contentWidth - 4);
        doc.text(dimLines, margin + 2, y);
        y += dimLines.length * 4 + 4;
      }

      y += 2;
    }

    // --- Reading List ---
    if (resources && resources.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Divider
      doc.setDrawColor(...teal);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;

      doc.setTextColor(...navy);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Reading List', margin, y);
      y += 8;

      const sortedDimensions = groupAndSortResources(resources, scores);

      for (const [dimId, items] of sortedDimensions) {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...teal);
        doc.text(DIMENSION_LABELS[dimId] || dimId, margin, y);
        y += 6;

        for (const r of items) {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }

          // Type badge
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          const typeLabel = r.type === 'episode' ? 'EPISODE' : 'BOOK';
          const typeBadgeColor = r.type === 'episode' ? teal : marigold;
          const typeBadgeWidth = doc.getTextWidth(typeLabel) + 6;
          doc.setFillColor(...typeBadgeColor);
          doc.roundedRect(margin + 2, y - 3, typeBadgeWidth, 4.5, 1, 1, 'F');
          doc.setTextColor(255, 255, 255);
          doc.text(typeLabel, margin + 5, y);

          // Title
          doc.setTextColor(...navy);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(r.title, margin + 2 + typeBadgeWidth + 3, y);
          y += 5;

          // Description
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(r.description, margin + 4, y);
          y += 6;
        }

        y += 2;
      }
    }

    // --- Footer with Substack link ---
    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    y += 4;
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setTextColor(...navy);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Subscribe for more from Nerd Out', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setTextColor(...teal);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.textWithLink('alyn.substack.com', pageWidth / 2 - doc.getTextWidth('alyn.substack.com') / 2, y, {
      url: 'https://alyn.substack.com',
    });

    // Underline the link
    const linkWidth = doc.getTextWidth('alyn.substack.com');
    const linkX = pageWidth / 2 - linkWidth / 2;
    doc.setDrawColor(...teal);
    doc.setLineWidth(0.3);
    doc.line(linkX, y + 0.5, linkX + linkWidth, y + 0.5);

    doc.save('cognitive-debt-profile.pdf');
  }, [profile, scores, resources]);

  return (
    <button className={styles.downloadButton} onClick={handleDownload}>
      Download My Results
    </button>
  );
}
