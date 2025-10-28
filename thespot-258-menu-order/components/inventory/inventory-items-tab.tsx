"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Upload } from "lucide-react"
import type { InventoryItem } from "@/lib/inventory/types"

interface InventoryItemsTabProps {
  staffUser: { phone: string; name: string; role: string }
  onUpdate: () => void
}

const categories = ["spirits", "mixers", "garnishes", "food", "cocktails", "beers", "wines", "other"]

const units = ["unit", "liter", "ml", "kg", "g", "bunch", "bottle", "can"]

export function InventoryItemsTab({ staffUser, onUpdate }: InventoryItemsTabProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "spirits",
    unit: "unit",
    current_stock: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    unit_cost: 0,
    supplier: "",
    barcode: "",
    sku: "",
    is_composite: false,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase.from("inventory_items").select("*").eq("is_active", true).order("name")

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error fetching items:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        const { error } = await supabase.from("inventory_items").update(formData).eq("id", editingItem.id)

        if (error) throw error
        alert("Item atualizado com sucesso!")
      } else {
        const { error } = await supabase.from("inventory_items").insert([formData])

        if (error) throw error
        alert("Item criado com sucesso!")
      }

      setShowDialog(false)
      resetForm()
      fetchItems()
      onUpdate()
    } catch (error) {
      console.error("Error saving item:", error)
      alert("Erro ao salvar item")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return

    try {
      const { error } = await supabase.from("inventory_items").update({ is_active: false }).eq("id", id)

      if (error) throw error
      alert("Item excluído com sucesso!")
      fetchItems()
      onUpdate()
    } catch (error) {
      console.error("Error deleting item:", error)
      alert("Erro ao excluir item")
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      unit: item.unit,
      current_stock: item.current_stock,
      min_stock_level: item.min_stock_level,
      max_stock_level: item.max_stock_level || 0,
      unit_cost: item.unit_cost,
      supplier: item.supplier || "",
      barcode: item.barcode || "",
      sku: item.sku || "",
      is_composite: item.is_composite,
    })
    setShowDialog(true)
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      category: "spirits",
      unit: "unit",
      current_stock: 0,
      min_stock_level: 0,
      max_stock_level: 0,
      unit_cost: 0,
      supplier: "",
      barcode: "",
      sku: "",
      is_composite: false,
    })
  }

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert("Por favor, selecione um arquivo CSV")
      return
    }

    try {
      const text = await csvFile.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const itemsToImport = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(",").map((v) => v.trim())
        const item: any = {}

        headers.forEach((header, index) => {
          item[header] = values[index]
        })

        // Validate and convert types
        itemsToImport.push({
          name: item.name,
          description: item.description || null,
          category: item.category || "other",
          unit: item.unit || "unit",
          current_stock: Number.parseFloat(item.current_stock) || 0,
          min_stock_level: Number.parseFloat(item.min_stock_level) || 0,
          max_stock_level: Number.parseFloat(item.max_stock_level) || null,
          unit_cost: Number.parseFloat(item.unit_cost) || 0,
          supplier: item.supplier || null,
          barcode: item.barcode || null,
          sku: item.sku || null,
          is_composite: item.is_composite === "true" || item.is_composite === "1",
        })
      }

      const { error } = await supabase.from("inventory_items").insert(itemsToImport)

      if (error) throw error

      alert(`${itemsToImport.length} itens importados com sucesso!`)
      setShowImportDialog(false)
      setCsvFile(null)
      fetchItems()
      onUpdate()
    } catch (error) {
      console.error("Error importing CSV:", error)
      alert("Erro ao importar CSV")
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <div className="text-center py-8">Carregando itens...</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens de Inventário</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowImportDialog(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
              <Button
                onClick={() => {
                  resetForm()
                  setShowDialog(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Item
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Pesquisar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Badge variant={item.is_composite ? "secondary" : "outline"}>{item.category}</Badge>
                    {item.current_stock <= item.min_stock_level && <Badge variant="destructive">Stock Baixo</Badge>}
                  </div>
                  {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      Stock: <strong>{item.current_stock}</strong> {item.unit}
                    </span>
                    <span>
                      Mínimo: <strong>{item.min_stock_level}</strong> {item.unit}
                    </span>
                    <span>
                      Custo: <strong>{item.unit_cost}</strong> MT/{item.unit}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_stock">Stock Atual *</Label>
              <Input
                id="current_stock"
                type="number"
                step="0.01"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock_level">Nível Mínimo *</Label>
              <Input
                id="min_stock_level"
                type="number"
                step="0.01"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock_level">Nível Máximo</Label>
              <Input
                id="max_stock_level"
                type="number"
                step="0.01"
                value={formData.max_stock_level}
                onChange={(e) => setFormData({ ...formData, max_stock_level: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Custo Unitário *</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Itens via CSV</DialogTitle>
            <DialogDescription>
              O arquivo CSV deve conter as colunas: name, description, category, unit, current_stock, min_stock_level,
              unit_cost
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportCSV} disabled={!csvFile}>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
