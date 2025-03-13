import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Table, Modal, Alert, Space, Divider, Typography, Empty, Tag } from 'antd';
import { Question, TestPaper, KhoiKienThuc } from '@/models/questionbank'; // Replace with the actual path to your Question type
import { useModel } from 'umi';
import { TablePaginationConfig } from 'antd/es/table';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

interface FormValues {
    courseId: string;
    easyQuestions?: number;
    mediumQuestions?: number;
    hardQuestions?: number;
    veryHardQuestions?: number;
    knowledgeAreas?: string[];
    [key: string]: any;
}

const TestPaperGenerator = () => {
    const { courses, questions: allQuestions, generateTestPaper, testPapers, setTestPapers, getQuestionStats, updateQuestion } = useModel('questionbank'); // eslint-disable-line no-shadow
    const [form] = Form.useForm();
    const [generatedTestPaper, setGeneratedTestPaper] = useState<TestPaper | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [difficultyStats, setDifficultyStats] = useState<{[key: string]: number}>({});
    const [knowledgeAreaStats, setKnowledgeAreaStats] = useState<{[key: string]: number}>({});
    const [loading, setLoading] = useState(false);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [previewTestPaper, setPreviewTestPaper] = useState<TestPaper | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    // const { updateQuestion } = useModel('questionbank');

    // Update question stats when courseId changes
    useEffect(() => {
        if (courseId) {
            const courseQuestions = allQuestions.filter(q => q.courseId === courseId);
            setAvailableQuestions(courseQuestions);
            
            // Get detailed stats
            const stats = getQuestionStats(courseId);
            setDifficultyStats(stats.difficultyStats);
            setKnowledgeAreaStats(stats.knowledgeAreaStats);
            
            // Reset form fields related to knowledge areas
            form.setFieldsValue({
                knowledgeAreas: [],
                easyQuestions: 0,
                mediumQuestions: 0,
                hardQuestions: 0,
                veryHardQuestions: 0
            });
        } else {
            setAvailableQuestions([]);
            setDifficultyStats({});
            setKnowledgeAreaStats({});
        }
    }, [courseId, allQuestions, getQuestionStats, form]);

    const handleCourseChange = (value: any) => {
        setCourseId(value);
    };

    const validateDistribution = (values: FormValues) => {
        // Validate that some questions are requested
        const totalRequested = (values.easyQuestions || 0) + 
            (values.mediumQuestions || 0) + 
            (values.hardQuestions || 0) + 
            (values.veryHardQuestions || 0);
            
        if (totalRequested === 0) {
            throw new Error("Please specify at least one question to include in the test paper.");
        }
        
        // Validate sufficient questions exist
        if (availableQuestions.length === 0) {
            throw new Error("No questions available for the selected course. Please add questions first.");
        }
        
        // Check difficulty level availability
        const difficulties = ['Easy', 'Medium', 'Hard', 'Very Hard'];
        for (const difficulty of difficulties) {
            const fieldName = `${difficulty.toLowerCase().replace(' ', '')}Questions`;
            const requestedCount = values[fieldName] || 0;
            if (requestedCount > 0) {
                const availableCount = availableQuestions.filter(q => 
                    q.difficultyLevel === difficulty).length;
                
                if (availableCount < requestedCount) {
                    throw new Error(`Not enough ${difficulty} questions available. Requested: ${requestedCount}, Available: ${availableCount}`);
                }
            }
        }
        
        // Check knowledge area availability and build distribution
        const knowledgeAreaDistribution: {[key: string]: number} = {};
        (values.knowledgeAreas || []).forEach((area: string) => {
            const count = values[`${area}_count`] || 0;
            knowledgeAreaDistribution[area] = count;
        });
        
        // If knowledge areas were selected, make sure they have counts
        if (values.knowledgeAreas && values.knowledgeAreas.length > 0) {
            let hasAreaCounts = false;
            for (const area of values.knowledgeAreas) {
                if (values[`${area}_count`] > 0) {
                    hasAreaCounts = true;
                    
                    // Validate we have enough questions for this area and each difficulty
                    for (const difficulty of difficulties) {
                        const requestedDiffCount = values[`${difficulty.toLowerCase().replace(' ', '')}Questions`] || 0;
                        if (requestedDiffCount > 0) {
                            const availableAreaDiffCount = availableQuestions.filter(q =>
                                q.khoiKienThucId === area && q.difficultyLevel === difficulty
                            ).length;

                            if (availableAreaDiffCount < 1) {
                                throw new Error(`No ${difficulty} questions available for knowledge area "${area}". Please select different criteria.`);
                            }
                        }
                    }
                }
            }

            if (!hasAreaCounts) {
                throw new Error("Please specify how many questions to include from each selected knowledge area.");
            }
        }

        return knowledgeAreaDistribution;
    };

    const handleSubmit = (values: FormValues) => {
        setLoading(true);
        setErrorMessage('');
        
        try {
            // Validate distribution and get knowledge area counts
            const knowledgeAreaDistribution = validateDistribution(values);

            const difficultyDistribution = {
                'Easy': values.easyQuestions || 0,
                'Medium': values.mediumQuestions || 0,
                'Hard': values.hardQuestions || 0,
                'Very Hard': values.veryHardQuestions || 0
            };

            // Function to shuffle array (Fisher-Yates shuffle)
            const shuffleArray = (array: any[]) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            // Call generateTestPaper to get the initial test paper
            const initialTestPaper = generateTestPaper(values.courseId, difficultyDistribution, knowledgeAreaDistribution);

            if (!initialTestPaper || !initialTestPaper.questions || initialTestPaper.questions.length === 0) {
                throw new Error("Failed to generate test paper. Please check your selection criteria.");
            }

            const testPaper = { ...initialTestPaper };

            // Shuffle the questions array
            testPaper.questions = shuffleArray(testPaper.questions);

            setGeneratedTestPaper(testPaper);
        } catch (err: any) {
            console.error("Error generating test paper:", err);
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteTestPaper = (testPaperId: any) => {
        Modal.confirm({
            title: 'Confirm Deletion',
            content: 'Are you sure you want to delete this test paper?',
            onOk: () => {
                const updatedTestPapers = testPapers.filter(tp => tp.id !== testPaperId);
                setTestPapers(updatedTestPapers);
                localStorage.setItem('testPapers', JSON.stringify(updatedTestPapers));
            }
        });
    };

    // Fixed viewTestPaper function - ensures proper state updates
    const viewTestPaper = (testPaper: TestPaper) => {
        // Make a copy of the test paper to avoid reference issues
        const paperToView = { ...testPaper };
        
        // Ensure we're setting the state directly, not through references
        setPreviewTestPaper(paperToView);
        
        // Make sure we set the modal visibility after the state is updated
        setTimeout(() => {
            setPreviewModalVisible(true);
        }, 0);
    };

    const renderKnowledgeAreaInputs = () => {
        const knowledgeAreas = form.getFieldValue('knowledgeAreas') || [];
        if (knowledgeAreas.length === 0) return null;

        return (
            <div style={{ marginBottom: 16 }}>
                <Text strong>Questions per Knowledge Area:</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 8 }}>
                    {knowledgeAreas.map((area: string) => (
                        <Form.Item 
                            key={area} 
                            name={`${area}_count`} 
                            label={area}
                            rules={[{ type: 'number', min: 0, message: 'Must be 0 or greater' }]}
                        >
                            <InputNumber min={0} placeholder="Count" />
                        </Form.Item>
                    ))}
                </div>
            </div>
        );
    };

    const getColorForDifficulty = (difficulty: string) => {
        switch(difficulty) {
            case 'Easy': return 'green';
            case 'Medium': return 'blue';
            case 'Hard': return 'orange';
            case 'Very Hard': return 'red';
            default: return 'default';
        }
    };

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
                                    const updatedQuestions = generatedTestPaper.questions.filter(q => q.id !== record.id);
                                    const updatedTestPapers = testPapers.map(testPaper => {
                                        if (testPaper.id === generatedTestPaper.id) {
                                            return { ...testPaper, questions: updatedQuestions };
                                        }
                                        return testPaper;
                                    });
                                    setTestPapers(updatedTestPapers);
                                    setGeneratedTestPaper({ ...generatedTestPaper, questions: updatedQuestions });
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
        <div>
            <Title level={3}>Generate Test Paper</Title>
            
            {errorMessage && (
                <Alert
                    message="Error"
                    description={errorMessage}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                    onClose={() => setErrorMessage('')}
                />
            )}
            
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                            <Option key={course.id} value={course.id}>{course.name}</Option>
                        ))}
                    </Select>
                </Form.Item>

                {courseId && availableQuestions.length === 0 && (
                    <Alert
                        message="No questions available for this course"
                        description="Please add questions to this course before generating a test paper"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

                {courseId && availableQuestions.length > 0 && (
                    <>
                        <div style={{ marginBottom: 16, border: '1px solid #f0f0f0', padding: 16, borderRadius: 4 }}>
                            <Text strong>Available Questions:</Text> {availableQuestions.length}
                            <div style={{ display: 'flex', gap: '16px', marginTop: 8, flexWrap: 'wrap' }}>
                                {Object.entries(difficultyStats).map(([difficulty, count]) => (
                                    count > 0 && (
                                        <div key={difficulty}>
                                            <Tag color={getColorForDifficulty(difficulty)}>{difficulty}: {count}</Tag>
                                        </div>
                                    )
                                ))}
                            </div>
                            
                            <Divider style={{ margin: '12px 0' }}/>
                            
                            <Text strong>Khối kiến thức:</Text>
                            <div style={{ display: 'flex', gap: '16px', marginTop: 8, flexWrap: 'wrap' }}>
                                {Object.entries(knowledgeAreaStats).map(([area, count]) => (
                                    <div key={area}>
                                        <Tag>{area}: {count}</Tag>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: 16 }}>
                            <Form.Item label="Easy Questions" name="easyQuestions">
                                <InputNumber placeholder="Count" min={0} />
                            </Form.Item>
                            <Form.Item label="Medium Questions" name="mediumQuestions">
                                <InputNumber placeholder="Count" min={0} />
                            </Form.Item>
                            <Form.Item label="Hard Questions" name="hardQuestions">
                                <InputNumber placeholder="Count" min={0} />
                            </Form.Item>
                            <Form.Item label="Very Hard Questions" name="veryHardQuestions">
                                <InputNumber placeholder="Count" min={0} />
                            </Form.Item>
                        </div>

                        <Form.Item name="knowledgeAreas" label="Khối kiến thức (Optional)">
                            <Select
                                mode="multiple"
                                placeholder="Select khối kiến thức to filter questions"
                                style={{ width: '100%' }}
                            >
                                {Object.keys(knowledgeAreaStats).map(area => (
                                    <Option key={area} value={area}>
                                        {area} ({knowledgeAreaStats[area]} questions)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {renderKnowledgeAreaInputs()}

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Generate Test Paper
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form>

            {/* Display generated test paper */}
            {generatedTestPaper && (
                <div style={{ marginTop: 24 }}>
                    <Divider />
                    <Title level={4}>Generated Test Paper</Title>
                    <div style={{ marginBottom: 16 }}>
                        <p><strong>Course:</strong> {generatedTestPaper.courseName}</p>
                        <p><strong>Created At:</strong> {generatedTestPaper.createdAt}</p>
                        <p><strong>Total Questions:</strong> {generatedTestPaper.questions.length}</p>
                    </div>
                    
                    {generatedTestPaper.questions.length > 0 ? (
                        <Table 
                            columns={questionColumns} 
                            dataSource={generatedTestPaper.questions} 
                            rowKey="id"
                            pagination={generatedTestPaper.questions.length > 10 ? { pageSize: 10, position: ['bottomCenter'] } : false}
                        />
                    ) : (
                        <Empty description="No questions were generated based on your criteria." />
                    )}
                </div>
            )}

            {/* Display test paper history */}
            <Divider />
            <Title level={4}>Test Paper History</Title>
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
            ) }

            {/* Test Paper Preview Modal */}
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
        </div>
    );
};

export default TestPaperGenerator;
