
import { Col, Layout, Row } from "antd";
import QLNhanVien from "./QLNhanVien";
import DichVu from "./DichVu";

const Employee = () => {


  return (
    <>
      <Layout>
        <Row gutter={[20, 20]}>
          <Col span={12}>
            <QLNhanVien />
          </Col>
          <Col span={12}>
            <DichVu />
          </Col>
        </Row>
      </Layout>  
    </>
  );
};

export default Employee;
