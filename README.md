# AI Camera / AI Video Analytics

Full-stack AI video analytics dashboard.

## Structure

- `frontend/` - React + TypeScript + Vite UI
- `backend/` - Spring Boot API and Dahua integration
- `database/` - PostgreSQL Docker Compose setup

## Run Database

```bash
cd database
docker compose up -d
```

The default database is:

- Database: `video_analytics`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

The backend uses Hibernate `ddl-auto=update`, so tables are created/updated from the Java entities.

## Run Backend

```bash
cd backend
DB_URL=jdbc:postgresql://localhost:5432/video_analytics \
DB_USERNAME=postgres \
DB_PASSWORD=postgres \
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8081`.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Build Full-Stack Jar

```bash
cd frontend
VITE_API_BASE_URL=/api npm run build

cd ../backend
rm -rf src/main/resources/static
mkdir -p src/main/resources/static
cp -R ../frontend/dist/. src/main/resources/static/
./mvnw -DskipTests package
```

The jar will be created at:

```text
backend/target/video-analytics-backend-0.0.1-SNAPSHOT.jar
```

