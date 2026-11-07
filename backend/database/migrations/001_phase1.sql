CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cases_client_id_idx ON cases (client_id);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  stored_filename text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL CHECK (size_bytes >= 0),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX documents_case_id_idx ON documents (case_id);

-- Local development account. Password is "admin", stored as a bcrypt hash.
INSERT INTO users (username, password_hash, role)
VALUES (
  'admin',
  '$2b$10$iz63jFOeX8g9/brIDLOA0uhDqekYlQdWr83992fDwnqVxqTeKCMFa',
  'admin'
);
