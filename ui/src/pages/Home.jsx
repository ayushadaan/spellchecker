import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [results, setResults] = useState(null); // State to store the results

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/check-url", {
        url,
        language,
      });
      setResults(response.data);
      console.log(response);
      
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">
        Website Quality Checker Tool
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Website URL:</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Language for Spell Check:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white rounded"
        >
          Submit
        </button>
      </form>

      {results && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Results:</h2>

          {/* Spelling Errors */}
          {results.spellingErrors && results.spellingErrors.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Spelling Errors:</h3>
              <ul>
                {results.spellingErrors.map((error, index) => (
                  <li key={index} className="text-red-500">
                    <strong>{error.message}</strong>
                    <br />
                    <span className="text-sm text-gray-500">
                      Context: "{error.context.text}"
                    </span>
                    <br />
                    <span className="text-sm">
                      Suggestions:{" "}
                      {error.replacements.map((r) => r.value).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-green-500">
              <p>No spelling errors found. Your text looks great!</p>
            </div>
          )}

          {/* Missing ALT Tags */}
          {results.altErrors && results.altErrors.length > 0 && (
            <div className="space-y-4 mt-4">
              <h3 className="font-medium">Missing ALT Tags:</h3>
              <ul>
                {results.altErrors.map((src, index) => (
                  <li key={index} className="text-yellow-500">
                    Missing ALT for image: {src}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta Tags */}
          {results.metaTags && (
            <div className="space-y-4 mt-4">
              <h3 className="font-medium">Meta Tags:</h3>
              <p
                className={`text-${
                  results.metaTags.title.status.includes("Valid")
                    ? "green"
                    : "red"
                }-500`}
              >
                Title: {results.metaTags.title.content} (Status:{" "}
                {results.metaTags.title.status})
              </p>
              <p
                className={`text-${
                  results.metaTags.description.status.includes("Valid")
                    ? "green"
                    : "red"
                }-500`}
              >
                Description:{" "}
                {results.metaTags.description.content || "No description"}{" "}
                (Status: {results.metaTags.description.status})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
