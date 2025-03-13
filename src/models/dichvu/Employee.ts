import { useState, useEffect } from 'react';
import { DichVu, NhanVien } from '@/services/DichVu/typings';
import { danhSachDichVu, initialEmployee } from './data';


export default () => {
  const [employee, setEmployee] = useState<NhanVien>(initialEmployee);
  const [danhSachDichVuState, setDanhSachDichVuState] = useState<DichVu[]>(danhSachDichVu);

  useEffect(() => {
    localStorage.setItem('employee', JSON.stringify(employee));
  }, [employee]);



  const getEmployee = (): NhanVien => {
    const employeeString = localStorage.getItem('employee');
    if (employeeString) {
      return JSON.parse(employeeString) as NhanVien;
    }
    return initialEmployee;
  };

  const updateEmployeeDetails = (newEmployee: NhanVien) => {
    setEmployee(newEmployee);
  };

    const [employeeList, setEmployeeList] = useState<NhanVien[]>([initialEmployee]);

    const addEmployee = (newEmployee: NhanVien) => {
        setEmployeeList([...employeeList, { ...newEmployee, employee_id: Date.now() }]);
    };

    const updateEmployee = (updatedEmployee: NhanVien) => {
        setEmployeeList(
            employeeList.map((emp) =>
                emp.employee_id === updatedEmployee.employee_id ? updatedEmployee : emp
            )
        );
    };

    const deleteEmployee = (employee_id: number) => {
        setEmployeeList(employeeList.filter((emp) => emp.employee_id !== employee_id));
    };

  const addDichVu = (newDichVu: DichVu) => {
    setDanhSachDichVuState([...danhSachDichVuState, { ...newDichVu, dichvu_id: Date.now() }]);
  };

  const updateDichVu = (updatedDichVu: DichVu) => {
    setDanhSachDichVuState(
      danhSachDichVuState.map((dichVu) =>
        dichVu.dichvu_id === updatedDichVu.dichvu_id ? updatedDichVu : dichVu
      )
    );
  };

  const deleteDichVu = (dichvu_id: number) => {
    setDanhSachDichVuState(danhSachDichVuState.filter((dichVu) => dichVu.dichvu_id !== dichvu_id));
  };

  return {
    employee,
        employeeList,
    danhSachDichVu: danhSachDichVuState,
    getEmployee,
    updateEmployeeDetails,
        addEmployee,
        updateEmployee,
        deleteEmployee,
    addDichVu,
    updateDichVu,
    deleteDichVu,
  };
};
