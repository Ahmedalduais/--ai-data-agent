import express from 'express';
const router = express.Router();
import { getAgent } from '../agent/langchain-agent.js';
import { getDatabase } from '../db/mysql.js';

// إضافة متغير لتخزين سياق المحادثة على مستوى الجلسة
const sessionContext = {
  currentQuery: null,
  previousQueries: []
};

router.post('/', async (req, res) => {
  const { message, model, context } = req.body;
  console.log(`Received query: "${message}" using model: ${model}`);

  // تحديث سياق المحادثة من الطلب إذا كان متاحاً
  if (context) {
    console.log("Received context from client:", context);
  }

  // تحديث سياق المحادثة المحلي
  sessionContext.previousQueries.push(sessionContext.currentQuery);
  sessionContext.currentQuery = message;

  console.log(`Updated session context. Current query: "${message}"`);
  console.log(`Previous queries: ${JSON.stringify(sessionContext.previousQueries.filter(Boolean))}`);

  // تحليل السؤال لمعرفة ما إذا كان متابعة للسؤال السابق
  const isFollowUpQuery = isFollowUp(message, sessionContext.previousQueries.filter(Boolean));
  console.log(`Is follow-up query: ${isFollowUpQuery}`);

  try {
    // تأكد من وجود قاعدة البيانات أولاً
    try {
      console.log("Getting database connection...");
      const db = await getDatabase();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return res.status(500).json({
        message: 'فشل الاتصال بقاعدة البيانات',
        error: dbError.message
      });
    }

    // استخدم LangChain لتحويل السؤال إلى SQL وتنفيذه
    console.log("Initializing LangChain agent...");
    const agent = await getAgent(model); // مرر اسم الموديل
    console.log("LangChain agent initialized successfully");

    // احصل على الاستعلام والنتيجة من LangChain
    console.log("Calling LangChain agent with query...");

    // إنشاء كائن السياق للوكيل
    const agentContext = {
      isFollowUp: isFollowUpQuery,
      previousQueries: sessionContext.previousQueries.filter(Boolean),
      clientContext: context || {}
    };

    const result = await agent.call({
      query: message,
      context: agentContext
    });
    console.log("LangChain agent call completed");

    // اطبع النتيجة في الكونسول للمراقبة
    console.log('LangChain result:', JSON.stringify(result, null, 2));

    // استخراج النتائج (جدول)
    let tableData = [];
    let columns = [];

    console.log("Processing result data...");
    if (result.result?.rows) {
      console.log("Found rows in result.result");
      tableData = result.result.rows;
      columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
    } else if (Array.isArray(result.result)) {
      console.log("Result is an array");
      tableData = result.result;
      columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
    } else if (typeof result.result === 'object' && result.result !== null) {
      console.log("Result is an object");
      tableData = [result.result];
      columns = Object.keys(result.result);
    } else {
      console.log("Result format not recognized:", typeof result.result);
    }

    console.log("Extracted columns:", columns);
    console.log("Table data count:", tableData.length);

    // إنشاء بيانات الرسم البياني بناءً على البيانات المعروضة
    let chart = null;
    if (tableData.length > 0 && columns.length >= 2) {
      console.log("Creating chart data");

      // تحديد نوع الرسم البياني المناسب
      let chartType = 'bar'; // النوع الافتراضي

      // البحث عن أعمدة رقمية للمحور Y
      const numericColumns = columns.filter(col => {
        return tableData.some(row => {
          const value = row[col];
          return typeof value === 'number' ||
                 (typeof value === 'string' && !isNaN(parseFloat(value)));
        });
      });
      console.log("Numeric columns:", numericColumns);

      // البحث عن أعمدة نصية أو تاريخية للمحور X
      const categoryColumns = columns.filter(col => {
        return tableData.some(row => {
          const value = row[col];
          return typeof value === 'string' || value instanceof Date;
        });
      });
      console.log("Category columns:", categoryColumns);

      // تحديد الأعمدة المناسبة للرسم البياني
      let xColumn = columns[0];
      let yColumn = columns[1];

      // إذا وجدنا أعمدة مناسبة، نستخدمها
      if (numericColumns.length > 0 && categoryColumns.length > 0) {
        xColumn = categoryColumns[0];
        yColumn = numericColumns[0];
      }

      // تحليل السؤال لتحديد نوع الرسم البياني المناسب
      const questionLower = message.toLowerCase();

      // تحديد نوع الرسم البياني بناءً على محتوى السؤال
      if (questionLower.includes('أعلى') ||
          questionLower.includes('أكثر') ||
          questionLower.includes('أفضل') ||
          questionLower.includes('ترتيب') ||
          questionLower.includes('مقارنة')) {
        chartType = 'bar'; // استخدام أعمدة للمقارنات
      } else if (questionLower.includes('تطور') ||
                 questionLower.includes('مع الوقت') ||
                 questionLower.includes('تاريخ') ||
                 questionLower.includes('شهر') ||
                 questionLower.includes('سنة')) {
        chartType = 'line'; // استخدام خط للبيانات الزمنية
      } else if (questionLower.includes('نسبة') ||
                 questionLower.includes('توزيع') ||
                 questionLower.includes('دائرة') ||
                 questionLower.includes('حصة')) {
        chartType = 'pie'; // استخدام دائرة للنسب
      } else if (tableData.length > 15) {
        chartType = 'line'; // استخدام خط للبيانات الكبيرة
      } else if (numericColumns.length >= 2) {
        chartType = 'scatter'; // استخدام نقاط للبيانات الرقمية المتعددة
      }

      // إذا كان السؤال يطلب رسماً بيانياً محدداً
      if (questionLower.includes('رسم خطي')) {
        chartType = 'line';
      } else if (questionLower.includes('رسم شريطي') || questionLower.includes('رسم عمودي')) {
        chartType = 'bar';
      } else if (questionLower.includes('رسم دائري')) {
        chartType = 'pie';
      } else if (questionLower.includes('رسم مبعثر')) {
        chartType = 'scatter';
      }

      console.log(`Selected chart type: ${chartType}, X column: ${xColumn}, Y column: ${yColumn}`);

      // تحضير البيانات للرسم البياني
      // إذا كان عدد الصفوف كبيراً جداً، نقوم بتقليصه للرسم البياني
      let chartData = tableData;
      if (tableData.length > 20 && chartType !== 'line') {
        // اختيار أهم 10-15 صفوف للعرض في الرسم البياني
        chartData = tableData.slice(0, 15);
      }

      chart = {
        chartType: chartType,
        columns: [xColumn, yColumn],
        data: chartData
      };
    }

    console.log("Sending response to client");
    // استخراج معلومات السياق من النتائج
    let responseContext = {};

    // إذا كان السؤال عن عميل محدد، نضيف معلومات العميل إلى السياق
    if (tableData.length > 0 && tableData[0].customer_name) {
      responseContext.currentCustomer = tableData[0];
    }

    // إذا كان السؤال عن منتجات، نضيف المنتجات إلى السياق
    if (tableData.length > 0 && tableData[0].item_name) {
      responseContext.currentItems = tableData;
    }

    res.json({
      message: result.result?.text || 'تم جلب البيانات بنجاح',
      table: {
        columns,
        data: tableData
      },
      chart, // قد يكون null إذا لم يكن هناك رسم بياني
      context: responseContext // إضافة معلومات السياق للاستجابة
    });
  } catch (err) {
    console.error("Error processing request:", err);
    res.status(500).json({
      message: 'حدث خطأ أثناء معالجة الطلب',
      error: err.message,
      stack: err.stack
    });
  }
});

/**
 * دالة لتحديد ما إذا كان السؤال متابعة للسؤال السابق
 * @param {string} currentQuery - السؤال الحالي
 * @param {Array} previousQueries - الأسئلة السابقة
 * @returns {boolean} - هل السؤال متابعة للسؤال السابق
 */
function isFollowUp(currentQuery, previousQueries) {
  if (!previousQueries.length) return false;

  // تحويل السؤال إلى حروف صغيرة للمقارنة
  const query = currentQuery.toLowerCase();

  // كلمات تشير إلى أن السؤال متابعة للسؤال السابق
  const followUpIndicators = [
    'منه', 'منها', 'له', 'لها', 'هو', 'هي', 'هم', 'هن',
    'هذا', 'هذه', 'هؤلاء', 'تلك', 'أولئك',
    'السابق', 'السابقة', 'المذكور', 'المذكورة',
    'اجلب', 'أظهر', 'عرض'
  ];

  // التحقق من وجود أي من الكلمات المؤشرة في السؤال
  return followUpIndicators.some(indicator => query.includes(indicator));
}

export default router;