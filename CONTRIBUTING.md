# 🤝 دليل المساهمة - Contributing Guide

مرحباً بك في مشروع وكيل البيانات الذكي! نحن نرحب بمساهماتك ونقدر وقتك وجهدك. 🙏

## 📋 جدول المحتويات

- [كيفية المساهمة](#-كيفية-المساهمة)
- [الإبلاغ عن الأخطاء](#-الإبلاغ-عن-الأخطاء)
- [اقتراح ميزات جديدة](#-اقتراح-ميزات-جديدة)
- [إرشادات الكود](#-إرشادات-الكود)
- [عملية المراجعة](#-عملية-المراجعة)
- [إعداد بيئة التطوير](#-إعداد-بيئة-التطوير)

## 🚀 كيفية المساهمة

### 1. Fork المستودع
```bash
# انقر على زر "Fork" في GitHub
# ثم استنسخ المستودع المنسوخ
git clone https://github.com/your-username/--ai-data-agent.git
cd --ai-data-agent
```

### 2. إنشاء فرع جديد
```bash
# إنشاء فرع للميزة الجديدة
git checkout -b feature/amazing-feature

# أو للإصلاح
git checkout -b fix/bug-description
```

### 3. تنفيذ التغييرات
- اكتب كود نظيف ومفهوم
- أضف تعليقات باللغة العربية
- اتبع معايير الكود الموجودة

### 4. اختبار التغييرات
```bash
# تشغيل الاختبارات
npm test

# تشغيل التطبيق محلياً
npm start
```

### 5. رفع التغييرات
```bash
git add .
git commit -m "إضافة ميزة رائعة"
git push origin feature/amazing-feature
```

### 6. إنشاء Pull Request
- اذهب إلى GitHub وأنشئ Pull Request
- اكتب وصفاً واضحاً للتغييرات
- اربط أي Issues ذات صلة

## 🐛 الإبلاغ عن الأخطاء

### قبل الإبلاغ
- [ ] تأكد من أن الخطأ لم يتم الإبلاغ عنه مسبقاً
- [ ] جرب إعادة إنتاج الخطأ
- [ ] تحقق من أنك تستخدم أحدث إصدار

### معلومات مطلوبة
```markdown
**وصف الخطأ**
وصف واضح ومختصر للخطأ.

**خطوات إعادة الإنتاج**
1. اذهب إلى '...'
2. انقر على '...'
3. مرر إلى '...'
4. شاهد الخطأ

**السلوك المتوقع**
وصف واضح لما كان متوقعاً أن يحدث.

**لقطات الشاشة**
إذا كان ذلك مناسباً، أضف لقطات شاشة.

**معلومات البيئة**
- نظام التشغيل: [مثل iOS]
- المتصفح: [مثل chrome, safari]
- إصدار Node.js: [مثل 18.0.0]
- إصدار التطبيق: [مثل 1.0.0]
```

## 💡 اقتراح ميزات جديدة

### قبل الاقتراح
- [ ] تحقق من أن الميزة غير موجودة
- [ ] ابحث في Issues الموجودة
- [ ] فكر في الفائدة للمستخدمين

### قالب الاقتراح
```markdown
**هل اقتراحك مرتبط بمشكلة؟**
وصف واضح للمشكلة. مثال: أشعر بالإحباط عندما [...]

**وصف الحل المقترح**
وصف واضح ومختصر لما تريده أن يحدث.

**وصف البدائل**
وصف واضح ومختصر لأي حلول أو ميزات بديلة فكرت فيها.

**سياق إضافي**
أضف أي سياق أو لقطات شاشة أخرى حول طلب الميزة هنا.
```

## 📝 إرشادات الكود

### معايير JavaScript
```javascript
// استخدم const/let بدلاً من var
const apiKey = process.env.API_KEY;
let result = null;

// أسماء متغيرات وصفية
const userQuery = 'أظهر لي المنتجات';
const databaseConnection = await mysql.createConnection();

// تعليقات باللغة العربية
// دالة لتحويل السؤال إلى استعلام SQL
function translateToSQL(question) {
  // منطق التحويل هنا
}
```

### معايير CSS
```css
/* استخدم أسماء فئات وصفية */
.chat-container {
  display: flex;
  flex-direction: column;
}

/* تعليقات واضحة */
/* منطقة عرض الرسوم البيانية */
.chart-display {
  height: 400px;
  width: 100%;
}
```

### هيكل الملفات
```
backend/
├── agent/          # منطق الذكاء الاصطناعي
├── config/         # إعدادات التطبيق
├── db/             # اتصال قاعدة البيانات
├── routes/         # مسارات API
└── server.js       # الخادم الرئيسي

frontend/
├── styles/         # ملفات CSS
├── app.js          # منطق التطبيق
├── chart.js        # إدارة الرسوم البيانية
└── index.html      # الصفحة الرئيسية
```

## 🔍 عملية المراجعة

### ما نبحث عنه
- ✅ الكود يعمل بشكل صحيح
- ✅ يتبع معايير المشروع
- ✅ يحتوي على تعليقات مناسبة
- ✅ لا يكسر الوظائف الموجودة
- ✅ يحسن من الأداء أو الوظائف

### زمن المراجعة
- **Pull Requests صغيرة**: 1-2 يوم
- **Pull Requests كبيرة**: 3-7 أيام
- **إصلاحات عاجلة**: خلال 24 ساعة

## 🛠️ إعداد بيئة التطوير

### المتطلبات
- Node.js 16+
- MySQL 8.0+
- Git
- محرر نصوص (VS Code موصى به)

### خطوات الإعداد
```bash
# 1. استنساخ المستودع
git clone https://github.com/Ahmedalduais/--ai-data-agent.git
cd --ai-data-agent

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# حرر ملف .env وأضف المعلومات المطلوبة

# 4. إعداد قاعدة البيانات
# أنشئ قاعدة البيانات وأضف البيانات التجريبية

# 5. تشغيل التطبيق
npm start
```

### أدوات التطوير المفيدة
- **VS Code Extensions**:
  - Arabic Language Pack
  - ES6 String HTML
  - Prettier
  - ESLint

## 📚 موارد مفيدة

### وثائق التقنيات
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [LangChain Documentation](https://langchain.readthedocs.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

### أدلة الأسلوب
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

## 🎯 أولويات المساهمة

### عالية الأولوية
- 🐛 إصلاح الأخطاء
- 🔒 تحسينات الأمان
- 📊 تحسين الرسوم البيانية
- 🌐 دعم لغات إضافية

### متوسطة الأولوية
- ✨ ميزات جديدة
- 🎨 تحسينات UI/UX
- 📝 تحسين الوثائق
- ⚡ تحسينات الأداء

### منخفضة الأولوية
- 🧹 تنظيف الكود
- 📦 تحديث التبعيات
- 🎭 تحسينات تجميلية

## 🏆 الاعتراف بالمساهمين

جميع المساهمين سيتم ذكرهم في:
- ملف README.md
- صفحة الشكر والتقدير
- ملاحظات الإصدار

## 📞 الحصول على المساعدة

إذا كنت بحاجة إلى مساعدة:
- 💬 أنشئ Discussion في GitHub
- 📧 راسل المطور: ahmedaldouois@gmail.com
- 🐛 أنشئ Issue للأسئلة التقنية

---

**شكراً لك على مساهمتك! 🙏**
