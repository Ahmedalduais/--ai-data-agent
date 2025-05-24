let chartInstance = null;
function renderChart(type, columns, data) {
  console.log("Rendering chart with type:", type);
  console.log("Chart columns:", columns);
  console.log("Chart data:", data);

  const container = document.getElementById('result-chart-container');
  const canvas = document.getElementById('result-chart');
  const ctx = canvas.getContext('2d');

  // إضافة عنصر لعرض تحليل البيانات
  const analysisElement = document.getElementById('data-analysis') || createAnalysisElement();

  if (chartInstance) {
    console.log("Destroying previous chart instance");
    chartInstance.destroy();
  }

  if (!columns || columns.length < 2 || !data || !data.length) {
    console.log("Invalid chart data, hiding chart");
    container.style.display = 'none';
    analysisElement.style.display = 'none';
    return;
  }

  // إظهار حاوية الرسم البياني
  container.style.display = 'block';

  // تحديد الأعمدة المناسبة للرسم البياني
  let xColumn = columns[0];
  let yColumn = columns[1];

  // البحث عن عمود رقمي للمحور Y إذا لم يكن العمود الحالي رقمياً
  const isNumericColumn = (col) => {
    return data.some(row => {
      const val = row[col];
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)));
    });
  };

  // إذا لم يكن العمود الثاني رقمياً، نبحث عن عمود رقمي آخر
  if (!isNumericColumn(yColumn)) {
    console.log("Second column is not numeric, searching for a numeric column");
    for (const col of columns) {
      if (col !== xColumn && isNumericColumn(col)) {
        yColumn = col;
        console.log("Found numeric column:", yColumn);
        break;
      }
    }
  }

  console.log("Using X column:", xColumn, "Y column:", yColumn);

  // تحديد البيانات للرسم البياني
  const labels = data.map(row => row[xColumn]);

  // تحويل القيم إلى أرقام إذا كانت نصية
  const values = data.map(row => {
    const val = row[yColumn];
    // محاولة تحويل القيمة إلى رقم إذا كانت نصية
    if (typeof val === 'string' && !isNaN(parseFloat(val))) {
      return parseFloat(val);
    }
    return val;
  });

  // تكوين الرسم البياني
  console.log("Preparing chart configuration");

  // التأكد من أن نوع الرسم البياني مدعوم
  if (!['bar', 'line', 'pie', 'doughnut', 'scatter'].includes(type)) {
    console.log("Unsupported chart type, defaulting to bar chart");
    type = 'bar';
  }

  // التأكد من أن البيانات صالحة للرسم البياني
  const validValues = values.filter(val => val !== null && val !== undefined && !isNaN(val));
  if (validValues.length === 0) {
    console.log("No valid numeric values for chart, using default values");
    // استخدام قيم افتراضية إذا لم تكن هناك قيم صالحة
    for (let i = 0; i < labels.length; i++) {
      values[i] = i + 1;
    }
  }

  console.log("Chart labels:", labels);
  console.log("Chart values:", values);

  const chartConfig = {
    type: type,
    data: {
      labels,
      datasets: [{
        label: yColumn,
        data: values,
        backgroundColor: getColors(data.length, type),
        borderColor: type === 'line' ? 'rgba(59,130,246,1)' : getColors(data.length, type),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: {
        duration: 1000 // تحريك لمدة ثانية واحدة
      },
      plugins: {
        title: {
          display: true,
          text: `${yColumn} حسب ${xColumn}`,
          font: {
            size: 16
          }
        },
        legend: {
          display: type === 'pie' || type === 'doughnut',
          position: 'bottom'
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y;
              }
              return label;
            }
          }
        }
      }
    }
  };

  // إضافة إعدادات المحاور حسب نوع الرسم البياني
  if (type !== 'pie' && type !== 'doughnut') {
    chartConfig.options.scales = {
      x: {
        display: true,
        title: {
          display: true,
          text: xColumn
        },
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: yColumn
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    };
  }

  // إضافة إعدادات خاصة حسب نوع الرسم البياني
  if (type === 'bar') {
    // تحسين عرض الأعمدة في الرسم الشريطي
    chartConfig.options.indexAxis = 'x';
    chartConfig.options.barPercentage = 0.8;
    chartConfig.options.categoryPercentage = 0.8;
  } else if (type === 'line') {
    // تحسينات للرسم الخطي
    chartConfig.data.datasets[0].tension = 0.3; // جعل الخط أكثر انسيابية
    chartConfig.data.datasets[0].fill = false;
    chartConfig.data.datasets[0].pointRadius = 4;
  } else if (type === 'pie' || type === 'doughnut') {
    // إعدادات خاصة للرسوم الدائرية
    chartConfig.options.cutout = type === 'doughnut' ? '50%' : 0;
  }

  // إنشاء الرسم البياني
  chartInstance = new Chart(ctx, chartConfig);

  // إنشاء تحليل للبيانات
  // سنستخدم تحليل البيانات المحلي مؤقتًا ثم نستبدله بتحليل النموذج اللغوي
  const localAnalysis = analyzeData(type, columns, data);
  analysisElement.innerHTML = localAnalysis;
  analysisElement.style.display = 'block';

  // طلب تحليل إضافي من النموذج اللغوي
  requestModelAnalysis(data, columns, type, xColumn, yColumn)
    .then(modelAnalysis => {
      if (modelAnalysis) {
        // إضافة تحليل النموذج اللغوي إلى عنصر التحليل
        const modelInsightElement = document.createElement('div');
        modelInsightElement.className = 'mt-4 p-3 bg-yellow-50 rounded border border-yellow-200';
        modelInsightElement.innerHTML = `
          <h4 class="text-lg font-bold mb-2">تحليل النموذج الذكي:</h4>
          <div class="text-right">${modelAnalysis}</div>
        `;
        analysisElement.appendChild(modelInsightElement);
      }
    })
    .catch(error => console.error("Error getting model analysis:", error));
}

