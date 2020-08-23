CREATE TABLE users
(
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  photo_url TEXT,
  is_admin boolean DEFAULT false NOT NULL
);

CREATE TABLE cards
(
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL REFERENCES users ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);