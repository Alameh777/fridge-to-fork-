# Fridge to Fork

A full-stack AI-powered recipe app that generates personalized recipes from your available ingredients. Includes a mobile-first web frontend and a separate admin panel.

## Projects

| Folder | Description | Port |
|---|---|---|
| `fridge-to-fork` | Laravel 12 API backend | 8000 |
| `fridge-to-fork-frontend` | React mobile frontend | 5173 |
| `fridge-to-fork-admin` | React admin panel | 5174 |

---

## Requirements — Install These First

### 1. PHP 8.2+
Download from https://windows.php.net/download (choose **Thread Safe x64 ZIP**)

Or easier — install **XAMPP** (includes PHP + MySQL together):
https://www.apachefriends.org/download.html

After installing, add PHP to your system PATH:
- Search "Environment Variables" in Windows
- Edit `Path` under System Variables
- Add `C:\xampp\php` (or wherever PHP is installed)
- Open a new terminal and run `php -v` to confirm

### 2. Composer (PHP package manager)
https://getcomposer.org/Composer-Setup.exe

Run the installer, then confirm with `composer -v`

### 3. Node.js 20+
https://nodejs.org/en/download

Choose the **LTS** version. Confirm with `node -v` and `npm -v`

### 4. MySQL (via XAMPP)
If you installed XAMPP above, open the XAMPP Control Panel and **Start** the MySQL service.

Create the database:
- Open http://localhost/phpmyadmin
- Click **New** on the left sidebar
- Database name: `fridge_to_fork`
- Click **Create**

### 5. Git
https://git-scm.com/download/win

Confirm with `git -v`

---

## Setup

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/fridge-to-fork.git
cd fridge-to-fork
```

---

### Step 2 — Backend (Laravel API)

```bash
cd fridge-to-fork
```

**Install dependencies:**
```bash
composer install
```

**Set up environment:**
```bash
copy .env.example .env
php artisan key:generate
```

**Open `.env` and fill in your Groq API key:**
```
GROQ_API_KEY=your_groq_api_key_here
```
Get a free key at https://console.groq.com → Log in → API Keys → Create

**Run database migrations:**
```bash
php artisan migrate
```

**Start the backend:**
```bash
php artisan serve
```
Backend is now running at http://localhost:8000

---

### Step 3 — Frontend (Mobile App)

Open a **new terminal**:

```bash
cd fridge-to-fork-frontend
npm install
npm run dev
```

App is now running at http://localhost:5173

---

### Step 4 — Admin Panel

Open a **new terminal**:

```bash
cd fridge-to-fork-admin
npm install
npm run dev
```

Admin panel is now running at http://localhost:5174

---

### Step 5 — Create an Admin Account

Register a normal account through the app at http://localhost:5173, then run:

```bash
cd fridge-to-fork
php artisan admin:make your@email.com
```

You can now log into the admin panel at http://localhost:5174

---

## Summary — 3 terminals running at the same time

| Terminal | Command | URL |
|---|---|---|
| 1 | `cd fridge-to-fork && php artisan serve` | http://localhost:8000 |
| 2 | `cd fridge-to-fork-frontend && npm run dev` | http://localhost:5173 |
| 3 | `cd fridge-to-fork-admin && npm run dev` | http://localhost:5174 |

---

## Features

- AI recipe generation from fridge ingredients (Groq / LLaMA 3.3)
- Fridge photo scan — take a photo and AI detects the ingredients
- Nutritional analysis per recipe (calories, protein, carbs, fat, fiber)
- Personalized dietary profiles: Halal, Vegetarian, Vegan, Ramadan Mode
- Allergy management — AI never suggests recipes with your allergens
- Cultural background preference influences recipe style
- Community feed — share dishes with photos, like and comment
- Save favourite recipes to your library
- Admin panel — manage users, posts, and comments

## Tech Stack

- **Backend:** Laravel 12, Sanctum, MySQL
- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router 7
- **AI:** Groq API (LLaMA 3.3 70B + LLaMA 4 Scout for vision)
