import { Hono } from "hono";

export const geoRoute = new Hono();

/**
 * GET /api/geo/reverse?lat=...&lon=...
 * Reverse geocoding proxy using OpenStreetMap (Nominatim)
 */
geoRoute.get("/reverse", async (c) => {
  const latStr = c.req.query("lat") || c.req.query("latitude");
  const lonStr = c.req.query("lon") || c.req.query("lng") || c.req.query("longitude");

  if (!latStr || !lonStr) {
    return c.json(
      {
        success: false,
        error: "Parámetros 'lat' y 'lon' son requeridos.",
      },
      400
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lon) || lon < -180 || lon > 180) {
    return c.json(
      {
        success: false,
        error: "Coordenadas latitud o longitud fuera de rango válido (-90..90, -180..180).",
      },
      400
    );
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BanderaAsistencia/1.0 (asistencia@bandera.pe)",
        "Accept": "application/json",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return c.json(
        {
          success: false,
          error: `Error al consultar servicio de OpenStreetMap: ${response.statusText}`,
        },
        502
      );
    }

    const data = (await response.json()) as any;
    const address = data.address || {};

    // Construct a friendly, concise, human-readable place name
    const parts: string[] = [];

    // 1. Specific landmark, venue, building or amenity
    const venueName =
      data.name ||
      address.amenity ||
      address.building ||
      address.office ||
      address.shop ||
      address.leisure ||
      address.tourism ||
      address.historic;

    if (venueName && typeof venueName === "string") {
      parts.push(venueName);
    }

    // 2. Road or street with optional number
    if (address.road && typeof address.road === "string") {
      const roadPart = address.house_number ? `${address.road} ${address.house_number}` : address.road;
      if (!parts.some((p) => p.toLowerCase().includes(roadPart.toLowerCase()))) {
        parts.push(roadPart);
      }
    } else if (address.pedestrian && typeof address.pedestrian === "string") {
      if (!parts.some((p) => p.toLowerCase().includes(address.pedestrian.toLowerCase()))) {
        parts.push(address.pedestrian);
      }
    }

    // 3. Suburb, neighbourhood or district
    const district = address.suburb || address.neighbourhood || address.city_district || address.district;
    if (district && typeof district === "string" && !parts.includes(district)) {
      parts.push(district);
    }

    // 4. City or town
    const city = address.city || address.town || address.municipality || address.village;
    if (city && typeof city === "string" && !parts.includes(city)) {
      parts.push(city);
    }

    const formattedName = parts.length > 0 ? parts.join(", ") : (data.display_name || "Ubicación seleccionada");

    return c.json({
      success: true,
      name: formattedName,
      display_name: data.display_name || formattedName,
      lat,
      lon,
      address,
    });
  } catch (err: any) {
    console.error("Error al consultar OpenStreetMap Nominatim:", err);
    return c.json(
      {
        success: false,
        error: "No se pudo obtener el nombre de la ubicación en este momento.",
        details: err?.message || String(err),
      },
      500
    );
  }
});
