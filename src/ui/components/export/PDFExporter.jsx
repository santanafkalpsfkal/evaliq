// src/ui/components/export/PDFExporter.jsx
import { Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";

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

  const exportToPDF = () => {
    if (!evaluations || evaluations.length === 0) {
      message.warning('No hay datos para exportar');
      return;
    }

    message.info('Generando reporte PDF...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Encabezado
      pdf.setFontSize(20);
      pdf.setTextColor(24, 144, 255);
      pdf.text('EvaliQ', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(102, 102, 102);
      yPosition += 10;
      pdf.text('Reporte de Evaluaciones de Calidad de Software', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(153, 153, 153);
      yPosition += 8;
      pdf.text(`Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // Estadísticas generales
      pdf.setFontSize(14);
      pdf.setTextColor(24, 144, 255);
      pdf.text('📊 Resumen General', 20, yPosition);
      yPosition += 15;

      const averageScore = evaluations.length > 0 
        ? evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length 
        : 0;

      const uniqueProjects = new Set(evaluations.map(e => e.projectName)).size;

      // Estadísticas
      pdf.setFontSize(10);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Total Evaluaciones:', 30, yPosition);
      pdf.setTextColor(24, 144, 255);
      pdf.text(evaluations.length.toString(), 80, yPosition);
      
      pdf.setTextColor(102, 102, 102);
      pdf.text('Puntuación Promedio:', 30, yPosition + 7);
      pdf.setTextColor(getScoreColor(averageScore));
      pdf.text(averageScore.toFixed(1).toString(), 85, yPosition + 7);
      
      pdf.setTextColor(102, 102, 102);
      pdf.text('Proyectos Únicos:', 30, yPosition + 14);
      pdf.setTextColor(82, 196, 26);
      pdf.text(uniqueProjects.toString(), 80, yPosition + 14);

      yPosition += 30;

      // Tabla de evaluaciones
      if (evaluations.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(24, 144, 255);
        pdf.text('📋 Detalle de Evaluaciones', 20, yPosition);
        yPosition += 10;

        // Encabezados de tabla
        pdf.setFontSize(8);
        pdf.setTextColor(255, 255, 255);
        pdf.setFillColor(64, 169, 255);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.text('Proyecto', 25, yPosition + 5);
        pdf.text('Evaluador', 80, yPosition + 5);
        pdf.text('Fecha', 130, yPosition + 5);
        pdf.text('Puntuación', 160, yPosition + 5);
        pdf.text('Estado', 185, yPosition + 5);

        yPosition += 10;

        // Filas de la tabla
        pdf.setTextColor(0, 0, 0);
        evaluations.forEach((evaluation, index) => {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(7);
          pdf.text(evaluation.projectName.substring(0, 25), 25, yPosition);
          pdf.text(evaluation.evaluator.substring(0, 20), 80, yPosition);
          pdf.text(new Date(evaluation.date).toLocaleDateString(), 130, yPosition);
          pdf.text(evaluation.totalScore.toString(), 160, yPosition);
          
          pdf.setTextColor(getScoreColor(evaluation.totalScore));
          pdf.text(getScoreStatus(evaluation.totalScore), 185, yPosition);
          pdf.setTextColor(0, 0, 0);

          // Línea separadora
          pdf.setDrawColor(200, 200, 200);
          pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);

          yPosition += 6;
        });

        yPosition += 15;
      }

      // Resumen por criterios
      if (evaluations.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(24, 144, 255);
        pdf.text('🎯 Análisis por Criterios ISO 25010', 20, yPosition);
        yPosition += 10;

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
      pdf.setFontSize(8);
      pdf.setTextColor(102, 102, 102);
      pdf.text('Reporte generado por EvaliQ - Plataforma de Evaluación de Calidad de Software', pageWidth / 2, 280, { align: 'center' });
      pdf.text(`© ${new Date().getFullYear()} - Todos los derechos reservados`, pageWidth / 2, 285, { align: 'center' });

      // Guardar PDF
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`reporte-evaliq-${date}.pdf`);
      
      message.success('Reporte exportado correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      message.error('Error al generar el reporte PDF');
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