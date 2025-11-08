import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Space, Alert } from "antd";
import { UserOutlined, LockOutlined, RocketOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userServices } from "../../services/userServices";
import { toast } from 'react-toastify';
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loginError, setLoginError] = useState(null); // { title, description, type }
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Wrapper para React-Toastify (mapeando tipos anteriores)
  const showNotification = (type, title, description) => {
    const text = description ? `${title}\n${description}` : title;
    switch (type) {
      case 'success':
        toast.success(text);
        break;
      case 'error':
        toast.error(text);
        break;
      case 'warning':
        toast.warn(text);
        break;
      default:
        toast.info(text);
    }
  };

  // Función de LOGIN
  const onLogin = async (values) => {
    console.log('🔐 Intentando login con:', { email: values.email, password: '***' });
    setLoginError(null);
    setLoading(true);
    
    try {
      const result = await userServices.login(values.email, values.password);
      
      console.log('🔍 Respuesta del login:', result);
      
      if (result?.success && result?.user) {
  showNotification('success', `¡Bienvenido a EvaliQ!`, `Hola ${result.user.name}`);
        
        setTimeout(() => {
          setLoading(false);
          if (result.user.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/home', { replace: true });
          }
        }, 1000);
        
      } else {
        const raw = (result?.message || result?.error || '').toString();
        let title = 'Error en el login';
        let description = 'Credenciales incorrectas';
        const text = raw.toLowerCase();
        if (text.includes('no activo') || text.includes('no existe')) {
          title = 'Usuario no encontrado o inactivo';
          description = 'Verifica tu email o contacta al administrador si crees que es un error.';
        } else if (text.includes('hash mismatch') || text.includes('contraseña') || text.includes('password')) {
          title = 'Contraseña incorrecta';
          description = 'La contraseña no coincide para ese usuario.';
        } else if (text.includes('servidor')) {
          title = 'Servidor no disponible';
          description = 'No pudimos conectarnos. Intenta de nuevo en unos segundos.';
        }
        showNotification('error', title, description);
        setLoginError({ title, description, type: 'error' });
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Error en login:', error);
      const description = error.message || 'No se pudo conectar con el servidor';
      showNotification('error', 'Error de conexión', description);
      setLoginError({ title: 'Error de conexión', description, type: 'error' });
      setLoading(false);
    }
  };

  // Función de REGISTRO
  const onRegister = async (values) => {
    console.log('📝 Intentando registro con:', { 
      name: values.name, 
      email: values.email, 
      password: '***' 
    });
    
    setRegisterLoading(true);
    
    try {
      const result = await userServices.register({
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      console.log('🔍 Respuesta del registro:', result);
      
      if (result?.success && result?.user) {
  showNotification('success', '¡Cuenta creada exitosamente!', `Bienvenido ${result.user.name}. Redirigiendo...`);
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 1200);
      } else {
        const errorMessage = result?.message || result?.error || 'No se pudo crear la cuenta';
        showNotification('error', 'Error en el registro', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      showNotification('error', 'Error de conexión', 'No se pudo conectar con el servidor');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const switchToRegister = () => {
    setIsRegisterMode(true);
    setShowSuccessMessage(false);
    setLoginError(null);
    form.resetFields();
  };

  const switchToLogin = () => {
    setIsRegisterMode(false);
    setShowSuccessMessage(false);
    setLoginError(null);
    form.resetFields();
  };

  // Mostrar alerta si viene de un logout reciente
  // Eliminado aviso post-logout para requerimiento de solo mostrar antes de redirigir

  return (
    <div className="login-container">
      <Card className={`login-card${isRegisterMode ? ' register-wide' : ''}`}>
        <div className="login-header">
          <Space direction="vertical" size="small" align="center">
            <RocketOutlined className="login-logo" />
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              EvaliQ
            </Title>
            <Text>
              {isRegisterMode ? 'Crear nueva cuenta' : 'Inicia sesión en tu cuenta'}
            </Text>
          </Space>
        </div>

        {/* Feedback inline para errores de login */}
        {!isRegisterMode && loginError && (
          <Alert
            type={loginError.type || 'error'}
            message={loginError.title}
            description={loginError.description}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Mensaje de éxito después del registro */}
        {showSuccessMessage && (
          <Alert
            message="¡Registro Exitoso!"
            description="Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión."
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        {isRegisterMode ? (
          // FORMULARIO DE REGISTRO (wider, two-column layout, same vertical footprint as login)
          <Form
            form={form}
            name="register"
            onFinish={onRegister}
            className="login-form register-form"
            size="large"
            layout="vertical"
          >
            <div className="form-row">
              <div className="form-col">
                <Form.Item
                  label="Nombre completo"
                  name="name"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu nombre' },
                    { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Tu nombre completo" 
                    disabled={registerLoading}
                  />
                </Form.Item>
              </div>
              <div className="form-col">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu email' },
                    { type: 'email', message: 'Email no válido' }
                  ]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="tu@email.com" 
                    disabled={registerLoading}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <Form.Item
                  label="Contraseña"
                  name="password"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu contraseña' },
                    { min: 6, message: 'Mínimo 6 caracteres' }
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Mínimo 6 caracteres" 
                    disabled={registerLoading}
                  />
                </Form.Item>
              </div>
              <div className="form-col">
                <Form.Item
                  label="Confirmar"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Confirma tu contraseña' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Las contraseñas no coinciden'));
                      },
                    }),
                  ]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Repite tu contraseña" 
                    disabled={registerLoading}
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item className="register-submit" style={{ marginBottom: 8 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={registerLoading}
                block
                icon={registerLoading ? null : <PlusOutlined />}
                style={{ height: '45px', fontSize: '16px' }}
              >
                {registerLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          // FORMULARIO DE LOGIN
          <Form
            form={form}
            name="login"
            onFinish={onLogin}
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
                disabled={loading}
              />
            </Form.Item>
            
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Contraseña" 
                disabled={loading}
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                style={{ height: '45px', fontSize: '16px' }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ margin: '16px 0', textAlign: 'center' }}>
          <Text type="secondary">
            {isRegisterMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </Text>
          <br />
          <Button 
            type="link" 
            onClick={isRegisterMode ? switchToLogin : switchToRegister}
            disabled={loading || registerLoading}
            style={{ padding: '4px 0' }}
          >
            {isRegisterMode ? 'Inicia sesión aquí' : 'Regístrate gratis'}
          </Button>
        </div>

        <Button 
          type="link" 
          onClick={handleGoHome}
          disabled={loading || registerLoading}
          style={{ display: 'block', margin: '0 auto', textAlign: 'center' }}
        >
          ← Volver al Home
        </Button>
      </Card>
    </div>
  );
};

export default Login;