export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ Vercel обновился!</h1>
        <p className="text-xl mb-2">Timestamp: {new Date().toISOString()}</p>
        <p className="text-gray-600">Если вы видите эту страницу - деплой прошел успешно</p>
        <div className="mt-8 p-4 bg-blue-100 dark:bg-blue-900 rounded">
          <p className="font-bold">Версия: Jan 24, 2026 - 04:40 UTC</p>
        </div>
      </div>
    </div>
  );
}
