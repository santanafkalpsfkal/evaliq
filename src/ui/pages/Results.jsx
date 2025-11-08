// src/ui/pages/Results.jsx (Versión simplificada)
import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Tag,
  Progress,
  Empty
} from "antd";
import {
  ArrowLeftOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PDFExporter from "../components/export/PDFExporter";
import { evaluationServices } from '../../services/evaluationServices';
import { userServices } from '../../services/userServices';
import "./Results.css";
import Footer from "../components/layout/Footer";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Results = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    try {
      const res = await evaluationServices.list();
      if (res?.success) {
        // Adaptar datos si vienen como items
        const items = res.items || [];
        setEvaluations(items.map(ev => ({
          ...ev,
          evaluator: ev.evaluatorName || ev.evaluatorEmail,
          date: ev.createdAt || ev.date,
        })));
      } else {
        setEvaluations([]);
      }
    } catch (e) {
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

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

  const columns = [
    {
      title: 'Proyecto',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Evaluador',
      dataIndex: 'evaluator',
      key: 'evaluator',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Puntuación Total',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (score) => (
        <Space>
          <Progress
            type="circle"
            percent={(score / 25) * 100}
            width={50}
            format={() => score}
            strokeColor={getScoreColor(score)}
          />
          <Tag color={getScoreColor(score)}>
            {getScoreStatus(score)}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<FileSearchOutlined />}
            onClick={() => console.log('Ver detalles:', record)}
          >
            Detalles
          </Button>
        </Space>
      )
    }
  ];

  const averageScore = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length
    : 0;

  const getCriterionStats = (criterionKey) => {
    const criterionScores = evaluations
      .map(evaluation => evaluation.scores?.[criterionKey])
      .filter(score => score !== undefined && score !== null);

    const avgScore = criterionScores.length > 0
      ? criterionScores.reduce((a, b) => a + b, 0) / criterionScores.length
      : 0;

    return { avgScore, count: criterionScores.length };
  };

  const criteriaList = [
    { key: 'functionality', name: 'Funcionalidad' },
    { key: 'reliability', name: 'Confiabilidad' },
    { key: 'usability', name: 'Usabilidad' },
    { key: 'efficiency', name: 'Eficiencia' },
    { key: 'maintainability', name: 'Mantenibilidad' }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      <Header className="results-header">
        <div className="results-header-content">

          <Title level={3} style={{ color: "#fff", marginBottom: 0 }}>
            Resultados y Reportes
          </Title>



          <Space>
            <Statistic
              title="Total Evaluaciones"
              value={evaluations.length}
              prefix={<BarChartOutlined />}
            />
            <Statistic
              title="Puntuación Promedio"
              value={averageScore.toFixed(1)}
              valueStyle={{ color: getScoreColor(averageScore) }}
            />
          </Space>
        </div>
      </Header>

      <Content className="results-content">
        <Card className="results-card">
          {/* Botones de navegación */}
          <div style={{ marginBottom: 24 }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/home')}
              >
                Volver al Home
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => navigate('/evaluation')}
              >
                Nueva Evaluación
              </Button>

              {/* Componente PDF Exporter */}
              <PDFExporter
                evaluations={evaluations}
                loading={loading}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={loadEvaluations}
                loading={loading}
              >
                Actualizar
              </Button>
            </Space>
          </div>

          {/* Estadísticas rápidas */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Proyectos Evaluados"
                  value={evaluations.length}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Puntuación Máxima"
                  value={evaluations.length > 0 ? Math.max(...evaluations.map(evaluation => evaluation.totalScore)) : 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small">
                <Statistic
                  title="Puntuación Mínima"
                  value={evaluations.length > 0 ? Math.min(...evaluations.map(evaluation => evaluation.totalScore)) : 0}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Tabla de resultados */}
          {evaluations.length > 0 ? (
            <div id="results-table-capture">
              <Table
                columns={columns}
                dataSource={evaluations.map((evaluation, index) => ({ ...evaluation, key: evaluation._id || index }))}
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No hay evaluaciones registradas"
            >
              <Button
                type="primary"
                onClick={() => navigate('/evaluation')}
              >
                Realizar Primera Evaluación
              </Button>
            </Empty>
          )}

          {/* Resumen de criterios */}
          {evaluations.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <Title level={4}>Resumen por Criterios</Title>
              <Row gutter={[16, 16]}>
                {criteriaList.map((criterion) => {
                  const { avgScore, count } = getCriterionStats(criterion.key);

                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={criterion.key}>
                      <Card size="small">
                        <Statistic
                          title={criterion.name}
                          value={avgScore.toFixed(1)}
                          suffix="/5"
                          valueStyle={{ color: getScoreColor(avgScore * 5) }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {count} evaluaciones
                        </Text>
                        <Progress
                          percent={(avgScore / 5) * 100}
                          size="small"
                          strokeColor={getScoreColor(avgScore * 5)}
                          style={{ marginTop: 8 }}
                        />
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Results;