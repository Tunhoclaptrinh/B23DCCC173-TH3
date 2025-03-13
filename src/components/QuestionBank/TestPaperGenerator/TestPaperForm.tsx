import React from 'react';
import { Form, Select, InputNumber, Button, Alert, Typography, Tag, Divider } from 'antd';
import { useModel } from 'umi';

const { Option } = Select;
const { Text } = Typography;

interface FormValues {
    courseId: string;
    easyQuestions?: number;
    mediumQuestions?: number;
    hardQuestions?: number;
    veryHardQuestions?: number;
    knowledgeAreas?: string[];
    [key: string]: any;
}

interface TestPaperFormProps {
    courses: any[];
    availableQuestions: any[];
    difficultyStats: {[key: string]: number};
    knowledgeAreaStats: {[key: string]: number};
    loading: boolean;
    errorMessage: string;
    form: any;
    handleCourseChange: (value: any) => void;
    handleSubmit: (values: FormValues) => void;
    renderKnowledgeAreaInputs: () => React.ReactNode;
    getColorForDifficulty: (difficulty: string) => string;
    setErrorMessage: (message: string) => void;
}

const TestPaperForm: React.FC<TestPaperFormProps> = ({
    courses,
    availableQuestions,
    difficultyStats,
    knowledgeAreaStats,
    loading,
    errorMessage,
    form,
    handleCourseChange,
    handleSubmit,
    renderKnowledgeAreaInputs,
    getColorForDifficulty,
    setErrorMessage
}) => {
    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

            {availableQuestions.length === 0 && (
                <Alert
                    message="No questions available for this course"
                    description="Please add questions to this course before generating a test paper"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {availableQuestions.length > 0 && (
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
    );
};

export default TestPaperForm;
