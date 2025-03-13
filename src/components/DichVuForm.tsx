import React from 'react';
import { Form, Input, InputNumber } from 'antd';

interface DichVuFormProps {
  form: any;
}

const DichVuForm: React.FC<DichVuFormProps> = ({ form }) => {
  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      autoComplete="off"
    >
      <Form.Item
        label="Tên Dịch Vụ"
        name="name"
        rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Giá"
        name="price"
        rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Thời Gian Thực Hiện"
        name="thoiGianThucHien"
        rules={[{ required: true, message: 'Vui lòng nhập thời gian thực hiện!' }]}
      >
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Mô Tả"
        name="description"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
      >
        <Input />
      </Form.Item>
    </Form>
  );
};

export default DichVuForm;
