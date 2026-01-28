import { Search } from 'lucide-react';

export default function SearchPaitent({ searchQuery, setSearchQuery }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Enter patient's Full Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pr-4 pl-12 text-sm text-gray-800 placeholder-gray-400 focus:border-cyan-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>
        <button className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <Search size={20} />
        </button>
      </div>
    </div>
  );
}
