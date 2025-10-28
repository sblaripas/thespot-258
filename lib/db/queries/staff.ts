import type { SupabaseClient } from "@supabase/supabase-js"
import type { Employee, Role } from "@/lib/types/staff"
import type { Language } from "@/lib/types/tenant"

/**
 * Fetch all employees for a tenant
 */
export async function fetchEmployees(client: SupabaseClient, tenantId: string) {
  return await client
    .from("employees")
    .select("*, role:roles(*)")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("name")
}

/**
 * Fetch employee by ID
 */
export async function fetchEmployeeById(client: SupabaseClient, id: string, tenantId: string) {
  return await client.from("employees").select("*, role:roles(*)").eq("id", id).eq("tenant_id", tenantId).single()
}

/**
 * Fetch all roles for a tenant
 */
export async function fetchRoles(client: SupabaseClient, tenantId: string) {
  return await client.from("roles").select("*").eq("tenant_id", tenantId).order("access_level", { ascending: false })
}

/**
 * Get localized role name
 */
export function getRoleName(role: Role, language: Language): string {
  return language === "pt" ? role.name_pt : role.name_en
}

/**
 * Check if employee has permission
 */
export function hasPermission(
  employee: Employee,
  permission: keyof Omit<
    Role,
    "id" | "tenant_id" | "name_pt" | "name_en" | "color" | "access_level" | "created_at" | "updated_at"
  >,
): boolean {
  if (!employee.role) return false
  return employee.role[permission] === true
}

/**
 * Verify employee PIN
 */
export async function verifyEmployeePin(client: SupabaseClient, employeeId: string, pin: string, tenantId: string) {
  // In production, this should use proper password hashing (bcrypt, argon2, etc.)
  const { data, error } = await client
    .from("employees")
    .select("pin_hash")
    .eq("id", employeeId)
    .eq("tenant_id", tenantId)
    .single()

  if (error || !data) {
    return false
  }

  // TODO: Implement proper PIN verification with hashing
  return data.pin_hash === pin
}
