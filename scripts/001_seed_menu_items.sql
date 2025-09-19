-- Seed menu items based on The Spot bar menu
INSERT INTO menu_items (name, description, price, category, stock_quantity, min_stock_alert, is_available) VALUES
-- Beers (Cervejas)
('2M 550ml', 'Premium Mozambican beer', 130, 'beers', 50, 10, true),
('2M Txoti 250ml', 'Small bottle premium beer', 120, 'beers', 40, 8, true),
('HEINEKEN 210ml', 'International premium beer', 130, 'beers', 30, 5, true),
('TXILAR 330ml', 'Local favorite beer', 120, 'beers', 45, 10, true),
('MANICA 330ml', 'Regional beer selection', 120, 'beers', 35, 8, true),
('CASTLE LITE 330ml', 'Light refreshing beer', 130, 'beers', 25, 5, true),
('CORONA 355ml', 'Mexican beer with lime', 150, 'beers', 20, 5, true),
('LAURENTINA PRETA TXOTI 250ml', 'Dark beer specialty', 120, 'beers', 30, 6, true),

-- Ciders (Cidras)
('FLYING FISH', 'Citrus flavored cider', 150, 'ciders', 25, 5, true),
('SAVANNA DRY', 'Dry apple cider', 180, 'ciders', 20, 4, true),
('SAVANNA LEMON', 'Lemon flavored cider', 180, 'ciders', 20, 4, true),
('BERNIN', 'Premium cider selection', 180, 'ciders', 15, 3, true),
('BERNINI 500ML', 'Large premium cider', 200, 'ciders', 12, 3, true),
('BRUTAL', 'Strong cider variety', 180, 'ciders', 18, 4, true),
('J.C A LATA', 'Canned cider specialty', 200, 'ciders', 15, 3, true),

-- Cocktails (Coquetéis)
('CAIPIRINHA DE LIMÃO', 'Classic Brazilian cocktail with lime', 250, 'cocktails', 100, 20, true),
('CAIPIRINHA DE MARACUJÁ', 'Passion fruit caipirinha', 250, 'cocktails', 100, 20, true),
('CAIPIRINHA DE FRUTOS VERMELHOS', 'Red berries caipirinha', 250, 'cocktails', 100, 20, true),
('GIN & TONIC', 'Classic gin and tonic', 380, 'cocktails', 100, 20, true),
('MAGNUM SPECIAL', 'House special cocktail', 500, 'cocktails', 50, 10, true),
('GIN & TONIC PROMO', 'Promotional gin and tonic', 300, 'cocktails', 100, 20, true),

-- Shots
('TEQUILA SHOT', 'Premium tequila shot', 150, 'shots', 50, 10, true),
('VODKA SHOT', 'Premium vodka shot', 150, 'shots', 50, 10, true),
('WHISKEY SHOT', 'Premium whiskey shot', 180, 'shots', 40, 8, true),
('RUM SHOT', 'Premium rum shot', 150, 'shots', 45, 10, true),

-- Liqueurs (Licores)
('AMARULA', 'Cream liqueur', 200, 'liqueurs', 20, 4, true),
('BAILEYS', 'Irish cream liqueur', 220, 'liqueurs', 15, 3, true),
('KAHLUA', 'Coffee liqueur', 200, 'liqueurs', 18, 4, true),

-- Bottles (Garrafas)
('WHISKEY BOTTLE', 'Premium whiskey bottle', 2500, 'bottles', 10, 2, true),
('VODKA BOTTLE', 'Premium vodka bottle', 2000, 'bottles', 12, 2, true),
('GIN BOTTLE', 'Premium gin bottle', 2200, 'bottles', 8, 2, true),
('RUM BOTTLE', 'Premium rum bottle', 2000, 'bottles', 10, 2, true),

-- Food items
('GRILLED CHICKEN', 'Grilled chicken with sides', 450, 'food', 20, 5, true),
('BEEF STEAK', 'Premium beef steak', 650, 'food', 15, 3, true),
('FISH FILLET', 'Fresh fish fillet', 550, 'food', 12, 3, true),
('VEGETARIAN PASTA', 'Pasta with vegetables', 350, 'food', 25, 5, true),
('PRAWNS', 'Grilled prawns', 750, 'food', 10, 2, true),
('CHICKEN WINGS', 'Spicy chicken wings', 300, 'food', 30, 6, true),
('NACHOS', 'Loaded nachos with cheese', 250, 'food', 40, 8, true),
('BURGER', 'Gourmet burger with fries', 400, 'food', 25, 5, true);
