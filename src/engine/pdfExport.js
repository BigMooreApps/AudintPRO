import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportAuditReportPDF(auditResult, numeralesList, evidenciasList) {
  const doc = new jsPDF();
  const resumen = auditResult.resumenGlobal;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('INFORME DE AUDITORÍA DOCUMENTAL ISO', 14, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')} | Motor de Auditoría IA`, 14, 25);

  // Summary Metrics Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen Ejecutivo de Auditoría', 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Veredicto Global: ${resumen.veredictoGlobal}`, 14, 48);
  doc.text(`Total Subnumerales Auditados: ${resumen.totalSubnumerales}`, 14, 54);

  // Status breakdown table
  autoTable(doc, {
    startY: 60,
    head: [['Estado ISO', 'Cantidad de Subnumerales', 'Porcentaje']],
    body: [
      ['🟢 Conforme', resumen.conforme, `${Math.round((resumen.conforme / resumen.totalSubnumerales) * 100)}%`],
      ['🟡 Parcialmente Conforme', resumen.parcialmenteConforme, `${Math.round((resumen.parcialmenteConforme / resumen.totalSubnumerales) * 100)}%`],
      ['🔴 No Conforme', resumen.noConforme, `${Math.round((resumen.noConforme / resumen.totalSubnumerales) * 100)}%`],
      ['⚪ Sin Evidencia', resumen.sinEvidencia, `${Math.round((resumen.sinEvidencia / resumen.totalSubnumerales) * 100)}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] }
  });

  // Conclusion general text
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusión General:', 14, finalY);
  
  doc.setFont('helvetica', 'normal');
  const splitText = doc.splitTextToSize(resumen.conclusionGeneral, 180);
  doc.text(splitText, 14, finalY + 6);

  // Detailed Audit Table
  finalY = finalY + 10 + (splitText.length * 5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Hallazgos por Subnumeral y Trazabilidad', 14, finalY);

  const tableBody = auditResult.subnumeralesResultados.map(item => [
    item.subnumeral,
    item.requisito.substring(0, 60) + '...',
    formatStatusLabel(item.resultado),
    item.numEvidencias,
    item.hallazgo
  ]);

  autoTable(doc, {
    startY: finalY + 6,
    head: [['Código', 'Requisito', 'Resultado', 'Evidencias', 'Hallazgo / Brecha']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 60 }
    }
  });

  // Save PDF
  doc.save(`Informe_Auditoria_ISO_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function formatStatusLabel(status) {
  switch (status) {
    case 'CONFORME': return '🟢 Conforme';
    case 'PARCIALMENTE_CONFORME': return '🟡 Parcial';
    case 'NO_CONFORME': return '🔴 No Conforme';
    case 'SIN_EVIDENCIA': return '⚪ Sin Evidencia';
    default: return status;
  }
}
