// src/ui/pages/About.jsx
import React from "react";
import { 
  Layout, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Tag,
  List,
  Divider,
  Collapse
} from "antd";
import { 
  ArrowLeftOutlined, 
  BookOutlined,
  StarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./About.css";
import Footer from "../components/layout/Footer";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const About = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // Datos educativos sobre normas ISO
  const isoStandards = [
    {
      name: "ISO/IEC 25010",
      description: "Sistema de calidad de productos de software",
      characteristics: [
        "Funcionalidad",
        "Confiabilidad de rendimiento", 
        "Compatibilidad",
        "Usabilidad",
        "Eficiencia de rendimiento",
        "Mantenibilidad",
        "Portabilidad",
        "Seguridad"
      ],
      year: 2011
    },
    {
      name: "ISO/IEC 9126",
      description: "Modelo de calidad de software anterior",
      characteristics: [
        "Funcionalidad",
        "Confiabilidad",
        "Usabilidad",
        "Eficiencia",
        "Mantenibilidad", 
        "Portabilidad"
      ],
      year: 2001
    }
  ];

  const qualityModels = [
    {
      name: "Modelo de McCall",
      focus: "Factores de calidad orientados al producto",
      factors: ["Corrección", "Confiabilidad", "Eficiencia", "Integridad", "Usabilidad"]
    },
    {
      name: "CMMI (Capability Maturity Model Integration)",
      focus: "Mejora de procesos organizacionales", 
      levels: ["Inicial", "Gestionado", "Definido", "Gestionado cuantitativamente", "Optimización"]
    },
    {
      name: "Modelo de Boehm",
      focus: "Características de calidad jerárquicas",
      characteristics: ["Uso general", "Mantenibilidad", "Portabilidad"]
    }
  ];

  const evaluationCriteria = [
    {
      criterion: "Funcionalidad",
      description: "Capacidad del software para proveer funciones que satisfacen necesidades establecidas",
      metrics: ["Completitud", "Corrección", "Interoperabilidad"]
    },
    {
      criterion: "Confiabilidad",
      description: "Capacidad de mantener el nivel de desempeño bajo condiciones establecidas", 
      metrics: ["Madurez", "Tolerancia a fallos", "Recuperabilidad"]
    },
    {
      criterion: "Usabilidad",
      description: "Capacidad de ser entendido, aprendido, usado y atractivo para el usuario",
      metrics: ["Inteligibilidad", "Aprendizaje", "Operabilidad"]
    },
    {
      criterion: "Eficiencia",
      description: "Rendimiento relativo a la cantidad de recursos usados bajo condiciones establecidas",
      metrics: ["Comportamiento temporal", "Utilización de recursos"]
    },
    {
      criterion: "Mantenibilidad", 
      description: "Capacidad de ser modificado efectivamente y eficientemente",
      metrics: ["Analizabilidad", "Modificabilidad", "Estabilidad"]
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <Header className="about-header">
        <div className="about-header-content">
          <div>
            <Title level={2} style={{ color: "#fff", marginBottom: 8 }}>
              <BookOutlined /> Sobre EvaliQ
            </Title>
          </div>
          
          <Space>
            {user ? (
              <>
                <Button 
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/home')}
                >
                  Volver al Home
                </Button>
                <Button 
                  type="primary"
                  onClick={() => navigate('/evaluation')}
                >
                  Comenzar a Evaluar
                </Button>
              </>
            ) : (
              <Button 
                type="primary"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
            )}
          </Space>
        </div>
      </Header>

      <Content className="about-content">
        {/* Introducción */}
        <Card className="about-card" style={{ marginBottom: 24 }}>
          <Title level={3}>¿Qué es EvaliQ?</Title>
          <Paragraph>
            EvaliQ es una plataforma educativa diseñada para enseñar y practicar conceptos 
            fundamentales de <Text strong>calidad de software</Text>. Nuestro objetivo es 
            proporcionar herramientas interactivas que faciliten el aprendizaje de normas 
            internacionales, modelos de calidad y técnicas de evaluación.
          </Paragraph>
          <Space>
            <Tag icon={<CheckCircleOutlined />} color="blue">Educativo</Tag>
            <Tag icon={<StarOutlined />} color="green">Interactivo</Tag>
            <Tag icon={<GlobalOutlined />} color="orange">Basado en Estándares</Tag>
          </Space>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Normas ISO */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Normas Internacionales ISO</span>
                </Space>
              } 
              className="about-card"
            >
              <List
                itemLayout="vertical"
                dataSource={isoStandards}
                renderItem={(standard) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{standard.name}</Text>
                          <Tag>{standard.year}</Tag>
                        </Space>
                      }
                      description={standard.description}
                    />
                    <Text strong>Características:</Text>
                    <div style={{ marginTop: 8 }}>
                      {standard.characteristics.map((char, index) => (
                        <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                          {char}
                        </Tag>
                      ))}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Modelos de Calidad */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <StarOutlined />
                  <span>Modelos de Calidad</span>
                </Space>
              } 
              className="about-card"
            >
              <Collapse ghost>
                {qualityModels.map((model, index) => (
                  <Panel header={model.name} key={index}>
                    <Paragraph>
                      <Text strong>Enfoque:</Text> {model.focus}
                    </Paragraph>
                    {model.factors && (
                      <>
                        <Text strong>Factores:</Text>
                        <div style={{ marginTop: 8 }}>
                          {model.factors.map((factor, idx) => (
                            <Tag key={idx} color="green" style={{ marginBottom: 4 }}>
                              {factor}
                            </Tag>
                          ))}
                        </div>
                      </>
                    )}
                    {model.levels && (
                      <>
                        <Text strong>Niveles de Madurez:</Text>
                        <div style={{ marginTop: 8 }}>
                          {model.levels.map((level, idx) => (
                            <Tag key={idx} color="orange" style={{ marginBottom: 4 }}>
                              {idx + 1}. {level}
                            </Tag>
                          ))}
                        </div>
                      </>
                    )}
                  </Panel>
                ))}
              </Collapse>
            </Card>
          </Col>
        </Row>

        {/* Criterios de Evaluación */}
        <Card 
          title="Criterios de Evaluación en EvaliQ" 
          className="about-card"
          style={{ marginTop: 24 }}
        >
          <Row gutter={[16, 16]}>
            {evaluationCriteria.map((criterion, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card 
                  size="small" 
                  title={criterion.criterion}
                  className="criterion-card"
                >
                  <Paragraph style={{ fontSize: '13px', marginBottom: 12 }}>
                    {criterion.description}
                  </Paragraph>
                  <Divider style={{ margin: '12px 0' }} />
                  <Text strong>Métricas:</Text>
                  <ul style={{ fontSize: '12px', marginTop: 8, paddingLeft: 16 }}>
                    {criterion.metrics.map((metric, idx) => (
                      <li key={idx}>{metric}</li>
                    ))}
                  </ul>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* CTA Final */}
        <Card className="about-card" style={{ marginTop: 24, textAlign: 'center' }}>
          <Title level={4}>¿Listo para comenzar?</Title>
          <Paragraph>
            Practica la evaluación de calidad de software utilizando estándares internacionales 
            y mejora tus habilidades en ingeniería de software.
          </Paragraph>
          {user ? (
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/evaluation')}
            >
              Comenzar Evaluación
            </Button>
          ) : (
            <Space>
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </Button>
              <Button 
                size="large"
                onClick={() => navigate('/login')}
              >
                Registrarse
              </Button>
            </Space>
          )}
        </Card>
      </Content>
      <Footer />
    </Layout>
  );
};

export default About;