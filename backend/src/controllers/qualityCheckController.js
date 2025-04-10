// controllers/websiteController.mjs

import axios from "axios";
import * as cheerio from "cheerio";

// Function to validate the URL format
function isValidUrl(url) {
  const regex = /^(http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

// Function to check spelling errors using LanguageTool API
async function checkSpelling(lang, text) {
  if (!text || typeof text !== "string" || text.trim() === "") {
    console.log("No text provided");
    return [];
  }

  const cleanText = text.trim().replace(/\s+/g, " ");

  // URL encode the text to handle special characters properly
  const encodedText = encodeURIComponent(cleanText);

  const language = lang || "auto";

  const url = `https://api.languagetool.org/v2/check?text=${encodedText}&language=auto`;

  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response.data.matches);

    if (response.data.matches && response.data.matches.length > 0) {
      return response.data.matches;
    } else {
      console.log("No spelling errors found.");
      return [];
    }
  } catch (error) {
    console.error("Error calling LanguageTool API:", error.message);
    return [];
  }
}

function checkAltTags($) {
  const missingAlt = [];
  $("img").each((index, element) => {
    const alt = $(element).attr("alt");
    if (!alt) {
      missingAlt.push($(element).attr("src"));
    }
  });
  return missingAlt;
}

function checkMetaTags($) {
  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content") || "";

  const titleStatus =
    title.length >= 50 && title.length <= 60
      ? "✅ Valid"
      : title.length < 50
      ? "❌ Too Short"
      : "❌ Too Long";
  const descriptionStatus =
    description.length >= 150 && description.length <= 160
      ? "✅ Valid"
      : description.length < 150
      ? "❌ Too Short"
      : "❌ Too Long";

  return {
    title: { content: title, status: titleStatus },
    description: { content: description, status: descriptionStatus },
  };
}

export async function qualityCheckController(req, res) {
  const { url, language } = req.body;

  if (!url || !isValidUrl(url)) {
    return res
      .status(400)
      .json({ error: "Invalid URL. Please enter a valid website URL." });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const spellingErrors = await checkSpelling(language, $("body").text());

    const altErrors = checkAltTags($);

    const metaTags = checkMetaTags($);

    const resultData = {
      url,
      spellingErrors,
      altErrors,
      metaTags,
    };

    // res.json(resultData);
    res.render("index", { results: resultData });
  } catch (error) {
    // console.error("Error fetching or processing the website:", error.message);
    // res.status(500).json({
    //   error: "Error occurred while fetching or processing the website.",
    // });
    console.log(error);

    res.status(500).render("index", { error: "Something went wrong" });
  }
}
