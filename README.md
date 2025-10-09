# Scheduleasier

---

### Installation Instructions 🛠️

To set up a PostgreSQL database using Docker, execute the following commands:

```bash
docker pull postgres:latest
docker run --name scheduleasier \
    -e POSTGRES_USER=<yourusername> \
    -e POSTGRES_PASSWORD=<yourpassword> \
    -p 5432:5432 \
    -d postgres:latest
```

Replace `<yourusername>` and `<yourpassword>` with your preferred database credentials.

After the image has been downloaded, start the PostgreSQL container with:

```bash
docker start scheduleasier
```

### Environment Configuration

Copy the example environment file to create your own configuration:

```bash
cp .env.example .env
```

Edit the `.env` file and update the values according to your database credentials and project requirements.

### Project Setup

Install the project dependencies using npm:

```bash
npm install
```

### Database Migration

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev
```

### Running the Project

Start the application with:

```bash
npm run dev
```
