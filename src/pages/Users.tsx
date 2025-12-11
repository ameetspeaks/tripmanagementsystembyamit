import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";

interface User {
  id: string;
  userName: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
  status: string;
}

const mockUsers: User[] = [
  { id: "1", userName: "Admin User", email: "admin@tripms.com", phone: "9876543210", role: "Admin", lastLogin: "2024-01-15 10:30", status: "Active" },
  { id: "2", userName: "Operations Manager", email: "ops@tripms.com", phone: "9876543211", role: "Manager", lastLogin: "2024-01-15 09:15", status: "Active" },
  { id: "3", userName: "Fleet Supervisor", email: "fleet@tripms.com", phone: "9876543212", role: "Supervisor", lastLogin: "2024-01-14 16:45", status: "Active" },
  { id: "4", userName: "Driver Coordinator", email: "driver@tripms.com", phone: "9876543213", role: "Coordinator", lastLogin: "2024-01-13 11:20", status: "Inactive" },
  { id: "5", userName: "Reports Analyst", email: "reports@tripms.com", phone: "9876543214", role: "Analyst", lastLogin: "2024-01-15 08:00", status: "Active" },
];

const columns: Column<User>[] = [
  { key: "userName", header: "User Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "role", header: "Role" },
  { key: "lastLogin", header: "Last Login" },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <span className={`status-badge ${
        item.status === "Active" ? "status-active" : "status-inactive"
      }`}>
        {item.status}
      </span>
    ),
  },
];

const Users = () => {
  const handleDelete = (item: User) => toast.info(`Delete user: ${item.userName} - Backend integration pending`);

  return (
    <DashboardLayout>
      <DataTable
        title="Users"
        data={mockUsers}
        columns={columns}
        searchKey="userName"
        addUrl="/users/add"
        viewUrl={(id) => `/users/view/${id}`}
        editUrl={(id) => `/users/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Users;
