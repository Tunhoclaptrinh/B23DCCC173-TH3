// import React, { useState, useEffect } from 'react';
// import { history } from 'umi'; // For navigation
// import { Form, Select, DatePicker, TimePicker, Button, message, Card, List, Tag, Modal, Popconfirm } from 'antd';
// import moment from 'moment';

// const { Option } = Select;


// const AppointmentScheduler: React.FC = () => {
//   const [users, setUsers] = useState<DichVu.User[]>([]);
//   const [employees, setEmployees] = useState<DichVu.NhanVien[]>([]);
//   const [services, setServices] = useState<DichVu.DichVu[]>([]);
//   const [appointments, setAppointments] = useState<DichVu.LichHen[]>([]);
//   const [reviews, setReviews] = useState<DichVu.Review[]>([]);

//   const [form] = Form.useForm();
//   const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
//   const [selectedService, setSelectedService] = useState<number | null>(null);
//   const [availableEmployees, setAvailableEmployees] = useState<DichVu.NhanVien[]>([]);
//   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
//   const [editingAppointment, setEditingAppointment] = useState<DichVu.LichHen | null>(null);

//   // Load data from localStorage on mount
//   useEffect(() => {
//     const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
//     const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
//     const storedServices = JSON.parse(localStorage.getItem('services') || '[]');
//     const storedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
//     const storedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');

//     setUsers(storedUsers);
//     setEmployees(storedEmployees);
//     setServices(storedServices);
//     setAppointments(storedAppointments);
//     setReviews(storedReviews);
//   }, []);

//   // Update available employees when date or service changes
//   useEffect(() => {
//     if (selectedDate && selectedService) {
//       const dayOfWeek = selectedDate.format('dddd').toLowerCase();
//       const dateStr = selectedDate.format('YYYY-MM-DD');

//       const serviceProviders = employees.filter((employee) =>
//         employee.dichvu_id?.includes(selectedService)
//       );

//       const available = serviceProviders.filter((employee) => {
//         const hasWorkSchedule =
//           employee.lichLamViec &&
//           employee.lichLamViec[dayOfWeek] &&
//           employee.lichLamViec[dayOfWeek].start &&
//           employee.lichLamViec[dayOfWeek].end;

//         if (!hasWorkSchedule) return false;

//         if (employee.sokhach) {
//           const dailyAppointments = appointments.filter(
//             (app) => app.employee_id === employee.employee_id && app.date === dateStr
//           );
//           if (dailyAppointments.length >= employee.sokhach) return false;
//         }

//         return true;
//       });

//       setAvailableEmployees(available);
//     } else {
//       setAvailableEmployees([]);
//     }
//   }, [selectedDate, selectedService, employees, appointments]);

//   // Check for appointment conflicts
//   const checkAppointmentConflict = (
//     employeeId: number,
//     date: string,
//     time: string,
//     duration: number,
//     excludeId?: number
//   ): boolean => {
//     const start = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
//     const end = moment(start).add(duration, 'minutes');

//     return appointments.some((app) => {
//       if (app.lichhen_id === excludeId) return false;
//       if (app.employee_id !== employeeId || app.date !== date) return false;

//       const appStart = moment(`${app.date} ${app.time}`, 'YYYY-MM-DD HH:mm');
//       const service = services.find((s) => s.dichvu_id === app.dichvu_id);
//       const appEnd = moment(appStart).add(service?.thoiGianThucHien || 60, 'minutes');

//       return start.isBefore(appEnd) && end.isAfter(appStart);
//     });
//   };

//   // Handle form submission
//   const handleSubmit = (values: any) => {
//     const date = values.date.format('YYYY-MM-DD');
//     const time = values.time.format('HH:mm');
//     const service = services.find((s) => s.dichvu_id === values.dichvu_id);
//     const duration = service?.thoiGianThucHien || 60;

//     const hasConflict = checkAppointmentConflict(
//       values.employee_id,
//       date,
//       time,
//       duration,
//       editingAppointment?.lichhen_id
//     );

//     if (hasConflict) {
//       message.error('There is a scheduling conflict. Please select a different time.');
//       return;
//     }

//     const employee = employees.find((e) => e.employee_id === values.employee_id);
//     if (employee && employee.lichLamViec) {
//       const dayOfWeek = moment(date).format('dddd').toLowerCase();
//       const workSchedule = employee.lichLamViec[dayOfWeek];
//       if (workSchedule) {
//         const workStart = moment(`${date} ${workSchedule.start}`, 'YYYY-MM-DD HH:mm');
//         const workEnd = moment(`${date} ${workSchedule.end}`, 'YYYY-MM-DD HH:mm');
//         const appointmentStart = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
//         const appointmentEnd = moment(appointmentStart).add(duration, 'minutes');

