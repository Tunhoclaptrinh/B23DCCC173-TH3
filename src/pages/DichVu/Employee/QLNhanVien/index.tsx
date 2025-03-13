import { IColumn } from '@/components/Table/typing';
import { NhanVien } from '@/services/DichVu/typings';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select } from 'antd';
import { useModel } from 'umi';
import { List } from 'antd';
import React, { useState } from 'react';
import EmployeeForm from '@/components/EmployeeForm';

interface DataType {
  title: string;
  description: string;
}

const QLNhanVien = () => {
  const { employeeList, danhSachDichVu, addEmployee, updateEmployee, deleteEmployee } = useModel('dichvu.Employee');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<NhanVien | null>(null);
  const [form] = Form.useForm<NhanVien>();

  const showModal = () => {
    setIsModalVisible(true);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const lichLamViec = {};
        Object.keys(values).forEach(key => {
          if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(key)) {
            lichLamViec[key] = values[key];
            delete values[key];
          }
        });
        const employeeData = { ...values, lichLamViec };

        if (editingEmployee) {
          updateEmployee({ ...editingEmployee, ...employeeData });
        } else {
          addEmployee(employeeData);
        }
        setIsModalVisible(false);
        setEditingEmployee(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleEdit = (record: NhanVien) => {
    setEditingEmployee(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (employee_id: number) => {
    deleteEmployee(employee_id);
  };

  const columns: IColumn<NhanVien>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 50,
    },
    {
      title: 'Số Khách',
      dataIndex: 'sokhach',
      key: 'sokhach',
      width: 50,
    },
    {
      title: 'Dịch Vụ',
      width: 200,
      align: 'center',
      render: (record) => {
        const dichVuIds = record.dichVuIds || [];
        const dichVuCuaNhanVien = danhSachDichVu.filter((dichVu: any) =>
          dichVuIds.includes(dichVu.dichvu_id)
        );

        return (
          <div>
            <List
              itemLayout="horizontal"
              dataSource={dichVuCuaNhanVien}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`${item.description} - ${item.price?.toLocaleString(
                      'vi-VN',
                      { style: 'currency', currency: 'VND' }
                    )}`}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      },
    },
    {
      title: 'Lịch Làm Việc',
      width: 200,
      align: 'center',
      render: (record) => {
        const lichLamViec = record.lichLamViec;

        if (!lichLamViec) {
          return <div>Không có lịch làm việc.</div>;
        }

        const daysOfWeek = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];

        const lichLamViecData: DataType[] = daysOfWeek.map((day) => {
          const schedule = lichLamViec[day];
          let description = '';

          if (schedule && schedule.length > 0) {
            description = schedule
              .map((item: { start: string; end: string }) => `${item.start}-${item.end}`)
              .join(', ');
          } else {
            description = 'Nghỉ';
          }

          return {
            title: day,
            description: description,
          };
        });

        return (
          <div>
            <List
              itemLayout="horizontal"
              dataSource={lichLamViecData}
              renderItem={(item: DataType) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      render: (text: any, record: NhanVien) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Sửa</Button>
          <Button onClick={() => handleDelete(record.employee_id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Thêm Nhân Viên
      </Button>
      <Table dataSource={employeeList} columns={columns} rowKey="employee_id" />
      <Modal
        title={editingEmployee ? "Sửa Thông Tin Nhân Viên" : "Thêm Nhân Viên"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <EmployeeForm form={form} danhSachDichVu={danhSachDichVu} />
      </Modal>
    </>
  );
};

export default QLNhanVien;
