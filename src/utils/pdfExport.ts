import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captura un contenedor DOM con formato de hoja A4 y genera un archivo PDF descargable
 * con soporte automático de paginación múltiple en alta definición.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Asegurar que las imágenes dentro del nodo estén listas
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth || 840,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

  const imgProps = pdf.getImageProperties(imgData);
  const renderedHeight = (imgProps.height * pdfWidth) / imgProps.width;

  let heightLeft = renderedHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, renderedHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  while (heightLeft > 4) {
    position = heightLeft - renderedHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, renderedHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
