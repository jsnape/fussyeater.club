INSERT OR IGNORE INTO households (id, name, created_utc)
VALUES ('default-household', 'Default Household', datetime('now'));

INSERT OR IGNORE INTO household_members (id, household_id, user_email, display_name, is_primary, created_utc)
VALUES ('member-default-1', 'default-household', 'dev@example.com', 'Dev User', 1, datetime('now'));

INSERT OR IGNORE INTO meal_plans (id, household_id, title, start_date, end_date, meals_json, created_utc)
VALUES (
	'meal-plan-default-1',
	'default-household',
	'Week Plan',
	date('now'),
	date('now', '+6 day'),
	'[{"date":"2026-01-01","mealType":"Dinner","recipeId":"recipe-default-1","servings":4}]',
	datetime('now')
);

INSERT OR IGNORE INTO shopping_lists (id, household_id, meal_plan_id, items_json, created_utc)
VALUES (
	'shopping-default-1',
	'default-household',
	'meal-plan-default-1',
	'[{"name":"Pasta","quantity":1,"unit":"Piece","category":"Other","isChecked":false},{"name":"Tomato Sauce","quantity":1,"unit":"Jar","category":"Other","isChecked":false}]',
	datetime('now')
);

INSERT OR IGNORE INTO store_cupboards (id, household_id, items_json, updated_utc)
VALUES (
	'cupboard-default-1',
	'default-household',
	'[{"name":"Rice","category":"Other","alwaysStocked":true},{"name":"Olive Oil","category":"Other","alwaysStocked":true}]',
	datetime('now')
);
