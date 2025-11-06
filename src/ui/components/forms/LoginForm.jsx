// src/ui/components/forms/LoginForm.jsx
import React, { useState } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { userServices } from "../../../services/userServices";
import "./LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Configurar contenedor global de mensajes (para que se vean)
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setLoading(true);

    try {
      const { email, password } = values;
      const res = await userServices.login(email, password);

      if (!res.success) {
        messageApi.open({
          type: "error",
          content: "❌ Credenciales inválidas. Intenta nuevamente.",
          duration: 3,
        });
        return;
      }

      // Guardar usuario
      localStorage.setItem("user", JSON.stringify(res.user));

      messageApi.open({
        type: "success",
        content: `✅ Bienvenido ${res.user.name}`,
        duration: 2,
      });

      // Pequeña pausa para que se vea la animación
      setTimeout(() => {
        if (res.user.role === "admin") navigate("/admin", { replace: true });
        else navigate("/home", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Error en login:", err);
      messageApi.open({
        type: "error",
        content: "⚠️ Ocurrió un error inesperado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {contextHolder}

      {/* Overlay con fondo semitransparente durante carga */}
      <Spin
        spinning={loading}
        tip="Validando credenciales..."
        size="large"
        fullscreen
      />

      <Card
        title="EvaliQ - Inicio de Sesión"
        bordered={false}
        className="login-card"
      >
        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Correo o Usuario"
            name="email"
            rules={[{ required: true, message: "Ingrese su correo o usuario" }]}
          >
            <Input placeholder="admin@evaliq.com o user@evaliq.com" />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: "Ingrese su contraseña" }]}
          >
            <Input.Password placeholder="********" autoComplete="new-password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginForm;
