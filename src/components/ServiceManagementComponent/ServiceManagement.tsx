import React, { useState } from 'react';
import { useModel } from 'umi';
import { Form, Input, InputNumber, Button, Table, Space, Modal, Card, Popconfirm, message } from 'antd';

const { TextArea } = Input;

const ServiceManagement = () => {
  const { services, addService, updateService, deleteService } = useModel('ServiceManagement.appointment');
  
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const showAddModal = () => {
    setEditingService(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (service) => {
    setEditingService(service);
    form.setFieldsValue({
      name: service.name,
      price: service.price,
      description: service.description || '',
      thoiGianThucHien: service.thoiGianThucHien || 60,
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (serviceId) => {
    deleteService(serviceId);
    message.success('Service deleted successfully');
  };

  const onFinish = (values) => {
    if (editingService) {
      // Update existing service
      updateService({
        ...editingService,
        ...values
      });
      message.success('Service updated successfully');
    } else {
      // Add new service
      addService({
        ...values,
        dichvu_id: Date.now() // Simple ID generation
      });
      message.success('Service added successfully');
    }
    
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Duration (minutes)',
      dataIndex: 'thoiGianThucHien',
      key: 'thoiGianThucHien',
      render: (duration) => duration || 60,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this service?"
            onConfirm={() => handleDelete(record.dichvu_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Service Management</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showAddModal}>
          Add New Service
        </Button>
      </Card>
      
      <Table 
        dataSource={services} 
        columns={columns} 
        rowKey="dichvu_id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingService ? "Edit Service" : "Add New Service"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingService ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="Service name" />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter service price' }]}
          >
            <InputNumber 
              min={0} 
              precision={2} 
              style={{ width: '100%' }} 
              placeholder="Service price"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            name="thoiGianThucHien"
            label="Duration (minutes)"
            rules={[{ required: true, message: 'Please enter service duration' }]}
            initialValue={60}
          >
            <InputNumber 
              min={5} 
              step={5} 
              style={{ width: '100%' }} 
              placeholder="Service duration in minutes"
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Service description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServiceManagement;