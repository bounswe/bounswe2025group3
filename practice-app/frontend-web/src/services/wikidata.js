export async function fetchWikidataDescriptionRecycling(itemId = "Q132580", language = "en") {
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${itemId}.json`);

    if (!res.ok) throw new Error("Failed to fetch entity data");

    const data = await res.json();
    const description = data.entities[itemId].descriptions?.[language]?.value;

    return description || "No description found.";
  } catch (err) {
    console.error(err);
    return "Failed to load description.";
  }
}