// src/ui/components/layout/Footer.jsx
import React from "react";
import { Layout, Typography, Space, Divider, Button, Row, Col } from "antd";
import { 
  HeartFilled,
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  MailOutlined,
  RocketOutlined,
  CodeOutlined,
  TeamOutlined,
  BookOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import "./Footer.css";

const { Footer: AntFooter } = Layout;
const { Text, Link, Title } = Typography;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        {/* Wave separator */}
        <div className="footer-wave">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
            className="wave-svg"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="wave-fill"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="wave-fill"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="wave-fill"
            ></path>
          </svg>
        </div>

        {/* Main Footer Content */}
        <Row gutter={[40, 30]} className="footer-main">
          {/* Brand Section */}
          <Col xs={24} md={8}>
            <div className="footer-brand">
              <div className="brand-logo">
                <RocketOutlined className="logo-icon" />
                <Title level={3} className="brand-name">
                  EvaliQ
                </Title>
              </div>
              <Text className="brand-tagline">
                Transformando la educación en calidad de software mediante evaluaciones inteligentes y estándares ISO.
              </Text>
              <div className="social-links">
                <Button 
                  type="text" 
                  icon={<GithubOutlined />} 
                  className="social-btn"
                  href="https://github.com" 
                  target="_blank"
                />
                <Button 
                  type="text" 
                  icon={<TwitterOutlined />} 
                  className="social-btn"
                  href="https://twitter.com" 
                  target="_blank"
                />
                <Button 
                  type="text" 
                  icon={<LinkedinOutlined />} 
                  className="social-btn"
                  href="https://linkedin.com" 
                  target="_blank"
                />
                <Button 
                  type="text" 
                  icon={<MailOutlined />} 
                  className="social-btn"
                  href="mailto:contacto@evaliq.com"
                />
              </div>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={12} md={4}>
            <div className="footer-section">
              <Title level={5} className="section-title">
                Navegación
              </Title>
              <Space direction="vertical" size="small" className="links-list">
                <Link href="/home" className="footer-link">
                  <RocketOutlined /> Inicio
                </Link>
                <Link href="/evaluation" className="footer-link">
                  <CodeOutlined /> Evaluar
                </Link>
                <Link href="/results" className="footer-link">
                  <SafetyCertificateOutlined /> Resultados
                </Link>
                <Link href="/about" className="footer-link">
                  <BookOutlined /> Acerca de
                </Link>
              </Space>
            </div>
          </Col>

          {/* Resources */}
          <Col xs={12} md={4}>
            <div className="footer-section">
              <Title level={5} className="section-title">
                Recursos
              </Title>
              <Space direction="vertical" size="small" className="links-list">
                <Link href="#" className="footer-link">
                  <BookOutlined /> Documentación
                </Link>
                <Link href="#" className="footer-link">
                  <TeamOutlined /> Tutoriales
                </Link>
                <Link href="#" className="footer-link">
                  <CodeOutlined /> API
                </Link>
                <Link href="#" className="footer-link">
                  <SafetyCertificateOutlined /> Casos de Estudio
                </Link>
              </Space>
            </div>
          </Col>

          {/* Support */}
          <Col xs={24} md={8}>
            <div className="footer-section">
              <Title level={5} className="section-title">
                ¿Necesitas Ayuda?
              </Title>
              <div className="support-card">
                <Text className="support-text">
                  ¿Tienes preguntas sobre calidad de software o necesitas asistencia técnica?
                </Text>
                <Button 
                  type="primary" 
                  icon={<MailOutlined />}
                  className="support-btn"
                  href="mailto:soporte@evaliq.com"
                >
                  Contactar Soporte
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Divider className="footer-divider" />

        {/* Bottom Section */}
        <div className="footer-bottom">
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Text className="copyright">
                © {currentYear} <strong>EvaliQ</strong>. Todos los derechos reservados.
              </Text>
            </Col>
            <Col xs={24} md={12}>
              <div className="bottom-links">
                <Space size="middle">
                  <Link href="#" className="bottom-link">Privacidad</Link>
                  <Link href="#" className="bottom-link">Términos</Link>
                  <Link href="#" className="bottom-link">Cookies</Link>
                  <Text className="made-with">
                    Hecho con <HeartFilled className="heart-icon" /> por el equipo EvaliQ
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;