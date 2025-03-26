// controllers/websiteController.mjs

import axios from "axios";
import * as cheerio from "cheerio";

// Function to validate the URL format
function isValidUrl(url) {
  const regex = /^(http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

// Function to check spelling errors using LanguageTool API
async function checkSpelling(language, text) {
  const url = `https://api.languagetoolplus.com/v2/check`;
  // const data = {
  //   text: "Text is not proided, i am comletely usefull and this data is useul" ,
  //   language: language,
  // };
  const data = new URLSearchParams();
  data.append("text", text);
  data.append("language", language);
  try {
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

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
    // console.log(error);

    res.status(500).render("index", { error: "Something went wrong" });
  }
}