// دالة لطلب تحليل من النموذج اللغوي
async function requestModelAnalysis(data, columns, chartType, xColumn, yColumn) {
  try {
    // إرسال طلب إلى الخادم للحصول على تحليل من النموذج اللغوي
    const response = await fetch('http://localhost:3003/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data,
        columns,
        chartType,
        xColumn,
        yColumn,
        timestamp: new Date().getTime()
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return result.analysis;
  } catch (error) {
    console.error("Error requesting model analysis:", error);
    // في حالة الخطأ، نعيد تحليلًا افتراضيًا
    return null;
  }
}

// دالة لإنشاء عنصر تحليل البيانات
function createAnalysisElement() {
  const container = document.getElementById('result-container');
  const analysisElement = document.createElement('div');
  analysisElement.id = 'data-analysis';
  analysisElement.className = 'mt-4 p-4 bg-gray-50 rounded-lg text-right border';
  container.appendChild(analysisElement);
  return analysisElement;
}

// دالة لإنشاء ألوان متعددة للرسم البياني
function getColors(count, type) {
  // ألوان أساسية للرسوم البيانية
  const baseColors = [
    'rgba(59,130,246,0.7)',   // أزرق
    'rgba(16,185,129,0.7)',   // أخضر
    'rgba(239,68,68,0.7)',    // أحمر
    'rgba(245,158,11,0.7)',   // برتقالي
    'rgba(139,92,246,0.7)',   // بنفسجي
    'rgba(236,72,153,0.7)',   // وردي
    'rgba(20,184,166,0.7)',   // فيروزي
    'rgba(249,115,22,0.7)',   // برتقالي داكن
    'rgba(168,85,247,0.7)',   // أرجواني
    'rgba(251,191,36,0.7)'    // أصفر
  ];

  if (type === 'line' || type === 'scatter') {
    return 'rgba(59,130,246,0.7)';
  }

  // إذا كان عدد العناصر أكبر من عدد الألوان المتاحة، نكرر الألوان
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
}

// دالة لتحليل البيانات
function analyzeData(type, columns, data) {
  if (!data || data.length === 0) return '';

  const xColumn = columns[0];
  const yColumn = columns[1];

  // استخراج القيم الرقمية
  const numericValues = data.map(row => {
    const val = row[yColumn];
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !isNaN(parseFloat(val))) return parseFloat(val);
    return null;
  }).filter(val => val !== null);

  if (numericValues.length === 0) return '';

  // حساب الإحصاءات الأساسية
  const sum = numericValues.reduce((a, b) => a + b, 0);
  const avg = sum / numericValues.length;
  const max = Math.max(...numericValues);
  const min = Math.min(...numericValues);

  // حساب الانحراف المعياري
  const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericValues.length;
  const stdDev = Math.sqrt(variance);

  // البحث عن القيمة الأعلى والأدنى
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

  // حساب الوسيط
  const sortedValues = [...numericValues].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];

  let analysis = '<h3 class="text-lg font-bold mb-3">تحليل البيانات:</h3>';

  // إضافة ملخص سريع
  if (type === 'bar' || type === 'line') {
    analysis += `<p class="mb-3">يوضح الرسم البياني توزيع <strong>${yColumn}</strong> حسب <strong>${xColumn}</strong> لعدد <strong>${data.length}</strong> من العناصر.</p>`;
  }

  analysis += '<div class="grid grid-cols-2 gap-4 mb-3">';

  // العمود الأول من الإحصاءات
  analysis += '<div><ul class="list-disc list-inside space-y-2">';
  analysis += `<li>عدد العناصر: <strong>${data.length}</strong></li>`;

  if (numericValues.length > 0) {
    analysis += `<li>المجموع الكلي: <strong>${sum.toLocaleString()}</strong></li>`;
    analysis += `<li>المتوسط: <strong>${avg.toLocaleString(undefined, {maximumFractionDigits: 2})}</strong></li>`;
    analysis += `<li>الوسيط: <strong>${median.toLocaleString(undefined, {maximumFractionDigits: 2})}</strong></li>`;
  }
  analysis += '</ul></div>';

  // العمود الثاني من الإحصاءات
  analysis += '<div><ul class="list-disc list-inside space-y-2">';
  if (numericValues.length > 0) {
    analysis += `<li>القيمة الأعلى: <strong>${max.toLocaleString()}</strong> (${maxItem[xColumn]})</li>`;
    analysis += `<li>القيمة الأدنى: <strong>${min.toLocaleString()}</strong> (${minItem[xColumn]})</li>`;
    analysis += `<li>الانحراف المعياري: <strong>${stdDev.toLocaleString(undefined, {maximumFractionDigits: 2})}</strong></li>`;
  }
  analysis += '</ul></div>';
  analysis += '</div>';

  // إضافة استنتاجات إضافية
  if (numericValues.length > 0) {
    analysis += '<div class="mt-2 p-3 bg-blue-50 rounded border border-blue-100">';
    analysis += '<h4 class="font-bold mb-1">استنتاجات:</h4>';

    // تحليل التوزيع
    const range = max - min;
    const variationCoefficient = stdDev / avg;

    if (variationCoefficient > 0.5) {
      analysis += `<p>• البيانات تظهر تشتتاً كبيراً (معامل التباين: ${variationCoefficient.toFixed(2)})، مما يشير إلى وجود تباين ملحوظ في القيم.</p>`;
      analysis += `<p>• المدى الكلي للبيانات هو ${range.toLocaleString()} (الفرق بين أعلى وأدنى قيمة).</p>`;
    } else {
      analysis += `<p>• البيانات متقاربة نسبياً حول المتوسط (معامل التباين: ${variationCoefficient.toFixed(2)}).</p>`;
      analysis += `<p>• المدى الكلي للبيانات هو ${range.toLocaleString()}.</p>`;
    }

    // تحليل القيم المتطرفة
    if (max > avg * 2) {
      analysis += `<p>• توجد قيم مرتفعة بشكل ملحوظ، حيث أن القيمة الأعلى (${max.toLocaleString()}) أكبر من ضعف المتوسط.</p>`;
    }

    analysis += '</div>';
  }

  return analysis;
}
