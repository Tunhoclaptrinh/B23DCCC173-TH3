import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Form, Select, DatePicker, TimePicker, Button, message, Card, List, Tag, Modal, Popconfirm } from 'antd';
import moment from 'moment';

const AppointmentScheduler: React.FC = () => {
  // Use the appointment model
  const { 
    users, employees, services, appointments, reviews,
    addAppointment, updateAppointment, deleteAppointment,
    checkAppointmentConflict, getEmployeesByService, canEmployeeProvideService
  } = useModel('ServiceManagement.appointment');

  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<DichVu.NhanVien[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<DichVu.LichHen | null>(null);

  // Filter available employees based on selected date and service
  useEffect(() => {
    if (selectedDate && selectedService) {
      const dayOfWeek = selectedDate.format('dddd').toLowerCase();
      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      const serviceProviders = getEmployeesByService(selectedService);
      
      const available = serviceProviders.filter(employee => {
        const hasWorkSchedule = employee.lichLamViec && 
                               employee.lichLamViec[dayOfWeek] && 
                               employee.lichLamViec[dayOfWeek].start && 
                               employee.lichLamViec[dayOfWeek].end;
        
        if (!hasWorkSchedule) {
          return false;
        }
        
        if (employee.sokhach) {
          const dailyAppointments = appointments.filter(
            app => app.employee_id === employee.employee_id && 
                   app.date === dateStr
          );
          
          if (dailyAppointments.length >= employee.sokhach) {
            return false;
          }
        }
        
        return true;
      });
      
      setAvailableEmployees(available);
    } else {
      setAvailableEmployees([]);
    }
  }, [selectedDate, selectedService, employees, appointments, services, getEmployeesByService]);
  
  // Handle form submission
  const handleSubmit = (values: any) => {
    console.log('Form values:', values); // Kiểm tra giá trị từ form

    const date = values.date.format('YYYY-MM-DD');
    const time = values.time.format('HH:mm');
    const service = services.find(s => s.dichvu_id === values.dichvu_id);
    const duration = service?.thoiGianThucHien || 60;
    console.log('Service duration:', duration); // Kiểm tra thời gian dịch vụ

    // Kiểm tra xung đột lịch hẹn
    const hasConflict = checkAppointmentConflict(
      values.employee_id,
      date,
      time,
      duration,
      editingAppointment?.lichhen_id
    );
    console.log('Has conflict:', hasConflict); // Kiểm tra có xung đột không

    if (hasConflict) {
      message.error('There is a scheduling conflict. Please select a different time.');
      return;
    }

    // Kiểm tra nhân viên có thể cung cấp dịch vụ không
    const canProvideService = canEmployeeProvideService(values.employee_id, values.dichvu_id);
    console.log('Can provide service:', canProvideService); // Kiểm tra khả năng cung cấp dịch vụ

    if (!canProvideService) {
      message.error('This employee cannot provide the selected service.');
      return;
    }

    // Kiểm tra thời gian hẹn có trong giờ làm việc không
    const employee = employees.find(e => e.employee_id === values.employee_id);
    console.log('Selected employee:', employee); // Kiểm tra nhân viên được chọn

    if (employee && employee.lichLamViec) {
      const dayOfWeek = moment(date).format('dddd').toLowerCase();
      const workSchedule = employee.lichLamViec[dayOfWeek];
      console.log('Day of week:', dayOfWeek, 'Work schedule:', workSchedule); // Kiểm tra lịch làm việc

      if (workSchedule) {
        const workStart = moment(`${date} ${workSchedule.start}`, 'YYYY-MM-DD HH:mm');
        const workEnd = moment(`${date} ${workSchedule.end}`, 'YYYY-MM-DD HH:mm');
        const appointmentStart = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
        const appointmentEnd = moment(appointmentStart).add(duration, 'minutes');
        console.log('Work start:', workStart.format('YYYY-MM-DD HH:mm'));
        console.log('Work end:', workEnd.format('YYYY-MM-DD HH:mm'));
        console.log('Appointment start:', appointmentStart.format('YYYY-MM-DD HH:mm'));
        console.log('Appointment end:', appointmentEnd.format('YYYY-MM-DD HH:mm'));

        if (appointmentStart < workStart || appointmentEnd > workEnd) {
          message.error('The selected time is outside of the employee\'s working hours.');
          return;
        }
      } else {
        message.error('The employee does not work on this day.');
        return;
      }
    } else {
      message.error('Employee or work schedule not found.');
      return;
    }

    // Tạo hoặc cập nhật lịch hẹn
    const appointmentData: DichVu.LichHen = {
      lichhen_id: editingAppointment ? editingAppointment.lichhen_id : Date.now(),
      date,
      time,
      dichvu_id: values.dichvu_id,
      employee_id: values.employee_id,
      user_id: values.user_id,
      status: editingAppointment ? editingAppointment.status : 'pending'
    };

    try {
      if (editingAppointment) {
        updateAppointment(appointmentData);
        message.success('Appointment updated successfully');
      } else {
        addAppointment(appointmentData);
        message.success('Appointment booked successfully');
      }

      setIsModalVisible(false);
      setEditingAppointment(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to save appointment');
      console.error(error);
    }
  };

  // Handle date change
  const handleDateChange = (date: moment.Moment | null) => {
    setSelectedDate(date);
    form.setFieldsValue({ employee_id: undefined }); // Reset employee selection
  };

  // Handle service change
  const handleServiceChange = (serviceId: number) => {
    setSelectedService(serviceId);
    form.setFieldsValue({ employee_id: undefined }); // Reset employee selection
  };

  // Handle appointment edit
  const handleEdit = (appointment: DichVu.LichHen) => {
    setEditingAppointment(appointment);
    const service = services.find(s => s.dichvu_id === appointment.dichvu_id);
    setSelectedService(service?.dichvu_id || null);
    setSelectedDate(moment(appointment.date));
    
    form.setFieldsValue({
      user_id: appointment.user_id,
      dichvu_id: appointment.dichvu_id,
      date: moment(appointment.date),
      time: moment(appointment.time, 'HH:mm'),
      employee_id: appointment.employee_id,
    });
    
    setIsModalVisible(true);
  };

  // Handle appointment status change
  const handleStatusChange = (appointment: DichVu.LichHen, status: string) => {
    const updatedAppointment = { ...appointment, status };
    updateAppointment(updatedAppointment);
    message.success(`Appointment marked as ${status}`);
  };

  // Handle appointment deletion
  const handleDelete = (appointmentId: number) => {
    deleteAppointment(appointmentId);
    message.success('Appointment deleted successfully');
  };

  // Get status tag color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'gold';
      case 'confirmed': return 'blue';
      case 'completed': return 'green';
      case 'canceled': return 'red';
      default: return 'default';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Appointment Scheduler</h1>
      
      <Button 
        type="primary" 
        onClick={() => {
          setEditingAppointment(null);
          form.resetFields();
          setIsModalVisible(true);
        }} 
        style={{ marginBottom: 16 }}
      >
        Book New Appointment
      </Button>
      
      <Card title="Current Appointments" style={{ marginBottom: 16 }}>
        <List
          itemLayout="horizontal"
          dataSource={appointments}
          renderItem={item => {
            const service = services.find(s => s.dichvu_id === item.dichvu_id);
            const employee = employees.find(e => e.employee_id === item.employee_id);
            const user = users.find(u => u.user_id === item.user_id);
            
            return (
              <List.Item
                actions={[
                  <Button type="link" onClick={() => handleEdit(item)}>Edit</Button>,
                  <Popconfirm
                    title="Are you sure you want to delete this appointment?"
                    onConfirm={() => handleDelete(item.lichhen_id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" danger>Delete</Button>
                  </Popconfirm>,
                  item.status !== 'confirmed' && item.status !== 'canceled' && (
                    <Button type="link" onClick={() => handleStatusChange(item, 'confirmed')}>
                      Confirm
                    </Button>
                  ),
                  item.status !== 'completed' && item.status !== 'canceled' && (
                    <Button type="link" onClick={() => handleStatusChange(item, 'completed')}>
                      Complete
                    </Button>
                  ),
                  item.status !== 'canceled' && (
                    <Button type="link" danger onClick={() => handleStatusChange(item, 'canceled')}>
                      Cancel
                    </Button>
                  )
                ]}
              >
                <List.Item.Meta
                  title={`${user?.name || 'Unknown User'} - ${service?.name || 'Unknown Service'}`}
                  description={
                    <>
                      <div>Date: {item.date} at {item.time}</div>
                      <div>Employee: {employee?.name || 'Unknown'}</div>
                      <div>
                        Status: <Tag color={getStatusColor(item.status || 'pending')}>{item.status || 'pending'}</Tag>
                      </div>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title={editingAppointment ? "Edit Appointment" : "Book New Appointment"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingAppointment(null);
        }}
        footer={null}
      >
        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Form.Item 
            name="user_id" 
            label="Customer" 
            rules={[{ required: true, message: 'Please select a customer' }]}
          >
            <Select placeholder="Select customer">
              {users.map(user => (
                <Select.Option key={user.user_id} value={user.user_id}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

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
                <Select.Option key={service.dichvu_id} value={service.dichvu_id}>
                  {service.name} - ${service.price} ({service.thoiGianThucHien || 60} minutes)
                </Select.Option>
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
              onChange={handleDateChange}
              disabledDate={(current) => {
                return current && current < moment().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item 
            name="time" 
            label="Time" 
            rules={[{ required: true, message: 'Please select a time' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="employee_id" 
            label="Service Provider" 
            rules={[{ required: true, message: 'Please select a service provider' }]}
          >
            <Select 
              placeholder="Select service provider"
              disabled={!selectedDate || !selectedService}
            >
              {availableEmployees.map(employee => {
                const employeeReviews = reviews.filter(r => r.employee_id === employee.employee_id);
                const totalRating = employeeReviews.reduce((sum, review) => sum + review.rating, 0);
                const avgRating = employeeReviews.length > 0 ? (totalRating / employeeReviews.length).toFixed(1) : null;
                
                return (
                  <Select.Option key={employee.employee_id} value={employee.employee_id}>
                    {employee.name} {avgRating ? `(Rating: ${avgRating}/5)` : ''}
                  </Select.Option>
                );
              })}
            </Select>
            {availableEmployees.length === 0 && selectedDate && selectedService && (
              <div style={{ color: '#ff4d4f', marginTop: 8 }}>
                No service providers available for this service on the selected date.
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentScheduler;