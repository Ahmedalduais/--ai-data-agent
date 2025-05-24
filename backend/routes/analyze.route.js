import express from 'express';
const router = express.Router();
import { getGeminiModel } from '../agent/gemini-model.js';

router.post('/', async (req, res) => {
  const { data, columns, chartType, xColumn, yColumn } = req.body;
  console.log(`Received analysis request for chart type: ${chartType}`);

  try {
    // استخدام Gemini لتحليل البيانات
    const analysis = await analyzeDataWithModel(data, columns, chartType, xColumn, yColumn);
    
    res.json({
      analysis
    });
  } catch (err) {
    console.error("Error analyzing data:", err);
    res.status(500).json({
      message: 'حدث خطأ أثناء تحليل البيانات',
      error: err.message
    });
  }
});

/**
 * دالة لتحليل البيانات باستخدام نموذج Gemini
 */
async function analyzeDataWithModel(data, columns, chartType, xColumn, yColumn) {
  const geminiModel = getGeminiModel();
  
  // استخراج بعض الإحصاءات الأساسية للمساعدة في التحليل
  const stats = calculateBasicStats(data, yColumn);
  
  const prompt = `
  أنت محلل بيانات خبير ومتخصص في تقديم رؤى وتحليلات مفيدة باللغة العربية.
  
  فيما يلي بيانات تم عرضها في رسم بياني من نوع "${chartType}":
  
  البيانات: ${JSON.stringify(data.slice(0, 10))}${data.length > 10 ? ' (وهناك المزيد من البيانات)' : ''}
  
  المحور الأفقي (X): ${xColumn}
  المحور الرأسي (Y): ${yColumn}
  
  إحصاءات أساسية:
  - عدد العناصر: ${stats.count}
  - المتوسط: ${stats.average}
  - القيمة الأعلى: ${stats.max} (${stats.maxItem ? stats.maxItem[xColumn] : 'غير متوفر'})
  - القيمة الأدنى: ${stats.min} (${stats.minItem ? stats.minItem[xColumn] : 'غير متوفر'})
  
  مهمتك:
  1. تقديم تحليل موجز (3-5 جمل) للبيانات المعروضة
  2. ذكر أي اتجاهات أو أنماط ملحوظة في البيانات
  3. تقديم نصيحة أو توصية واحدة على الأقل بناءً على هذه البيانات
  4. اقتراح سؤال متابعة يمكن للمستخدم طرحه للحصول على مزيد من الرؤى
  
  قدم إجابتك بتنسيق HTML بسيط (استخدم وسوم <p> للفقرات و<ul>/<li> للقوائم و<strong> للتأكيد).
  `;

  try {
    const analysis = await geminiModel.call(prompt);
    return analysis.trim();
  } catch (error) {
    console.error('Error generating analysis with Gemini:', error);
    return '<p>لم نتمكن من تحليل البيانات في هذه المرة. يرجى المحاولة مرة أخرى لاحقًا.</p>';
  }
}

/**
 * دالة لحساب إحصاءات أساسية من البيانات
 */
function calculateBasicStats(data, yColumn) {
  if (!data || data.length === 0) {
    return {
      count: 0,
      average: 0,
      max: 0,
      min: 0,
      maxItem: null,
      minItem: null
    };
  }

  // استخراج القيم الرقمية
  const numericValues = data.map(row => {
    const val = row[yColumn];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !isNaN(parseFloat(val))) return parseFloat(val);
    return null;
  }).filter(val => val !== null);

  if (numericValues.length === 0) {
    return {
      count: data.length,
      average: 0,
      max: 0,
      min: 0,
      maxItem: null,
      minItem: null
    };
  }

  // حساب الإحصاءات
  const sum = numericValues.reduce((a, b) => a + b, 0);
  const average = sum / numericValues.length;
  const max = Math.max(...numericValues);
  const min = Math.min(...numericValues);

  // البحث عن العناصر ذات القيم القصوى
  const maxItem = data.find(row => {
    const val = row[yColumn];
    return (typeof val === 'number' && val === max) || 
           (typeof val === 'string' && parseFloat(val) === max);
  });
  
  const minItem = data.find(row => {
    const val = row[yColumn];
    return (typeof val === 'number' && val === min) || 
           (typeof val === 'string' && parseFloat(val) === min);
  });

  return {
    count: data.length,
    average: average.toFixed(2),
    max,
    min,
    maxItem,
    minItem
  };
}

export default router;
