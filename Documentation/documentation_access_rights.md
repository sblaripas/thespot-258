# Access Rights Management System

## Overview
A comprehensive role-based access control (RBAC) system for managing employee permissions across POS and Back Office applications.

## Features

### Role Management
- **Pre-defined Roles**: Owner, Administrator, Manager, Cashier
- **Custom Role Creation**: Add new roles with custom permissions
- **Role Editing**: Modify existing roles and their permissions
- **Role Deletion**: Remove roles (with protection for Owner role)
- **Bulk Operations**: Select and delete multiple roles simultaneously

### Access Control
- **Dual System Access**: Configure permissions for both POS and Back Office
- **Granular Permissions**: Fine-grained control over specific functionalities
- **Toggle-based Access**: Enable/disable entire system access with master switches

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Modern dark color scheme with gradient background
- **Modal-based Editing**: Inline role editing without page navigation
- **Pagination Support**: Handles large numbers of roles efficiently

## Role Structure

### Core Properties
```typescript
interface Role {
  id: string;
  name: string;
  color: string;
  employeeCount: number;
  posAccess: boolean;
  posPermissions: string[];
  backOfficeAccess: boolean;
  backOfficePermissions: string[];
}