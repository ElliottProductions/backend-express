-- Use this file to define your SQL tables
-- The SQL in this file will be executed when you run `npm run setup-db`
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE todos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_name VARCHAR NOT NULL UNIQUE,
  completed BOOLEAN NOT NULL,
  user_id BIGINT
);

CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL
);