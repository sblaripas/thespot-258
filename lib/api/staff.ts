"use server"

import { createServiceClient } from "@/lib/supabase/server"
import { fetchEmployees, fetchEmployeeById, fetchRoles } from "@/lib/db/queries/staff"
import type { Employee, Role } from "@/lib/types/staff"

export async function getEmployees(tenantId: string) {
  const supabase = await createServiceClient()
  const { data, error } = await fetchEmployees(supabase, tenantId)

  if (error) {
    throw new Error(`Failed to fetch employees: ${error.message}`)
  }

  return data as Employee[]
}

export async function getEmployeeById(id: string, tenantId: string) {
  const supabase = await createServiceClient()
  const { data, error } = await fetchEmployeeById(supabase, id, tenantId)

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`)
  }

  return data as Employee
}

export async function getRoles(tenantId: string) {
  const supabase = await createServiceClient()
  const { data, error } = await fetchRoles(supabase, tenantId)

  if (error) {
    throw new Error(`Failed to fetch roles: ${error.message}`)
  }

  return data as Role[]
}

export async function createEmployee(tenantId: string, employeeData: Partial<Employee>) {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from("employees")
    .insert({
      tenant_id: tenantId,
      ...employeeData,
    })
    .select("*, role:roles(*)")
    .single()

  if (error) {
    throw new Error(`Failed to create employee: ${error.message}`)
  }

  return data as Employee
}

export async function updateEmployee(id: string, tenantId: string, employeeData: Partial<Employee>) {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from("employees")
    .update(employeeData)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select("*, role:roles(*)")
    .single()

  if (error) {
    throw new Error(`Failed to update employee: ${error.message}`)
  }

  return data as Employee
}

export async function deleteEmployee(id: string, tenantId: string) {
  const supabase = await createServiceClient()

  const { error } = await supabase.from("employees").update({ is_active: false }).eq("id", id).eq("tenant_id", tenantId)

  if (error) {
    throw new Error(`Failed to delete employee: ${error.message}`)
  }

  return true
}
