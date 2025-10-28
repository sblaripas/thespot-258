"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser, getAllUsers, createUser, updateUser, deleteUser } from "./actions"
import {
  BarChart3,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Edit,
  Save,
  X,
  Trash2,
  UserPlus,
} from "lucide-react"

interface StaffUser {
  phone: string
  name: string
  role: string
  otp: string
}

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeWallets: number
  lowStockItems: number
  todayRevenue: number
  todayOrders: number
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  stock_quantity: number
  min_stock_alert: number
  is_available: boolean
}

interface RecentOrder {
  id: string
  total_amount: number
  status: string
  created_at: string
  client_phone: string
  staff_name: string
}

export default function AdminPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeWallets: 0,
    lowStockItems: 0,
    todayRevenue: 0,
    todayOrders: 0,
  })
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({})
  const [users, setUsers] = useState<any[]>([])
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [userForm, setUserForm] = useState({
    phone: "",
    name: "",
    role: "customer",
  })
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "menu">("dashboard")
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (user && user.role === "admin") {
        setStaffUser(user)
        fetchDashboardData()
        fetchUsers()
      } else {
        window.location.href = "/auth/login"
      }
    }
    checkAuth()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      await Promise.all([fetchStats(), fetchMenuItems(), fetchRecentOrders()])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Total revenue from transactions
      const { data: totalRevenueData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("transaction_type", "debit")

      const totalRevenue = totalRevenueData?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

      // Total orders
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")

      // Active wallets
      const { count: activeWallets } = await supabase
        .from("wallets")
        .select("*", { count: "exact", head: true })
        .not("activated_at", "is", null)

      // Low stock items
      const { data: lowStockData } = await supabase
        .from("menu_items")
        .select("stock_quantity, min_stock_alert")
        .lte("stock_quantity", supabase.raw("min_stock_alert"))

      // Today's stats
      const today = new Date().toISOString().split("T")[0]

      const { data: todayRevenueData } = await supabase
        .from("transactions")
        .select("amount")
        .eq("transaction_type", "debit")
        .gte("created_at", `${today}T00:00:00`)

      const todayRevenue = todayRevenueData?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

      const { count: todayOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")
        .gte("created_at", `${today}T00:00:00`)

      setStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        activeWallets: activeWallets || 0,
        lowStockItems: lowStockData?.length || 0,
        todayRevenue,
        todayOrders: todayOrders || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").order("category").order("name")

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_amount,
          status,
          created_at,
          wallets!inner(client_phone)
        `)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      const formattedOrders =
        data?.map((order) => ({
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          client_phone: order.wallets.client_phone,
          staff_name: "Staff", // Could be enhanced to get actual staff name
        })) || []

      setRecentOrders(formattedOrders)
    } catch (error) {
      console.error("Error fetching recent orders:", error)
    }
  }

  const fetchUsers = async () => {
    const result = await getAllUsers()
    if (result.success && result.users) {
      setUsers(result.users)
    }
  }

  const startEditing = (item: MenuItem) => {
    setEditingItem(item.id)
    setEditForm({
      name: item.name,
      price: item.price,
      stock_quantity: item.stock_quantity,
      min_stock_alert: item.min_stock_alert,
      is_available: item.is_available,
    })
  }

  const saveEdit = async () => {
    if (!editingItem || !editForm) return

    try {
      const { error } = await supabase.from("menu_items").update(editForm).eq("id", editingItem)

      if (error) throw error

      // Update local state
      setMenuItems((prev) => prev.map((item) => (item.id === editingItem ? { ...item, ...editForm } : item)))

      setEditingItem(null)
      setEditForm({})
    } catch (error) {
      console.error("Error updating menu item:", error)
      alert("Failed to update menu item")
    }
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditForm({})
  }

  const openUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setUserForm({
        phone: user.phone,
        name: user.name,
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setUserForm({
        phone: "",
        name: "",
        role: "customer",
      })
    }
    setIsUserDialogOpen(true)
  }

  const closeUserDialog = () => {
    setIsUserDialogOpen(false)
    setEditingUser(null)
    setUserForm({
      phone: "",
      name: "",
      role: "customer",
    })
  }

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        const result = await updateUser(editingUser.id, userForm)
        if (result.success) {
          await fetchUsers()
          closeUserDialog()
        } else {
          alert(result.error || "Failed to update user")
        }
      } else {
        const result = await createUser(userForm)
        if (result.success) {
          await fetchUsers()
          closeUserDialog()
        } else {
          alert(result.error || "Failed to create user")
        }
      }
    } catch (error) {
      console.error("Error saving user:", error)
      alert("An unexpected error occurred")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        await fetchUsers()
      } else {
        alert(result.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("An unexpected error occurred")
    }
  }

  const formatCurrency = (amount: number) => `${amount} MT`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-MZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!staffUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">THE SPOT ADMIN</h1>
              <p className="text-muted-foreground">Welcome, {staffUser?.name}</p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/staff")}>
              Back to Staff Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 border-b border-border">
          <Button variant={activeTab === "dashboard" ? "default" : "ghost"} onClick={() => setActiveTab("dashboard")}>
            Dashboard
          </Button>
          <Button variant={activeTab === "users" ? "default" : "ghost"} onClick={() => setActiveTab("users")}>
            <Users className="w-4 h-4 mr-2" />
            User Management
          </Button>
          <Button variant={activeTab === "menu" ? "default" : "ghost"} onClick={() => setActiveTab("menu")}>
            <Package className="w-4 h-4 mr-2" />
            Menu Management
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">Today: {formatCurrency(stats.todayRevenue)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Today: {stats.todayOrders}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{stats.activeWallets}</div>
                  <p className="text-xs text-muted-foreground">Activated wallets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.lowStockItems}</div>
                  <p className="text-xs text-muted-foreground">Need restocking</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.client_phone} • {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                          <Badge
                            variant={
                              order.status === "confirmed"
                                ? "default"
                                : order.status === "pending_confirmation"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <Button onClick={() => openUserDialog()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "waiter" || user.role === "barman"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                      <p className="text-xs text-muted-foreground">Created: {formatDate(user.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openUserDialog(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === "admin" && users.filter((u) => u.role === "admin").length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "menu" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Menu Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    {editingItem === item.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2">
                        <Input
                          value={editForm.name || ""}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                        />
                        <Input
                          type="number"
                          value={editForm.price || ""}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number.parseInt(e.target.value) }))}
                          placeholder="Price"
                        />
                        <Input
                          type="number"
                          value={editForm.stock_quantity || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, stock_quantity: Number.parseInt(e.target.value) }))
                          }
                          placeholder="Stock"
                        />
                        <Input
                          type="number"
                          value={editForm.min_stock_alert || ""}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, min_stock_alert: Number.parseInt(e.target.value) }))
                          }
                          placeholder="Min Stock"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant={item.is_available ? "default" : "secondary"}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </Badge>
                            {item.stock_quantity <= item.min_stock_alert && (
                              <Badge variant="destructive">Low Stock</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Price: {formatCurrency(item.price)}</span>
                            <span>Stock: {item.stock_quantity}</span>
                            <span>Category: {item.category}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => startEditing(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information" : "Create a new user account"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+258 84 123 4567"
                value={userForm.phone}
                onChange={(e) => setUserForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={userForm.name}
                onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="barman">Barman</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeUserDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>{editingUser ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
