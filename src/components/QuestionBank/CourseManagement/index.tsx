import React, { useState } from 'react';
import { Button, Table, Modal, Popconfirm } from 'antd';
import { useModel } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import CourseForm from '../../Form/CourseForm';

const CourseManagement: React.FC = () => {
    const { courses, addCourse, updateCourse, deleteCourse } = useModel('questionbank');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);

    // Handle add/edit course
    const handleSaveCourse = (values: any) => {
        if (editingCourse) {
            // Edit existing course
            updateCourse({ 
                ...editingCourse, 
                ...values,
            });
        } else {
            // Add new course
            addCourse({
                id: uuidv4(),
                name: values.name,
            });
        }
        setIsModalVisible(false);
        setEditingCourse(null);
    };

    // Handle edit
    const handleEdit = (course: any) => {
        setEditingCourse(course);
        setIsModalVisible(true);
    };

    // Handle delete course
    const handleDelete = (id: string) => {
        deleteCourse(id);
    };

    const columns = [
        {
            title: 'Course ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Course Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure to delete this course?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                </>
            ),
        }
    ];

    return (
        <div>
            <Button 
                type="primary" 
                style={{ marginBottom: 16 }} 
                onClick={() => {
                    setEditingCourse(null); 
                    setIsModalVisible(true);
                }}
            >
                Add Course
            </Button>

            <Table columns={columns} dataSource={courses} rowKey="id" />

            {/* Modal for displaying the form */}
            <Modal
                title={editingCourse ? "Edit Course" : "Add New Course"}
                visible={isModalVisible}
                footer={null}
                onCancel={() => setIsModalVisible(false)}
            >
                <CourseForm 
                    onSubmit={handleSaveCourse} 
                    initialValues={
                        editingCourse ? {
                            ...editingCourse,
                        } : null
                    } 
                />
            </Modal>
        </div>
    );
};

export default CourseManagement;