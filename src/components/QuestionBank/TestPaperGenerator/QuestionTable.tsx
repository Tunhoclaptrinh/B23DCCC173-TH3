import React from 'react';
import { Table, Space, Button, Modal, Tag } from 'antd';
import { Question } from '@/models/questionbank';

interface QuestionTableProps {
    questions: Question[];
    getColorForDifficulty: (difficulty: string) => string;
    setEditingQuestion: (question: Question) => void;
    testPapers: any[];
    setTestPapers: (testPapers: any[]) => void;
    generatedTestPaper: any;
}

const QuestionTable: React.FC<QuestionTableProps> = ({
    questions,
    getColorForDifficulty,
    setEditingQuestion,
    testPapers,
    setTestPapers,
    generatedTestPaper
}) => {
    const questionColumns = [
        { 
            title: 'Question', 
            dataIndex: 'content', 
            key: 'content',
            render: (text: string) => <div style={{ maxWidth: 500, wordWrap: 'break-word' }}>{text}</div>
        },
        { 
            title: 'Difficulty', 
            dataIndex: 'difficultyLevel', 
            key: 'difficultyLevel', 
            width: 120,
            render: (difficulty: string) => (
                <Tag color={getColorForDifficulty(difficulty)}>{difficulty}</Tag>
            )
        },
        {
            title: 'Knowledge Area',
            dataIndex: 'khoiKienThucId',
            key: 'khoiKienThucId',
            width: 180,
            render: (khoiKienThucId: string) => {
                // Assuming you have a way to map khoiKienThucId to a name
                // Replace this with your actual logic
                return <span>{khoiKienThucId}</span>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Question) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => setEditingQuestion(record)}>
                        Edit
                    </Button>
                    <Button type="primary" danger size="small" onClick={() => {
                        Modal.confirm({
                            title: 'Confirm Deletion',
                            content: 'Are you sure you want to delete this question from the test paper?',
                            onOk: () => {
                                // Implement delete logic here
                                if (generatedTestPaper) {
                                    const updatedQuestions = generatedTestPaper.questions.filter((q: Question) => q.id !== record.id);
                                    const updatedTestPapers = testPapers.map((testPaper: any) => {
                                        if (testPaper.id === generatedTestPaper.id) {
                                            return { ...testPaper, questions: updatedQuestions };
                                        }
                                        return testPaper;
                                    });
                                    setTestPapers(updatedTestPapers);
                                    generatedTestPaper.questions = updatedQuestions;
                                }
                            }
                        });
                    }}>
                        Delete
                    </Button>
                </Space>
            ),
        }
    ];

    return (
        <Table 
            columns={questionColumns} 
            dataSource={questions} 
            rowKey="id"
            pagination={questions.length > 10 ? { pageSize: 10, position: ['bottomCenter'] } : false}
        />
    );
};

export default QuestionTable;
