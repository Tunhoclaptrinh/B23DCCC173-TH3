import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button } from 'antd';
import { Course, KhoiKienThuc } from '../../models/questionbank';
import { useModel } from 'umi';

interface QuestionFormProps {
    onSubmit: (values: any) => void;
    courses: Course[];
    initialValues?: any;
    isModal?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit, courses, initialValues, isModal }) => {
    const { khoiKienThucs } = useModel('questionbank');
    const [form] = Form.useForm();
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(initialValues?.courseId);

    // Lấy danh sách knowledgeAreas dựa trên courseId đã chọn
    const getKnowledgeAreas = () => {
        if (!selectedCourseId) return [];
        const selectedCourse = courses.find(course => course.id === selectedCourseId);
        return selectedCourse ? selectedCourse.knowledgeAreas || [] : [];
    };

    // Khi initialValues thay đổi (ví dụ: khi edit), cập nhật selectedCourseId
    useEffect(() => {
        if (initialValues?.courseId) {
            setSelectedCourseId(initialValues.courseId);
            form.setFieldsValue(initialValues); // Đảm bảo form được điền giá trị ban đầu
        }
    }, [initialValues, form]);

    // Xử lý khi thay đổi khóa học
    const handleCourseChange = (value: string) => {
        setSelectedCourseId(value);
        form.setFieldsValue({ knowledgeArea: undefined }); // Reset knowledgeArea khi đổi course
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={initialValues}
        >
            <Form.Item
                name="courseId"
                label="Course"
                rules={[{ required: true, message: 'Please select a course' }]}
            >
                <Select
                    placeholder="Select a course"
                    onChange={handleCourseChange}
                >
                    {courses.map(course => (
                        <Select.Option key={course.id} value={course.id}>
                            {course.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                name="content"
                label="Question Content"
                rules={[{ required: true, message: 'Please input question content' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
                name="difficultyLevel"
                label="Difficulty Level"
                rules={[{ required: true, message: 'Please select difficulty level' }]}
            >
                <Select placeholder="Select difficulty level">
                    <Select.Option value="Easy">Easy</Select.Option>
                    <Select.Option value="Medium">Medium</Select.Option>
                    <Select.Option value="Hard">Hard</Select.Option>
                    <Select.Option value="Very Hard">Very Hard</Select.Option>
                </Select>
            </Form.Item>


            <Form.Item
                name="khoiKienThucId"
                label="Khối kiến thức"
                rules={[{ required: true, message: 'Please select a khối kiến thức' }]}
            >
                <Select placeholder="Select a khối kiến thức">
                    {khoiKienThucs.map(khoiKienThuc => (
                        <Select.Option key={khoiKienThuc.id} value={khoiKienThuc.id}>
                            {khoiKienThuc.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    {isModal ? 'Add Question' : 'Save'}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default QuestionForm;
