import { DichVu, NhanVien } from '@/services/DichVu/typings';

export const initialEmployee: NhanVien = {
  employee_id: 1,
  name: 'John Doe',
  age: 30,
  sokhach: 5,
  lichLamViec: {
    Monday: [{ start: "09:00", end: "17:00" }],
    Tuesday: [{ start: "09:00", end: "17:00" }],
    Wednesday: [{ start: "09:00", end: "17:00" }],
    Thursday: [{ start: "09:00", end: "17:00" }],
    Friday: [{ start: "09:00", end: "17:00" }],
    Saturday: [{ start: "09:00", end: "12:00" }],
    Sunday: [],
  },
  dichVuIds: [1, 2],
};

export const danhSachDichVu: DichVu[] = [
  {
    dichvu_id: 1,
    name: "Cắt tóc nam cơ bản",
    price: 150000,
    description: "Cắt tóc theo kiểu dáng phổ thông, nhanh chóng.",
    thoiGianThucHien: 30,
  },
  {
    dichvu_id: 2,
    name: "Cắt tóc nam tạo kiểu",
    price: 250000,
    description: "Tạo kiểu tóc nam theo yêu cầu, tư vấn kiểu tóc phù hợp.",
    thoiGianThucHien: 45,
  },
  {
    dichvu_id: 3,
    name: "Gội đầu dưỡng sinh",
    price: 120000,
    description: "Gội đầu thư giãn, massage da đầu, sử dụng dầu gội thảo dược.",
    thoiGianThucHien: 60,
  }
];

