import React from 'react';
import { Modal, Button, Typography, Tag, Table, Empty } from 'antd';
import { Question, TestPaper } from '@/models/questionbank';

const { Text, Paragraph } = Typography;

interface TestPaperPreviewModalProps {
    previewModalVisible: boolean;
    setPreviewModalVisible: (visible: boolean) => void;
    previewTestPaper: TestPaper | null;
    getColorForDifficulty: (difficulty: string) => string;
}

const TestPaperPreviewModal: React.FC<TestPaperPreviewModalProps> = ({
    previewModalVisible,
    setPreviewModalVisible,
    previewTestPaper,
    getColorForDifficulty
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
        }
    ];

    return (
        <Modal
            title={previewTestPaper ? `Test Paper: ${previewTestPaper?.courseName}` : 'Test Paper Details'}
            visible={previewModalVisible}
            onCancel={() => setPreviewModalVisible(false)}
            width={800}
            footer={[
                <Button key="close" onClick={() => setPreviewModalVisible(false)}>
                    Close
                </Button>
            ]}
            destroyOnClose={true}
        >
            {previewTestPaper && (
                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Paragraph>
                            <Text strong>Course:</Text> {previewTestPaper.courseName}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Created:</Text> {previewTestPaper.createdAt}
                        </Paragraph>
                        <Paragraph>
                            <Text strong>Total Questions:</Text> {previewTestPaper.questions.length}
                        </Paragraph>
                        
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Question Distribution:</Text>
                            <div style={{ display: 'flex', gap: '8px', marginTop: 4, flexWrap: 'wrap' }}>
                                {['Easy', 'Medium', 'Hard', 'Very Hard'].map(difficulty => {
                                    const count = previewTestPaper.questions.filter(q => 
                                        q.difficultyLevel === difficulty
                                    ).length;
                                    return count > 0 ? (
                                        <Tag key={difficulty} color={getColorForDifficulty(difficulty)}>
                                            {difficulty}: {count}
                                        </Tag>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        
                        <div style={{ marginTop: 8 }}>
                            <Text strong>Test Paper Structure:</Text>
                            <pre>{JSON.stringify(previewTestPaper.cauTruc, null, 2)}</pre>
                        </div>
                    </div>
                    
                    {previewTestPaper.questions && previewTestPaper.questions.length > 0 ? (
                        <Table
                            columns={questionColumns}
                            dataSource={previewTestPaper.questions}
                            rowKey="id"
                            size="small"
                            pagination={previewTestPaper.questions.length > 10 ?
                                { pageSize: 10, position: ['bottomCenter'] } : undefined}
                        />
                    ) : (
                        <Empty description="This test paper does not contain any questions." />
                    ) }
                </div>
            )}
        </Modal>
    );
};

export default TestPaperPreviewModal;
