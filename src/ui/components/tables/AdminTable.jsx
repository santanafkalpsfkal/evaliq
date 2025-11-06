// src/ui/components/tables/AdminTable.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Descriptions
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  UserAddOutlined,
  BarChartOutlined,
  TeamOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const AdminTable = () => {
  const [users, setUsers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [evalModalVisible, setEvalModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingEvaluation, setViewingEvaluation] = useState(null);
  const [userForm] = Form.useForm();
  const [evalForm] = Form.useForm();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    // Cargar usuarios desde localStorage
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Si no hay usuarios, crear algunos de ejemplo
    if (savedUsers.length === 0) {
      const defaultUsers = [
        {
          id: 1,
          name: 'Ana García',
          email: 'ana@evaliq.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 2,
          name: 'Carlos López',
          email: 'carlos@evaliq.com',
          role: 'user',
          createdAt: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 3,
          name: 'María Torres',
          email: 'maria@evaliq.com',
          role: 'user',
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    } else {
      setUsers(savedUsers);
    }

    // Cargar evaluaciones desde localStorage
    const savedEvaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    setEvaluations(savedEvaluations);
    
    setLoading(false);
  };

  // Columnas para la tabla de usuarios
  const userColumns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span>{text}</span>
          {record.role === 'admin' && <Tag color="red">Admin</Tag>}
          {record.status === 'inactive' && <Tag color="default">Inactivo</Tag>}
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Administrador' : 'Usuario'}
        </Tag>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? 'Activo' : 'Inactivo'}
        </Tag>
      )
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => editUser(record)}
          >
            Editar
          </Button>
          {record.role !== 'admin' && (
            <Popconfirm
              title={`¿${record.status === 'active' ? 'Desactivar' : 'Activar'} usuario?`}
              description={`Esta acción ${record.status === 'active' ? 'desactivará' : 'activará'} al usuario ${record.name}`}
              onConfirm={() => toggleUserStatus(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                size="small" 
                type={record.status === 'active' ? 'default' : 'primary'}
              >
                {record.status === 'active' ? 'Desactivar' : 'Activar'}
              </Button>
            </Popconfirm>
          )}
          {record.role !== 'admin' && (
            <Popconfirm
              title="¿Eliminar usuario permanentemente?"
              description="Esta acción no se puede deshacer y eliminará todas las evaluaciones del usuario"
              onConfirm={() => deleteUser(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button 
                size="small" 
                danger 
                icon={<DeleteOutlined />}
              >
                Eliminar
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // Columnas para la tabla de evaluaciones
  const evaluationColumns = [
    {
      title: 'Proyecto',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Evaluador',
      dataIndex: 'evaluator',
      key: 'evaluator',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Puntuación Total',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: (score) => (
        <Tag color={
          score >= 20 ? 'green' : 
          score >= 15 ? 'orange' : 
          score >= 10 ? 'yellow' : 'red'
        }>
          {score}/25
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => viewEvaluation(record)}
          >
            Ver Detalles
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => editEvaluation(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar evaluación?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => deleteEvaluation(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Funciones CRUD para usuarios
  const showAddUserModal = () => {
    setEditingUser(null);
    userForm.resetFields();
    setUserModalVisible(true);
  };

  const editUser = (user) => {
    setEditingUser(user);
    userForm.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
    setUserModalVisible(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userForm.validateFields();
      
      if (editingUser) {
        // Editar usuario existente
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...values }
            : user
        );
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        message.success('Usuario actualizado correctamente');
      } else {
        // Agregar nuevo usuario
        const newUser = {
          id: Date.now(),
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status,
          createdAt: new Date().toISOString()
        };
        
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        message.success('Usuario agregado correctamente');
      }
      
      setUserModalVisible(false);
      userForm.resetFields();
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error al validar formulario:', error);
    }
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    message.success('Estado del usuario actualizado correctamente');
  };

  const deleteUser = (userId) => {
    // Eliminar también las evaluaciones del usuario
    const userToDelete = users.find(user => user.id === userId);
    const updatedEvaluations = evaluations.filter(
      evaluation => evaluation.evaluator !== userToDelete.name
    );
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    setEvaluations(updatedEvaluations);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    
    message.success('Usuario eliminado correctamente');
  };

  // Funciones CRUD para evaluaciones
  const viewEvaluation = (evaluation) => {
    setViewingEvaluation(evaluation);
    setEvalModalVisible(true);
  };

  const editEvaluation = (evaluation) => {
    evalForm.setFieldsValue({
      projectName: evaluation.projectName,
      evaluator: evaluation.evaluator,
      totalScore: evaluation.totalScore,
      comments: evaluation.comments,
      ...evaluation.scores
    });
    setViewingEvaluation(evaluation);
    setEvalModalVisible(true);
  };

  const handleSaveEvaluation = async () => {
    try {
      const values = await evalForm.validateFields();
      const { projectName, evaluator, comments, ...scores } = values;
      
      const totalScore = Object.values(scores).reduce((sum, score) => sum + (score || 0), 0);
      
      if (viewingEvaluation) {
        // Editar evaluación existente
        const updatedEvaluation = {
          ...viewingEvaluation,
          projectName,
          evaluator,
          totalScore,
          comments,
          scores,
          date: new Date().toISOString()
        };
        
        const updatedEvaluations = evaluations.map(evaluation  => 
          eval.id === viewingEvaluation.id ? updatedEvaluation : eval
        );
        setEvaluations(updatedEvaluations);
        localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
        message.success('Evaluación actualizada correctamente');
      }
      
      setEvalModalVisible(false);
      evalForm.resetFields();
      setViewingEvaluation(null);
      
    } catch (error) {
      console.error('Error al validar formulario:', error);
    }
  };

  const deleteEvaluation = (evaluationId) => {
    const updatedEvaluations = evaluations.filter(evaluation => evaluation.id !== evaluationId);
    setEvaluations(updatedEvaluations);
    localStorage.setItem('evaluations', JSON.stringify(updatedEvaluations));
    message.success('Evaluación eliminada correctamente');
  };

  // Estadísticas
  const totalUsers = users.length;
  const totalAdmins = users.filter(user => user.role === 'admin').length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const totalEvaluations = evaluations.length;
  const avgScore = evaluations.length > 0 
    ? (evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length).toFixed(1)
    : 0;

  const criteriaList = [
    { key: 'functionality', name: 'Funcionalidad' },
    { key: 'reliability', name: 'Confiabilidad' },
    { key: 'usability', name: 'Usabilidad' },
    { key: 'efficiency', name: 'Eficiencia' },
    { key: 'maintainability', name: 'Mantenibilidad' }
  ];

  return (
    <div>
      {/* Modal para Usuarios */}
      <Modal
        title={editingUser ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
        open={userModalVisible}
        onOk={handleSaveUser}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
          userForm.resetFields();
        }}
        okText={editingUser ? 'Actualizar' : 'Agregar'}
        cancelText="Cancelar"
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          name="userForm"
        >
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[
              { required: true, message: 'Por favor ingrese el nombre del usuario' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ]}
          >
            <Input placeholder="Ej: Juan Pérez" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Por favor ingrese un email válido' }
            ]}
          >
            <Input placeholder="Ej: usuario@evaliq.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
          >
            <Select placeholder="Seleccione el rol">
              <Option value="user">Usuario</Option>
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
          >
            <Select placeholder="Seleccione el estado">
              <Option value="active">Activo</Option>
              <Option value="inactive">Inactivo</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Evaluaciones */}
      <Modal
        title={viewingEvaluation ? 'Editar Evaluación' : 'Detalles de Evaluación'}
        open={evalModalVisible}
        onOk={viewingEvaluation ? handleSaveEvaluation : () => setEvalModalVisible(false)}
        onCancel={() => {
          setEvalModalVisible(false);
          setViewingEvaluation(null);
          evalForm.resetFields();
        }}
        okText={viewingEvaluation ? 'Actualizar' : 'Cerrar'}
        cancelText="Cancelar"
        width={800}
        okButtonProps={viewingEvaluation ? {} : { style: { display: 'none' } }}
      >
        {viewingEvaluation && (
          <Form
            form={evalForm}
            layout="vertical"
            name="evalForm"
            disabled={!viewingEvaluation}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="projectName"
                  label="Nombre del Proyecto"
                  rules={[{ required: true, message: 'Ingrese el nombre del proyecto' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="evaluator"
                  label="Evaluador"
                  rules={[{ required: true, message: 'Ingrese el nombre del evaluador' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="comments"
              label="Comentarios"
            >
              <TextArea rows={3} />
            </Form.Item>

            {viewingEvaluation && (
              <>
                <Descriptions title="Puntuaciones por Criterio" size="small" column={2}>
                  {criteriaList.map(criterion => (
                    <Descriptions.Item key={criterion.key} label={criterion.name}>
                      <Form.Item
                        name={criterion.key}
                        style={{ margin: 0 }}
                      >
                        <InputNumber 
                          min={0} 
                          max={5} 
                          style={{ width: '80px' }}
                        />
                      </Form.Item>
                    </Descriptions.Item>
                  ))}
                </Descriptions>
                <Form.Item
                  name="totalScore"
                  label="Puntuación Total"
                >
                  <InputNumber disabled style={{ width: '100px' }} />
                </Form.Item>
              </>
            )}
          </Form>
        )}
      </Modal>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Usuarios"
              value={totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Usuarios Activos"
              value={activeUsers}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Evaluaciones"
              value={totalEvaluations}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small">
            <Statistic
              title="Puntuación Promedio"
              value={avgScore}
              suffix="/25"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Usuarios */}
      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>Gestión de Usuarios ({users.length})</span>
          </Space>
        } 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={showAddUserModal}
          >
            Agregar Usuario
          </Button>
        }
      >
        <Table
          columns={userColumns}
          dataSource={users}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          rowKey="id"
        />
      </Card>

      {/* Tabla de Evaluaciones */}
      <Card 
        title={
          <Space>
            <BarChartOutlined />
            <span>Gestión de Evaluaciones ({evaluations.length})</span>
          </Space>
        }
      >
        <Table
          columns={evaluationColumns}
          dataSource={evaluations.map((evaluation, index) => ({ ...evaluation, key: index }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default AdminTable;