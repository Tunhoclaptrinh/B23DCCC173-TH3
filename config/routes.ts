export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU



	// Ngọc làm
	{
		path: '/employees',
		name: 'Employees',
		component: './DichVu/Employee',
		icon: 'ArrowsAltOutlined',
	},











	// Tuấn làm

	{
		path: "/service-management",
		name: "ServiceManagement",
		icon: "QuestionCircleOutlined",
		"routes": [
			{
				"path": "/service-management/dash-board",
				"name": "Dash Board",
				component: "./ServiceManagement/ServiceManagement",
			},
			{
				"path": "/service-management/customer-management",
				"name": "Customer Management",
				component: '@/components/ServiceManagementComponent/CustomerManagement',

			},
			{
				"path": "/service-management/service-management",
				"name": "Service Management",
				component: '@/components/ServiceManagementComponent/ServiceManagement',
			},
			{
				"path": "/service-management/employee-management",
				"name": "Employee Management",
				component: '@/components/ServiceManagementComponent/EmployeeManagement',

			},
			{
				"path": "/service-management/appointment-management",
				"name": "Appointment Management",
				// component: '@/components/ServiceManagementComponent/AppointmentScheduler',
				component: '@/components/ServiceManagementComponent/AppointmentManagement',
			},
			{
				"path": "/service-management/review-responses",
				"name": "Review Responses"
			},
			{
				"path": "/service-management/statistics",
				"name": "Statistics"
			}
		]
	},



	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
