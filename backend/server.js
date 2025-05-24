import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import queryRoute from './routes/query.route.js';
import analyzeRoute from './routes/analyze.route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAvailableModels } from './agent/ollama-model.js';
import { config, validateConfig, displayConfig } from './config/config.js';

// التحقق من متغيرات البيئة المطلوبة
validateConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// إعداد CORS
app.use(cors({
  origin: config.security.corsOrigin,
  credentials: true
}));

// إعداد معالج JSON مع حد أقصى لحجم الطلبات
app.use(bodyParser.json({ limit: config.server.maxRequestSize }));
app.use(bodyParser.urlencoded({ extended: true, limit: config.server.maxRequestSize }));

app.use('/api/query', queryRoute);
app.use('/api/analyze', analyzeRoute);

// تقديم ملفات الواجهة الأمامية من مجلد frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (_, res) => {
  res.send('AI Data Agent backend is running.');
});

// يجب أن يكون هذا قبل app.use(express.static(...))
app.get('/api/models', (_, res) => {
  const models = getAvailableModels();
  res.json(models);
});

// بدء تشغيل الخادم
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log('🚀 وكيل البيانات الذكي - AI Data Agent');
  console.log('=====================================');
  displayConfig();
  console.log('=====================================');
  console.log(`✅ الخادم يعمل على المنفذ ${PORT}`);
  console.log(`🌐 الرابط: http://localhost:${PORT}`);
  console.log('=====================================');
});