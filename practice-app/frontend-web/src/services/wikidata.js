// src/services/wikidata.js


const BASE_URL = "https://www.wikidata.org/w/rest.php/wikibase/v1";

export async function fetchWikidataDescriptionRecycling(itemId = "Q132580", language = "en") {
  try {
    const res = await fetch(`${BASE_URL}/entities/items/${itemId}/descriptions/${language}`);

    if (!res.ok) throw new Error("Failed to fetch description");

    const data = await res.json();
    return data.value || "No description found.";
  } catch (err) {
    console.error(err);
    return "Failed to load description.";
  }
}
