// متغير عالمي لتخزين سياق المحادثة
const conversationContext = {
  currentQuery: null,
  previousQueries: [],
  currentCustomer: null,
  currentItems: null
};

// جلب قائمة الموديلات من الخادم وتعبئة القائمة المنسدلة
window.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('model-select');
  try {
    const res = await fetch('http://localhost:3003/api/models');
    const models = await res.json();
    select.innerHTML = '';
    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = model;
      select.appendChild(opt);
    });

    // إضافة رسالة ترحيب واقتراحات عند بدء التطبيق
    showWelcomeMessage();
  } catch (e) {
    select.innerHTML = '<option>llama3</option>';
    showWelcomeMessage();
  }
});

// دالة لعرض رسالة ترحيب واقتراحات
function showWelcomeMessage() {
  const welcomeMessage = `
    <p>مرحبًا بك في وكيل البيانات الذكي! أنا هنا لمساعدتك في تحليل بيانات المخزون والمبيعات.</p>
    <p>يمكنك سؤالي عن أي شيء يتعلق ببيانات متجرك، مثل:</p>
    <ul class="list-disc list-inside mt-2 space-y-1">
      <li>ما هي أكثر المنتجات مبيعًا؟</li>
      <li>أظهر لي مبيعات الخضروات</li>
      <li>ما هي حركة المخزون للفواكه؟</li>
      <li>قارن بين مبيعات الفواكه والخضروات</li>
      <li>ما هي المنتجات التي تحتاج إلى إعادة تخزين؟</li>
    </ul>
    <p class="mt-2">ما الذي ترغب في معرفته اليوم؟</p>
  `;

  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200';
  welcomeDiv.innerHTML = welcomeMessage;

  const welcomeElement = appendMessage('الوكيل', '');
  welcomeElement.innerHTML = `<b>الوكيل:</b>`;
  welcomeElement.appendChild(welcomeDiv);
}

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  // إضافة رسالة المستخدم إلى المحادثة
  appendMessage('أنت', message);
  input.value = '';

  // تحديث سياق المحادثة
  conversationContext.previousQueries.push(conversationContext.currentQuery);
  conversationContext.currentQuery = message;
  console.log("Updated conversation context:", conversationContext);

  // إظهار مؤشر التحميل مع رسالة تفاعلية
  const loadingMessages = [
    'جاري تحليل سؤالك...',
    'أبحث في البيانات...',
    'أقوم بمعالجة طلبك، يرجى الانتظار قليلاً...',
    'جاري استخراج المعلومات المطلوبة...',
    'أعمل على إيجاد إجابة دقيقة لسؤالك...'
  ];
  const randomLoadingMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'flex items-center';
  loadingDiv.innerHTML = `
    <div class="mr-2">${randomLoadingMessage}</div>
    <div class="loading-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  `;

  // إضافة أنماط CSS للنقاط المتحركة
  if (!document.getElementById('loading-dots-style')) {
    const style = document.createElement('style');
    style.id = 'loading-dots-style';
    style.textContent = `
      .loading-dots {
        display: inline-flex;
      }
      .dot {
        width: 8px;
        height: 8px;
        margin: 0 4px;
        border-radius: 50%;
        background-color: #3b82f6;
        animation: dot-pulse 1.5s infinite ease-in-out;
      }
      .dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes dot-pulse {
        0%, 100% { transform: scale(0.8); opacity: 0.5; }
        50% { transform: scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  const loadingMessage = appendMessage('الوكيل', '');
  loadingMessage.querySelector('b').insertAdjacentElement('afterend', loadingDiv);

  // إخفاء عناصر النتائج السابقة
  document.getElementById('result-table').style.display = 'none';
  document.getElementById('result-chart-container').style.display = 'none';

  try {
    // إرسال الطلب إلى الخادم
    const model = document.getElementById('model-select').value;
    console.log(`Sending query: "${message}" using model: ${model}`);

    const res = await fetch('http://localhost:3003/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        model,
        context: {
          currentQuery: conversationContext.currentQuery,
          previousQueries: conversationContext.previousQueries.filter(Boolean),
          currentCustomer: conversationContext.currentCustomer,
          currentItems: conversationContext.currentItems
        },
        timestamp: new Date().getTime() // إضافة طابع زمني لمنع التخزين المؤقت
      })
    });

    if (!res.ok) {
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Response data:", data);

    // تحديث سياق المحادثة إذا كانت هناك معلومات سياق في الاستجابة
    if (data.context) {
      if (data.context.currentCustomer) {
        conversationContext.currentCustomer = data.context.currentCustomer;
        console.log("Updated current customer:", conversationContext.currentCustomer);
      }
      if (data.context.currentItems) {
        conversationContext.currentItems = data.context.currentItems;
        console.log("Updated current items:", conversationContext.currentItems);
      }
    }

    // تحديث رسالة الوكيل
    loadingMessage.innerHTML = `<b>الوكيل:</b> ${data.message || ''}`;

    // عرض الجدول إذا توفرت بيانات جدول
    if (data.table && data.table.columns && data.table.data && data.table.data.length > 0) {
      console.log("Rendering table with columns:", data.table.columns);
      renderTable(data.table.columns, data.table.data);
      document.getElementById('result-table').style.display = 'block';
    }

    // عرض الرسم البياني إذا توفرت بيانات رسم
    if (data.chart && data.chart.columns && data.chart.data && data.chart.data.length > 0) {
      console.log("Rendering chart with type:", data.chart.chartType);
      renderChart(data.chart.chartType, data.chart.columns, data.chart.data);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    loadingMessage.innerHTML = `<b>الوكيل:</b> <span class="text-red-500">حدث خطأ أثناء معالجة الطلب: ${error.message}</span>`;
  }
});

function appendMessage(sender, text) {
  const box = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'mb-2 p-2 rounded';

  // تطبيق أنماط مختلفة حسب المرسل
  if (sender === 'أنت') {
    div.className += ' bg-blue-50';
  } else {
    div.className += ' bg-gray-50';
  }

  div.innerHTML = `<b>${sender}:</b> ${text}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;

  // إرجاع العنصر المضاف للتمكن من تحديثه لاحقاً
  return div;
}
