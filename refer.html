exports.handler = async function (event) {
  const { type, lat, lng, city } = event.queryStringParameters || {};
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key not configured on server." }) };
  }

  try {
    // Step 1: Geocode if city provided
    let latitude = lat;
    let longitude = lng;

    if (city && (!lat || !lng)) {
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || !geoData.results.length) {
        return { statusCode: 400, body: JSON.stringify({ error: "Location not found. Try a different city or zip." }) };
      }
      latitude = geoData.results[0].geometry.location.lat;
      longitude = geoData.results[0].geometry.location.lng;
    }

    // Step 2: Nearby search
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=8000&type=establishment&keyword=${encodeURIComponent(type || "business")}&key=${apiKey}`
    );
    const placesData = await placesRes.json();

    if (placesData.status === "REQUEST_DENIED") {
      return { statusCode: 403, body: JSON.stringify({ error: "API key denied. Check your Google Cloud console." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: placesData.results || [], location: { lat: latitude, lng: longitude } }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
