# Setup de Base de Datos

## 1. Crear proyecto en Neon o Supabase

### Neon (recomendado — free tier generoso)
1. https://neon.tech → New Project
2. Copiar connection string
3. Pegar en `.env.local` → `DATABASE_URL`

### Supabase
1. https://supabase.com → New Project  
2. Settings → Database → Connection string (URI mode)
3. Pegar en `.env.local` → `DATABASE_URL`

## 2. Ejecutar schema

```bash
# Opción A: desde Neon/Supabase SQL Editor — pegar contenido de schema.sql

# Opción B: con psql
psql $DATABASE_URL < database/schema.sql
```

## 3. Variables de entorno

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="tu-password-seguro"
SESSION_SECRET="32-chars-minimo-secreto-random"
NEXT_PUBLIC_APP_URL="https://tudominio.com"
```
