import fetch from 'node-fetch';
import { config } from '../config/config.js';

// إعدادات Google Gemini API من متغيرات البيئة
const GEMINI_API_KEY = config.ai.geminiApiKey;
const GEMINI_API_URL = config.ai.geminiApiUrl;

/**
 * دالة لإنشاء نموذج Gemini
 */
export function getGeminiModel() {
  return {
    // دالة لإرسال طلب إلى Gemini API
    call: async (prompt) => {
      try {
        console.log(`Sending prompt to Gemini API: ${prompt.substring(0, 100)}...`);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Gemini API response received');

        // استخراج النص من الاستجابة
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
      } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
      }
    }
  };
}

// وصف هيكل قاعدة البيانات
const DATABASE_SCHEMA = `
# هيكل قاعدة البيانات "inventorymanagement"

## جدول العملاء (customers)
- customer_id: معرف العميل (INT, المفتاح الرئيسي)
- customer_name: اسم العميل (VARCHAR)
- phone: رقم الهاتف (VARCHAR)
- email: البريد الإلكتروني (VARCHAR)
- address: العنوان (VARCHAR)

## جدول الفواتير (invoices)
- invoice_id: معرف الفاتورة (INT, المفتاح الرئيسي)
- customer_id: معرف العميل (INT, مفتاح أجنبي يشير إلى customers.customer_id)
- invoice_date: تاريخ الفاتورة (DATE)
- total_amount: المبلغ الإجمالي (DECIMAL)
- notes: ملاحظات (TEXT)

## جدول تفاصيل الفواتير (invoice_details)
- invoice_detail_id: معرف تفاصيل الفاتورة (INT, المفتاح الرئيسي)
- invoice_id: معرف الفاتورة (INT, مفتاح أجنبي يشير إلى invoices.invoice_id)
- item_id: معرف المنتج (INT, مفتاح أجنبي يشير إلى items.item_id)
- quantity: الكمية (INT)
- unit_price: سعر الوحدة (DECIMAL)
- subtotal: المجموع الفرعي (DECIMAL)

## جدول المنتجات (items)
- item_id: معرف المنتج (INT, المفتاح الرئيسي)
- item_name: اسم المنتج (VARCHAR)
- category: الفئة (VARCHAR)
- unit_price: سعر البيع (DECIMAL)
- cost_price: سعر التكلفة (DECIMAL)
- stock_quantity: كمية المخزون (INT)

## جدول المشتريات (purchases)
- purchase_id: معرف عملية الشراء (INT, المفتاح الرئيسي)
- supplier_id: معرف المورد (INT, مفتاح أجنبي يشير إلى suppliers.supplier_id)
- purchase_date: تاريخ الشراء (DATE)
- total_amount: المبلغ الإجمالي (DECIMAL)
- notes: ملاحظات (TEXT)

## جدول تفاصيل المشتريات (purchase_details)
- purchase_detail_id: معرف تفاصيل الشراء (INT, المفتاح الرئيسي)
- purchase_id: معرف عملية الشراء (INT, مفتاح أجنبي يشير إلى purchases.purchase_id)
- item_id: معرف المنتج (INT, مفتاح أجنبي يشير إلى items.item_id)
- quantity: الكمية (INT)
- unit_cost: تكلفة الوحدة (DECIMAL)
- subtotal: المجموع الفرعي (DECIMAL)

## جدول حركات المخزون (stock_movements)
- movement_id: معرف الحركة (INT, المفتاح الرئيسي)
- item_id: معرف المنتج (INT, مفتاح أجنبي يشير إلى items.item_id)
- movement_type: نوع الحركة (ENUM: 'شراء', 'بيع', 'إرجاع')
- quantity: الكمية (INT)
- movement_date: تاريخ الحركة (DATE)
- remarks: ملاحظات (TEXT)

## جدول الموردين (suppliers)
- supplier_id: معرف المورد (INT, المفتاح الرئيسي)
- supplier_name: اسم المورد (VARCHAR)
- contact_info: معلومات الاتصال (VARCHAR)
- address: العنوان (VARCHAR)

## العلاقات بين الجداول
- invoices.customer_id -> customers.customer_id
- invoice_details.invoice_id -> invoices.invoice_id
- invoice_details.item_id -> items.item_id
- purchases.supplier_id -> suppliers.supplier_id
- purchase_details.purchase_id -> purchases.purchase_id
- purchase_details.item_id -> items.item_id
- stock_movements.item_id -> items.item_id
`;

/**
 * دالة لتحويل سؤال بالعربية إلى استعلام SQL
 * @param {string} question - السؤال بالعربية
 * @returns {Promise<string>} - استعلام SQL
 */