//         if (appointmentStart.isBefore(workStart) || appointmentEnd.isAfter(workEnd)) {
//           message.error("The selected time is outside of the employee's working hours.");
//           return;
//         }
//       } else {
//         message.error('The employee does not work on this day.');
//         return;
//       }
//     }

//     const appointmentData: DichVu.LichHen = {
//       lichhen_id: editingAppointment ? editingAppointment.lichhen_id : Date.now(),
//       date,
//       time,
//       dichvu_id: values.dichvu_id,
//       employee_id: values.employee_id,
//       user_id: values.user_id,
//       status: editingAppointment ? editingAppointment.status : 'pending',
//     };

//     const updatedAppointments = editingAppointment
//       ? appointments.map((app) => (app.lichhen_id === appointmentData.lichhen_id ? appointmentData : app))
//       : [...appointments, appointmentData];

//     setAppointments(updatedAppointments);
//     localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

//     message.success(editingAppointment ? 'Appointment updated successfully' : 'Appointment booked successfully');
//     setIsModalVisible(false);
//     setEditingAppointment(null);
//     form.resetFields();
//   };

//   // Handle date change
//   const handleDateChange = (date: moment.Moment | null) => {
//     setSelectedDate(date);
//     form.setFieldsValue({ employee_id: undefined });
//   };

//   // Handle service change
//   const handleServiceChange = (serviceId: number) => {
//     setSelectedService(serviceId);
//     form.setFieldsValue({ employee_id: undefined });
//   };

//   // Handle editing an appointment
//   const handleEdit = (appointment: DichVu.LichHen) => {
//     setEditingAppointment(appointment);
//     setSelectedService(appointment.dichvu_id);
//     setSelectedDate(moment(appointment.date));
//     form.setFieldsValue({
//       user_id: appointment.user_id,
//       dichvu_id: appointment.dichvu_id,
//       date: moment(appointment.date),
//       time: moment(appointment.time, 'HH:mm'),
//       employee_id: appointment.employee_id,
//     });
//     setIsModalVisible(true);
//   };

//   // Handle status change
//   const handleStatusChange = (appointment: DichVu.LichHen, status: string) => {
//     const updatedAppointment: DichVu.LichHen = { ...appointment, status };
//     const updatedAppointments = appointments.map((app) =>
//       app.lichhen_id === appointment.lichhen_id ? updatedAppointment : app
//     );
//     setAppointments(updatedAppointments);
//     localStorage.setItem('appointments', JSON.stringify(updatedAppointments));

//     if (status === 'completed') {
//       const reviewData: DichVu.Review = {
//         review_id: Date.now(),
//         review: '',
//         rating: 0,
//         employee_id: appointment.employee_id,
//         user_id: appointment.user_id,
//         dichvu_id: appointment.dichvu_id,
//         create_at: moment().format('YYYY-MM-DD HH:mm:ss'),
//         appointment_id: appointment.lichhen_id,
//       };

//       const updatedReviews = [...reviews, reviewData];
//       setReviews(updatedReviews);
//       localStorage.setItem('reviews', JSON.stringify(updatedReviews));

//       message.success('Appointment completed. Redirecting to Reviews...');
//       history.push('/service-management/review-responses');
//     } else {
//       message.success(`Appointment marked as ${status}`);
//     }
//   };

//   // Handle appointment deletion
//   const handleDelete = (appointmentId: number) => {
//     const updatedAppointments = appointments.filter((app) => app.lichhen_id !== appointmentId);
//     setAppointments(updatedAppointments);
//     localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
//     message.success('Appointment deleted successfully');
//   };

//   // Get status tag color
//   const getStatusColor = (status?: string): string => {
//     switch (status) {
//       case 'pending':
//         return 'gold';
//       case 'confirmed':
//         return 'blue';
//       case 'completed':
//         return 'green';
//       case 'canceled':
//         return 'red';
//       default:
//         return 'default';
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Appointment Scheduler</h1>

//       <Button
//         type="primary"
//         onClick={() => {
//           setEditingAppointment(null);
//           form.resetFields();
//           setSelectedService(null);
//           setSelectedDate(null);
//           setIsModalVisible(true);
//         }}
//         style={{ marginBottom: 16 }}
//       >
//         Book New Appointment
//       </Button>

//       <Card title="Current Appointments" style={{ marginBottom: 16 }}>
//         <List
//           itemLayout="horizontal"
//           dataSource={appointments}
//           renderItem={(item) => {
//             const service = services.find((s) => s.dichvu_id === item.dichvu_id);
//             const employee = employees.find((e) => e.employee_id === item.employee_id);
//             const user = users.find((u) => u.user_id === item.user_id);

