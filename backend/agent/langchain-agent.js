import { translateQuestionToSQL, generateResultDescription } from "./gemini-model.js";
import mysql from "mysql2/promise";
import { config } from '../config/config.js';

// إضافة متغير عالمي لتخزين سياق المحادثة
const conversationContext = {
  currentCustomer: null,
  currentItems: null,
  previousQueries: [],
  previousResults: []
};

/**
 * دالة للاتصال بقاعدة البيانات وتنفيذ استعلام SQL
 * @param {string} sql - استعلام SQL
 * @returns {Promise<Array>} - نتائج الاستعلام
 */
async function executeQuery(sql) {
  try {
    // تنظيف استعلام SQL من أي أكواد تنسيق
    sql = sql.replace(/```sql|```/g, '').trim();

    console.log(`Executing SQL query: ${sql}`);

    // الاتصال بقاعدة البيانات باستخدام إعدادات متغيرات البيئة
    const connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port
    });

    // تنفيذ الاستعلام
    const [rows] = await connection.execute(sql);

    // إغلاق الاتصال
    await connection.end();

    console.log(`Query executed successfully, returned ${rows.length} rows`);

    // تحديث سياق المحادثة بناءً على نتائج الاستعلام
    updateContextFromResults(sql, rows);

    return rows;
  } catch (error) {
    console.error("Error executing query:", error);

    // في حالة وجود خطأ في الاستعلام، نحاول إصلاحه
    if (error.code === 'ER_PARSE_ERROR' || error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
      console.warn("SQL error, attempting to fix query:", error.message);

      // تحليل السؤال الأصلي من الاستعلام
      const categoryMatch = sql.match(/category\s*=\s*['"]([^'"]+)['"]/i);
      const category = categoryMatch ? categoryMatch[1] : null;

      // تحديد الاستعلام البديل المناسب بناءً على الفئة المطلوبة
      let fallbackQuery = '';

      if (category) {
        // إذا كان هناك فئة محددة في الاستعلام، نستخدمها
        fallbackQuery = `SELECT * FROM items WHERE category = '${category}' LIMIT 10`;
        console.log(`Using category-specific fallback query for category: ${category}`);
      } else if (sql.toLowerCase().includes('stock_movements')) {
        // إذا كان الاستعلام يتعلق بحركات المخزون
        fallbackQuery = `
          SELECT i.item_id, i.item_name, i.category, i.stock_quantity,
                 i.unit_price, i.cost_price
          FROM items i
          ORDER BY i.item_id
          LIMIT 15
        `;
      } else if (sql.toLowerCase().includes('vegetables') || sql.toLowerCase().includes('خضروات')) {
        // إذا كان الاستعلام يتعلق بالخضروات
        fallbackQuery = `SELECT * FROM items WHERE category = 'خضروات' LIMIT 10`;
      } else {
        // استعلام افتراضي
        fallbackQuery = 'SELECT * FROM items LIMIT 10';
      }

      // محاولة تنفيذ الاستعلام البديل
      try {
        console.log(`Executing fallback query: ${fallbackQuery}`);
        const connection = await mysql.createConnection({
          host: config.database.host,
          user: config.database.user,
          password: config.database.password,
          database: config.database.database,
          port: config.database.port
        });

        const [rows] = await connection.execute(fallbackQuery);
        await connection.end();

        console.log(`Fallback query returned ${rows.length} rows`);

        // إذا كانت النتائج فارغة أو لا تتطابق مع الفئة المطلوبة، نجرب استعلامًا آخر
        if (rows.length === 0 || (category && !rows.some(row => row.category === category))) {
          throw new Error("Fallback query returned inappropriate results");
        }

        // تحديث سياق المحادثة بناءً على نتائج الاستعلام البديل
        updateContextFromResults(fallbackQuery, rows);

        return rows;
      } catch (fallbackError) {
        console.error("Fallback query failed or returned inappropriate results:", fallbackError);

        // محاولة أخيرة باستعلام أبسط
        try {
          const connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.database,
            port: config.database.port
          });

          // استعلام نهائي يجلب جميع الفئات
          const finalQuery = `
            SELECT i.item_id, i.item_name, i.category, i.stock_quantity,
                   i.unit_price, i.cost_price
            FROM items i
            ORDER BY i.category, i.item_name
            LIMIT 15
          `;

          const [rows] = await connection.execute(finalQuery);
          await connection.end();

          // تحديث سياق المحادثة بناءً على نتائج الاستعلام النهائي
          updateContextFromResults(finalQuery, rows);

          return rows;
        } catch (finalError) {
          console.error("Final fallback query failed:", finalError);
          return [];
        }
      }
    }

    return [];
  }
}

