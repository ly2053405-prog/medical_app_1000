# ملفات الإصلاح — Medical Archive Dashboard

## ملخص المشاكل التي تم اكتشافها وإصلاحها

---

### 1. `package.json` — تكرار `vite`
**المشكلة:** `vite` موجود في كل من `dependencies` و`devDependencies` في نفس الوقت.  
**الإصلاح:** حُذف من `dependencies` وبقي في `devDependencies` فقط.  
**السبب:** التكرار يسبب تضاربًا في إصدار الحزمة أثناء `npm install` على Netlify.

---

### 2. `tsconfig.json` — خاصية `resolveJsonModule` مفقودة
**المشكلة:** الملف `src/firebase.ts` يستورد مباشرة:
```ts
import firebaseConfig from '../firebase-applet-config.json';
```
لكن `tsconfig.json` لم يكن يحتوي على `"resolveJsonModule": true`.  
**الإصلاح:** أضفنا السطر التالي تحت `compilerOptions`:
```json
"resolveJsonModule": true
```

---

### 3. `firebase-applet-config.json` — سليم 100%
**النتيجة:** الملف لا يحتوي على أي كود React أو TypeScript أو قواعد Firebase.  
لا يحتاج إلى تعديل في البنية، فقط تأكد من حماية بيانات الـ API Key.

> ⚠️ **تنبيه أمني:** `apiKey` موجودة في هذا الملف. إذا كان المشروع عامًا (public repo)،  
> انقلها إلى متغيرات البيئة في Netlify:
> ```
> VITE_FIREBASE_API_KEY=...
> VITE_FIREBASE_PROJECT_ID=...
> ```

---

### 4. `firestore.rules` — مستقل ونظيف
**الوضع:** قواعد Firestore موجودة في ملفها الصحيح `firestore.rules`.  
**لا علاقة لها بـ `package.json` أو `firebase-applet-config.json`** — كانت منفصلة مسبقًا.  
**تم تحسين التنسيق** وإضافة دالة مساعدة `isOwner()` لتقليل التكرار.

---

### 5. `netlify.toml` — ملف جديد (مفقود كليًا!)
**المشكلة:** Netlify لم يكن يعرف أين يبني المشروع أو يخدم الملفات منه.  
**الإصلاح:** أنشأنا `netlify.toml` يحدد:
- أمر البناء: `vite build`
- مجلد النشر: `dist`
- إعادة توجيه SPA: كل المسارات → `index.html`
- إعادة توجيه API: `/api/*` → Netlify Functions

---

### 6. `server.ts` و Netlify — تحذير مهم
مشروعك يستخدم Express server (`server.ts`) مع 7 API routes تعتمد على Gemini AI.  
**Netlify لا يدعم Express server دائم التشغيل.**

**الحل:** حوّل كل route إلى Netlify Function مستقلة في:
```
netlify/
  functions/
    triage.ts
    smart-summary.ts
    triage-questions.ts
    health-assessment.ts
    chat.ts
    check-interactions.ts
    classify.ts
```

**بديل أسرع:** استخدم **Render.com** أو **Railway.app** بدلاً من Netlify، لأنها تدعم Express مباشرة.

---

## ترتيب النسخ في المشروع

```
مجلد المشروع/
├── package.json              ← استبدل بالإصلاح
├── tsconfig.json             ← استبدل بالإصلاح
├── firebase-applet-config.json  ← سليم، لا تغيير مطلوب
├── firebase.json             ← سليم
├── firestore.rules           ← محسّن
└── netlify.toml              ← جديد، أضفه للمشروع
```
