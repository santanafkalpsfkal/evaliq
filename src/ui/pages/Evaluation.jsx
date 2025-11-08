// src/ui/pages/Evaluation.jsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Slider,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  message
} from "antd";
import {
  ArrowLeftOutlined,
  BarChartOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userServices } from "../../services/userServices"; // auth helper
import { evaluationServices } from "../../services/evaluationServices"; // backend real
import "./Evaluation.css";
import Footer from "../components/layout/Footer";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Evaluation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  // Criterios de evaluación basados en ISO 25010
  const evaluationCriteria = [
    {
      key: 'functionality',
      name: 'Funcionalidad',
      description: 'Capacidad del software para proveer funciones que satisfacen necesidades establecidas'
    },
    {
      key: 'reliability',
      name: 'Confiabilidad',
      description: 'Capacidad de mantener el nivel de desempeño bajo condiciones establecidas'
    },
    {
      key: 'usability',
      name: 'Usabilidad',
      description: 'Capacidad de ser entendido, aprendido, usado y atractivo para el usuario'
    },
    {
      key: 'efficiency',
      name: 'Eficiencia',
      description: 'Rendimiento relativo a la cantidad de recursos usados bajo condiciones establecidas'
    },
    {
      key: 'maintainability',
      name: 'Mantenibilidad',
      description: 'Capacidad de ser modificado efectivamente y eficientemente'
    }
  ];

  useEffect(() => {
    // CAMBIO: Usar userServices en lugar de localStorage directo
    const currentUser = userServices.getCurrentUser(); // ← CAMBIO AQUÍ
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Si no está autenticado, redirigir al login
      message.warning('Por favor inicia sesión para acceder a las evaluaciones');
      navigate('/login');
    }
  }, [navigate]);

  const onValuesChange = (changedValues, allValues) => {
    // Calcular puntuación total
    const scores = Object.values(allValues).filter(val => typeof val === 'number');
    const total = scores.reduce((sum, score) => sum + (score || 0), 0);
    setTotalScore(total);
  };

  const handleSubmit = async (values) => {
    try {
      // Verificar que el usuario esté autenticado
      const currentUser = userServices.getCurrentUser(); // ← CAMBIO AQUÍ
      if (!currentUser) {
        message.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/login');
        return;
      }

      // Construir payload y guardar en backend
      const { projectName, comments, ...scoreFields } = values;
      const payload = {
        projectName,
        comments,
        scores: scoreFields,
      };
      const res = await evaluationServices.create(payload);
      if (!res?.success) {
        message.error(res?.error || 'No se pudo guardar la evaluación');
        return;
      }
      message.success('Evaluación guardada correctamente');

      // Redirigir a resultados después de 1.5 segundos
      setTimeout(() => {
        navigate('/results');
      }, 1500);

    } catch (error) {
      console.error('Error creando evaluación', error);
      message.error('Error al guardar la evaluación');
    }
  };

  // Si no hay usuario, mostrar loading o redirigir
  if (!user) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
        <Content style={{ padding: '50px', textAlign: 'center' }}>
          <div>Cargando...</div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <Header className="evaluation-header">
        <div className="evaluation-header-content">
          <div>
            <Title level={3} style={{ color: "#fff", marginBottom: 0 }}>
              Evaluación de Proyectos
            </Title>

          </div>

          <Space>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>
              Evaluador: {user.name} {/* ← MUESTRA user real */}
            </Text>
          </Space>
        </div>
      </Header>

      <Content className="evaluation-content">
        <Card className="evaluation-card">
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
                onClick={() => navigate('/results')}
              >
                Ver Resultados
              </Button>
            </Space>
          </div>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={onValuesChange}
            onFinish={handleSubmit}
          >
            {/* Nombre del proyecto */}
            <Form.Item
              name="projectName"
              label="Nombre del Proyecto"
              rules={[{ required: true, message: 'Ingrese el nombre del proyecto' }]}
            >
              <Input placeholder="Ej: Sistema de Gestión Académica" size="large" />
            </Form.Item>

            {/* Criterios de evaluación */}
            <Title level={4}>Criterios de Calidad (ISO 25010)</Title>
            <Text type="secondary">
              Evalúe cada criterio en una escala de 0 a 5 puntos
            </Text>

            <Row gutter={[16, 24]} style={{ marginTop: 24 }}>
              {evaluationCriteria.map((criterion) => (
                <Col xs={24} md={12} key={criterion.key}>
                  <Card size="small" className="criterion-card">
                    <Form.Item
                      name={criterion.key}
                      label={
                        <div>
                          <Text strong>{criterion.name}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {criterion.description}
                          </Text>
                        </div>
                      }
                    >
                      <Slider
                        min={0}
                        max={5}
                        marks={{
                          0: '0',
                          1: '1',
                          2: '2',
                          3: '3',
                          4: '4',
                          5: '5'
                        }}
                        tooltip={{ formatter: (value) => `${value} puntos` }}
                      />
                    </Form.Item>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Comentarios adicionales */}
            <Form.Item
              name="comments"
              label="Comentarios Adicionales"
              style={{ marginTop: 24 }}
            >
              <Input.TextArea
                rows={4}
                placeholder="Observaciones, fortalezas, áreas de mejora..."
              />
            </Form.Item>

            {/* Botón de enviar */}
            <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<CheckCircleOutlined />}
                style={{ minWidth: 200 }}
              >
                Guardar Evaluación
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Evaluation;