// src/ui/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Layout, Typography, Card, Row, Col, Button, Space, Modal, Alert } from "antd";
import {
  FileTextOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  ProfileOutlined,
  UserOutlined,
  LoginOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { userServices } from "../../services/userServices"; // auth helper
import { toast } from 'react-toastify';
import "./Home.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const Home = () => {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // nuevo
  // const [loginModalVisible, setLoginModalVisible] = useState(false); // remover (no usado)
  const navigate = useNavigate();

  useEffect(() => {
    const load = () => setUser(userServices.getCurrentUser());
    load();
    setReady(true);
    const onStorage = (e) => {
      if (e.key === 'userData' || e.key === 'authToken') load();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Función para manejar la navegación protegida - MANTIENE TU CÓDIGO ORIGINAL
  const handleProtectedNavigation = (path, actionName) => {
    // CAMBIO MÍNIMO: Usar userServices
    const currentUser = userServices.getCurrentUser(); // ← SOLO ESTE CAMBIO

    if (!currentUser) {
      toast.warn(`Debes iniciar sesión para ${actionName}.`);
      setTimeout(() => {
        Modal.confirm({
          title: 'Acceso Requerido',
          icon: <ExclamationCircleOutlined />,
          content: `Para ${actionName}, necesitas iniciar sesión o registrarte en EvaliQ.`,
          okText: 'Iniciar Sesión',
          cancelText: 'Cancelar',
          onOk: () => navigate('/login')
        });
      }, 250);
    } else {
      // MANTIENE TU NAVEGACIÓN ORIGINAL
      navigate(path);
    }
  };

  // Función para manejar login/registro - MANTIENE TU CÓDIGO ORIGINAL
  const handleAuthAction = () => {
    // CAMBIO MÍNIMO: Usar userServices
    const currentUser = userServices.getCurrentUser(); // ← SOLO ESTE CAMBIO

    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  // EL RESTO DE TU CÓDIGO SE MANTIENE EXACTAMENTE IGUAL
  return (
    <Layout className="home-layout">
      {/* Header Component - Versión pública */}
      <Header
        title="Bienvenido a EvaliQ"
        subtitle="Plataforma educativa para evaluación de calidad de software"
        showUserMenu={!!user}
      />

      {/* Contenido principal - TODO TU CÓDIGO ORIGINAL SE MANTIENE */}
      <Content className="home-content">
        {/* Banner de bienvenida */}
        {!user && (
          <Card
            style={{
              background: 'linear-gradient(90deg, #001529 0%, #003a8c 100%)',
              color: 'white',
              textAlign: 'center',
              marginBottom: 40,
              border: 'none'
            }}
          >
            <Space direction="vertical" size="middle">
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                ¡Comienza a evaluar proyectos de software!
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Únete a nuestra comunidad y aprende sobre calidad de software con estándares ISO
              </Text>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                  onClick={() => navigate('/login')}
                >
                  Registrarse
                </Button>
              </Space>
              <Alert
                type="info"
                showIcon
                message="Acceso restringido"
                description="Para evaluar proyectos y ver resultados, inicia sesión o crea tu cuenta gratis."
                style={{ marginTop: 12 }}
              />
            </Space>
          </Card>
        )}

        <Row gutter={[24, 32]}>
          {/* Evaluación de Proyectos */}
          <Col xs={24} sm={12} md={8}>
            <Card className="home-card" hoverable>
              <FileTextOutlined className="home-icon" />
              <Title level={4}>Evaluación de Proyectos</Title>
              <Text>
                Evalúa proyectos de software con métricas de calidad y criterios
                técnicos basados en normas ISO.
              </Text>
              <Button
                type="primary"
                block
                style={{ marginTop: 20 }}
                onClick={() => handleProtectedNavigation(
                  '/evaluation',
                  'evaluar proyectos'
                )}
              >
                {user ? 'Ir a Evaluar' : 'Evaluar Proyectos'}
              </Button>
              {!user && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                  🔐 Requiere inicio de sesión
                </Text>
              )}
            </Card>
          </Col>

          {/* Resultados y Reportes */}
          <Col xs={24} sm={12} md={8}>
            <Card className="home-card" hoverable>
              <BarChartOutlined className="home-icon" />
              <Title level={4}>Resultados y Reportes</Title>
              <Text>
                Visualiza resultados, métricas y comparaciones de proyectos evaluados.
              </Text>
              <Button
                type="primary"
                block
                style={{ marginTop: 20 }}
                onClick={() => handleProtectedNavigation(
                  '/results',
                  'ver resultados'
                )}
              >
                {user ? 'Ver Resultados' : 'Explorar Resultados'}
              </Button>
              {!user && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                  🔐 Requiere inicio de sesión
                </Text>
              )}
            </Card>
          </Col>
          {/* Sobre EvaliQ */}
          <Col xs={24} sm={12} md={8}>
            <Card className="home-card" hoverable>
              <InfoCircleOutlined className="home-icon" />
              <Title level={4}>Sobre EvaliQ</Title>
              <Text>
                Aprende sobre normas ISO, modelos de calidad y buenas prácticas de desarrollo.
              </Text>
              <Button
                type="primary"
                block
                style={{ marginTop: 20 }}
                onClick={() => navigate('/about')}
              >
                Ver Información
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                🌐 Acceso público
              </Text>
            </Card>
          </Col>
          {/* Mi Perfil */}
          <Col xs={24} sm={12} md={8}>
            <Card className="home-card" hoverable>
              <ProfileOutlined className="home-icon" />
              <Title level={4}>
                {user ? 'Mi Perfil' : 'Mi Cuenta'}
              </Title>
              <Text>
                {user
                  ? 'Gestiona tu información personal, ve tus estadísticas y actividad reciente.'
                  : 'Crea tu cuenta para guardar tus evaluaciones y acceder a todas las funciones.'
                }
              </Text>
              <Button
                type={user ? "default" : "primary"}
                block
                style={{ marginTop: 20 }}
                onClick={handleAuthAction}
                icon={user ? <UserOutlined /> : <LoginOutlined />}
              >
                {user ? 'Ver Mi Perfil' : 'Crear Cuenta / Login'}
              </Button>
            </Card>
          </Col>

          {/* Configuración */}
          <Col xs={24} sm={12} md={8}>
            <Card className="home-card" hoverable>
              <SettingOutlined className="home-icon" />
              <Title level={4}>Configuración</Title>
              <Text>
                Personaliza tu experiencia, notificaciones y preferencias de la aplicación.
              </Text>
              <Button
                type="default"
                block
                style={{ marginTop: 20 }}
                onClick={() => handleProtectedNavigation(
                  '/settings',
                  'acceder a la configuración'
                )}
                disabled={!user}
              >
                {user ? 'Configurar' : 'Configuración'}
              </Button>
              {!user && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                  🔒 Disponible para usuarios registrados
                </Text>
              )}
            </Card>
          </Col>



          {/* Panel de Administración (solo para admins logueados) */}
          {user?.role === 'admin' && (
            <Col xs={24} sm={12} md={8}>
              <Card className="home-card admin-card" hoverable>
                <TeamOutlined className="home-icon" />
                <Title level={4}>Panel de Administración</Title>
                <Text>
                  Gestiona usuarios, proyectos y configuraciones del sistema.
                </Text>
                <Button
                  type="primary"
                  block
                  style={{ marginTop: 20 }}
                  onClick={() => navigate('/admin')}
                >
                  Ir al Panel Admin
                </Button>
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                  ⚡ Solo administradores
                </Text>
              </Card>
            </Col>
          )}
        </Row>

        {/* Información para usuarios no logueados */}
        {!user && (
          <Card style={{ marginTop: 40, textAlign: 'center' }}>
            <Space direction="vertical" size="middle">
              <Title level={3}>¿Por qué registrarte en EvaliQ?</Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text strong>📊 Guarda tus evaluaciones</Text>
                    <Text type="secondary">Tus resultados se guardan automáticamente</Text>
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text strong>📈 Sigue tu progreso</Text>
                    <Text type="secondary">Mira tus estadísticas y mejora</Text>
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text strong>🎓 Aprende más</Text>
                    <Text type="secondary">Accede a todos los recursos educativos</Text>
                  </Space>
                </Col>
              </Row>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/login')}
              >
                ¡Únete a EvaliQ Gratis!
              </Button>
              <Alert
                type="warning"
                showIcon
                message="Funcionalidad limitada"
                description="Mientras no inicies sesión, el acceso a evaluación, resultados y configuración estará bloqueado."
              />
            </Space>
          </Card>
        )}

        {/* Espacio adicional antes del footer */}
        <div style={{ height: '40px' }}></div>
      </Content>

      <Footer />
    </Layout>
  );
};

export default Home;