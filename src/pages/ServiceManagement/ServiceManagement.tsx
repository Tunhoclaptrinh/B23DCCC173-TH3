import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Card, Row, Col, Statistic, DatePicker, Table, Select, Space, Empty } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// Nhớ xóa recharts
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const { 
    appointments, 
    employees, 
    services,
    users,
    getAppointmentStatsByDay,
    getRevenueByService,
    getRevenueByEmployee,
    getEmployeeRatings
  } = useModel('ServiceManagement.appointment');
  

  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  
  const [appointmentStats, setAppointmentStats] = useState([]);
  const [revenueByService, setRevenueByService] = useState([]);
  const [revenueByEmployee, setRevenueByEmployee] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate stats whenever data changes
  useEffect(() => {
    calculateStats();
  }, [appointments, employees, services, dateRange, selectedEmployee]);

  const calculateStats = () => {
    // Get appointment stats by day
    const statsObj = getAppointmentStatsByDay(dateRange[0].toDate(), dateRange[1].toDate());
    const statsArray = Object.entries(statsObj).map(([date, count]) => ({
      date,
      count
    }));
    setAppointmentStats(statsArray);

    // Get revenue by service
    const revenueByServiceObj = getRevenueByService();
    const revenueByServiceArray = Object.entries(revenueByServiceObj)
      .filter(([_, value]) => value > 0) // Only include services with revenue
      .map(([name, value]) => ({
        name,
        value
      }));
    setRevenueByService(revenueByServiceArray);

    // Get revenue by employee
    const revenueByEmployeeObj = getRevenueByEmployee();
    const revenueByEmployeeArray = Object.entries(revenueByEmployeeObj)
      .filter(([_, value]) => value > 0) // Only include employees with revenue
      .map(([name, value]) => ({
        name,
        value
      }));
    setRevenueByEmployee(revenueByEmployeeArray);
    
    // Get employee ratings
    const ratingsObj = getEmployeeRatings();
    const ratingsArray = employees.map(employee => ({
      name: employee.name,
      id: employee.employee_id,
      rating: ratingsObj[employee.employee_id]?.average || 0,
      reviewCount: ratingsObj[employee.employee_id]?.count || 0
    }));
    setRatings(ratingsArray);
  };

  // Filter appointments by date range and employee
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = moment(appointment.date);
    const isInDateRange = appointmentDate.isBetween(dateRange[0], dateRange[1], null, '[]');
    
    if (selectedEmployee === 'all') {
      return isInDateRange;
    } else {
      return isInDateRange && appointment.employee_id === selectedEmployee;
    }
  });

  // Get total revenue in the selected period
  const totalRevenue = filteredAppointments
    .filter(app => app.status === 'completed')
    .reduce((sum, app) => {
      const service = services.find(s => s.dichvu_id === app.dichvu_id);
      return sum + (service?.price || 0);
    }, 0);

  // Get appointment status counts
  const getStatusCounts = () => {
    const counts = { pending: 0, confirmed: 0, completed: 0, canceled: 0 };
    
    filteredAppointments.forEach(app => {
      const status = app.status || 'pending';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return [
      { name: 'Pending', value: counts.pending },
      { name: 'Confirmed', value: counts.confirmed },
      { name: 'Completed', value: counts.completed },
      { name: 'Canceled', value: counts.canceled }
    ].filter(item => item.value > 0);
  };

  // Table columns for appointments
  const appointmentColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix()
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: 'Service',
      key: 'service',
      render: (_, record) => {
        const service = services.find(s => s.dichvu_id === record.dichvu_id);
        return service?.name || 'Unknown';
      }
    },
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => {
        const employee = employees.find(e => e.employee_id === record.employee_id);
        return employee?.name || 'Unknown';
      }
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => {
        const user = users.find(u => u.user_id === record.user_id);
        return user?.name || 'Unknown';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      defaultSortOrder: 'ascend',
      sorter: (a, b) => {
        const statusOrder = { pending: 0, confirmed: 1, completed: 2, canceled: 3 };
        return statusOrder[a.status || 'pending'] - statusOrder[b.status || 'pending'];
      },
      render: (status) => status || 'pending'
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      
      <Card style={{ marginBottom: 20 }}>
        <Space direction="horizontal" size="large">
          <RangePicker 
            value={dateRange}
            onChange={(dates) => setDateRange(dates)} 
            allowClear={false}
          />
          <Select 
            style={{ width: 200 }}
            value={selectedEmployee} 
            onChange={setSelectedEmployee}
          >
            <Option value="all">All Employees</Option>
            {employees.map(employee => (
              <Option key={employee.employee_id} value={employee.employee_id}>
                {employee.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>
      
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Appointments" 
              value={filteredAppointments.length} 
              suffix={<span>in period</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Completed Appointments" 
              value={filteredAppointments.filter(app => app.status === 'completed').length} 
              suffix={<span>in period</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={totalRevenue} 
              prefix="$" 
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Average Service Price" 
              value={services.length ? services.reduce((sum, service) => sum + service.price, 0) / services.length : 0} 
              prefix="$" 
              precision={2}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Row */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="Appointments by Day">
            {appointmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={appointmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" name="Appointments" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No appointment data available" />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Revenue by Service">
            {revenueByService.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByService}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No revenue data available" />
            )}
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Card title="Revenue by Employee">
            {revenueByEmployee.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No employee revenue data available" />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Appointment Status Distribution">
            {getStatusCounts().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getStatusCounts()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getStatusCounts().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No status data available" />
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Employee Ratings */}
      <Card title="Employee Ratings" style={{ marginBottom: 20 }}>
        {ratings.length > 0 ? (
          <Table 
            dataSource={ratings} 
            rowKey="id"
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { 
                title: 'Rating', 
                dataIndex: 'rating', 
                key: 'rating',
                render: (rating) => rating.toFixed(1) + ' / 5.0',
                sorter: (a, b) => a.rating - b.rating
              },
              { 
                title: 'Reviews', 
                dataIndex: 'reviewCount', 
                key: 'reviewCount',
                sorter: (a, b) => a.reviewCount - b.reviewCount
              }
            ]} 
            pagination={false}
          />
        ) : (
          <Empty description="No rating data available" />
        )}
      </Card>
      
      {/* Recent Appointments */}
      <Card title="Recent Appointments">
        <Table 
          dataSource={filteredAppointments} 
          columns={appointmentColumns} 
          rowKey="lichhen_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;