# ✅ רשימת בדיקות לפני חיבור דף לקוחות לבקאנד

## 🔍 שלב 1: בדיקת הבקאנד הקיים

### 1.1 בדוק את Prisma Schema

```bash
# אם יש לך תיקיית prisma בפרויקט
ls prisma/
cat prisma/schema.prisma
```

**מה לחפש:**
- האם יש מודל `Customer` או `Client`?
- מה השדות שלו?
- האם יש relations (קשרים) למודלים אחרים?

**דוגמה למה שאנחנו מחפשים:**
```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String?
  city      String?
  address   String?
  status    String?
  createdAt DateTime @default(now())
  // ... שדות נוספים
}
```

### 1.2 בדוק את ה-API Routes

**בדוק אם יש כבר routes ללקוחות:**

```bash
# חפש קבצים של routes
find . -name "*route*" -o -name "*api*" | grep -i customer
find . -name "*route*" -o -name "*api*" | grep -i client
```

**מה לחפש:**
- `GET /api/customers` - קבלת כל הלקוחות
- `POST /api/customers` - יצירת לקוח חדש
- `PUT /api/customers/:id` - עדכון לקוח
- `DELETE /api/customers/:id` - מחיקת לקוח

### 1.3 בדוק את ה-API URL

**בדוק את קובץ `.env`:**

```bash
cat .env | grep API
# או
cat .env.local | grep API
```

**מה לחפש:**
```
VITE_API_URL=http://localhost:3000/api
# או
VITE_API_URL=https://your-backend-url.com/api
```

### 1.4 בדוק את ה-Authentication

**בדוק אם יש token:**

```bash
# בדוק בקוד איך ה-token נשמר
grep -r "localStorage.getItem('token')" src/
```

**מה לחפש:**
- האם יש token ב-localStorage?
- האם ה-API דורש authentication?

## 📊 שלב 2: השוואת מבנה הנתונים

### 2.1 מבנה נוכחי (localStorage)

**מה יש לנו כרגע:**
```javascript
{
  id: Date.now(), // או string
  name: "שם לקוח",
  phone: "0501234567",
  email: "email@example.com",
  city: "תל אביב",
  address: "רחוב 123",
  status: "פעיל", // או "חסום"
  initials: "של", // ראשי תיבות
  totalRevenue: 0,
  rating: "-",
  // ... שדות נוספים
}
```

### 2.2 מבנה צפוי בבקאנד

**צריך לבדוק מה המבנה ב-Prisma:**

- מה סוג ה-ID? (String, Int, UUID?)
- מה השמות של השדות? (phone או phoneNumber?)
- האם יש שדות נוספים שצריך?
- האם יש שדות שצריך להוסיף?

## 🧪 שלב 3: בדיקת API Endpoints

### 3.1 בדוק אם ה-API עובד

**נסה לבדוק ידנית:**

```bash
# אם יש לך את ה-API URL, נסה:
curl http://localhost:3000/api/customers
# או
curl https://your-backend-url.com/api/customers
```

**או דרך הדפדפן:**
1. פתח את Developer Tools (F12)
2. לך ל-Tab "Network"
3. נסה לטעון את דף הלקוחות
4. בדוק אם יש קריאות ל-API

### 3.2 בדוק את התגובה

**מה צריך לבדוק:**
- האם ה-API מחזיר נתונים?
- מה המבנה של התגובה?
- האם יש שגיאות?

## 📝 שלב 4: רשימת פעולות

**לפני שנתחיל לעדכן את הקוד, אנא בדוק:**

- [ ] יש מודל Customer/Client ב-Prisma
- [ ] יש API routes ללקוחות
- [ ] ה-API_URL מוגדר ב-.env
- [ ] יש authentication (אם נדרש)
- [ ] הבנתי את המבנה של הנתונים בבקאנד
- [ ] יש לי גישה לשרת הבקאנד לבדיקות

## 🚀 שלב 5: התחלה

**אחרי שסיימת את כל הבדיקות:**

1. **תגיד לי מה מצאת** - אני אעדכן את הקוד בהתאם
2. **נעדכן את ה-mapping** - נשנה את הפונקציות `mapBackendClientToFrontend` ו-`mapFrontendClientToBackend`
3. **נעדכן את דף הלקוחות** - נחליף את localStorage ב-API calls
4. **נבדוק יחד** - נוודא שהכל עובד

## ❓ שאלות לבדיקה

**אנא ענה על השאלות הבאות:**

1. **מה המבנה של מודל Customer/Client ב-Prisma שלך?**
   - העתק את המודל מ-schema.prisma

2. **האם יש כבר API routes ללקוחות?**
   - אם כן, מה הנתיבים? (למשל: `/api/customers`)

3. **מה ה-API_URL שלך?**
   - העתק מה-.env (ללא חשיפת מידע רגיש)

4. **האם יש authentication?**
   - האם צריך token?
   - איך מקבלים את ה-token?

5. **האם יש שדות נוספים שצריך?**
   - שדות שצריך להוסיף/להסיר?

---

**אחרי שתסיים את הבדיקות, נמשיך לעדכן את הקוד!** 🚀



