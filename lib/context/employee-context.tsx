"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Employee, EmployeePermissions } from "@/lib/types/employee"
import { getEmployeePermissions } from "@/lib/types/employee"

interface EmployeeContextType {
  employee: Employee | null
  permissions: EmployeePermissions | null
  isAuthenticated: boolean
  login: (employee: Employee) => void
  logout: () => void
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [permissions, setPermissions] = useState<EmployeePermissions | null>(null)

  useEffect(() => {
    // Load employee from session storage
    const stored = sessionStorage.getItem("employee")
    if (stored) {
      try {
        const emp = JSON.parse(stored) as Employee
        setEmployee(emp)
        setPermissions(getEmployeePermissions(emp))
      } catch (e) {
        console.error("Failed to parse stored employee:", e)
        sessionStorage.removeItem("employee")
      }
    }
  }, [])

  const login = (emp: Employee) => {
    setEmployee(emp)
    setPermissions(getEmployeePermissions(emp))
    sessionStorage.setItem("employee", JSON.stringify(emp))
  }

  const logout = () => {
    setEmployee(null)
    setPermissions(null)
    sessionStorage.removeItem("employee")
  }

  return (
    <EmployeeContext.Provider
      value={{
        employee,
        permissions,
        isAuthenticated: employee !== null,
        login,
        logout,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error("useEmployee must be used within EmployeeProvider")
  }
  return context
}
