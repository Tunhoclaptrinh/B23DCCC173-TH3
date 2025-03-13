import React from 'react';
import { Table, Button, Space, Alert, Tag } from 'antd';
import { TestPaper } from '@/models/questionbank';

interface TestPaperHistoryProps {
    testPapers: TestPaper[];
    viewTestPaper: (testPaper: TestPaper) => void;
    deleteTestPaper: (testPaperId: any) => void;
}

const TestPaperHistory: React.FC<TestPaperHistoryProps> = ({
    testPapers,
    viewTestPaper,
    deleteTestPaper
}) => {
    return (
        <>
            {testPapers.length === 0 ? (
                <Alert message="No test papers generated yet" type="info" />
            ) : (
                <Table
                    columns={[
                        { title: 'Course', dataIndex: 'courseName', key: 'courseName' },
                        { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
                        { 
                            title: 'Questions', 
                            dataIndex: 'questions', 
                            key: 'questions', 
                            render: (questions: any) => <Tag color="blue">{questions.length} questions</Tag> 
                        },
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (_: any, record: TestPaper) => (
                                <Space>
                                    <Button onClick={() => viewTestPaper(record)}>View</Button>
                                    <Button danger onClick={() => deleteTestPaper(record.id)}>Delete</Button>
                                </Space>
                            )
                        }
                    ]}
                    dataSource={testPapers}
                    rowKey="id"
                    pagination={testPapers.length > 10 ? { pageSize: 10, position: ['bottomCenter'] } : false}
                />
            )}
        </>
    );
};

export default TestPaperHistory;
