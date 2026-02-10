# איך לראות את ה-UI Tests ב-GitHub CI/CD 🚀

## שלב 1: העלאת הקוד ל-GitHub

```bash
cd /Users/raneenmandalawi/Desktop/smart-notifications-erpnext/smart-notifications-frontend

# בדוק סטטוס
git status

# הוסף את כל הקבצים החדשים
git add .

# עשה commit
git commit -m "Add Playwright E2E tests with CI/CD workflow"

# העלה ל-GitHub
git push origin main
```

---

## שלב 2: הגדרת GitHub Pages (לדוחות Allure)

1. עבור ל-GitHub Repository: `https://github.com/raneenmandalawe/smart-notifications-frontend`
2. **Settings** → **Pages**
3. **Source**: בחר `Deploy from a branch`
4. **Branch**: בחר `gh-pages` (ייווצר אוטומטית ע"י ה-workflow)
5. **Save**

---

## שלב 3: הגדרת Ngrok URL Secret (אופציונלי)

אם יש לך Ngrok URL קבוע:

1. **Settings** → **Secrets and variables** → **Actions**
2. לחץ **New repository secret**
3. **Name**: `NGROK_URL`
4. **Value**: `https://your-domain.ngrok-free.app`
5. **Add secret**

---

## שלב 4: הרצה ידנית של הבדיקות

### אופציה א': Manual Trigger (מומלץ להתחלה)

1. עבור ל-**Actions** tab ב-GitHub
2. בחר **"Playwright E2E Tests with Allure"** מהרשימה משמאל
3. לחץ **"Run workflow"** (כפתור ימני)
4. הזן את ה-Ngrok URL שלך (או השאר ריק אם הגדרת Secret)
5. לחץ **"Run workflow"** (ירוק)

### אופציה ב': Pull Request (אוטומטי)

1. צור branch חדש:
   ```bash
   git checkout -b test-ui-e2e
   git push origin test-ui-e2e
   ```

2. פתח Pull Request ב-GitHub:
   - מ-`test-ui-e2e` ל-`main`
   - הבדיקות יתחילו אוטומטית!

---

## שלב 5: צפייה בתוצאות

### 🔍 לצפייה ב-Workflow בזמן ריצה:

1. **Actions** tab
2. לחץ על ה-workflow run האחרון
3. תראה 6 jobs במקביל:
   - ✅ `Test chromium - desktop`
   - ✅ `Test chromium - tablet`
   - ✅ `Test chromium - mobile`
   - ✅ `Test firefox - desktop`
   - ✅ `Test firefox - tablet`
   - ✅ `Test firefox - mobile`

4. לחץ על job כלשהו לצפייה בלוגים

### 📊 לצפייה בדוח Allure:

לאחר שה-workflow הסתיים:

1. גש ל: `https://raneenmandalawe.github.io/smart-notifications-frontend/`
2. תראה דוח Allure מפורט עם:
   - ✅ כל הבדיקות שרצו
   - 📊 גרפים ותרשימים
   - 📸 Screenshots של כשלונות
   - 🎥 Videos של הרצות
   - 📝 Environment details

### 📥 הורדת Artifacts:

1. ב-workflow run, גלול למטה ל-**Artifacts**
2. הורד:
   - `allure-results-*` - תוצאות Allure
   - `playwright-report-*` - דוחות Playwright HTML

---

## שלב 6: הגנה על Branch Main (מומלץ)

כדי למנוע merge לפני שהבדיקות עוברות:

1. **Settings** → **Branches**
2. לחץ **Add rule** (או **Add classic branch protection rule**)
3. **Branch name pattern**: `main`
4. ✅ סמן: **Require status checks to pass before merging**
5. חפש: `Test chromium - desktop` (או כל job אחר)
6. ✅ סמן את כל ה-jobs שאתה רוצה שיהיו חובה
7. **Save changes**

עכשיו לא ניתן למזג PR אלא אם כל הבדיקות עוברות! 🔒

---

## 🎯 דוגמאות לשימוש

### תרחיש 1: Pull Request עם בדיקות אוטומטיות

```bash
# צור feature branch
git checkout -b feature/new-dashboard-filter

# עשה שינויים
# ... edit files ...

# commit & push
git add .
git commit -m "Add new risk filter"
git push origin feature/new-dashboard-filter

# פתח PR ב-GitHub - הבדיקות יתחילו אוטומטית!
```

### תרחיר 2: בדיקה מהירה עם Ngrok

```bash
# בטרמינל 1 - הרץ frontend
npm run dev

# בטרמינל 2 - הרץ ngrok
ngrok http 3000

# העתק את ה-URL (למשל: https://abc123.ngrok-free.app)

# ב-GitHub Actions:
# 1. Actions → Playwright E2E Tests
# 2. Run workflow
# 3. הדבק את ה-Ngrok URL
# 4. Run!
```

---

## 🐛 פתרון בעיות

### בעיה: "NGROK_URL is not set"
**פתרון**: הגדר Secret ב-GitHub או הזן ידנית בעת ההרצה

### בעיה: "Cannot reach NGROK_URL"
**פתרון**: 
- וודא ש-ngrok רץ מקומית
- בדוק שה-Frontend רץ על פורט 3000
- בדוק שה-URL נכון

### בעיה: Tests fail locally but pass in CI
**פתרון**: הרץ עם משתני סביבה זהים:
```bash
NGROK_URL=http://localhost:3000 CI=true npm run test:e2e
```

---

## 📚 קבצים שיעלו ל-GitHub

```
.github/workflows/playwright-tests.yml  ← CI/CD workflow
tests/e2e/dashboard.spec.ts            ← הבדיקות
tests/e2e/pages/DashboardPage.ts        ← Page Object
playwright.config.ts                    ← תצורה
E2E_TESTING.md                         ← מדריך
package.json                           ← dependencies
```

---

## ✅ Checklist לפני Push

- [ ] הבדיקות עוברות מקומית: `npm run test:e2e`
- [ ] Playwright מותקן: `npx playwright install`
- [ ] package.json מעודכן עם dependencies
- [ ] .gitignore מכיל test-results/ ו-allure-results/
- [ ] README.md מכיל הוראות E2E
- [ ] GitHub Pages מוגדר (אחרי ה-push הראשון)

---

## 🎉 זהו!

לאחר Push, תוכל לראות:
- ✅ Workflow runs ב-Actions tab
- 📊 Allure reports ב-GitHub Pages
- 🎯 Status checks ב-Pull Requests
- 📈 Test history לאורך זמן

**GitHub Actions URL**: `https://github.com/raneenmandalawe/smart-notifications-frontend/actions`  
**Allure Reports URL**: `https://raneenmandalawe.github.io/smart-notifications-frontend/`
