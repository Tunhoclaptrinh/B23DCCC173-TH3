import React, { useState, useEffect } from 'react';
import { useModel, history } from 'umi';
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
  Tag,
} from 'antd';
import moment from 'moment';



const { Option } = Select;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Approval', color: 'orange' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
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
    addUser,
  } = useModel('ServiceManagement.appointment');

  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<DichVu.LichHen | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<DichVu.NhanVien[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isStatusUpdateMode, setIsStatusUpdateMode] = useState(false);
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);

  // Sync localStorage with model data on mount
  useEffect(() => {
    const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
    const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');

    if (storedAppointments.length > 0 && appointments.length === 0) {
      storedAppointments.forEach((app: DichVu.LichHen) => addAppointment(app));
    }
    if (storedUsers.length > 0 && users.length === 0) {
      storedUsers.forEach((user: DichVu.User) => addUser(user));
    }
    // Services and employees are assumed to be initialized in the model
  }, [appointments, users, addAppointment, addUser]);

  // Reset form and state when modal closes
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

  // Handle service selection
  const handleServiceChange = (dichvu_id: number) => {
    setSelectedService(dichvu_id);
    const eligibleEmployees = getEmployeesByService(dichvu_id);
    setAvailableEmployees(eligibleEmployees);
    form.setFieldsValue({ employee_id: undefined });
  };

  // Handle date selection
  const handleDateChange = (date: moment.Moment | null) => {
    const formattedDate = date ? date.format('YYYY-MM-DD') : null;
    setSelectedDate(formattedDate);
    form.setFieldsValue({ employee_id: undefined, time: undefined });
  };

  // Toggle new customer mode
  const toggleNewCustomerMode = () => {
    setIsNewCustomerMode(!isNewCustomerMode);
    if (!isNewCustomerMode) {
      form.setFieldsValue({ user_id: undefined });
    } else {
      form.setFieldsValue({
        new_customer_name: undefined,
        new_customer_age: undefined,
        new_customer_gender: undefined,
      });
    }
  };

  // Show add modal
  const showAddModal = () => {
    setEditingAppointment(null);
    setIsStatusUpdateMode(false);
    setIsNewCustomerMode(false);
    form.resetFields();
    form.setFieldsValue({ date: moment(), status: 'pending' });
    setIsModalVisible(true);
  };

  // Show edit modal
  const showEditModal = (appointment: DichVu.LichHen) => {
    setEditingAppointment(appointment);
    setIsStatusUpdateMode(false);
    setIsNewCustomerMode(false);
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
      status: appointment.status || 'pending',
    });
    setIsModalVisible(true);
  };

  // Show status update modal
  const showStatusUpdateModal = (appointment: DichVu.LichHen) => {
    setEditingAppointment(appointment);
    setIsStatusUpdateMode(true);
    form.setFieldsValue({ status: appointment.status || 'pending' });
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Handle appointment deletion
  const handleDelete = (appointmentId: number) => {
    deleteAppointment(appointmentId);
    message.success('Appointment deleted successfully');
  };

  // Handle completing an appointment
  const handleCompleteAppointment = (appointment: DichVu.LichHen) => {
    const updatedAppointment: DichVu.LichHen = { ...appointment, status: 'completed' };
    updateAppointment(updatedAppointment);

    const reviewData: DichVu.Review = {
      review_id: Date.now(),
      review: '',
      rating: 0,
      employee_id: appointment.employee_id,
      user_id: appointment.user_id,
      dichvu_id: appointment.dichvu_id,
      create_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      appointment_id: appointment.lichhen_id,
    };

    const existingReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    existingReviews.push(reviewData);
    localStorage.setItem('reviews', JSON.stringify(existingReviews));

    message.success('Appointment completed. Redirecting to Reviews...');
    history.push('/reviews');
  };

  // Handle form submission
  const onFinish = (values: any) => {
    if (isStatusUpdateMode && editingAppointment) {
      const updatedAppointment: DichVu.LichHen = { ...editingAppointment, status: values.status };
      if (values.status === 'completed') {
        handleCompleteAppointment(updatedAppointment);
      } else {
        updateAppointment(updatedAppointment);
        message.success('Appointment status updated successfully');
      }
      setIsModalVisible(false);
      return;
    }

    let userId = values.user_id;
    if (isNewCustomerMode && values.new_customer_name) {
      const newUser: DichVu.User = {
        user_id: Date.now(),
        name: values.new_customer_name,
        age: values.new_customer_age || 0,
        gender: values.new_customer_gender,
      };
      addUser(newUser);
      userId = newUser.user_id;
      message.success('New customer created successfully');
    }

    const formattedDate = values.date.format('YYYY-MM-DD');
    const formattedTime = values.time.format('HH:mm');
    const selectedServiceData = services.find((s) => s.dichvu_id === values.dichvu_id);
    const duration = selectedServiceData?.thoiGianThucHien || 60;

    if (!canEmployeeProvideService(values.employee_id, values.dichvu_id)) {
      message.error('This employee cannot provide the selected service');
      return;
    }

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

    const appointmentData: DichVu.LichHen = {
      lichhen_id: editingAppointment ? editingAppointment.lichhen_id : Date.now(),
      date: formattedDate,
      time: formattedTime,
      dichvu_id: values.dichvu_id,
      employee_id: values.employee_id,
      user_id: userId,
      status: values.status || 'pending',
    };

    if (editingAppointment) {
      if (values.status === 'completed') {
        handleCompleteAppointment(appointmentData);
      } else {
        updateAppointment(appointmentData);
        message.success('Appointment updated successfully');
      }
    } else {
      addAppointment(appointmentData);
      message.success('Appointment created successfully');
    }
    setIsModalVisible(false);
  };

  // Check employee availability
  const isEmployeeAvailable = (employeeId: number): boolean => {
    if (!selectedDate) return true;
    const employee = employees.find((e) => e.employee_id === employeeId);
    if (!employee || !employee.lichLamViec) return true;
    const dayOfWeek = moment(selectedDate).format('dddd').toLowerCase();
    return !!employee.lichLamViec[dayOfWeek];
  };

  // Format employee option text
  const formatEmployeeOption = (employee: DichVu.NhanVien): string => {
    const isAvailable = isEmployeeAvailable(employee.employee_id);
    return `${employee.name}${isAvailable ? '' : ' (Not scheduled this day)'}`;
  };

  // Table columns
  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a: DichVu.LichHen, b: DichVu.LichHen) => new Date(a.date).getTime() - new Date(b.date).getTime() },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    {
      title: 'Service',
      key: 'service',
      render: (_: any, record: DichVu.LichHen) => services.find((s) => s.dichvu_id === record.dichvu_id)?.name || 'Unknown Service',
    },
    {
      title: 'Client',
      key: 'client',
      render: (_: any, record: DichVu.LichHen) => users.find((u) => u.user_id === record.user_id)?.name || 'Unknown Client',
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_: any, record: DichVu.LichHen) => employees.find((e) => e.employee_id === record.employee_id)?.name || 'Unknown Employee',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: DichVu.LichHen) => {
        const status = STATUS_OPTIONS.find((s) => s.value === (record.status || 'pending'));
        return <Tag color={status?.color || 'default'}>{status?.label || 'Pending'}</Tag>;
      },
      filters: STATUS_OPTIONS.map((status) => ({ text: status.label, value: status.value })),
      onFilter: (value: string, record: DichVu.LichHen) => record.status === value || (!record.status && value === 'pending'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DichVu.LichHen) => (
        <Space size="middle">
          <Button type="link" onClick={() => showStatusUpdateModal(record)}>
            Update Status
          </Button>
          <Button type="link" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this appointment?"
            onConfirm={() => handleDelete(record.lichhen_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
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
      <Table dataSource={appointments} columns={columns} rowKey="lichhen_id" pagination={{ pageSize: 10 }} />
      <Modal
        title={isStatusUpdateMode ? 'Update Appointment Status' : editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {isStatusUpdateMode ? 'Update Status' : editingAppointment ? 'Update Appointment' : 'Create Appointment'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {!isStatusUpdateMode && (
            <>
              {!isNewCustomerMode ? (
                <Form.Item
                  name="user_id"
                  label="Client"
                  rules={[{ required: !isNewCustomerMode, message: 'Please select a client' }]}
                >
                  <Select
                    placeholder="Select client"
                    showSearch
                    optionFilterProp="children"
                    dropdownRender={(menu) => (
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
                    {users.map((user) => (
                      <Option key={user.user_id} value={user.user_id}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Button type="link" onClick={toggleNewCustomerMode}>
                      Back to Customer Selection
                    </Button>
                  </div>
                  <Form.Item
                    name="new_customer_name"
                    label="Customer Name"
                    rules={[{ required: isNewCustomerMode, message: 'Please enter customer name' }]}
                  >
                    <Input placeholder="Enter customer name" />
                  </Form.Item>
                  <Form.Item name="new_customer_age" label="Customer Age">
                    <Input type="number" placeholder="Enter age" />
                  </Form.Item>
                  <Form.Item name="new_customer_gender" label="Customer Gender">
                    <Select placeholder="Select gender">
                      <Option value="male">Male</Option>
                      <Option value="female">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </>
              )}
              <Form.Item name="dichvu_id" label="Service" rules={[{ required: true, message: 'Please select a service' }]}>
                <Select placeholder="Select service" onChange={handleServiceChange}>
                  {services.map((service) => (
                    <Option key={service.dichvu_id} value={service.dichvu_id}>
                      {service.name} - ${service.price} ({service.thoiGianThucHien || 60} mins)
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                  onChange={handleDateChange}
                />
              </Form.Item>
              <Form.Item name="employee_id" label="Employee" rules={[{ required: true, message: 'Please select an employee' }]}>
                <Select placeholder="Select employee" disabled={!selectedService}>
                  {availableEmployees.map((employee) => (
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
              <Form.Item name="time" label="Time" rules={[{ required: true, message: 'Please select a time' }]}>
                <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
              </Form.Item>
            </>
          )}
          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select a status' }]}>
            <Select placeholder="Select status">
              {STATUS_OPTIONS.map((status) => (
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