# 🤖 وكيل البيانات الذكي - AI Data Agent

<div align="center">

![AI Data Agent](https://img.shields.io/badge/AI-Data%20Agent-blue?style=for-the-badge&logo=artificial-intelligence)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-FF6B35?style=for-the-badge&logo=chainlink&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

**وكيل ذكاء صناعي متقدم لتحليل البيانات باستخدام الذكاء الاصطناعي**

[العرض التوضيحي](#-العرض-التوضيحي) • [التثبيت](#-التثبيت) • [الاستخدام](#-الاستخدام) • [المساهمة](#-المساهمة)

</div>

---

## 📋 نظرة عامة

وكيل البيانات الذكي هو تطبيق ويب متطور يستخدم تقنيات الذكاء الاصطناعي لتحليل البيانات والإجابة على الاستفسارات باللغة العربية. يمكن للمستخدمين طرح أسئلة بلغة طبيعية حول بياناتهم والحصول على إجابات دقيقة مع رسوم بيانية تفاعلية.

### ✨ الميزات الرئيسية

- 🗣️ **واجهة محادثة ذكية**: تفاعل طبيعي باللغة العربية
- 🔄 **تحويل تلقائي للاستفسارات**: من اللغة الطبيعية إلى استعلامات SQL
- 📊 **رسوم بيانية تفاعلية**: عرض البيانات بصرياً (أعمدة، خطوط، دائرية)
- 🧠 **ذاكرة سياقية**: يتذكر المحادثات السابقة للاستفسارات المتتالية
- ⚡ **استجابة فورية**: معالجة سريعة للاستفسارات
- 🎨 **واجهة مستخدم حديثة**: تصميم متجاوب باستخدام Tailwind CSS
- 🔒 **آمن ومحمي**: حماية البيانات والمفاتيح الحساسة

### 🛠️ التقنيات المستخدمة

#### الواجهة الخلفية (Backend)
- **Node.js** - بيئة تشغيل JavaScript
- **Express.js** - إطار عمل الخادم
- **LangChain** - إطار عمل الذكاء الاصطناعي
- **Google Gemini API** - نموذج الذكاء الاصطناعي
- **MySQL2** - قاعدة البيانات
- **TypeORM** - أداة ربط قواعد البيانات

#### الواجهة الأمامية (Frontend)
- **HTML5** - هيكل الصفحة
- **CSS3 + Tailwind CSS** - التصميم والتنسيق
- **JavaScript (ES6+)** - التفاعل والديناميكية
- **Chart.js** - الرسوم البيانية التفاعلية

---

## 🚀 التثبيت

### المتطلبات الأساسية

قبل البدء، تأكد من تثبيت:

- [Node.js](https://nodejs.org/) (الإصدار 16 أو أحدث)
- [MySQL](https://www.mysql.com/) (الإصدار 8.0 أو أحدث)
- [Git](https://git-scm.com/)

### خطوات التثبيت

1. **استنساخ المستودع**
```bash
git clone https://github.com/Ahmedalduais/--ai-data-agent.git
cd --ai-data-agent
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد قاعدة البيانات**
```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE inventorymanagement;

-- استخدام قاعدة البيانات
USE inventorymanagement;

-- إنشاء الجداول (راجع ملف database-schema.sql)
```

4. **إعداد متغيرات البيئة**
```bash
# إنشاء ملف .env
cp .env.example .env

# تحرير الملف وإضافة المعلومات المطلوبة
```

5. **تشغيل التطبيق**
```bash
npm start
```

6. **فتح التطبيق**
افتح المتصفح وانتقل إلى: `http://localhost:3003`

---

## ⚙️ الإعداد

### متغيرات البيئة

أنشئ ملف `.env` في الجذر الرئيسي وأضف:

```env
# إعدادات قاعدة البيانات
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=inventorymanagement

# مفتاح Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# إعدادات الخادم
PORT=3003
NODE_ENV=production
```

### هيكل قاعدة البيانات

التطبيق يعمل مع قاعدة بيانات إدارة المخزون التي تحتوي على:

- **العملاء** (customers)
- **الفواتير** (invoices)
- **تفاصيل الفواتير** (invoice_details)
- **المنتجات** (items)
- **المشتريات** (purchases)
- **تفاصيل المشتريات** (purchase_details)
- **حركات المخزون** (stock_movements)
- **الموردين** (suppliers)

---

## 💡 الاستخدام

### أمثلة على الاستفسارات

يمكنك طرح أسئلة مثل:

```
📊 أسئلة عامة:
- "أظهر لي جميع المنتجات"
- "ما هي أعلى 5 منتجات مبيعاً؟"
- "أعطني تقرير عن المخزون"

🥬 أسئلة عن فئات محددة:
- "أظهر لي منتجات الخضروات"
- "ما هي أكثر الفواكه مبيعاً؟"
- "كم عدد منتجات اللحوم المتوفرة؟"

👥 أسئلة عن العملاء:
- "من هو أكثر العملاء شراءً؟"
- "أظهر لي مشتريات العميل أحمد"
- "ما هي إجمالي مبيعات هذا الشهر؟"

📈 أسئلة تحليلية:
- "أظهر لي تطور المبيعات خلال الأشهر الماضية"
- "ما هي المنتجات الأكثر ربحية؟"
- "أعطني تحليل للمخزون المنخفض"
```

### أنواع الرسوم البيانية

- **أعمدة بيانية**: للمقارنات والترتيب
- **خطوط بيانية**: للبيانات الزمنية والاتجاهات
- **دوائر بيانية**: للنسب والتوزيعات
- **نقاط مبعثرة**: للعلاقات بين متغيرين

---

## 🏗️ هيكل المشروع

```
ai-data-agent/
├── 📁 backend/
│   ├── 📁 agent/
│   │   ├── 📄 gemini-model.js      # تكامل Google Gemini
│   │   ├── 📄 langchain-agent.js   # وكيل LangChain
│   │   └── 📄 ollama-model.js      # دعم Ollama (اختياري)
│   ├── 📁 db/
│   │   └── 📄 mysql.js             # اتصال قاعدة البيانات
│   ├── 📁 routes/
│   │   ├── 📄 analyze.route.js     # مسارات التحليل
│   │   └── 📄 query.route.js       # مسارات الاستفسارات
│   └── 📄 server.js                # الخادم الرئيسي
├── 📁 frontend/
│   ├── 📁 styles/
│   │   └── 📄 tailwind.css         # أنماط CSS
│   ├── 📄 app.js                   # منطق التطبيق الرئيسي
│   ├── 📄 chart.js                 # إدارة الرسوم البيانية
│   ├── 📄 table.js                 # إدارة الجداول
│   └── 📄 index.html               # الصفحة الرئيسية
├── 📄 package.json                 # تبعيات المشروع
├── 📄 .env.example                 # مثال متغيرات البيئة
├── 📄 .gitignore                   # ملفات مستبعدة من Git
└── 📄 README.md                    # هذا الملف
```

---

## 🔧 API المرجعي

### نقاط النهاية (Endpoints)

#### `POST /api/query`
إرسال استفسار للوكيل الذكي

**المعاملات:**
```json
{
  "message": "السؤال باللغة العربية",
  "model": "gemini-2.0-flash",
  "context": {}
}
```

**الاستجابة:**
```json
{
  "message": "وصف النتائج",
  "table": {
    "columns": ["عمود1", "عمود2"],
    "data": [...]
  },
  "chart": {
    "chartType": "bar",
    "columns": ["x", "y"],
    "data": [...]
  },
  "context": {}
}
```

#### `GET /api/models`
الحصول على قائمة النماذج المتاحة

---

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage

# تشغيل اختبارات التكامل
npm run test:integration
```

---

## 🚀 النشر

### النشر على خادم محلي

```bash
# بناء التطبيق للإنتاج
npm run build

# تشغيل في وضع الإنتاج
NODE_ENV=production npm start
```

### النشر على السحابة

التطبيق متوافق مع:
- **Heroku**
- **AWS EC2**
- **Google Cloud Platform**
- **DigitalOcean**
- **Azure**

---

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى اتباع الخطوات التالية:

1. **Fork** المستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. تنفيذ التغييرات (`git commit -m 'Add amazing feature'`)
4. رفع التغييرات (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### إرشادات المساهمة

- اتبع معايير الكود الموجودة
- أضف اختبارات للميزات الجديدة
- حدث الوثائق عند الحاجة
- تأكد من عمل جميع الاختبارات

---

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👨‍💻 المطور

**المهندس أحمد الدعيس**

- 📧 البريد الإلكتروني: [ahmedaldouois@gmail.com](mailto:ahmedaldouois@gmail.com)
- 💼 LinkedIn: [أحمد الدعيس](https://linkedin.com/in/ahmedalduais)
- 🐙 GitHub: [@Ahmedalduais](https://github.com/Ahmedalduais)

---

## 🙏 شكر وتقدير

- [LangChain](https://langchain.com/) - إطار عمل الذكاء الاصطناعي
- [Google Gemini](https://deepmind.google/technologies/gemini/) - نموذج الذكاء الاصطناعي
- [Chart.js](https://www.chartjs.org/) - مكتبة الرسوم البيانية
- [Tailwind CSS](https://tailwindcss.com/) - إطار عمل CSS

---

## 📊 إحصائيات المشروع

![GitHub stars](https://img.shields.io/github/stars/Ahmedalduais/--ai-data-agent?style=social)
![GitHub forks](https://img.shields.io/github/forks/Ahmedalduais/--ai-data-agent?style=social)
![GitHub issues](https://img.shields.io/github/issues/Ahmedalduais/--ai-data-agent)
![GitHub license](https://img.shields.io/github/license/Ahmedalduais/--ai-data-agent)

---

<div align="center">

**⭐ إذا أعجبك هذا المشروع، لا تنس إعطاؤه نجمة! ⭐**

</div>