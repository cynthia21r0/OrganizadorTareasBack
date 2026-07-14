# Tareas Backend — NestJS + PostgreSQL (TypeORM, sin Prisma)

API REST para la app Flutter de tareas familiares. Usa **TypeORM** como ORM
(no Prisma), JWT para autenticación y PostgreSQL como base de datos.

---

## 1. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Esto levanta un contenedor `postgres:16-alpine` en el puerto `5432` con la
base `tareas_familiares` (usuario/clave `postgres`/`postgres`, definidos en
`docker-compose.yml`).

Si prefieres usar un PostgreSQL que ya tengas instalado localmente, solo
ajusta las variables en tu `.env` (paso 3).

## 2. Instalar dependencias

```bash
npm install
```

## 3. Variables de entorno

Copia `.env.example` a `.env` y ajusta si es necesario:

```bash
cp .env.example .env
```

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=tareas_familiares
JWT_SECRET=cambia_esto_por_un_secreto_largo_y_aleatorio
JWT_EXPIRES_IN=7d
PORT=3000
```

## 4. Ejecutar en desarrollo

```bash
npm run start:dev
```

Con `synchronize: true` (activo en `app.module.ts`), TypeORM crea las tablas
`users` y `tasks` automáticamente la primera vez que arranca — no hace falta
correr migraciones a mano para empezar a probar.

> Si al arrancar ves un error relacionado con `uuid_generate_v4()` o la
> extensión `uuid-ossp`, conéctate a la base y corre una sola vez:
> ```sql
> CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
> ```

La API queda disponible en `http://localhost:3000/api`.

---

## 2. Arquitectura

```
src/
├── main.ts                      # Bootstrap, CORS, ValidationPipe global
├── app.module.ts                # Conexión TypeORM + registro de módulos
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts       # POST /auth/register, /auth/login
│   ├── auth.service.ts          # bcrypt hash + firma de JWT
│   ├── dto/                     # RegisterDto, LoginDto (class-validator)
│   ├── strategies/jwt.strategy.ts
│   ├── guards/jwt-auth.guard.ts
│   └── decorators/current-user.decorator.ts
├── users/
│   ├── entities/user.entity.ts  # Tabla `users` (TypeORM)
│   ├── dto/user-response.dto.ts # Nunca expone password_hash
│   ├── users.service.ts
│   ├── users.controller.ts      # GET /users (lista de la familia)
│   └── users.module.ts
└── tasks/
    ├── entities/task.entity.ts  # Tabla `tasks` (TypeORM)
    ├── dto/create-task.dto.ts
    ├── dto/update-task.dto.ts
    ├── tasks.service.ts         # CRUD + filtro por usuario/día
    ├── tasks.controller.ts
    └── tasks.module.ts
```

Capas: **Controller** (HTTP) → **Service** (reglas de negocio) →
**Repository de TypeORM** (`@InjectRepository`) → PostgreSQL. Misma
separación que usaste en FiestaPlan, solo que aquí con TypeORM en vez de
Prisma.

---

## 3. Endpoints (contrato para el Flutter)

| Método | Ruta                                  | Body / Query                              | Auth | Descripción |
|--------|---------------------------------------|--------------------------------------------|------|--------------|
| POST   | `/api/auth/register`                  | `{ name, email, password }`                | No   | Crea usuario (el primero registrado queda `admin`) |
| POST   | `/api/auth/login`                     | `{ email, password }`                      | No   | Devuelve `{ accessToken, user }` |
| GET    | `/api/users`                          | —                                           | Sí   | Lista de integrantes (para el dropdown de asignación) |
| POST   | `/api/tasks`                          | `{ title, description?, dueDate, priority, assignedToId }` | Sí | Crea tarea |
| GET    | `/api/tasks`                          | —                                           | Sí   | Todas las tareas (pantalla Familia) |
| GET    | `/api/tasks/user/:userId`             | `?day=2026-07-13` (opcional)                | Sí   | Tareas de un usuario, o de un usuario en un día |
| PATCH  | `/api/tasks/:id`                      | Campos parciales de `CreateTaskDto` + `status?` | Sí | Editar tarea |
| PATCH  | `/api/tasks/:id/toggle`               | —                                           | Sí   | Alterna pendiente/completada |
| DELETE | `/api/tasks/:id`                      | —                                           | Sí   | Elimina tarea |

Todas las rutas protegidas esperan el header:
```
Authorization: Bearer <accessToken>
```

### Ejemplo de respuesta de login
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "name": "Ana", "email": "ana@mail.com", "role": "admin" }
}
```

---

## 4. Conectar el Flutter a esta API

En tu app Flutter, reemplaza el `TaskRepository`/`AuthRepository` locales
(SQLite) por un cliente HTTP (por ejemplo con el paquete `dio` o `http`) que
llame a estas rutas y guarde el `accessToken` en memoria (o en
`flutter_secure_storage`) para mandarlo en cada request. Si conectas desde un
emulador Android, usa `http://10.0.2.2:3000/api` en vez de `localhost`; si es
un dispositivo físico en tu misma red Wi-Fi, usa la IP local de tu máquina
(ej. `http://192.168.1.X:3000/api`).
