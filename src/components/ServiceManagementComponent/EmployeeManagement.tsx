import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Form, Input, InputNumber, Button, Table, Space, Modal, Card, Tabs, TimePicker, Checkbox, Popconfirm, message, Select } from 'antd';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EmployeeManagement = () => {
  const { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    services 
  } = useModel('ServiceManagement.appointment');
  
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [scheduleForm] = Form.useForm();

  // Reset form when modal is closed
  useEffect(() => {
    if (!isModalVisible) {
      form.resetFields();
      setEditingEmployee(null);
    }
  }, [isModalVisible, form]);

  // Set schedule form values when editing an employee
  useEffect(() => {
    if (editingEmployee && editingEmployee.lichLamViec) {
      const scheduleValues = {};
      
      weekDays.forEach(day => {
        const schedule = editingEmployee.lichLamViec[day];
        if (schedule) {
          scheduleValues[`${day}_enabled`] = true;
          scheduleValues[`${day}_start`] = moment(schedule.start, 'HH:mm');
          scheduleValues[`${day}_end`] = moment(schedule.end, 'HH:mm');
        } else {
          scheduleValues[`${day}_enabled`] = false;
        }
      });
      
      scheduleForm.setFieldsValue(scheduleValues);
    } else {
      // Default schedule (Monday-Friday, 9am-5pm)
      const defaultSchedule = {};
      weekDays.forEach(day => {
        const isWeekday = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day);
        defaultSchedule[`${day}_enabled`] = isWeekday;
        defaultSchedule[`${day}_start`] = moment('09:00', 'HH:mm');
        defaultSchedule[`${day}_end`] = moment('17:00', 'HH:mm');
      });
      
      scheduleForm.setFieldsValue(defaultSchedule);
    }
  }, [editingEmployee, scheduleForm]);

  const showAddModal = () => {
    setEditingEmployee(null);
    setIsModalVisible(true);
  };

//   const showEditModal = (employee) => {
//     setEditingEmployee(employee);
//     form.setFieldsValue({
//       name: employee.name,
//       age: employee.age,
//       sokhach: employee.sokhach || 10,
//       services: employee.services || []
//     });
//     setIsModalVisible(true);
//   };
const showEditModal = (employee) => {
    setEditingEmployee(employee);
  
    form.setFieldsValue({
      name: employee.name,
      age: employee.age,
      sokhach: employee.sokhach || 10,
      services: employee.services || [],
    });
  
    const scheduleValues = {};
    weekDays.forEach(day => {
      const schedule = employee.lichLamViec?.[day];
      if (schedule) {
        scheduleValues[`${day}_enabled`] = true;
        scheduleValues[`${day}_start`] = moment(schedule.start, 'HH:mm');
        scheduleValues[`${day}_end`] = moment(schedule.end, 'HH:mm');
      } else {
        scheduleValues[`${day}_enabled`] = false;
      }
    });
  
    scheduleForm.setFieldsValue(scheduleValues);
    setIsModalVisible(true);
  };
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (employeeId) => {
    deleteEmployee(employeeId);
    message.success('Employee deleted successfully');
  };

//   const onFinish = (values) => {
//     // Get schedule from the scheduleForm
//     const scheduleValues = scheduleForm.getFieldsValue();
//     const lichLamViec = {};
    
//     weekDays.forEach(day => {
//       if (scheduleValues[`${day}_enabled`]) {
//         lichLamViec[day] = {
//           start: scheduleValues[`${day}_start`].format('HH:mm'),
//           end: scheduleValues[`${day}_end`].format('HH:mm')
//         };
//       }
//     });
    
//     const employeeData = {
//       ...values,
//       lichLamViec,
//       services: values.services || []  // Ensure services array exists
//     };
    
//     if (editingEmployee) {
//       // Update existing employee
//       updateEmployee({
//         ...editingEmployee,
//         ...employeeData
//       });
//       message.success('Employee updated successfully');
//     } else {
//       // Add new employee
//       addEmployee({
//         ...employeeData,
//         employee_id: Date.now() // Simple ID generation
//       });
//       message.success('Employee added successfully');
//     }
    
//     setIsModalVisible(false);
//   };

