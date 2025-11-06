// src/ui/pages/Admin.jsx
import React from "react";
import { Layout, Card } from "antd";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import AdminTable from "../components/tables/AdminTable";
import "./Admin.css";

const { Content } = Layout;

const Admin = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6f9", display: "flex", flexDirection: "column" }}>
      {/* Header Component */}
      <Header 
        title="Panel de Administración"
        subtitle="Gestión completa de usuarios y evaluaciones del sistema"
      />

      <Content className="admin-content">
        <Card className="admin-card" bordered={false}>
          <AdminTable />
        </Card>
      </Content>
      
      <Footer />
    </Layout>
  );
};

export default Admin;