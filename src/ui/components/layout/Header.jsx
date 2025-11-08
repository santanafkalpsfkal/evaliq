// src/ui/components/layout/Header.jsx
import React from "react";
import { Layout, Typography, Button, Dropdown, Space, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  ProfileOutlined,
  HomeOutlined,
  LoginOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { userServices } from "../../../services/userServices"; // ← SOLO ESTA LÍNEA NUEVA
import { toast } from 'react-toastify';
import "./Header.css";

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = ({ title, subtitle, showUserMenu = true }) => {
  const navigate = useNavigate();
  // CAMBIO MÍNIMO: Usar userServices en lugar de localStorage directo
  const [user, setUser] = React.useState(() => userServices.getCurrentUser());
  // Reactivar estado usuario en cambios de storage para que el menú desaparezca tras logout
  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'userData' || e.key === 'authToken') {
        setUser(userServices.getCurrentUser());
      }
    };
    const onSessionChanged = () => setUser(userServices.getCurrentUser());
    window.addEventListener('storage', onStorage);
    window.addEventListener('session-changed', onSessionChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('session-changed', onSessionChanged);
    };
  }, []);

  const handleLogout = () => {
    // Un solo aviso (toast) y navegar cuando se cierre automáticamente
    userServices.logout();
    setUser(null);
    toast.info('Cerrando sesión...', {
      autoClose: 2000,
      onClose: () => navigate('/login')
    });
  };

  // EL RESTO DE TU CÓDIGO SE MANTIENE EXACTAMENTE IGUAL
  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Mi Perfil'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración'
    },
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <TeamOutlined />,
      label: 'Panel Admin'
    }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: () => handleLogout(),
    },
  ];

  const onUserMenuClick = ({ key }) => {
    if (key === 'logout') return handleLogout();
    if (key === 'profile') return navigate('/profile');
    if (key === 'settings') return navigate('/settings');
    if (key === 'admin') return navigate('/admin');
  };

  // Estilos para el dropdown
  const dropdownStyle = {
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    border: '1px solid #f0f0f0',
  };

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="header-titles">
          <Title level={3} style={{ color: "#fff", marginBottom: 0, fontSize: "20px" }}>
            {title}
          </Title>
          {subtitle && (
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
              {subtitle}
            </Text>
          )}
        </div>
        
        {showUserMenu && user ? (
          // Menú para usuarios logueados
          <Dropdown 
            menu={{ items: userMenuItems, onClick: onUserMenuClick }} 
            placement="bottomRight"
            trigger={['click']}
            dropdownStyle={dropdownStyle}
          >
            <Button 
              type="text" 
              className="user-dropdown-btn"
            >
              <Space size="small">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: user?.role === 'admin' ? '#f5222d' : '#87d068',
                    width: '24px',
                    height: '24px',
                    lineHeight: '24px',
                    fontSize: '12px'
                  }}
                />
                <span style={{ fontWeight: 500 }}>{user ? user.name : "Usuario"}</span>
              </Space>
            </Button>
          </Dropdown>
        ) : showUserMenu ? (
          // Botón de login para usuarios no logueados
          <Button 
            type="primary" 
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
            className="login-btn"
          >
            Iniciar Sesión
          </Button>
        ) : null}
      </div>
    </AntHeader>
  );
};

// Asegúrate de que esta línea esté presente
export default Header;