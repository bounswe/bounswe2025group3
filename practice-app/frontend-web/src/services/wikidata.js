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

export const fetchWikidataDescriptionSustainableDevelopment = async () => {
  try {
    const response = await fetch(
      'https://www.wikidata.org/wiki/Special:EntityData/Q131201.json'
    );
    const data = await response.json();

    const entity = data.entities?.Q131201;
    const description = entity?.descriptions?.en?.value;

    const fallback =
      "Sustainable development is development that meets the needs of the present without compromising the ability of future generations to meet their own needs.";

    return description && description.length > 10 ? description : fallback;
  } catch (error) {
    console.error("Error fetching sustainable development description:", error);
    return "Failed to load sustainable development description.";
  }
};

export async function fetchWikidataDescriptionCircularEconomy(itemId = "Q1062957", language = "en") {
  try {
    const res = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${itemId}.json`);
    
    if (!res.ok) throw new Error("Failed to fetch entity data");
    
    const data = await res.json();
    const description = data.entities[itemId].descriptions?.[language]?.value;
    
    const fallback = 
      "A circular economy is an economic system aimed at eliminating waste and the continual use of resources through reusing, sharing, repairing, refurbishing, remanufacturing and recycling.";
    
    return description && description.length > 10 ? description : fallback;
  } catch (err) {
    console.error(err);
    return "Failed to load circular economy description.";
  }
  
}
export async function fetchWikidataDescriptionWasteManagement(itemId = "Q180388", language = "en") {
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
