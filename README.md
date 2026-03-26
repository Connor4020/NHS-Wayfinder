# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Environment Variables

Configure a database connection via a `.env` file (loaded by Nitro on the server-side). Copy `.env.example` to `.env` and set:

- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASS`: MySQL password
- `DB_NAME`: Database name

A connection pool is created in `api/database.ts` and used by server API handlers (e.g. `server/api/users.get.ts`). Keep credentials only in `.env`; avoid hard-coded defaults.

# Database setup

## Requirments

- MySql 

## deployment

To deploy the database you need to use an MySql Statment. you need to run it to create the database and it will automatically create a default admin user.

```SQL

CREATE DATABASE IF NOT EXISTS wayfinder;
USE wayfinder;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS node (
    node_id INT AUTO_INCREMENT PRIMARY KEY,
    node_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS connections (
    node_1 INT,
    node_2 INT,
    wheelchair_accessible BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (node_1, node_2),
    FOREIGN KEY (node_1) REFERENCES node(node_id) ON DELETE CASCADE,
    FOREIGN KEY (node_2) REFERENCES node(node_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_resource (
    media_id INT AUTO_INCREMENT PRIMARY KEY,
    media_name VARCHAR(100)
    media_type VARCHAR(50),
    media_alt_txt VARCHAR(255)
    media_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS connection_media (
    connection_node_1 INT,
    connection_node_2 INT,
    media_id INT,
    content_desc TEXT,
    order_num INT,
    PRIMARY KEY (connection_node_1, connection_node_2, media_id),
    FOREIGN KEY (connection_node_1, connection_node_2)
        REFERENCES connections(node_1, node_2) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media_resource(media_id) ON DELETE CASCADE
);

INSERT INTO users (username, password_hash)
VALUES ('ADMIN', '$2b$10$esfNLxVmlAgKwm5Ene/I1u6HjF3aJDO745acvzKJ9JZNxFY4gfmq2')
ON DUPLICATE KEY UPDATE username = username;

```

run this on the database software and it will create the db needed, then once its created to set up the connection between the db and the program get the mysql username and password you made aswell as the database name which you can find at the top of the sql statment its wayfinder by default and the ip of the host and fill in the .env variables.


# Post-Deployment

create a new admin user with secure password and username and delete the default menu. do not delete the account before the new one is created this will lock you out. please use the admin usermanagment system in the program to do this.