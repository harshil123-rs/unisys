const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function searchLocation(query: string) {
    if (!API_KEY) {
        console.warn("Google Maps API Key is missing");
        return null;
    }

    try {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${API_KEY}`);
        const data = await res.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formatted_address: data.results[0].formatted_address
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

export async function getRoute(origin: [number, number], dest: [number, number]) {
    if (!API_KEY) return null;

    try {
        const originStr = `${origin[0]},${origin[1]}`;
        const destStr = `${dest[0]},${dest[1]}`;
        const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${API_KEY}`);
        const data = await res.json();

        if (data.status === 'OK' && data.routes.length > 0) {
            // Decode polyline
            const points = decodePolyline(data.routes[0].overview_polyline.points);
            return points;
        }
        return null;
    } catch (error) {
        console.error("Directions error:", error);
        return null;
    }
}

// Helper to decode Google's polyline format
function decodePolyline(encoded: string) {
    const points: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }
    return points;
}
