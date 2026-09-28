import React, { useState, useEffect } from 'react';

// Функция проверки: ссылка это или простой текст
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

export default function App() {
  const [content, setContent] = useState('https://github.com');
  const [fgColor, setFgColor] = useState('#1e293b');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [format, setFormat] = useState('png');
  const [boxSize, setBoxSize] = useState(10);
  const [qrImage, setQrImage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUrl = isValidUrl(content);

  // Отправка запроса на бэкенд для генерации QR-кода
  const generateQR = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          fg_color: fgColor,
          bg_color: bgColor,
          format,
          box_size: Number(boxSize),
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setQrImage(json.data.image);
        loadHistory();
      }
    } catch (e) {
      console.error('Ошибка создания QR:', e);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка истории
  const loadHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/qr/history');
      const json = await res.json();
      if (json.status === 'success') {
        setHistory(json.data);
      }
    } catch (e) {
      console.error('Ошибка загрузки истории:', e);
    }
  };

  // Автоматическое обновление превью при изменении настроек (с легкой задержкой)
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 300);
    return () => clearTimeout(timer);
  }, [content, fgColor, bgColor, format, boxSize]);

  useEffect(() => {
    loadHistory();
  }, []);

  // Скачивание готового файла
  const handleDownload = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qrcode_${Date.now()}.${format}`;
    link.click();
  };

  // Копирование содержимого
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Шапка */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              QR Code Customizer
            </h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            FastAPI + React
          </span>
        </div>
      </header>

      {/* Основная сетка */}
      <main className="max-w-5xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {/* Левая колонка: Настройки */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-800">Настройки QR-кода</h2>

          {/* Ввод текста / ссылки */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Текст или URL
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Вставьте ссылку https://... или любой текст"
              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
            />
            <div className="mt-1 text-xs">
              {isUrl ? (
                <span className="text-emerald-600 font-medium">✓ Валидная ссылка (URL)</span>
              ) : (
                <span className="text-slate-400">Обычный текст</span>
              )}
            </div>
          </div>

          {/* Цвета */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Цвет кода
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border p-0.5"
                />
                <span className="text-xs font-mono text-slate-500">{fgColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Цвет фона
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border p-0.5"
                />
                <span className="text-xs font-mono text-slate-500">{bgColor}</span>
              </div>
            </div>
          </div>

          {/* Размер и формат */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Размер точек
              </label>
              <input
                type="range"
                min="6"
                max="20"
                value={boxSize}
                onChange={(e) => setBoxSize(e.target.value)}
                className="w-full cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Формат
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="png">PNG (Растровый)</option>
                <option value="svg">SVG (Векторный)</option>
              </select>
            </div>
          </div>

          {/* Быстрые пресеты */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Быстрые темы
            </label>
            <div className="flex gap-2">
              {[
                { name: 'Классика', fg: '#000000', bg: '#ffffff' },
                { name: 'Индиго', fg: '#4338ca', bg: '#eef2ff' },
                { name: 'Изумруд', fg: '#065f46', bg: '#ecfdf5' },
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setFgColor(theme.fg);
                    setBgColor(theme.bg);
                  }}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-slate-50 transition"
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка: Превью и Действия */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Превью QR-кода</h2>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center min-h-[260px] min-w-[260px] bg-slate-50/50">
              {loading ? (
                <span className="text-sm text-slate-400 animate-pulse">Генерация...</span>
              ) : qrImage ? (
                <img
                  src={qrImage}
                  alt="QR Code Preview"
                  className="max-h-64 object-contain rounded-lg shadow-sm"
                />
              ) : (
                <span className="text-sm text-slate-400">Введите текст для генерации</span>
              )}
            </div>

            {/* Кнопки скачивания и копирования */}
            <div className="flex gap-3 mt-6 w-full max-w-xs">
              <button
                onClick={handleDownload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm"
              >
                Скачать {format.toUpperCase()}
              </button>
              <button
                onClick={handleCopy}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-sm transition"
              >
                {copied ? 'Скопировано!' : 'Копировать'}
              </button>
            </div>
          </div>

          {/* Блок истории */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3">История генераций</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">История пока пуста</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setContent(item.content);
                      setFgColor(item.fg_color);
                      setBgColor(item.bg_color);
                      setFormat(item.format);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition text-xs"
                  >
                    <span className="font-medium text-slate-700 truncate max-w-[220px]">
                      {item.content}
                    </span>
                    <span className="text-slate-400">{item.created_at}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}