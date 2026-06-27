import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture a DOM element and download it as a PNG image
 */
export async function exportToPng(elementId: string, fileName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export failed: Element with id #${elementId} not found.`);
    return false;
  }

  try {
    // Hide temporary elements that shouldn't appear in the print/capture (e.g. edit badges)
    const indicators = element.querySelectorAll('.card-hover-edit-indicator, .card-editor-overlay');
    indicators.forEach(el => (el as HTMLElement).style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 3, // Multiplies resolution for crisp, high-res production prints
      useCORS: true,
      backgroundColor: null,
      logging: false
    });

    // Restore hidden elements
    indicators.forEach(el => (el as HTMLElement).style.display = '');

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('PNG capture error:', error);
    return false;
  }
}

/**
 * Capture a DOM element and download it as a PDF file
 */
export async function exportToPdf(elementId: string, fileName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export failed: Element with id #${elementId} not found.`);
    return false;
  }

  try {
    const indicators = element.querySelectorAll('.card-hover-edit-indicator, .card-editor-overlay');
    indicators.forEach(el => (el as HTMLElement).style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false
    });

    indicators.forEach(el => (el as HTMLElement).style.display = '');

    const imgWidth = 210; // A4 size width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Center card on A4 sheet
    const xOffset = (210 - imgWidth) / 2;
    const yOffset = (297 - imgHeight) / 2 > 0 ? (297 - imgHeight) / 2 : 10;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export error:', error);
    return false;
  }
}
