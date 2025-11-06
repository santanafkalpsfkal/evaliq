// src/ui/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Typography, 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Row, 
  Col,
  Switch,
  Select,
  Divider,
  message,
  Modal,
  List
} from "antd";
import { 
  ArrowLeftOutlined, 
  SettingOutlined,
  SaveOutlined,
  BellOutlined,
  SecurityScanOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import "./Settings.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const Settings = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
    
    // Cargar configuraciones guardadas
    const savedSettings = JSON.parse(localStorage.getItem("userSettings") || '{}');
    form.setFieldsValue({
      notifications: savedSettings.notifications !== undefined ? savedSettings.notifications : true,
      emailReports: savedSettings.emailReports !== undefined ? savedSettings.emailReports : true,
      language: savedSettings.language || 'es',
      theme: savedSettings.theme || 'light',
      autoSave: savedSettings.autoSave !== undefined ? savedSettings.autoSave : true
    });
  }, [form]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Guardar configuraciones
      localStorage.setItem("userSettings", JSON.stringify(values));
      
      message.success('Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      message.error('Error al guardar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    confirm({
      title: '¿Restablecer configuraciones?',
      icon: <ExclamationCircleOutlined />,
      content: 'Todas tus configuraciones personalizadas se perderán y se restaurarán los valores predeterminados.',
      okText: 'Sí, restablecer',
      cancelText: 'Cancelar',
      onOk() {
        form.setFieldsValue({
          notifications: true,
          emailReports: true,
          language: 'es',
          theme: 'light',
          autoSave: true
        });
        localStorage.removeItem("userSettings");
        message.success('Configuraciones restablecidas correctamente');
      }
    });
  };

  const handleChangePassword = () => {
    Modal.info({
      title: 'Cambio de Contraseña',
      content: (
        <div>
          <p>Para cambiar tu contraseña, contacta al administrador del sistema.</p>
          <p>O en un sistema real, aquí iría un formulario para cambiar la contraseña.</p>
        </div>
      )
    });
  };

  const systemInfo = [
    { title: 'Versión de la Aplicación', value: 'EvaliQ v1.0.0' },
    { title: 'Última Actualización', value: '15 de Enero, 2024' },
    { title: 'Navegador', value: navigator.userAgent.split(' ')[0] },
    { title: 'Soporte', value: 'soporte@evaliq.com' }
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <Header className="settings-header">
        <div className="settings-header-content">
          <div>
            <Title level={3} style={{ color: "#fff", marginBottom: 0 }}>
              Configuración
            </Title>
          </div>
          
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/home')}
          >
            Volver al Home
          </Button>
        </div>
      </Header>

      <Content className="settings-content">
        <Row gutter={[24, 24]}>
          {/* Columna izquierda - Preferencias */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BellOutlined />
                  <span>Preferencias de Notificaciones</span>
                </Space>
              }
              className="settings-card"
            >
              <Form
                form={form}
                layout="vertical"
              >
                <Form.Item
                  name="notifications"
                  label="Notificaciones del Sistema"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Activadas" 
                    unCheckedChildren="Desactivadas" 
                  />
                </Form.Item>

                <Form.Item
                  name="emailReports"
                  label="Reportes por Email"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Activados" 
                    unCheckedChildren="Desactivados" 
                  />
                </Form.Item>

                <Form.Item
                  name="autoSave"
                  label="Guardado Automático"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Activado" 
                    unCheckedChildren="Desactivado" 
                  />
                </Form.Item>
              </Form>
            </Card>

            <Card 
              title={
                <Space>
                  <SettingOutlined />
                  <span>Preferencias de la Aplicación</span>
                </Space>
              }
              className="settings-card"
              style={{ marginTop: 24 }}
            >
              <Form
                form={form}
                layout="vertical"
              >
                <Form.Item
                  name="language"
                  label="Idioma"
                >
                  <Select>
                    <Option value="es">Español</Option>
                    <Option value="en">English</Option>
                    <Option value="pt">Português</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="theme"
                  label="Tema"
                >
                  <Select>
                    <Option value="light">Claro</Option>
                    <Option value="dark">Oscuro</Option>
                    <Option value="auto">Automático</Option>
                  </Select>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Columna derecha - Seguridad e Información */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <SecurityScanOutlined />
                  <span>Seguridad</span>
                </Space>
              }
              className="settings-card"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Cambiar Contraseña</Text>
                    <br />
                    <Text type="secondary">Actualiza tu contraseña regularmente</Text>
                  </div>
                  <Button 
                    icon={<EyeInvisibleOutlined />}
                    onClick={handleChangePassword}
                  >
                    Cambiar
                  </Button>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Sesión Actual</Text>
                    <br />
                    <Text type="secondary">Conectado como: {user?.name}</Text>
                  </div>
                  <Button 
                    type="primary"
                    onClick={() => navigate('/profile')}
                  >
                    Ver Perfil
                  </Button>
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Exportar Datos</Text>
                    <br />
                    <Text type="secondary">Descarga toda tu información</Text>
                  </div>
                  <Button>
                    Exportar
                  </Button>
                </div>
              </Space>
            </Card>

            <Card 
              title={
                <Space>
                  <InfoCircleOutlined />
                  <span>Información del Sistema</span>
                </Space>
              }
              className="settings-card"
              style={{ marginTop: 24 }}
            >
              <List
                dataSource={systemInfo}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={item.value}
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* Acciones */}
            <Card className="settings-card" style={{ marginTop: 24 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  onClick={handleSaveSettings}
                  loading={loading}
                  block
                  size="large"
                >
                  Guardar Configuraciones
                </Button>
                
                <Button 
                  onClick={handleResetSettings}
                  block
                >
                  Restablecer Valores Predeterminados
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Settings;