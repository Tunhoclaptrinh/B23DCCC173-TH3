  import React from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { DichVu } from '@/services/DichVu/typings';

interface EmployeeFormProps {
  form: any;
  danhSachDichVu: DichVu[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ form, danhSachDichVu }) => {
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input your name!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Age"
        name="age"
        rules={[{ required: true, message: 'Please input your age!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label="Số Khách"
        name="sokhach"
        rules={[{ required: true, message: 'Please input số khách!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label="Dịch Vụ"
        name="dichVuIds"
      >
        <Select
          mode="multiple"
          placeholder="Chọn dịch vụ"
        >
          {danhSachDichVu.map((dichVu) => (
            <Select.Option key={dichVu.dichvu_id} value={dichVu.dichvu_id}>
              {dichVu.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
};

export default EmployeeForm;
