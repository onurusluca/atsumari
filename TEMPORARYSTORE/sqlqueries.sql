Create a "users" table with this data:
- id (default value: "uuid_generate_v4()", primary key),
- created_at: (default value: "now()"),
- name,
- email,
- style (JSON type),
- character (JSON type)
- role (foreign relation to "user_roles" table's "role"),
- belongs_to_organization (foreign relation to "spaces" table's "organization_name")

Create a "spaces" table with this data:
- id (default value: "uuid_generate_v4()", primary key),
- created_at: (default value: "now()"),
- access_key,
- user_id (foreign relation to "users" table's "id"),
- current_online_user_count
- organization_name

Create a "user_roles" table with this data:
- id (default value: "bigint generated by default as identity primary key", primary key),
- created_at: (default value: "now()"),
- role,
- user_id (foreign relation to "users" table's "id"),
- space_id (foreign relation to "spaces" table's "id")

Create a "messages" table with this data:
- id (default value: "bigint generated by default as identity primary key", primary key),
- created_at: (default value: "now()"),
- message,
- user_id (foreign relation to "users" table's "id"),
- space_id (foreign relation to "spaces" table's "id")

Create a "user_positions" table with this data:
- id (default value: "bigint generated by default as identity primary key", primary key),
- created_at: (default value: "now()"),
- position,
- user_id (foreign relation to "users" table's "id"),



For "users" table:
- enable delete, insert, update for the user who created the user
- enable read access for all users.
- when a user is deleted, delete all the spaces, user_roles, messages and user_positions that the user created.


For "spaces" table:
- enable delete, insert, update for user_role "admin" users only
- enable read access for all users.

For "user_roles" table:
- enable delete, insert, update for user_role "admin" users only
- enable read access for all users.

For "messages" table:
- enable delete, insert, update for the user who created the message
- enable read access for all users.
- enable realtime for this table.

For "user_positions" table:
- enable insert for the user who created it
- enable read access for all users.
- enable realtime for this table.

Create a function:
- that inserts new user(from auth.users) to "users" table when a new user is signed up and make the user's role who created the space an "admin". And create a trigger that is triggered when a new user is inserted in auth.users
