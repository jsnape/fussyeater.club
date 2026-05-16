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

-- Additional seed recipes for browse page testing

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'fish-fingers-chips',
    'Homemade Fish Fingers & Chips',
    'Crispy baked fish fingers with oven chips — a fussy-eater favourite that beats the freezer version.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    15,
    25,
    '[{"amount":400.0,"unit":"g","ingredient":"cod loin","preparation":{"type":"text","text":"cut into fingers"}},{"amount":100.0,"unit":"g","ingredient":"breadcrumbs"},{"amount":2.0,"unit":null,"ingredient":"eggs","preparation":{"type":"text","text":"beaten"}},{"amount":800.0,"unit":"g","ingredient":"potatoes","preparation":{"type":"text","text":"cut into chips"}},{"amount":2.0,"unit":"tbsp","ingredient":"olive oil"}]',
    '["Cut fish into finger-sized pieces.","Dip in egg, then breadcrumbs.","Place on baking tray with chips.","Bake at 200°C for 25 minutes, turning halfway."]',
    NULL,
    'Use panko breadcrumbs for extra crunch. Freeze uncooked for midweek meals.',
    '["kid-friendly","dairy-free","batch-cook"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'banana-pancakes',
    'Two-Ingredient Banana Pancakes',
    'Just banana and eggs — naturally gluten-free, sweet, and loved by toddlers and teens alike.',
    NULL,
    'full',
    'public',
    NULL,
    2,
    '8 small pancakes',
    5,
    10,
    '[{"amount":2.0,"unit":null,"ingredient":"ripe bananas","preparation":{"type":"text","text":"mashed"}},{"amount":2.0,"unit":null,"ingredient":"eggs","preparation":{"type":"text","text":"beaten"}}]',
    '["Mash bananas until smooth.","Mix in beaten eggs.","Fry small spoonfuls in a non-stick pan for 2 min each side.","Serve with berries or a drizzle of honey."]',
    NULL,
    NULL,
    '["breakfast","gluten-free","quick","kid-friendly"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'hidden-veg-bolognese',
    'Hidden Veg Bolognese',
    'Classic bolognese packed with grated vegetables that fussy eaters won''t notice. The secret is grating everything finely.',
    NULL,
    'full',
    'public',
    NULL,
    6,
    NULL,
    20,
    40,
    '[{"amount":500.0,"unit":"g","ingredient":"beef mince"},{"amount":2.0,"unit":null,"ingredient":"carrots","preparation":{"type":"text","text":"finely grated"}},{"amount":2.0,"unit":null,"ingredient":"courgettes","preparation":{"type":"text","text":"finely grated"}},{"amount":1.0,"unit":null,"ingredient":"red pepper","preparation":{"type":"text","text":"finely diced"}},{"amount":400.0,"unit":"g","ingredient":"passata"},{"amount":2.0,"unit":"tbsp","ingredient":"tomato puree"},{"amount":400.0,"unit":"g","ingredient":"spaghetti"}]',
    '["Brown the mince in a large pan.","Add grated carrots, courgette, and pepper — cook until softened.","Stir in passata and tomato puree, simmer 30 min.","Cook spaghetti and serve with sauce on top."]',
    NULL,
    'Blitz the sauce if your child prefers smooth textures.',
    '["family-favorite","hidden-veg","batch-cook"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'cheese-quesadillas',
    'Cheese Quesadillas',
    'Melty cheese in a crispy tortilla — ready in 10 minutes. Add fillings gradually for adventurous eaters.',
    NULL,
    'full',
    'public',
    NULL,
    2,
    '4 quesadillas',
    5,
    5,
    '[{"amount":4.0,"unit":null,"ingredient":"flour tortillas"},{"amount":200.0,"unit":"g","ingredient":"cheddar cheese","preparation":{"type":"text","text":"grated"}},{"amount":1.0,"unit":"tbsp","ingredient":"butter"}]',
    '["Place grated cheese on one half of each tortilla.","Fold in half and press gently.","Cook in a buttered pan for 2 min each side until golden.","Cut into triangles and serve."]',
    NULL,
    'Great as a safe base — try adding ham, sweetcorn, or mild salsa over time.',
    '["quick","kid-friendly","vegetarian","snack"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'chicken-nuggets',
    'Baked Chicken Nuggets',
    'Homemade baked nuggets with a cornflake crumb coating. Crunchy outside, juicy inside.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    '20 nuggets',
    15,
    20,
    '[{"amount":500.0,"unit":"g","ingredient":"chicken breast","preparation":{"type":"text","text":"cut into chunks"}},{"amount":100.0,"unit":"g","ingredient":"cornflakes","preparation":{"type":"text","text":"crushed"}},{"amount":2.0,"unit":null,"ingredient":"eggs","preparation":{"type":"text","text":"beaten"}},{"amount":1.0,"unit":"tsp","ingredient":"garlic powder"},{"amount":1.0,"unit":"tsp","ingredient":"paprika"}]',
    '["Preheat oven to 200°C.","Season crushed cornflakes with garlic powder and paprika.","Dip chicken in egg, then coat in cornflake mixture.","Place on lined baking tray.","Bake 20 minutes until golden and cooked through."]',
    NULL,
    'Freeze raw on a tray, then bag up for quick midweek dinners.',
    '["kid-friendly","dairy-free","batch-cook"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'veggie-fried-rice',
    'Veggie Fried Rice',
    'Use up leftover rice and whatever veg you have. A great way to introduce new vegetables one at a time.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    10,
    10,
    '[{"amount":400.0,"unit":"g","ingredient":"cooked rice","preparation":{"type":"text","text":"cold, day-old is best"}},{"amount":2.0,"unit":null,"ingredient":"eggs","preparation":{"type":"text","text":"beaten"}},{"amount":100.0,"unit":"g","ingredient":"frozen peas"},{"amount":1.0,"unit":null,"ingredient":"carrot","preparation":{"type":"text","text":"finely diced"}},{"amount":2.0,"unit":"tbsp","ingredient":"soy sauce"},{"amount":1.0,"unit":"tbsp","ingredient":"sesame oil"}]',
    '["Heat oil in a wok over high heat.","Scramble eggs, push to one side.","Add diced veg, stir-fry 3 min.","Add cold rice and soy sauce, toss until heated through.","Serve immediately."]',
    NULL,
    NULL,
    '["quick","vegetarian","kid-friendly"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'simple-tomato-soup',
    'Simple Tomato Soup',
    'Smooth, sweet tomato soup that even the pickiest eaters enjoy. No lumps, no bits — just pure comfort.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    10,
    25,
    '[{"amount":2.0,"unit":null,"ingredient":"tins chopped tomatoes"},{"amount":1.0,"unit":null,"ingredient":"onion","preparation":{"type":"text","text":"diced"}},{"amount":1.0,"unit":"clove","ingredient":"garlic","preparation":{"type":"text","text":"minced"}},{"amount":500.0,"unit":"ml","ingredient":"vegetable stock"},{"amount":1.0,"unit":"tsp","ingredient":"sugar"},{"amount":2.0,"unit":"tbsp","ingredient":"olive oil"}]',
    '["Soften onion and garlic in oil.","Add tomatoes, stock, and sugar.","Simmer 20 minutes.","Blend until completely smooth.","Season and serve with bread for dipping."]',
    NULL,
    'Add a swirl of cream or serve with grilled cheese soldiers.',
    '["vegetarian","smooth","comfort-food","kid-friendly"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'mac-and-cheese',
    'Stovetop Mac & Cheese',
    'Creamy, cheesy, and on the table in 20 minutes. The ultimate safe food for cheese lovers.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    5,
    15,
    '[{"amount":350.0,"unit":"g","ingredient":"macaroni"},{"amount":30.0,"unit":"g","ingredient":"butter"},{"amount":2.0,"unit":"tbsp","ingredient":"plain flour"},{"amount":500.0,"unit":"ml","ingredient":"milk"},{"amount":200.0,"unit":"g","ingredient":"cheddar cheese","preparation":{"type":"text","text":"grated"}},{"amount":1.0,"unit":"tsp","ingredient":"mustard powder"}]',
    '["Cook macaroni until al dente.","Melt butter, stir in flour, cook 1 min.","Gradually whisk in milk until thickened.","Stir in cheese and mustard until melted.","Combine with pasta and serve."]',
    NULL,
    'Add a breadcrumb topping and grill for 5 min for a crunchier version.',
    '["quick","vegetarian","kid-friendly","comfort-food"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'sweet-potato-wedges',
    'Crispy Sweet Potato Wedges',
    'Naturally sweet, crispy on the outside, fluffy inside. A great side or snack.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    10,
    30,
    '[{"amount":4.0,"unit":null,"ingredient":"sweet potatoes","preparation":{"type":"text","text":"cut into wedges"}},{"amount":2.0,"unit":"tbsp","ingredient":"olive oil"},{"amount":1.0,"unit":"tsp","ingredient":"smoked paprika"},{"amount":0.5,"unit":"tsp","ingredient":"garlic powder"}]',
    '["Preheat oven to 200°C.","Toss wedges in oil, paprika, and garlic powder.","Spread on a baking tray in a single layer.","Bake 30 minutes, turning halfway, until crispy."]',
    NULL,
    NULL,
    '["vegetarian","gluten-free","kid-friendly","snack"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'overnight-oats',
    'Overnight Oats',
    'Prep the night before, grab from the fridge in the morning. Smooth texture, naturally sweet.',
    NULL,
    'full',
    'public',
    NULL,
    1,
    '1 jar',
    5,
    0,
    '[{"amount":50.0,"unit":"g","ingredient":"rolled oats"},{"amount":150.0,"unit":"ml","ingredient":"milk"},{"amount":1.0,"unit":"tbsp","ingredient":"honey"},{"amount":1.0,"unit":"tbsp","ingredient":"chia seeds"},{"amount":50.0,"unit":"g","ingredient":"berries"}]',
    '["Combine oats, milk, honey, and chia seeds in a jar.","Stir well, cover, and refrigerate overnight.","Top with berries before serving."]',
    NULL,
    'Use dairy-free milk for a vegan version. Try peanut butter and banana as a topping.',
    '["breakfast","quick","vegetarian"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'pitta-pizzas',
    'Pitta Bread Pizzas',
    'Individual pizzas using pitta breads as the base. Kids can choose their own toppings.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    '4 pizzas',
    10,
    8,
    '[{"amount":4.0,"unit":null,"ingredient":"pitta breads"},{"amount":4.0,"unit":"tbsp","ingredient":"tomato puree"},{"amount":150.0,"unit":"g","ingredient":"mozzarella","preparation":{"type":"text","text":"grated"}},{"amount":null,"unit":null,"ingredient":"toppings of choice"}]',
    '["Spread tomato puree on each pitta.","Add cheese and chosen toppings.","Grill for 6-8 minutes until cheese melts and bubbles.","Cool slightly before serving."]',
    NULL,
    'Great for fussy eaters — they feel in control of what goes on top.',
    '["quick","kid-friendly","vegetarian","fun"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'mild-chicken-curry',
    'Mild Chicken Curry',
    'A gently spiced creamy curry that works as a first introduction to Indian flavours.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    15,
    30,
    '[{"amount":500.0,"unit":"g","ingredient":"chicken thighs","preparation":{"type":"text","text":"diced"}},{"amount":1.0,"unit":null,"ingredient":"onion","preparation":{"type":"text","text":"diced"}},{"amount":2.0,"unit":"tsp","ingredient":"mild curry powder"},{"amount":200.0,"unit":"ml","ingredient":"coconut milk"},{"amount":200.0,"unit":"g","ingredient":"passata"},{"amount":1.0,"unit":"tbsp","ingredient":"mango chutney"}]',
    '["Fry onion until soft.","Add chicken and cook until sealed.","Stir in curry powder, cook 1 min.","Add coconut milk, passata, and chutney.","Simmer 25 min until chicken is cooked. Serve with rice."]',
    NULL,
    'The mango chutney adds sweetness that kids love. Increase spice gradually over time.',
    '["kid-friendly","dairy-free","gluten-free","family-favorite"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'bbc-good-food-flapjacks',
    'Golden Flapjacks',
    'Chewy oat flapjacks from BBC Good Food — a reliable after-school snack.',
    NULL,
    'reference',
    'public',
    NULL,
    12,
    '12 bars',
    10,
    25,
    '[{"amount":250.0,"unit":"g","ingredient":"rolled oats"},{"amount":125.0,"unit":"g","ingredient":"butter"},{"amount":125.0,"unit":"g","ingredient":"golden syrup"},{"amount":75.0,"unit":"g","ingredient":"demerara sugar"}]',
    NULL,
    '{"kind":"url","label":"BBC Good Food Flapjacks","url":"https://www.bbcgoodfood.com/recipes/yummy-golden-syrup-flapjacks"}',
    NULL,
    '["snack","vegetarian","batch-cook","kid-friendly"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'scrambled-eggs-toast',
    'Perfect Scrambled Eggs on Toast',
    'Soft, creamy scrambled eggs. A safe breakfast that most children will eat happily.',
    NULL,
    'full',
    'public',
    NULL,
    2,
    NULL,
    2,
    5,
    '[{"amount":4.0,"unit":null,"ingredient":"eggs"},{"amount":1.0,"unit":"tbsp","ingredient":"butter"},{"amount":1.0,"unit":"tbsp","ingredient":"milk"},{"amount":2.0,"unit":"slices","ingredient":"bread","preparation":{"type":"text","text":"toasted"}}]',
    '["Beat eggs with milk and a pinch of salt.","Melt butter in a non-stick pan over low heat.","Add eggs and stir gently with a spatula.","Remove from heat while still slightly underdone — they will continue cooking.","Serve immediately on hot toast."]',
    NULL,
    'The key is low heat and patience. Remove before they look fully done.',
    '["breakfast","quick","vegetarian","kid-friendly"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'slow-cooker-pulled-chicken',
    'Slow Cooker Pulled Chicken',
    'Throw it in the slow cooker in the morning, shred at dinner. Works in wraps, sandwiches, or on rice.',
    NULL,
    'full',
    'public',
    NULL,
    6,
    NULL,
    10,
    240,
    '[{"amount":1.0,"unit":"kg","ingredient":"chicken thighs","preparation":{"type":"text","text":"boneless, skinless"}},{"amount":200.0,"unit":"ml","ingredient":"BBQ sauce"},{"amount":100.0,"unit":"ml","ingredient":"chicken stock"},{"amount":1.0,"unit":"tbsp","ingredient":"smoked paprika"},{"amount":1.0,"unit":"tsp","ingredient":"garlic powder"}]',
    '["Place chicken in slow cooker.","Mix BBQ sauce, stock, paprika, and garlic powder; pour over chicken.","Cook on low for 6-8 hours or high for 4 hours.","Shred with two forks and stir through the sauce."]',
    NULL,
    'Freezes brilliantly. Mild enough for kids, flavourful enough for adults.',
    '["slow-cook","dairy-free","batch-cook","family-favorite"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'fruit-smoothie',
    'Berry Fruit Smoothie',
    'A thick, naturally sweet smoothie. Sneak in spinach once they''re comfortable with the base recipe.',
    NULL,
    'full',
    'public',
    NULL,
    2,
    '2 glasses',
    5,
    0,
    '[{"amount":150.0,"unit":"g","ingredient":"frozen mixed berries"},{"amount":1.0,"unit":null,"ingredient":"banana"},{"amount":200.0,"unit":"ml","ingredient":"milk"},{"amount":1.0,"unit":"tbsp","ingredient":"honey"}]',
    '["Add all ingredients to a blender.","Blend until smooth.","Pour into glasses and serve immediately."]',
    NULL,
    'Frozen fruit makes it thick like a milkshake. Try adding a handful of spinach once they like the base.',
    '["breakfast","quick","vegetarian","gluten-free","snack"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'toad-in-the-hole',
    'Toad in the Hole',
    'Sausages baked in crispy Yorkshire pudding batter. A proper British comfort meal.',
    NULL,
    'full',
    'public',
    NULL,
    4,
    NULL,
    15,
    35,
    '[{"amount":8.0,"unit":null,"ingredient":"pork sausages"},{"amount":150.0,"unit":"g","ingredient":"plain flour"},{"amount":3.0,"unit":null,"ingredient":"eggs"},{"amount":300.0,"unit":"ml","ingredient":"milk"},{"amount":2.0,"unit":"tbsp","ingredient":"vegetable oil"}]',
    '["Preheat oven to 220°C with oil in a roasting tin.","Whisk flour, eggs, and milk into a smooth batter; rest 15 min.","Brown sausages in the hot tin for 5 min.","Pour batter around sausages.","Bake 30 min until puffed and golden. Don''t open the oven!"]',
    NULL,
    'Serve with onion gravy and peas.',
    '["comfort-food","british","family-favorite"]'
);

INSERT OR IGNORE INTO recipes (id, title, description, image_url, type, visibility, household_id, servings, yield, prep_minutes, cook_minutes, ingredients, method, source_reference, notes, tags)
VALUES (
    'cucumber-sandwich-bites',
    'Cucumber Sandwich Bites',
    'Tiny crustless sandwiches with cream cheese and cucumber. Great for sensory-sensitive children who prefer mild flavours.',
    NULL,
    'full',
    'public',
    NULL,
    2,
    '8 bites',
    10,
    0,
    '[{"amount":4.0,"unit":"slices","ingredient":"white bread","preparation":{"type":"text","text":"crusts removed"}},{"amount":4.0,"unit":"tbsp","ingredient":"cream cheese"},{"amount":0.5,"unit":null,"ingredient":"cucumber","preparation":{"type":"text","text":"thinly sliced"}}]',
    '["Spread cream cheese on each slice of bread.","Layer cucumber slices on two slices.","Top with remaining bread.","Cut into small squares or use cookie cutters for fun shapes."]',
    NULL,
    'Fun shapes make these more appealing. Try star or dinosaur cutters.',
    '["quick","vegetarian","kid-friendly","snack","nut-free"]'
);