//             return (
//               <List.Item
//                 actions={[
//                   <Button type="link" onClick={() => handleEdit(item)}>
//                     Edit
//                   </Button>,
//                   <Popconfirm
//                     title="Are you sure you want to delete this appointment?"
//                     onConfirm={() => handleDelete(item.lichhen_id)}
//                     okText="Yes"
//                     cancelText="No"
//                   >
//                     <Button type="link" danger>
//                       Delete
//                     </Button>
//                   </Popconfirm>,
//                   item.status !== 'confirmed' &&
//                     item.status !== 'canceled' && (
//                       <Button type="link" onClick={() => handleStatusChange(item, 'confirmed')}>
//                         Confirm
//                       </Button>
//                     ),
//                   item.status !== 'completed' &&
//                     item.status !== 'canceled' && (
//                       <Popconfirm
//                         title="Mark as completed? This will redirect to Reviews."
//                         onConfirm={() => handleStatusChange(item, 'completed')}
//                         okText="Yes"
//                         cancelText="No"
//                       >
//                         <Button type="link">Complete</Button>
//                       </Popconfirm>
//                     ),
//                   item.status !== 'canceled' && (
//                     <Button type="link" danger onClick={() => handleStatusChange(item, 'canceled')}>
//                       Cancel
//                     </Button>
//                   ),
//                   item.status === 'completed' && (
//                     <Button type="link" onClick={() => history.push('/service-management/review-responses')}>
//                       View Reviews
//                     </Button>
//                   ),
//                 ].filter(Boolean)}
//               >
//                 <List.Item.Meta
//                   title={`${user?.name || 'Unknown User'} - ${service?.name || 'Unknown Service'}`}
//                   description={
//                     <>
//                       <div>Date: {item.date} at {item.time}</div>
//                       <div>Employee: {employee?.name || 'Unknown'}</div>
//                       <div>
//                         Status: <Tag color={getStatusColor(item.status)}>{item.status || 'pending'}</Tag>
//                       </div>
//                     </>
//                   }
//                 />
//               </List.Item>
//             );
//           }}
//         />
//       </Card>

//       <Modal
//         title={editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
//         visible={isModalVisible}
//         onCancel={() => {
//           setIsModalVisible(false);
//           setEditingAppointment(null);
//           setSelectedService(null);
//           setSelectedDate(null);
//         }}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <Form.Item
//             name="user_id"
//             label="Customer"
//             rules={[{ required: true, message: 'Please select a customer' }]}
//           >
//             <Select placeholder="Select customer" showSearch optionFilterProp="children">
//               {users.map((user) => (
//                 <Option key={user.user_id} value={user.user_id}>
//                   {user.name}
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="dichvu_id"
//             label="Service"
//             rules={[{ required: true, message: 'Please select a service' }]}
//           >
//             <Select placeholder="Select service" onChange={handleServiceChange}>
//               {services.map((service) => (
//                 <Option key={service.dichvu_id} value={service.dichvu_id}>
//                   {service.name} - ${service.price} ({service.thoiGianThucHien || 60} minutes)
//                 </Option>
//               ))}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="date"
//             label="Date"
//             rules={[{ required: true, message: 'Please select a date' }]}
//           >
//             <DatePicker
//               style={{ width: '100%' }}
//               onChange={handleDateChange}
//               disabledDate={(current) => current && current < moment().startOf('day')}
//             />
//           </Form.Item>

//           <Form.Item
//             name="time"
//             label="Time"
//             rules={[{ required: true, message: 'Please select a time' }]}
//           >
//             <TimePicker format="HH:mm" style={{ width: '100%' }} minuteStep={15} />
//           </Form.Item>

//           <Form.Item
//             name="employee_id"
//             label="Service Provider"
//             rules={[{ required: true, message: 'Please select a service provider' }]}
//           >
//             <Select placeholder="Select service provider" disabled={!selectedDate || !selectedService}>
//               {availableEmployees.map((employee) => {
//                 const employeeReviews = reviews.filter((r) => r.employee_id === employee.employee_id);
//                 const totalRating = employeeReviews.reduce((sum, review) => sum + review.rating, 0);
//                 const avgRating =
//                   employeeReviews.length > 0 ? (totalRating / employeeReviews.length).toFixed(1) : null;
//                 return (
//                   <Option key={employee.employee_id} value={employee.employee_id}>
//                     {employee.name} {avgRating ? `(Rating: ${avgRating}/5)` : ''}
//                   </Option>
//                 );
//               })}
//             </Select>
//             {availableEmployees.length === 0 && selectedDate && selectedService && (
//               <div style={{ color: '#ff4d4f', marginTop: 8 }}>
//                 No service providers available for this service on the selected date.
//               </div>
//             )}
//           </Form.Item>

//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
//             </Button>
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default AppointmentScheduler;