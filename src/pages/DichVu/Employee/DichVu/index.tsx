import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber } from 'antd';
import { useModel } from 'umi';
import { DichVu } from '@/services/DichVu/typings';
import DichVuForm from '@/components/DichVuForm';
import type { IColumn } from '@/components/Table/typing';


const QuanLyDichVu = () => {
  const { danhSachDichVu, addDichVu, updateDichVu, deleteDichVu } = useModel('dichvu.Employee');
  const [visible, setVisible] = useState<boolean>(false);
  const [editingDichVu, setEditingDichVu] = useState<DichVu | null>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: DichVu) => {
    form.setFieldsValue(record);
    setEditingDichVu(record);
    setVisible(true);
  };

  const handleDelete = (dichvu_id: number) => {
    deleteDichVu(dichvu_id);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingDichVu) {
          updateDichVu({ ...editingDichVu, ...values });
        } else {
          addDichVu(values);
        }
        setVisible(false);
        setEditingDichVu(null);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setVisible(false);
    setEditingDichVu(null);
    form.resetFields();
  };

  const columns: IColumn<DichVu>[] = [
    {
      title: 'Tên Dịch Vụ',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 100,
    },
    {
      title: 'Thời Gian Thực Hiện',
      dataIndex: 'thoiGianThucHien',
      key: 'thoiGianThucHien',
      width: 150,
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      align: 'center',
      render: (text: any, record: DichVu) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Sửa</Button>
          <Button onClick={() => handleDelete(record.dichvu_id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => {
          setVisible(true);
          setEditingDichVu(null);
          form.resetFields();
        }}
      >
        Thêm Dịch Vụ
      </Button>
      <Table
        columns={columns}
        dataSource={danhSachDichVu}
        rowKey="dichvu_id"
      />
      <Modal
        title={editingDichVu ? 'Sửa Dịch Vụ' : 'Thêm Dịch Vụ'}
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {editingDichVu ? 'Lưu' : 'Thêm'}
          </Button>,
        ]}
      >
        <DichVuForm form={form} />
      </Modal>
    </div>
  );
};

export default QuanLyDichVu;