export async function translateQuestionToSQL(question, context = null) {
  const geminiModel = getGeminiModel();

  // استيراد سياق المحادثة إذا كان متاحاً
  let contextInfo = '';
  if (context && context.currentCustomer) {
    contextInfo = `
    معلومات السياق الحالي:
    - العميل الحالي: ${JSON.stringify(context.currentCustomer)}
    `;
  }

  const prompt = `
  أنت مساعد ذكي متخصص في تحويل الأسئلة باللغة العربية إلى استعلامات SQL دقيقة.

  فيما يلي هيكل قاعدة البيانات التي نستخدمها:

  ${DATABASE_SCHEMA}

  السؤال هو: "${question}"

  ${contextInfo}

  مهمتك هي:
  1. فهم السؤال باللغة العربية بدقة
  2. تحديد الجداول والحقول المطلوبة للإجابة على السؤال بشكل صحيح
  3. إنشاء استعلام SQL يجيب على السؤال بدقة تامة
  4. مراعاة العلاقات بين الجداول واستخدام JOIN عند الحاجة
  5. استخدام الدوال المناسبة مثل COUNT و SUM و AVG وغيرها حسب الحاجة
  6. ترتيب النتائج بشكل منطقي (ORDER BY) إذا كان ذلك مناسباً
  7. استخدام LIMIT عند الحاجة لتقييد عدد النتائج

  إرشادات مهمة جداً:
  - إذا كان السؤال عن "أعلى" أو "أكثر" أو "أفضل"، تأكد من استخدام ORDER BY مع DESC والحد المناسب
  - إذا كان السؤال عن فئة محددة مثل "الخضروات" أو "الفواكه"، تأكد من تضمين شرط WHERE category = 'الفئة المطلوبة' بالضبط
  - إذا كان السؤال يتعلق بالمبيعات، فاستخدم جداول الفواتير وتفاصيل الفواتير
  - إذا كان السؤال يتعلق بالمشتريات، فاستخدم جداول المشتريات وتفاصيل المشتريات
  - إذا كان السؤال يتعلق بحركة المخزون، فاستخدم جدول stock_movements مع JOIN على جدول items
  - تأكد من استخدام الفلاتر الصحيحة في WHERE لتطابق السؤال بدقة
  - إذا كان السؤال يطلب عدداً محدداً من النتائج (مثل "أعلى صنفين")، استخدم LIMIT بالعدد المطلوب
  - تأكد من أن الاستعلام يعمل بشكل صحيح ولا يحتوي على أخطاء نحوية

  ملاحظات هامة حول البيانات:
  - فئة "الخضروات" يجب أن تكون بالضبط 'خضروات' في شرط WHERE
  - فئة "الفواكه" يجب أن تكون بالضبط 'الفواكه' في شرط WHERE
  - تأكد من أن أسماء الجداول والحقول مكتوبة بشكل صحيح تماماً كما في هيكل قاعدة البيانات

  إرشادات خاصة بسياق المحادثة:
  - إذا كان السؤال يشير إلى عميل محدد بالاسم (مثل "خالد حسن")، تأكد من تضمين شرط WHERE customer_name = 'اسم العميل' بالضبط
  - إذا كان السؤال يتعلق بـ "المنتجات التي يشتريها" عميل معين، استخدم JOIN بين جداول customers و invoices و invoice_details و items
  - إذا كان السؤال متابعة لسؤال سابق عن عميل معين، استخدم معلومات السياق المقدمة لتحديد العميل المقصود

  أعطني فقط استعلام SQL بدون أي شرح إضافي أو علامات تنسيق مثل \`\`\`sql.
  `;

  try {
    const sqlQuery = await geminiModel.call(prompt);
    return sqlQuery.trim();
  } catch (error) {
    console.error('Error translating question to SQL:', error);
    // في حالة الخطأ، نعيد استعلام SQL افتراضي
    return 'SELECT * FROM items LIMIT 10';
  }
}

/**
 * دالة لإنشاء وصف للنتائج بناءً على السؤال والبيانات
 * @param {string} question - السؤال الأصلي
 * @param {Array} data - البيانات المسترجعة
 * @returns {Promise<string>} - وصف النتائج
 */
export async function generateResultDescription(question, data, sqlQuery, context = null) {
  const geminiModel = getGeminiModel();

  // استيراد سياق المحادثة إذا كان متاحاً
  let contextInfo = '';
  if (context && context.currentCustomer) {
    contextInfo = `
    معلومات السياق الحالي:
    - العميل الحالي: ${JSON.stringify(context.currentCustomer)}
    `;
  }

  const prompt = `
  أنت مساعد ذكي متخصص في تحليل البيانات وتقديم الإجابات الدقيقة باللغة العربية.

  السؤال الأصلي هو: "${question}"

  استعلام SQL المستخدم: ${sqlQuery}

  ${contextInfo}

  البيانات التي تم استرجاعها هي:
  ${JSON.stringify(data, null, 2)}

  مهمتك:
  1. تحليل البيانات المسترجعة بدقة
  2. تقديم إجابة مباشرة وواضحة للسؤال الأصلي
  3. ذكر أي أرقام أو إحصائيات مهمة ظهرت في النتائج
  4. إذا كان السؤال عن "أعلى" أو "أكثر"، حدد بوضوح ما هي العناصر الأعلى
  5. إذا كان السؤال عن فئة محددة (مثل الخضروات أو الفواكه)، تأكد من أن إجابتك تتعلق بهذه الفئة تحديداً
  6. إذا كان السؤال متابعة لسؤال سابق عن عميل معين، تأكد من ذكر اسم العميل في الإجابة

  قم بإنشاء وصف موجز (2-4 جمل) لهذه البيانات باللغة العربية. اشرح ما تظهره البيانات وكيف تجيب على السؤال الأصلي بدقة.

  إذا كانت البيانات لا تجيب مباشرة على السؤال، أشر إلى ذلك بوضوح.
  `;

  try {
    const description = await geminiModel.call(prompt);
    return description.trim();
  } catch (error) {
    console.error('Error generating result description:', error);
    return 'تم استرجاع البيانات بنجاح.';
  }
}