const onFinish = (values) => {
    const scheduleValues = scheduleForm.getFieldsValue();
    const lichLamViec = {};
  
    weekDays.forEach(day => {
      if (scheduleValues[`${day}_enabled`]) {
        lichLamViec[day] = {
          start: scheduleValues[`${day}_start`]?.format('HH:mm') || '09:00',
          end: scheduleValues[`${day}_end`]?.format('HH:mm') || '17:00',
        };
      }
    });
  
    console.log("Saving Employee Data:", { ...values, lichLamViec });
  
    const employeeData = {
      ...values,
      lichLamViec,
      services: values.services || []
    };
  
    if (editingEmployee) {
      updateEmployee({ ...editingEmployee, ...employeeData });
      message.success('Employee updated successfully');
    } else {
      addEmployee({ ...employeeData, employee_id: Date.now() });
      message.success('Employee added successfully');
    }
  
    setIsModalVisible(false);
  };
  

  // Helper function to get service names
  const getServiceNames = (serviceIds) => {
    if (!serviceIds || !serviceIds.length) return 'No services assigned';
    
    return serviceIds.map(id => {
      const service = services.find(s => s.dichvu_id === id);
      return service ? service.name : `Unknown (${id})`;
    }).join(', ');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: 'Services',
      key: 'services',
      render: (_, record) => getServiceNames(record.services),
    },
    {
      title: 'Max Clients Per Day',
      dataIndex: 'sokhach',
      key: 'sokhach',
      render: (sokhach) => sokhach || 'Unlimited',
    },
    {
      title: 'Work Schedule',
      key: 'schedule',
      render: (_, record) => {
        if (!record.lichLamViec) return 'No schedule set';
        
        return (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {Object.entries(record.lichLamViec).map(([day, hours]) => (
              <li key={day}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {hours.start} - {hours.end}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record.employee_id)}
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
      <h1>Employee Management</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showAddModal}>
          Add New Employee
        </Button>
      </Card>
      
      <Table 
        dataSource={employees} 
        columns={columns} 
        rowKey="employee_id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingEmployee ? "Edit Employee" : "Add New Employee"}
        visible={isModalVisible}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => {
            // Submit both forms
            form.submit();
          }}>
            {editingEmployee ? 'Update' : 'Add'}
          </Button>,
        ]}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Basic Information" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter employee name' }]}
              >
                <Input placeholder="Employee name" />
              </Form.Item>
              
              <Form.Item
                name="age"
                label="Age"
                rules={[{ required: true, message: 'Please enter employee age' }]}
              >
                <InputNumber min={18} max={100} style={{ width: '100%' }} placeholder="Employee age" />
              </Form.Item>
              
              <Form.Item
                name="services"
                label="Services Provided"
                rules={[{ required: true, message: 'Please select at least one service' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select services this employee provides"
                  style={{ width: '100%' }}
                >
                  {services.map(service => (
                    <Option key={service.dichvu_id} value={service.dichvu_id}>
                      {service.name} - ${service.price} ({service.thoiGianThucHien || 60} mins)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="sokhach"
                label="Maximum Clients Per Day"
                tooltip="Leave empty for unlimited clients"
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Maximum clients per day" />
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Work Schedule" key="2">
            <Form
              form={scheduleForm}
              layout="vertical"
            >
              {weekDays.map(day => (
                <Card 
                  key={day} 
                  title={day.charAt(0).toUpperCase() + day.slice(1)} 
                  size="small" 
                  style={{ marginBottom: 10 }}
                >
                  <Form.Item name={`${day}_enabled`} valuePropName="checked">
                    <Checkbox>Working day</Checkbox>
                  </Form.Item>
                  
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => {
                      const isEnabled = getFieldValue(`${day}_enabled`);
                      return (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <Form.Item
                            name={`${day}_start`}
                            label="Start time"
                            style={{ marginBottom: 0, flex: 1 }}
                          >
                            <TimePicker 
                              format="HH:mm" 
                              style={{ width: '100%' }} 
                              disabled={!isEnabled}
                            />
                          </Form.Item>
                          
                          <Form.Item
                            name={`${day}_end`}
                            label="End time"
                            style={{ marginBottom: 0, flex: 1 }}
                          >
                            <TimePicker 
                              format="HH:mm" 
                              style={{ width: '100%' }} 
                              disabled={!isEnabled}
                            />
                          </Form.Item>
                        </div>
                      );
                    }}
                  </Form.Item>
                </Card>
              ))}
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;