// src/ui/components/export/PDFExporter.jsx
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';

const PDFExporter = ({ evaluations, loading = false }) => {
  const getScoreColor = (score) => {
    if (score >= 20) return '#52c41a';
    if (score >= 15) return '#faad14';
    if (score >= 10) return '#fa8c16';
    return '#f5222d';
  };

  const getScoreStatus = (score) => {
    if (score >= 20) return 'Excelente';
    if (score >= 15) return 'Bueno';
    if (score >= 10) return 'Regular';
    return 'Bajo';
  };

  const exportToPDF = async () => {
    if (!evaluations || evaluations.length === 0) {
      toast.warn('No hay datos para exportar');
      return;
    }

    toast.info('Generando reporte PDF...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 20;
      let yPosition = 18;

      // Encabezado
  pdf.setFontSize(22);
      pdf.setTextColor(24, 144, 255);
      pdf.text('EvaliQ', pageWidth / 2, yPosition, { align: 'center' });
      
  pdf.setFontSize(14);
  pdf.setTextColor(102, 102, 102);
  yPosition += 9;
  pdf.text('Reporte de Evaluaciones de Calidad de Software', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(153, 153, 153);
      yPosition += 8;
      pdf.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
  yPosition += 16;

  pdf.setDrawColor(220,220,220);
  pdf.line(marginX, yPosition, pageWidth - marginX, yPosition);
  yPosition += 8;

      // Estadísticas generales
  pdf.setFontSize(14);
  pdf.setTextColor(24, 144, 255);
  pdf.text('Resumen General', marginX, yPosition);
  yPosition += 12;

      const averageScore = evaluations.length > 0 
        ? evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length 
        : 0;

      const uniqueProjects = new Set(evaluations.map(e => e.projectName)).size;

      // Estadísticas
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Total Evaluaciones:', marginX + 10, yPosition);
      pdf.setTextColor(24, 144, 255);
      pdf.text(evaluations.length.toString(), marginX + 65, yPosition);

      pdf.setTextColor(102, 102, 102);
      pdf.text('Puntuación Promedio:', marginX + 10, yPosition + 7);
      pdf.setTextColor(getScoreColor(averageScore));
      pdf.text(averageScore.toFixed(1).toString(), marginX + 70, yPosition + 7);

      pdf.setTextColor(102, 102, 102);
      pdf.text('Proyectos Únicos:', marginX + 10, yPosition + 14);
      pdf.setTextColor(82, 196, 26);
      pdf.text(uniqueProjects.toString(), marginX + 65, yPosition + 14);

  yPosition += 22;

      // Charts: criterios promedio (Bar) y distribución de estados (Doughnut)
      const criteriaList = [
        { key: 'functionality', name: 'Funcionalidad' },
        { key: 'reliability', name: 'Confiabilidad' },
        { key: 'usability', name: 'Usabilidad' },
        { key: 'efficiency', name: 'Eficiencia' },
        { key: 'maintainability', name: 'Mantenibilidad' }
      ];

      const criteriaAverages = criteriaList.map(c => {
        const vals = evaluations.map(e => e.scores?.[c.key]).filter(v => v !== undefined && v !== null);
        const avg = vals.length ? (vals.reduce((a,b)=>a+b,0) / vals.length) : 0;
        return Number(avg.toFixed(2));
      });

      const statusCount = { Excelente: 0, Bueno: 0, Regular: 0, Bajo: 0 };
      evaluations.forEach(e => {
        const s = e.totalScore;
        if (s >= 20) statusCount.Excelente++; else if (s >= 15) statusCount.Bueno++; else if (s >= 10) statusCount.Regular++; else statusCount.Bajo++;
      });

      async function makeChartImage(type, data, options, widthPx = 800, heightPx = 400) {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx; canvas.height = heightPx; canvas.style.display = 'none';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, { type, data, options });
        await new Promise(r => setTimeout(r, 50));
        const img = canvas.toDataURL('image/png');
        chart.destroy();
        document.body.removeChild(canvas);
        return img;
      }

      // Bar chart
      const barImg = await makeChartImage('bar', {
        labels: criteriaList.map(c=>c.name),
        datasets: [{
          label: 'Promedio (0-5)',
          data: criteriaAverages,
          backgroundColor: '#1890ff'
        }]
      }, {
        responsive: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 5 } }
      }, 900, 420);

      const chartWidth = pageWidth - marginX*2; // ~170mm
      const chartHeight = 80; // mm
      if (yPosition + chartHeight + 10 > pageHeight - 20) { pdf.addPage(); yPosition = 20; }
      pdf.setFontSize(12); pdf.setTextColor(24,144,255);
      pdf.text('Promedios por Criterio', marginX, yPosition);
      yPosition += 6;
      pdf.addImage(barImg, 'PNG', marginX, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 10;

      // Doughnut chart
      const donutImg = await makeChartImage('doughnut', {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount),
          backgroundColor: ['#52c41a','#faad14','#fa8c16','#f5222d']
        }]
      }, { responsive: false, plugins: { legend: { position: 'bottom' } } }, 500, 380);

      const donutWidth = chartWidth * 0.7; const donutHeight = 70;
      if (yPosition + donutHeight + 10 > pageHeight - 20) { pdf.addPage(); yPosition = 20; }
      pdf.setFontSize(12); pdf.setTextColor(24,144,255);
      pdf.text('Distribución por Estado', marginX, yPosition);
      yPosition += 6;
      pdf.addImage(donutImg, 'PNG', marginX + (chartWidth - donutWidth)/2, yPosition, donutWidth, donutHeight);
      yPosition += donutHeight + 12;

      // Tabla de evaluaciones
      if (evaluations.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(24, 144, 255);
        pdf.text('Detalle de Evaluaciones', marginX, yPosition);
        yPosition += 4;

        const body = evaluations.map(e => [
          e.projectName || '-',
          e.evaluator || '-',
          new Date(e.date).toLocaleDateString(),
          String(e.totalScore ?? ''),
          getScoreStatus(e.totalScore)
        ]);

        autoTable(pdf, {
          head: [['Proyecto','Evaluador','Fecha','Puntuación','Estado']],
          body,
          startY: yPosition + 4,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', valign: 'middle' },
          headStyles: { fillColor: [64,169,255], textColor: 255, halign: 'left' },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: {
            0: { cellWidth: 58 }, // Proyecto
            1: { cellWidth: 42 }, // Evaluador
            2: { cellWidth: 24 }, // Fecha
            3: { cellWidth: 18, halign: 'right' }, // Puntuación
            4: { cellWidth: 26 } // Estado
          },
          margin: { left: marginX, right: marginX }
        });

        yPosition = pdf.lastAutoTable.finalY + 10;
      }

      // Resumen por criterios
      if (evaluations.length > 0) {
  pdf.setFontSize(14);
  pdf.setTextColor(24, 144, 255);
  pdf.text('Análisis por Criterios ISO 25010', 20, yPosition);
  yPosition += 8;

        const criteriaList = [
          { key: 'functionality', name: 'Funcionalidad' },
          { key: 'reliability', name: 'Confiabilidad' },
          { key: 'usability', name: 'Usabilidad' },
          { key: 'efficiency', name: 'Eficiencia' },
          { key: 'maintainability', name: 'Mantenibilidad' }
        ];

        criteriaList.forEach((criterion) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }

          const criterionScores = evaluations
            .map(evaluation => evaluation.scores?.[criterion.key])
            .filter(score => score !== undefined && score !== null);
          
          const avgScore = criterionScores.length > 0 
            ? criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length 
            : 0;

          pdf.setFontSize(9);
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${criterion.name}:`, 25, yPosition);
          pdf.setTextColor(getScoreColor(avgScore * 5));
          pdf.text(`${avgScore.toFixed(1)}/5 (${criterionScores.length} eval)`, 70, yPosition);

          // Barra de progreso
          const barWidth = 40;
          const progressWidth = (avgScore / 5) * barWidth;
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(120, yPosition - 2, barWidth, 3);
          pdf.setFillColor(getScoreColor(avgScore * 5));
          pdf.rect(120, yPosition - 2, progressWidth, 3, 'F');

          yPosition += 8;
        });
      }

      // Pie de página
      // Captura opcional de un contenedor en pantalla (si existe elemento con id 'results-table-capture')
      try {
        const el = document.getElementById('results-table-capture');
        if (el) {
          const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
          const imgData = canvas.toDataURL('image/png');
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(24,144,255);
          pdf.text('Vista Previa de Tabla', 20, 20);
          const imgWidth = pageWidth - marginX*2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', marginX, 28, imgWidth, Math.min(imgHeight, 240));
        }
      } catch {}

      // Pie de página con numeración
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 35, 290);
        pdf.text('EvaliQ - Calidad de Software', 20, 290);
      }

      // Guardar PDF
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`reporte-evaliq-${date}.pdf`);
      toast.success('Reporte exportado correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      toast.error('Error al generar el reporte PDF');
    }
  };

  return (
    <Button 
      icon={<DownloadOutlined />}
      onClick={exportToPDF}
      disabled={!evaluations || evaluations.length === 0}
      loading={loading}
    >
      Exportar Reporte PDF
    </Button>
  );
};

export default PDFExporter;