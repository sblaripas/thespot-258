import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Fetch employee by ID with role information
 */
export async function fetchEmployeeById(client: SupabaseClient, id: string, tenantId: string) {
  return await client.from("employees").select("*, role:roles(*)").eq("id", id).eq("tenant_id", tenantId).single()
}

/**
 * Fetch employee by phone number (for PIN login)
 */
export async function fetchEmployeeByPhone(client: SupabaseClient, phone: string, tenantId: string) {
  return await client
    .from("employees")
    .select("*, role:roles(*)")
    .eq("phone", phone)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .single()
}

/**
 * Fetch all employees for a tenant
 */
export async function fetchEmployees(client: SupabaseClient, tenantId: string) {
  return await client.from("employees").select("*, role:roles(*)").eq("tenant_id", tenantId).order("name")
}

/**
 * Fetch all roles for a tenant
 */
export async function fetchRoles(client: SupabaseClient, tenantId: string) {
  return await client.from("roles").select("*").eq("tenant_id", tenantId).order("access_level", { ascending: false })
}

/**
 * Update employee last login
 */
export async function updateEmployeeLastLogin(client: SupabaseClient, id: string, tenantId: string) {
  return await client
    .from("employees")
    .update({ last_login: new Date().toISOString() })
    .eq("id", id)
    .eq("tenant_id", tenantId)
}

/**
 * Verify employee PIN
 */
export async function verifyEmployeePin(client: SupabaseClient, phone: string, pin: string, tenantId: string) {
  // In a real implementation, you would hash the PIN and compare
  // For now, we'll do a simple comparison
  const { data, error } = await fetchEmployeeByPhone(client, phone, tenantId)

  if (error || !data) {
    return { valid: false, employee: null }
  }

  // TODO: Implement proper PIN hashing with bcrypt or similar
  const pinValid = data.pin_hash === pin

  return { valid: pinValid, employee: pinValid ? data : null }
}
