-- ========================
-- SEED DEFAULT CATEGORIES AND SUPPLIERS FOR THE SPOT
-- ========================

-- Default tenant ID
DO $$ 
DECLARE
    default_tenant_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN

-- ========================
-- SEED CATEGORIES
-- ========================

INSERT INTO categories (tenant_id, name_pt, name_en, description_pt, description_en, display_order, is_active)
VALUES 
    (default_tenant_id, 'Bebidas', 'Drinks', 'Bebidas alcoólicas e não alcoólicas', 'Alcoholic and non-alcoholic beverages', 1, TRUE),
    (default_tenant_id, 'Cocktails', 'Cocktails', 'Cocktails clássicos e especiais', 'Classic and signature cocktails', 2, TRUE),
    (default_tenant_id, 'Shots', 'Shots', 'Shots e bebidas rápidas', 'Shots and quick drinks', 3, TRUE),
    (default_tenant_id, 'Cervejas', 'Beers', 'Cervejas nacionais e importadas', 'Local and imported beers', 4, TRUE),
    (default_tenant_id, 'Vinhos', 'Wines', 'Vinhos tintos, brancos e rosés', 'Red, white and rosé wines', 5, TRUE),
    (default_tenant_id, 'Petiscos', 'Appetizers', 'Petiscos e entradas', 'Snacks and starters', 6, TRUE),
    (default_tenant_id, 'Pratos Principais', 'Main Courses', 'Pratos principais', 'Main dishes', 7, TRUE),
    (default_tenant_id, 'Sobremesas', 'Desserts', 'Sobremesas e doces', 'Desserts and sweets', 8, TRUE),
    (default_tenant_id, 'Refrigerantes', 'Soft Drinks', 'Refrigerantes e sumos', 'Sodas and juices', 9, TRUE),
    (default_tenant_id, 'Cafés', 'Coffees', 'Cafés e bebidas quentes', 'Coffees and hot beverages', 10, TRUE)
ON CONFLICT DO NOTHING;

-- ========================
-- SEED SUPPLIERS
-- ========================

INSERT INTO suppliers (tenant_id, name, contact_person, phone, email, address, payment_terms, is_active)
VALUES 
    (default_tenant_id, 'Cervejas de Moçambique (CDM)', 'João Silva', '+258 84 111 1111', 'vendas@cdm.co.mz', 'Av. das Indústrias, Matola', '30 dias', TRUE),
    (default_tenant_id, 'Vinhos Maputo', 'Maria Santos', '+258 84 222 2222', 'info@vinhosmaputo.co.mz', 'Rua da Mesquita, Maputo', '15 dias', TRUE),
    (default_tenant_id, 'Distribuidora Central', 'Pedro Costa', '+258 84 333 3333', 'vendas@distcentral.co.mz', 'Av. Julius Nyerere, Maputo', '30 dias', TRUE),
    (default_tenant_id, 'Fresh Foods Moz', 'Ana Machado', '+258 84 444 4444', 'pedidos@freshfoods.co.mz', 'Mercado Central, Maputo', '7 dias', TRUE),
    (default_tenant_id, 'Bebidas Premium Lda', 'Carlos Nhantumbo', '+258 84 555 5555', 'info@bebidaspremium.co.mz', 'Av. Marginal, Maputo', '30 dias', TRUE)
ON CONFLICT DO NOTHING;

-- ========================
-- SEED ALLERGENS
-- ========================

INSERT INTO allergens (tenant_id, name_pt, name_en, description_pt, description_en)
VALUES 
    (default_tenant_id, 'Glúten', 'Gluten', 'Contém glúten (trigo, centeio, cevada)', 'Contains gluten (wheat, rye, barley)'),
    (default_tenant_id, 'Lactose', 'Lactose', 'Contém lactose (leite e derivados)', 'Contains lactose (milk and dairy)'),
    (default_tenant_id, 'Amendoim', 'Peanuts', 'Contém amendoim', 'Contains peanuts'),
    (default_tenant_id, 'Frutos Secos', 'Tree Nuts', 'Contém frutos secos (nozes, amêndoas, etc.)', 'Contains tree nuts (walnuts, almonds, etc.)'),
    (default_tenant_id, 'Marisco', 'Shellfish', 'Contém marisco', 'Contains shellfish'),
    (default_tenant_id, 'Peixe', 'Fish', 'Contém peixe', 'Contains fish'),
    (default_tenant_id, 'Ovos', 'Eggs', 'Contém ovos', 'Contains eggs'),
    (default_tenant_id, 'Soja', 'Soy', 'Contém soja', 'Contains soy'),
    (default_tenant_id, 'Sulfitos', 'Sulfites', 'Contém sulfitos', 'Contains sulfites')
ON CONFLICT DO NOTHING;

END $$;
