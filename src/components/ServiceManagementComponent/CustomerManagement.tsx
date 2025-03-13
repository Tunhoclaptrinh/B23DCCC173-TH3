import React, { useState } from 'react';
import { useModel } from 'umi';
import { Form, Input, InputNumber, Button, Table, Space, Modal, Card, Select, Popconfirm, message } from 'antd';

const { Option } = Select;

const CustomerManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useModel('ServiceManagement.appointment');

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      age: user.age,
      gender: user.gender || undefined,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFinish = (values) => {
    if (editingUser) {
      updateUser({ user_id: editingUser.user_id, ...values });
      message.success('Cập nhật khách hàng thành công!');
    } else {
      const newUser = { user_id: Date.now(), ...values }; // Chỉ lưu ID
      addUser(newUser);
      message.success('Thêm khách hàng mới thành công!');
    }
    setIsModalVisible(false);
  };

  const handleDelete = (user_id) => {
    deleteUser(user_id);
    message.success('Xóa khách hàng thành công!');
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tuổi',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (gender === 'male' ? 'Nam' : 'Nữ'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showEditModal(record)}>Sửa</Button>
          <Popconfirm title="Bạn có chắc muốn xóa?" onConfirm={() => handleDelete(record.user_id)}>
            <Button type="danger">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Quản lý khách hàng">
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>
        Thêm khách hàng
      </Button>
      <Table dataSource={users} columns={columns} rowKey="user_id" />
      <Modal
        title={editingUser ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="age" label="Tuổi" rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}> 
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}> 
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Cập nhật' : 'Thêm'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CustomerManagement;