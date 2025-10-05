import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition">
            Compara-Lá
          </Link>

          <div className="flex space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition">
              Buscar
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/upload" className="text-gray-300 hover:text-white transition">
              Upload
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white transition">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
