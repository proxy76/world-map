# GlobeTales.

Aplicație web modernă construită cu Django Python (pentru backend), Vite (pentru frontend), Redis (pentru cache) 

## Cerințe

- Python 3.10+
- Node.js 18+
- Redis 6+
- PostgreSQL (sau altă bază de date configurată în Django)

## Stack Tehnologic

- **Backend**: Django
- **Frontend**: Vite (React/Vue/etc.)
- **Cache/Task Queue**: Redis
- **Build Tools**: Vite, pip, poetry/pipenv (opțional)

---

## Instalare

### 1. Clonarea proiectului

```bash
git clone https://github.com/proxy76/world-map
```

### 2. Instalare dependențe frontend
```bash
cd frontend
npm install
```


### 3. Pornire redis
```bash
redis-server.exe --port 6380
```

### 4. Pornire backend
#### Pentru primul run al proiectului, se migrează modelele:
```bash
python manage.py migrate
```
```bash
python manage.py runserver
```

### Pornire frontend
```bash
npm run dev
```