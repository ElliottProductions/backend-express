-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`
DROP TABLE IF EXISTS todos;

CREATE TABLE todos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_name VARCHAR NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL,
  user_id VARCHAR
);
