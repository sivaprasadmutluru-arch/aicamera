# Database

This project uses PostgreSQL.

Start the database:

```bash
docker compose up -d
```

Connection defaults:

```text
DB_URL=jdbc:postgresql://localhost:5432/video_analytics
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Schema management is handled by Spring Boot / Hibernate from the backend entity classes:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For production, change the default password and set `JWT_SECRET` using environment variables.

