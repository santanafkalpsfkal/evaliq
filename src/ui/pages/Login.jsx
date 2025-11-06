// src/ui/pages/Login.jsx
import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Space, message } from "antd";
import { UserOutlined, LockOutlined, RocketOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    setLoading(true);
    
    // Simular proceso de login
    setTimeout(() => {
      // Crear usuario de ejemplo
      const user = {
        id: 1,
        name: values.email.split('@')[0] || 'Usuario',
        email: values.email,
        role: values.email.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      
      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", "fake-jwt-token");
      
      message.success(`¡Bienvenido a EvaliQ, ${user.name}!`);
      setLoading(false);
      
      // Redirigir al HOME después del login
      navigate('/home');
    }, 1000);
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Space direction="vertical" size="small" align="center">
            <RocketOutlined className="login-logo" />
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              EvaliQ
            </Title>
            <Text>Inicia sesión en tu cuenta</Text>
          </Space>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          className="login-form"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Por favor ingresa tu email' },
              { type: 'email', message: 'Email no válido' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Contraseña" 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        <div className="login-footer">
          <Text type="secondary">
            ¿No tienes cuenta? Usa cualquier email y contraseña para probar
          </Text>
          <Button 
            type="link" 
            onClick={handleGoHome}
            style={{ marginTop: 8 }}
          >
            ← Volver al Home
          </Button>
        </div>

        {/* Demo credentials */}
        <div className="demo-credentials">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <strong>Demo:</strong> admin@evaliq.com / user@evaliq.com
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;