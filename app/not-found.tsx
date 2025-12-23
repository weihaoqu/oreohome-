import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-black text-pink-500 mb-4">404</div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">页面未找到</h2>
        <p className="text-slate-600 mb-8">
          抱歉，您访问的页面不存在
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
