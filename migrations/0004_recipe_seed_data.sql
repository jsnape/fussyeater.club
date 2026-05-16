-- Sample recipe seed data for local development and manual testing.
-- All recipes are public so they work without household setup.
-- Private-visibility access control is covered by unit tests.

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'spaghetti-carbonara',
    'Spaghetti Carbonara',
    'Creamy weeknight pasta with **pancetta** and black pepper.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    '1 large bowl',
    10,
    15,
    '[{"amount":400.0,"unit":"g","ingredient":"spaghetti","ingredientGroup":"Pasta"},{"amount":150.0,"unit":"g","ingredient":"pancetta","ingredientGroup":"Sauce","preparation":{"type":"text","text":"diced"}},{"amount":3.0,"unit":null,"ingredient":"large eggs","ingredientGroup":"Sauce"},{"amount":60.0,"unit":"g","ingredient":"pecorino romano","ingredientGroup":"Sauce","preparation":{"type":"text","text":"finely grated"}},{"amount":1.0,"unit":"tsp","ingredient":"black pepper","preparation":{"type":"text","text":"freshly ground"}}]',
    '["Cook spaghetti in salted water until al dente.","Crisp pancetta in a pan.","Whisk eggs, cheese, and pepper.","Toss hot pasta with pancetta, then egg mixture off heat.","Serve immediately with extra cheese and pepper."]',
    NULL,
    'A true Roman classic — the key is to toss off the heat so eggs emulsify rather than scramble.',
    '["italian","quick","family-favorite"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'classic-beef-bourguignon',
    'Classic Beef Bourguignon',
    'A traditional slow-cooked French stew from a trusted cookbook source.',
    NULL,
    'reference',
    'public',
    NULL,
    6,
    '6 pints',
    30,
    180,
    '[{"amount":1.5,"unit":"kg","ingredient":"beef chuck","ingredientGroup":"Stew","preparation":{"type":"text","text":"cut into chunks"}},{"amount":200.0,"unit":"g","ingredient":"smoked bacon","ingredientGroup":"Stew","preparation":{"type":"text","text":"diced"}},{"amount":12.0,"unit":null,"ingredient":"small onions","ingredientGroup":"Vegetables","preparation":{"type":"text","text":"peeled"}},{"amount":250.0,"unit":"g","ingredient":"mushrooms","ingredientGroup":"Vegetables","preparation":{"type":"text","text":"quartered"}}]',
    NULL,
    '{"kind":"book","label":"Mastering French Cooking, p. 315","bookTitle":"Mastering French Cooking","pageNumber":315,"isbn":"978-0375413407"}',
    NULL,
    '["french","slow-cook","comfort-food"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'secret-family-lasagne',
    'Secret Family Lasagne',
    'Our household''s special layered lasagne recipe.',
    NULL,
    'full',
    'public',
    NULL,
    8,
    '1 large dish',
    45,
    60,
    '[{"amount":500.0,"unit":"g","ingredient":"beef mince","ingredientGroup":"Ragu"},{"amount":1.0,"unit":null,"ingredient":"onion","ingredientGroup":"Ragu","preparation":{"type":"text","text":"finely chopped"}},{"amount":400.0,"unit":"g","ingredient":"chopped tomatoes","ingredientGroup":"Ragu"},{"amount":500.0,"unit":"ml","ingredient":"bechamel sauce","ingredientGroup":"Assembly","preparation":{"type":"recipe-link","recipeId":"basic-bechamel","recipeLabel":"Basic Bechamel"}},{"amount":12.0,"unit":null,"ingredient":"lasagne sheets","ingredientGroup":"Assembly"},{"amount":200.0,"unit":"g","ingredient":"mozzarella","ingredientGroup":"Assembly","preparation":{"type":"text","text":"grated"}}]',
    '["Brown the mince with onion until cooked through.","Add chopped tomatoes and simmer for 30 minutes.","Layer ragu, lasagne sheets, and bechamel in a dish.","Top with mozzarella.","Bake at 180°C for 40 minutes until golden and bubbling."]',
    NULL,
    'Let it rest for 10 minutes before cutting — the layers hold together much better.',
    '["italian","family-favorite","batch-cook"]'
);
