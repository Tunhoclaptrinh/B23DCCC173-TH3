import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { 
  Form, 
  Input, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Card, 
  DatePicker, 
  TimePicker, 
  Select, 
  Popconfirm, 
  message, 
  Tag 
} from 'antd';
import moment from 'moment';

const { Option } = Select;

// Status options and colors
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Approval', color: 'orange' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

const AppointmentManagement = () => {
  const { 
    appointments, 
    services, 
    users, 
    employees, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    getEmployeesByService,
    checkAppointmentConflict,
    canEmployeeProvideService,
    addUser  // Added to be able to create users if needed
  } = useModel('ServiceManagement.appointment');
  
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isStatusUpdateMode, setIsStatusUpdateMode] = useState(false);
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isModalVisible) {
      form.resetFields();
      setEditingAppointment(null);
      setSelectedService(null);
      setSelectedDate(null);
      setAvailableEmployees([]);
      setIsStatusUpdateMode(false);
      setIsNewCustomerMode(false);
    }
  }, [isModalVisible, form]);

  // Handle service selection to filter available employees
  const handleServiceChange = (serviceId) => {
    setSelectedService(serviceId);
    
    // Get employees who can provide this service
    const eligibleEmployees = getEmployeesByService(serviceId);
    setAvailableEmployees(eligibleEmployees);
    
    // Clear employee selection if previously selected
    form.setFieldsValue({ employee_id: undefined });
  };

  // Handle date selection to validate employee availability for the day
  const handleDateChange = (date) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : null;
    setSelectedDate(formattedDate);
    
    // Clear employee selection and time when date changes
    form.setFieldsValue({ 
      employee_id: undefined,
      time: undefined 
    });
  };

  // Toggle new customer form
  const toggleNewCustomerMode = () => {
    setIsNewCustomerMode(!isNewCustomerMode);
    if (!isNewCustomerMode) {
      form.setFieldsValue({ user_id: undefined });
    } else {
      form.setFieldsValue({ 
        new_customer_name: undefined,
        new_customer_age: undefined,
        new_customer_gender: undefined
      });
    }
  };

  // Show modal to add a new appointment
  const showAddModal = () => {
    setEditingAppointment(null);
    setIsStatusUpdateMode(false);
    setIsNewCustomerMode(false);
    form.resetFields();
    form.setFieldsValue({
      date: moment(),
      status: 'pending'
    });
    setIsModalVisible(true);
  };

  // Show modal to edit an existing appointment
  const showEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setIsStatusUpdateMode(false);
    setIsNewCustomerMode(false);
    
    // Get employees who can provide this service
    const serviceId = appointment.dichvu_id;
    const eligibleEmployees = getEmployeesByService(serviceId);
    setAvailableEmployees(eligibleEmployees);
    setSelectedService(serviceId);
    setSelectedDate(appointment.date);
    
    form.setFieldsValue({
      user_id: appointment.user_id,
      dichvu_id: appointment.dichvu_id,
      employee_id: appointment.employee_id,
      date: moment(appointment.date),
      time: moment(appointment.time, 'HH:mm'),
      status: appointment.status || 'pending'
    });
    
    setIsModalVisible(true);
  };

  // Show modal to just update status
  const showStatusUpdateModal = (appointment) => {
    setEditingAppointment(appointment);
    setIsStatusUpdateMode(true);
    
    form.setFieldsValue({
      status: appointment.status || 'pending'
    });
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (appointmentId) => {
    deleteAppointment(appointmentId);
    message.success('Appointment deleted successfully');
  };

  // Handle form submission
  const onFinish = (values) => {
    // If only updating status
    if (isStatusUpdateMode && editingAppointment) {
      const updatedAppointment = {
        ...editingAppointment,
        status: values.status
      };
      
      updateAppointment(updatedAppointment);
      message.success('Appointment status updated successfully');
      setIsModalVisible(false);
      return;
    }
    
    let userId = values.user_id;
    
    // If creating a new customer
    if (isNewCustomerMode && values.new_customer_name) {
      const newUser = {
        user_id: Date.now(), // Simple ID generation
        name: values.new_customer_name,
        age: values.new_customer_age || 0,
        gender: values.new_customer_gender
      };
      
      const addedUser = addUser(newUser);
      userId = addedUser.user_id;
      message.success('New customer created successfully');
    }
    
    const formattedDate = values.date.format('YYYY-MM-DD');
    const formattedTime = values.time.format('HH:mm');
    
    // Get service duration for conflict check
    const selectedServiceData = services.find(s => s.dichvu_id === values.dichvu_id);
    const duration = selectedServiceData?.thoiGianThucHien || 60;
    
    // Check if employee can provide this service
    if (!canEmployeeProvideService(values.employee_id, values.dichvu_id)) {
      message.error('This employee cannot provide the selected service');
      return;
    }
    
    // Check for appointment conflicts
    const hasConflict = checkAppointmentConflict(
      values.employee_id,
      formattedDate,
      formattedTime,
      duration,
      editingAppointment?.lichhen_id
    );
    
    if (hasConflict) {
      message.error('This time slot conflicts with an existing appointment');
      return;
    }
    
    const appointmentData = {
      date: formattedDate,
      time: formattedTime,
      dichvu_id: values.dichvu_id,
      employee_id: values.employee_id,
      user_id: userId,
      status: values.status || 'pending',
    };
    
    if (editingAppointment) {
      // Update existing appointment
      updateAppointment({
        ...editingAppointment,
        ...appointmentData
      });
      message.success('Appointment updated successfully');
    } else {
      // Add new appointment
      addAppointment({
        ...appointmentData,
        lichhen_id: Date.now() // Simple ID generation
      });
      message.success('Appointment created successfully');
    }
    
    setIsModalVisible(false);
  };

  // Check if employee is available on selected date
  const isEmployeeAvailable = (employeeId) => {
    if (!selectedDate) return true;
    
    const employee = employees.find(e => e.employee_id === employeeId);
    if (!employee || !employee.lichLamViec) return true;
    
    // Get day of week from selected date
    const dayOfWeek = moment(selectedDate).format('dddd').toLowerCase();
    
    // Check if employee works on this day
    return !!employee.lichLamViec[dayOfWeek];
  };

  // Format employee name with availability
  const formatEmployeeOption = (employee) => {
    const isAvailable = isEmployeeAvailable(employee.employee_id);
    return `${employee.name}${isAvailable ? '' : ' (Not scheduled this day)'}`;
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => {
        const service = services.find(s => s.dichvu_id === record.dichvu_id);
        return service ? service.name : 'Unknown Service';
      },
    },
    {
      title: 'Client',
      key: 'client',
      render: (_, record) => {
        const user = users.find(u => u.user_id === record.user_id);
        return user ? user.name : 'Unknown Client';
      },
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => {
        const employee = employees.find(e => e.employee_id === record.employee_id);
        return employee ? employee.name : 'Unknown Employee';
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = STATUS_OPTIONS.find(s => s.value === (record.status || 'pending'));
        return <Tag color={status?.color || 'default'}>{status?.label || 'Pending'}</Tag>;
      },
      filters: STATUS_OPTIONS.map(status => ({ text: status.label, value: status.value })),
      onFilter: (value, record) => record.status === value || (!record.status && value === 'pending'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => showStatusUpdateModal(record)}
          >
            Update Status
          </Button>
          <Button 
            type="link" 
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this appointment?"
            onConfirm={() => handleDelete(record.lichhen_id)}
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
      <h1>Appointment Management</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={showAddModal}>
          Create New Appointment
        </Button>
      </Card>
      
      <Table 
        dataSource={appointments} 
        columns={columns} 
        rowKey="lichhen_id"
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={
          isStatusUpdateMode 
            ? "Update Appointment Status" 
            : (editingAppointment ? "Edit Appointment" : "Create New Appointment")
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {isStatusUpdateMode 
              ? 'Update Status' 
              : (editingAppointment ? 'Update Appointment' : 'Create Appointment')
            }
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {!isStatusUpdateMode && (
            <>
              {!isNewCustomerMode ? (
                <>
                  <Form.Item
                    name="user_id"
                    label="Client"
                    rules={[{ required: !isNewCustomerMode, message: 'Please select a client' }]}
                  >
                    <Select 
                      placeholder="Select client"
                      dropdownRender={menu => (
                        <>
                          {menu}
                          <div style={{ padding: '8px', borderTop: '1px solid #e8e8e8' }}>
                            <Button type="link" onClick={toggleNewCustomerMode}>
                              + Add New Customer
                            </Button>
                          </div>
                        </>
                      )}
                    >
                      {users.map(user => (
                        <Option key={user.user_id} value={user.user_id}>
                          {user.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button type="link" onClick={toggleNewCustomerMode}>
                      &lt; Back to Customer Selection
                    </Button>
                  </div>
                  <Form.Item
                    name="new_customer_name"
                    label="Customer Name"
                    rules={[{ required: isNewCustomerMode, message: 'Please enter customer name' }]}
                  >
                    <Input placeholder="Enter customer name" />
                  </Form.Item>
                  <Form.Item
                    name="new_customer_age"
                    label="Customer Age"
                  >
                    <Input type="number" placeholder="Enter age" />
                  </Form.Item>
                  <Form.Item
                    name="new_customer_gender"
                    label="Customer Gender"
                  >
                    <Select placeholder="Select gender">
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </>
              )}
              
              <Form.Item
                name="dichvu_id"
                label="Service"
                rules={[{ required: true, message: 'Please select a service' }]}
              >
                <Select 
                  placeholder="Select service"
                  onChange={handleServiceChange}
                >
                  {services.map(service => (
                    <Option key={service.dichvu_id} value={service.dichvu_id}>
                      {service.name} - ${service.price} ({service.thoiGianThucHien || 60} mins)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select a date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabledDate={current => current && current < moment().startOf('day')}
                  onChange={handleDateChange}
                />
              </Form.Item>
              
              <Form.Item
                name="employee_id"
                label="Employee"
                rules={[{ required: true, message: 'Please select an employee' }]}
              >
                <Select 
                  placeholder="Select employee"
                  disabled={!selectedService}
                >
                  {availableEmployees.map(employee => (
                    <Option 
                      key={employee.employee_id} 
                      value={employee.employee_id}
                      disabled={!isEmployeeAvailable(employee.employee_id)}
                    >
                      {formatEmployeeOption(employee)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="time"
                label="Time"
                rules={[{ required: true, message: 'Please select a time' }]}
              >
                <TimePicker 
                  format="HH:mm" 
                  style={{ width: '100%' }} 
                  minuteStep={15}
                />
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select status">
              {STATUS_OPTIONS.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentManagement;