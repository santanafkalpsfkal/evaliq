// src/ui/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Typography, 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Avatar, 
  Row, 
  Col,
  Statistic,
  Tag,
  Divider,
  message,
  Upload
} from "antd";
import { 
  ArrowLeftOutlined, 
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  MailOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Footer from "../components/layout/Footer";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalEvaluations: 0,
    averageScore: 0,
    projectsEvaluated: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
      form.setFieldsValue({
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      });
      
      // Calcular estadísticas del usuario
      calculateUserStats(savedUser);
    }
  };

  const calculateUserStats = (currentUser) => {
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    const userEvaluations = evaluations.filter(evaluation => evaluation.evaluator === currentUser.name);
    
    const totalEvaluations = userEvaluations.length;
    const averageScore = totalEvaluations > 0 
      ? userEvaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / totalEvaluations 
      : 0;
    const projectsEvaluated = new Set(userEvaluations.map(evaluation => evaluation.projectName)).size;

    setUserStats({
      totalEvaluations,
      averageScore: averageScore.toFixed(1),
      projectsEvaluated
    });
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const updatedUser = {
        ...user,
        name: values.name,
        email: values.email
      };
      
      // Actualizar en localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      message.success('Perfil actualizado correctamente');
      setEditing(false);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 20) return '#52c41a';
    if (score >= 15) return '#faad14';
    if (score >= 10) return '#fa8c16';
    return '#f5222d';
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9" }}>
      {/* Header */}
      <Header className="profile-header">
        <div className="profile-header-content">
          <div>
            <Title level={3} style={{ color: "#fff", marginBottom: 0 }}>
              Mi Perfil
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

      <Content className="profile-content">
        <Row gutter={[24, 24]}>
          {/* Columna izquierda - Información personal */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  <span>Información Personal</span>
                </Space>
              }
              className="profile-card"
              extra={
                !editing ? (
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={handleEdit}
                  >
                    Editar
                  </Button>
                ) : (
                  <Space>
                    <Button onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Guardar
                    </Button>
                  </Space>
                )
              }
            >
              <Form
                form={form}
                layout="vertical"
                disabled={!editing}
              >
                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar 
                    size={100} 
                    icon={<UserOutlined />}
                    style={{ 
                      backgroundColor: user?.role === 'admin' ? '#f5222d' : '#1890ff',
                      marginBottom: 16
                    }}
                  />
                  {editing && (
                    <Upload 
                      showUploadList={false}
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />}>
                        Cambiar Foto
                      </Button>
                    </Upload>
                  )}
                </div>

                <Form.Item
                  name="name"
                  label="Nombre Completo"
                  rules={[
                    { required: true, message: 'Por favor ingrese su nombre' },
                    { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Su nombre completo"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Correo Electrónico"
                  rules={[
                    { required: true, message: 'Por favor ingrese su email' },
                    { type: 'email', message: 'Por favor ingrese un email válido' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="su.email@ejemplo.com"
                  />
                </Form.Item>

                <Form.Item
                  name="role"
                  label="Rol en el Sistema"
                >
                  <Input 
                    prefix={<TeamOutlined />} 
                    disabled
                    suffix={
                      <Tag color={user?.role === 'admin' ? 'red' : 'blue'}>
                        {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </Tag>
                    }
                  />
                </Form.Item>

                {user?.createdAt && (
                  <Form.Item label="Fecha de Registro">
                    <Input 
                      prefix={<CalendarOutlined />}
                      value={new Date(user.createdAt).toLocaleDateString()}
                      disabled
                    />
                  </Form.Item>
                )}
              </Form>
            </Card>
          </Col>

          {/* Columna derecha - Estadísticas */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined />
                  <span>Mis Estadísticas</span>
                </Space>
              }
              className="profile-card"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title="Evaluaciones Realizadas"
                      value={userStats.totalEvaluations}
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title="Puntuación Promedio"
                      value={userStats.averageScore}
                      valueStyle={{ color: getScoreColor(userStats.averageScore) }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title="Proyectos Evaluados"
                      value={userStats.projectsEvaluated}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider />

              {/* Actividad reciente */}
              <Title level={5}>Actividad Reciente</Title>
              {userStats.totalEvaluations > 0 ? (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {JSON.parse(localStorage.getItem('evaluations') || '[]')
                    .filter(evaluation => evaluation.evaluator === user?.name)
                    .slice(0, 5)
                    .map((evaluation, index) => (
                      <div key={index} style={{ 
                        padding: '8px 0', 
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <Text strong>{evaluation.projectName}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(evaluation.date).toLocaleDateString()}
                          </Text>
                        </div>
                        <Tag color={getScoreColor(evaluation.totalScore)}>
                          {evaluation.totalScore} pts
                        </Tag>
                      </div>
                    ))}
                </div>
              ) : (
                <Text type="secondary">
                  Aún no has realizado evaluaciones. 
                  <Button 
                    type="link" 
                    onClick={() => navigate('/evaluation')}
                    style={{ padding: 0, marginLeft: 4 }}
                  >
                    ¡Comienza ahora!
                  </Button>
                </Text>
              )}
            </Card>

            {/* Información del sistema */}
            <Card 
              title="Información del Sistema"
              className="profile-card"
              style={{ marginTop: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Versión de EvaliQ</Text>
                  <Tag color="blue">v1.0.0</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Última actualización</Text>
                  <Text type="secondary">15 Ene 2024</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Estado del sistema</Text>
                  <Tag color="green">Operativo</Tag>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
      <Footer />
    </Layout>
  );
};

export default Profile;