async function getAgent(model) {
  try {
    console.log(`Creating agent with model: ${model}`);

    // إنشاء وكيل بسيط يستخدم Gemini API
    return {
      call: async ({ query, context }) => {
        console.log(`Processing query: ${query}`);
        console.log(`With context:`, context);

        // دمج سياق المحادثة المحلي مع السياق المستلم من العميل
        const mergedContext = { ...conversationContext };

        // إذا كان هناك سياق من العميل، نضيفه إلى السياق المدمج
        if (context && context.clientContext) {
          if (context.clientContext.currentCustomer) {
            mergedContext.currentCustomer = context.clientContext.currentCustomer;
          }
          if (context.clientContext.currentItems) {
            mergedContext.currentItems = context.clientContext.currentItems;
          }
        }

        // إذا كان السؤال متابعة للسؤال السابق، نضيف علامة في السياق
        if (context && context.isFollowUp) {
          mergedContext.isFollowUp = true;
        }

        try {
          // استخدام Gemini لتحويل السؤال إلى استعلام SQL مع مراعاة سياق المحادثة
          const sql = await translateQuestionToSQL(query, mergedContext);
          console.log(`Generated SQL: ${sql}`);

          // تنفيذ الاستعلام على قاعدة البيانات
          const result = await executeQuery(sql);

          // استخدام Gemini لإنشاء وصف للنتائج مع مراعاة سياق المحادثة
          const text = await generateResultDescription(query, result, sql, mergedContext);

          console.log("Query processed successfully");
          return {
            result: result,
            sql: sql,
            text: text
          };
        } catch (error) {
          console.error("Error processing query:", error);

          // في حالة الخطأ، نعيد رسالة خطأ
          return {
            result: [],
            sql: "SELECT * FROM items LIMIT 10",
            text: "حدث خطأ أثناء معالجة الاستعلام. يرجى التحقق من تشغيل خادم MySQL وإعداد قاعدة البيانات بشكل صحيح."
          };
        }
      }
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw error;
  }
}

/**
 * دالة لتحديث سياق المحادثة بناءً على نتائج الاستعلام
 * @param {string} sql - استعلام SQL
 * @param {Array} results - نتائج الاستعلام
 */
function updateContextFromResults(sql, results) {
  // حفظ الاستعلام والنتائج في سياق المحادثة
  conversationContext.previousQueries.push(sql);
  conversationContext.previousResults.push(results);

  // إذا كان الاستعلام يتعلق بالعملاء، نحدث العميل الحالي
  if (sql.toLowerCase().includes('customers') && results.length > 0) {
    // تحقق مما إذا كان الاستعلام يبحث عن أكثر العملاء شراءً
    if (sql.toLowerCase().includes('count') || sql.toLowerCase().includes('sum') ||
        sql.toLowerCase().includes('group by') || sql.toLowerCase().includes('order by')) {
      // نفترض أن أول عميل في النتائج هو الأكثر شراءً
      conversationContext.currentCustomer = results[0];
      console.log(`Updated current customer to: ${JSON.stringify(conversationContext.currentCustomer)}`);
    }
  }

  // إذا كان الاستعلام يتعلق بالمنتجات، نحدث المنتجات الحالية
  if (sql.toLowerCase().includes('items') || sql.toLowerCase().includes('products')) {
    conversationContext.currentItems = results;
    console.log(`Updated current items with ${results.length} items`);
  }
}

export { getAgent };
