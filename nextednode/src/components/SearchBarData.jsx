import React, { useState } from "react";
import axios from "axios";

function SearchBarData() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;    
    console.log(encodeURIComponent(query));
    
    try {
      const res = await axios.get(
        `http://localhost:8000/search?q=${encodeURIComponent(query)}`
      );
      setResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <form onSubmit={search} className="flex items-center space-x-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {results.map((hit, i) => (
          <li
            key={i}
            className="p-3 border border-gray-200 rounded-md shadow-sm bg-white hover:bg-gray-50"
          >
            {hit._source?.title || "No Title"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBarData;
