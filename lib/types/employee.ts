export interface Role {
  id: string
  tenant_id: string
  name_pt: string
  name_en: string
  color: string
  can_manage_orders: boolean
  can_manage_tables: boolean
  can_manage_menu: boolean
  can_manage_inventory: boolean
  can_manage_staff: boolean
  can_view_reports: boolean
  can_manage_settings: boolean
  access_level: number
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  role_id: string | null
  role?: Role
  pin_hash: string | null
  language_preference: "pt" | "en"
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface EmployeePermissions {
  canManageOrders: boolean
  canManageTables: boolean
  canManageMenu: boolean
  canManageInventory: boolean
  canManageStaff: boolean
  canViewReports: boolean
  canManageSettings: boolean
  accessLevel: number
}

export function getEmployeePermissions(employee: Employee): EmployeePermissions {
  if (!employee.role) {
    return {
      canManageOrders: false,
      canManageTables: false,
      canManageMenu: false,
      canManageInventory: false,
      canManageStaff: false,
      canViewReports: false,
      canManageSettings: false,
      accessLevel: 1,
    }
  }

  return {
    canManageOrders: employee.role.can_manage_orders,
    canManageTables: employee.role.can_manage_tables,
    canManageMenu: employee.role.can_manage_menu,
    canManageInventory: employee.role.can_manage_inventory,
    canManageStaff: employee.role.can_manage_staff,
    canViewReports: employee.role.can_view_reports,
    canManageSettings: employee.role.can_manage_settings,
    accessLevel: employee.role.access_level,
  }
}
