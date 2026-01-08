# מדריך חיבור דף לקוחות לבקאנד

## 📋 סקירה כללית

המערכת שלך כבר משתמשת ב-Prisma כבקאנד, ויש לך כבר:
- ✅ `apiClient` מוגדר (`src/config/apiClient.jsx`)
- ✅ שירותי לקוחות בסיסיים (`src/redux/services/customerService.jsx`)
- ✅ דף לקוחות שעובד עם localStorage (`src/pages/calendarClients/index.jsx`)

## 🎯 המטרה

לחבר את דף הלקוחות לבקאנד **ללא פגיעה במערכת הקיימת**.

## 📝 שלב 1: בדיקת הבקאנד הקיים

### 1.1 בדוק את ה-Prisma Schema

בדוק אם יש כבר מודל `Customer` או `Client` ב-Prisma:

```bash
# אם יש לך תיקיית prisma, בדוק את schema.prisma
cat prisma/schema.prisma | grep -i customer
cat prisma/schema.prisma | grep -i client
```

### 1.2 בדוק את ה-API Routes הקיימים

בדוק אם יש כבר routes ללקוחות בשרת:
- `GET /api/customers` - קבלת כל הלקוחות
- `POST /api/customers` - יצירת לקוח חדש
- `PUT /api/customers/:id` - עדכון לקוח
- `DELETE /api/customers/:id` - מחיקת לקוח

## 📝 שלב 2: יצירת Service Layer חדש

ניצור שכבת שירות חדשה שתעבוד עם הבקאנד, אבל תתמוך גם ב-localStorage כגיבוי.

### 2.1 יצירת קובץ שירות חדש

ניצור קובץ חדש: `src/services/clients/clientService.js`

קובץ זה יכלול:
- פונקציות לטעינת לקוחות מהבקאנד
- שמירת לקוחות בבקאנד
- עדכון לקוחות
- מחיקת לקוחות
- **גיבוי ל-localStorage** במקרה של שגיאה

## 📝 שלב 3: עדכון דף הלקוחות

נעדכן את `src/pages/calendarClients/index.jsx` כך ש:
1. **קודם** ינסה לטעון מהבקאנד
2. **אם נכשל** - יטען מ-localStorage (כגיבוי)
3. **בכל פעולה** - ישמור גם בבקאנד וגם ב-localStorage (כגיבוי)

## 📝 שלב 4: מיפוי נתונים

נצטרך למפות בין המבנה הנוכחי (localStorage) למבנה של הבקאנד:

### מבנה נוכחי (localStorage):
```javascript
{
  id: Date.now(),
  name: "שם לקוח",
  phone: "0501234567",
  email: "email@example.com",
  city: "תל אביב",
  address: "רחוב 123",
  status: "פעיל",
  // ... שדות נוספים
}
```

### מבנה צפוי בבקאנד:
צריך לבדוק מה המבנה ב-Prisma Schema שלך.

## 🚀 תוכנית ביצוע

### שלב א': הכנה (ללא שינוי קוד)
1. בדוק את Prisma Schema - מה המבנה של Customer/Client
2. בדוק את ה-API Routes הקיימים
3. בדוק את ה-API_URL ב-`.env`

### שלב ב': יצירת Service Layer
1. יצירת `src/services/clients/clientService.js`
2. הוספת פונקציות CRUD עם גיבוי ל-localStorage

### שלב ג': עדכון דף הלקוחות
1. עדכון `useEffect` לטעינה מהבקאנד
2. עדכון `handleCreateNewClient` לשמירה בבקאנד
3. עדכון `handleSaveField` לעדכון בבקאנד
4. עדכון `handleDeleteClients` למחיקה בבקאנד

### שלב ד': בדיקות
1. בדיקה שהכל עובד עם הבקאנד
2. בדיקה שהגיבוי ל-localStorage עובד
3. בדיקה שהמערכת הקיימת לא נפגעה

## ⚠️ נקודות חשובות

1. **לא למחוק את localStorage** - נשמור אותו כגיבוי
2. **טיפול בשגיאות** - אם הבקאנד לא זמין, נשתמש ב-localStorage
3. **מיפוי נתונים** - צריך לוודא שהמבנה תואם
4. **בדיקות** - לבדוק היטב לפני deployment

## 🔄 תהליך העבודה

1. **עבודה על branch נפרד** - לא על main/master
2. **בדיקות מקומיות** - לבדוק שהכל עובד
3. **בדיקות על staging** - לבדוק עם הבקאנד האמיתי
4. **רק אחרי הכל** - merge ל-main

## 📞 שאלות לבדיקה

לפני שנתחיל, אני צריך לדעת:
1. מה המבנה של מודל Customer/Client ב-Prisma שלך?
2. האם יש כבר API routes ללקוחות?
3. מה ה-API_URL שלך? (בודק ב-`.env`)
4. האם יש authentication? (נראה שיש token ב-apiClient)

---

**הצעה**: נתחיל ביצירת ה-Service Layer החדש, ואז נבדוק יחד את המבנה של הבקאנד שלך.



