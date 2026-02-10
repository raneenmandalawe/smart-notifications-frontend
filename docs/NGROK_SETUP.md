# Ngrok Setup for CI/CD Testing

## מדריך התקנה והגדרת Ngrok להרצת טסטים ב-CI

## למה אנחנו צריכים Ngrok?

כאשר הטסטים שלנו רצים ב-GitHub Actions, הם לא יכולים לגשת אל `localhost:3000` כי השרת שלנו רץ על המחשב המקומי שלנו. Ngrok יוצר tunnel מאובטח בין המחשב המקומי שלנו לבין URL ציבורי באינטרנט, וכך GitHub Actions יכול לגשת לאפליקציה שלנו.

```
GitHub Actions (Cloud) -> Ngrok URL (Public) -> Ngrok Tunnel -> localhost:3000 (Your Computer)
```

## שלב 1: התקנת Ngrok

### macOS (באמצעות Homebrew)

```bash
brew install ngrok/ngrok/ngrok
```

### Windows/Linux או ידנית

1. הירשם ל-[ngrok.com](https://ngrok.com/)
2. הורד את Ngrok מ-[דף ההורדות](https://ngrok.com/download)
3. חלץ את הקובץ והעבר אותו לתיקייה שנמצאת ב-PATH


## שלב 2: הגדרת Token

לאחר ההרשמה, תקבל authtoken. הפעל את הפקודה הזאת **פעם אחת בלבד**:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

> 💡 **טיפ:** את ה-authtoken תמצאי ב-[Ngrok Dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)


## שלב 3: הרצת Frontend עם Ngrok

### אפשרות 1: Ngrok עם Domain דינמי (חינמי)

כל פעם תקבלי URL חדש:

```bash
# Terminal 1: הרץ את ה-Frontend
cd smart-notifications-frontend
npm run dev

# Terminal 2: הרץ Ngrok על פורט 3000
ngrok http 3000
```

תקבלי משהו כזה:
```
Forwarding  https://abcd-1234-efgh-5678.ngrok-free.app -> http://localhost:3000
```

העתיקי את ה-URL (`https://abcd-1234-efgh-5678.ngrok-free.app`)


### אפשרות 2: Ngrok עם Static Domain (מומלץ!)

Domain קבוע שנשאר זהה בכל הרצה:

1. צרי Static Domain ב-[Ngrok Dashboard > Domains](https://dashboard.ngrok.com/cloud-edge/domains)
2. לוחצי על "Create Domain" - תקבלי משהו כמו: `your-app-name.ngrok-free.app`
3. הריצי:

```bash
ngrok http 3000 --url=your-app-name.ngrok-free.app
```

> ✅ **יתרון:** ה-URL לא משתנה, אז לא צריך לעדכן כל פעם את GitHub Secrets!


## שלב 4: טיפול ב-Ngrok Warning Page

Ngrok מציג דף אזהרה לפני כניסה לאתר. הטסטים שלנו כבר מטפלים בזה אוטומטית!

הקוד ב-[dashboard_page.py](../tests/ui/pages/dashboard_page.py):

```python
def _verify_page_loaded(self):
    """Verify Dashboard page loaded successfully"""
    try:
        # Handle ngrok warning page if present
        try:
            ngrok_button = self.page.get_by_role("button", name="Visit Site")
            if ngrok_button.is_visible(timeout=2000):
                ngrok_button.click()
        except:
            pass  # No ngrok warning
        
        # Verify we're on dashboard
        self.page.wait_for_selector(self.SCAN_BUTTON, timeout=10000)
```


## שלב 5: הגדרת NGROK_URL ב-GitHub

### בדיקה מקומית

```bash
# הגדרת משתנה סביבה
export NGROK_URL=https://your-app-name.ngrok-free.app

# הרצת הטסטים
cd smart-notifications-frontend
python -m pytest tests/ui/ -v
```

### ב-GitHub Actions

יש לך 2 אפשרויות:

#### אפשרות 1: GitHub Secret (מומלץ)

1. עברי ל-GitHub Repository Settings
2. **Settings** → **Secrets and variables** → **Actions**
3. לחצי **New repository secret**
4. שם: `NGROK_URL`
5. ערך: `https://your-app-name.ngrok-free.app`
6. שמרי


#### אפשרות 2: Manual Trigger Input

הפעלה ידנית של workflow עם URL:

1. עברי ל-**Actions** → **Playwright E2E Tests with Allure**
2. לחצי **Run workflow**
3. הזיני את ה-Ngrok URL
4. הריצי


## שלב 6: הרצת הטסטים ב-CI

### תנאים מוקדמים

✅ Frontend רץ על המחשב שלך: `npm run dev`  
✅ Backend רץ על המחשב שלך (עם ERPNext מחובר)  
✅ Ngrok רץ ומפנה ל-`localhost:3000`  
✅ `NGROK_URL` מוגדר ב-GitHub Secrets  

### הפעלה

1. צרי Pull Request או הריצי את ה-workflow ידנית
2. ה-workflow יבצע:
   - ✅ בדיקת חיבור ל-NGROK_URL
   - ✅ התקנת תלויות Python
   - ✅ התקנת דפדפני Playwright
   - ✅ הרצת הטסטים על 6 תצורות (2 browsers × 3 viewports)
   - ✅ יצירת דוחות Allure
   - ✅ העלאת screenshots במקרה של כשלון


## פתרון בעיות נפוצות

### ❌ "Cannot reach NGROK_URL"

**בעיה:** GitHub Actions לא מצליח להתחבר ל-URL

**פתרונות:**
1. ודאי ש-Ngrok **רץ** על המחשב שלך
2. ודאי ש-Frontend **רץ** (`npm run dev`)
3. בדקי שה-URL נכון בהגדרות GitHub
4. נסי לגשת ל-URL מדפדפן חיצוני לוודא שהוא עובד


### ❌ Tests fail with timeout

**בעיה:** הטסטים מתלים ולא עובר timeout

**פתרונות:**
1. ודאי ש-ERPNext רץ ויש לו נתונים
2. בדקי שה-Backend מחובר ל-ERPNext
3. נסי להריץ טסט אחד בלבד קודם: `pytest tests/ui/test_dashboard.py::TestDashboardUI::test_dashboard_page_loads -v`


### ❌ Ngrok shows "ERR_NGROK_3200"

**בעיה:** Ngrok tunnel expired

**פתרון:** 
עם Free plan, ה-tunnel נפסק אחרי 2 שעות. סגרי והפעילי מחדש:

```bash
# Stop ngrok (Ctrl+C)
# Restart
ngrok http 3000 --url=your-app-name.ngrok-free.app
```


## Workflow Structure

הנה מבנה ה-CI Pipeline:

```yaml
playwright-tests:
  Matrix Strategy:
    - browsers: [chromium, firefox]
    - viewports: [desktop, tablet, mobile]
  
  Steps:
    1. Checkout code
    2. Setup Python 3.11
    3. Install dependencies
    4. Install Playwright browsers
    5. Validate NGROK_URL is reachable
    6. Run pytest tests
    7. Upload screenshots (on failure)
    8. Upload Allure results
    
generate-allure-report:
  Steps:
    1. Download all Allure results
    2. Generate Allure Report
    3. Publish to GitHub Pages
```


## Best Practices

### 1. השתמשי ב-Static Domain

זה חוסך זמן ומונע טעויות כי ה-URL לא משתנה.

### 2. בדקי מקומית לפני CI

```bash
export NGROK_URL=https://your-app-name.ngrok-free.app
export HEADLESS=true
python -m pytest tests/ui/ -v
```

### 3. הקפידי על Clean State

ודאי שה-Frontend ו-Backend רצים כמו שצריך לפני הרצת הטסטים.

### 4. השתמשי ב-Secrets

**אף פעם** אל תשימי את ה-NGROK_URL ישירות בקוד. תמיד דרך GitHub Secrets.


## מסמכים נוספים

- [GitHub Actions Workflow](../.github/workflows/playwright-tests.yml)
- [Test Dashboard](../tests/ui/test_dashboard.py)
- [Dashboard Page Object](../tests/ui/pages/dashboard_page.py)
- [CI/CD Pipeline Documentation](./CI_PIPELINE.md)


## סיכום

עכשיו יש לך:
- ✅ Ngrok מותקן ומוגדר
- ✅ Frontend נגיש דרך URL ציבורי
- ✅ Workflow שמריץ טסטים ב-6 תצורות שונות
- ✅ Allure reports אוטומטיים
- ✅ Screenshot uploads בזמן כשלונות

**בהצלחה! 🚀**
