// src/ui/components/layout/Header.jsx
import React from "react";
import { Layout, Typography, Button, Dropdown, Space, Avatar, message } from "antd";
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
import "./Header.css";

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = ({ title, subtitle, showUserMenu = true }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    message.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'Mi Perfil',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configuración',
      onClick: () => navigate('/settings')
    },
    ...(user?.role === 'admin' ? [{
      key: 'admin',
      icon: <TeamOutlined />,
      label: 'Panel Admin',
      onClick: () => navigate('/admin')
    }] : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar Sesión',
      onClick: handleLogout,
    },
  ];

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
            menu={{ items: userMenuItems }} 
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