import type maplibregl from "maplibre-gl";

function computeCentroid(ring: GeoJSON.Position[]): [number, number] {
  let x = 0, y = 0;
  for (const pos of ring) {
    const [lng, lat] = pos;
    x += lng;
    y += lat;
  }
  return [x / ring.length, y / ring.length];
}

/**
 * Get the centroid of a feature by its id from a given layer.
 * Looks up the layer's source, retrieves the feature from its GeoJSON,
 * and returns a simple centroid.
 */
export function getFeatureCentroid(
  map: maplibregl.Map,
  layerId: string,
  featureId: string
): [number, number] | null {
  const layer = map.getLayer(layerId);
  if (!layer) return null;

  const sourceId = (layer as any).source as string;
  const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
  if (!source) return null;

  // MapLibre doesn’t type-expose this, but it’s there
  const data = (source as any)._data as GeoJSON.FeatureCollection;
  if (!data) return null;

  const feature = data.features.find(f => f.id === featureId);
  if (!feature) return null;

  if (feature.geometry.type === "Polygon") {
    return computeCentroid(feature.geometry.coordinates[0] as [number, number][]);
  }

  if (feature.geometry.type === "MultiPolygon") {
    // feature.geometry.coordinates is GeoJSON.Position[][][]
    let biggest: GeoJSON.Position[] = [];
    let max = 0;

    for (const poly of feature.geometry.coordinates) {
      const ring = poly[0]; // outer ring
      if (ring.length > max) {
        max = ring.length;
        biggest = ring;
      }
    }

    if (biggest.length) {
      return computeCentroid(biggest as [number, number][]);
    }
  }

  return null;
}
