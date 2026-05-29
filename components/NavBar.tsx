'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart2, AlertCircle, Bookmark, Home, Zap } from 'lucide-react';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chapters', label: 'Chapters', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/mistakes', label: 'Mistakes', icon: AlertCircle },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/cat-sim', label: 'CAT Sim', icon: Zap },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-1 h-14 overflow-x-auto">
        <span className="text-indigo-400 font-bold text-lg mr-4 whitespace-nowrap">🎯 CAT Quant</span>
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
              ${path === href || (href !== '/' && path.startsWith(href))
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
