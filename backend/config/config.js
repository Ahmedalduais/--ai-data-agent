import dotenv from 'dotenv';

// تحميل متغيرات البيئة من ملف .env
dotenv.config();

/**
 * إعدادات التطبيق
 */
const config = {
  // إعدادات الخادم
  server: {
    port: process.env.PORT || 3003,
    nodeEnv: process.env.NODE_ENV || 'development',
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT) || 30
  },

  // إعدادات قاعدة البيانات
  database: {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'inventorymanagement',
    port: parseInt(process.env.MYSQL_PORT) || 3306
  },

  // إعدادات الذكاء الاصطناعي
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
  },

  // إعدادات الأمان
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  // إعدادات السجلات
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

/**
 * التحقق من وجود المتغيرات المطلوبة
 */
function validateConfig() {
  const requiredVars = [
    'GEMINI_API_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ متغيرات البيئة المطلوبة مفقودة:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 يرجى إنشاء ملف .env وإضافة المتغيرات المطلوبة');
    console.error('   يمكنك نسخ ملف .env.example كنقطة بداية');
    process.exit(1);
  }
}

/**
 * عرض معلومات الإعداد (بدون المعلومات الحساسة)
 */
function displayConfig() {
  if (config.server.nodeEnv === 'development') {
    console.log('🔧 إعدادات التطبيق:');
    console.log(`   📡 الخادم: http://localhost:${config.server.port}`);
    console.log(`   🗄️  قاعدة البيانات: ${config.database.host}:${config.database.port}/${config.database.database}`);
    console.log(`   🤖 نموذج الذكاء الاصطناعي: Google Gemini`);
    console.log(`   🌍 البيئة: ${config.server.nodeEnv}`);
    console.log(`   📝 مستوى السجلات: ${config.logging.level}`);
  }
}

export { config, validateConfig, displayConfig };
