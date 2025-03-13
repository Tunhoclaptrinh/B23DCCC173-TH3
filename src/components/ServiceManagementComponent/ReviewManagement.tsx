// Import required dependencies
import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Table, Button, Modal, Form, Input, Rate, message } from 'antd';

const AppointmentReviews = () => {
    const { appointments, reviews, addReview, addResponse } = useModel('ServiceManagement.appointment');
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [isResponseModalVisible, setIsResponseModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [form] = Form.useForm();

    // Show review modal
    const showReviewModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsReviewModalVisible(true);
        form.resetFields();
    };

    // Show response modal
    const showResponseModal = (review) => {
        setSelectedAppointment(review);
        setIsResponseModalVisible(true);
        form.setFieldsValue({ response: review.response || '' });
    };

    // Submit review
    const handleReviewSubmit = (values) => {
        addReview({
            user_id: selectedAppointment.user_id,
            employee_id: selectedAppointment.employee_id,
            dichvu_id: selectedAppointment.dichvu_id,
            rating: values.rating,
            review: values.review,
        });
        message.success('Review submitted successfully!');
        setIsReviewModalVisible(false);
    };

    // Submit response
    const handleResponseSubmit = (values) => {
        addResponse(selectedAppointment.review_id, values.response);
        message.success('Response submitted successfully!');
        setIsResponseModalVisible(false);
    };

    // Define columns for the review table
    const columns = [
        {
            title: 'Service',
            dataIndex: 'dichvu_id',
            key: 'dichvu_id',
        },
        {
            title: 'Employee',
            dataIndex: 'employee_id',
            key: 'employee_id',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => <Rate disabled defaultValue={rating} />,
        },
        {
            title: 'Review',
            dataIndex: 'review',
            key: 'review',
        },
        {
            title: 'Response',
            dataIndex: 'response',
            key: 'response',
            render: (response, record) => (
                response ? response : <Button onClick={() => showResponseModal(record)}>Respond</Button>
            ),
        },
    ];

    return (
        <div>
            <h2>Appointment Reviews</h2>
            <Table dataSource={reviews} columns={columns} rowKey="review_id" />

            {/* Review Modal */}
            <Modal
                title="Submit a Review"
                visible={isReviewModalVisible}
                onCancel={() => setIsReviewModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleReviewSubmit} layout="vertical">
                    <Form.Item name="rating" label="Rating" rules={[{ required: true }]}> 
                        <Rate />
                    </Form.Item>
                    <Form.Item name="review" label="Review" rules={[{ required: true }]}> 
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Form>
            </Modal>

            {/* Response Modal */}
            <Modal
                title="Respond to Review"
                visible={isResponseModalVisible}
                onCancel={() => setIsResponseModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleResponseSubmit} layout="vertical">
                    <Form.Item name="response" label="Response" rules={[{ required: true }]}> 
                        <Input.TextArea />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AppointmentReviews;