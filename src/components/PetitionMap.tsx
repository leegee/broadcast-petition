import styles from "./PetitionMap.module.scss";
import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import maplibregl from "maplibre-gl";
import { fetchPetitionData, countsStore } from "../petitionStore";
import { highlightedFeatureId } from "./highlight.store";
import { getFeatureCentroid } from "../lib/getFeatureCentroid";

const POLL_INTERVAL_MS = 60_000;
const MAP_CENTRE: maplibregl.LngLatLike = [-5.2, 55.3];
const BASE_COLOR = "rgba(0,0,0,0)";
const MIN_COLOR = "#644";
const MID_COLOR = "#ccd";
const MAX_COLOR = "#11f";
const CLRS = [MIN_COLOR, MID_COLOR, MAX_COLOR];
let baseZoomLevel = 5;

const UK_BOUNDS: [number, number, number, number] = [
  -8.649357, 49.863461,
  1.768960, 60.860761
];

export default function PetitionMap() {
  let map: maplibregl.Map;
  let popup: maplibregl.Popup | null = null;
  let intervalId: number;
  let geoData: any;

  const [legendSteps, setLegendSteps] = createSignal<{ value: number; color: string }[]>([]);

  function getSignatureRange() {
    const values = Object.values(countsStore).map(c => c.count);
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  function updateLegend(min: number, max: number) {
    const steps = [0, min, Math.round((min + max) / 2), max].map((value, i) => ({
      value,
      color: [BASE_COLOR, MIN_COLOR, MID_COLOR, MAX_COLOR][i],
    }));
    setLegendSteps(steps);
  }

  async function updateMapData() {
    await fetchPetitionData();

    geoData.features.forEach((f: any) => {
      const code = f.properties.PCON24CD.toUpperCase();
      f.properties.signatures = countsStore[code]?.count || 0;
    });

    const { min, max } = getSignatureRange();

    const source = map.getSource("constituencies") as maplibregl.GeoJSONSource;
    if (source) source.setData(geoData);

    const layer = map.getLayer("constituency-fills");
    if (layer) {
      map.setPaintProperty(layer.id, "fill-color", [
        "interpolate",
        ["linear"],
        ["get", "signatures"],
        0, BASE_COLOR,
        min, CLRS[0],
        (min + max) / 2, CLRS[1],
        max, CLRS[2],
      ]);
    }

    updateLegend(min, max);
  }

  onMount(async () => {
    geoData = await fetch(
      "Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BGC_-8097874740651686118.geojson"
    ).then(r => r.json());

    await fetchPetitionData();

    geoData.features.forEach((f: any) => {
      const code = f.properties.PCON24CD.toUpperCase();
      f.properties.signatures = countsStore[code]?.count || 0;
      f.properties.id = code;
      f.id = code;
    });

    const { min, max } = getSignatureRange();

    map = new maplibregl.Map({
      container: "map",
      style: { version: 8, sources: {}, layers: [], glyphs: "fonts/{fontstack}/{range}.pbf" },
      center: MAP_CENTRE,
      zoom: baseZoomLevel,
      attributionControl: false,
    });

    map.on("load", () => {
      map.addSource("constituencies", { type: "geojson", data: geoData });

      // Fill layer
      map.addLayer({
        id: "constituency-fills",
        type: "fill",
        source: "constituencies",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "signatures"],
            min, CLRS[0],
            (min + max) / 2, CLRS[1],
            max, CLRS[2],
          ],
          "fill-opacity": 0.9,
        },
      });

      // Highlight border
      map.addLayer({
        id: "highlight-border",
        type: "line",
        source: "constituencies",
        paint: {
          "line-color": "white",
          "line-width": 5,
        },
        filter: ["==", ["get", "id"], ""],
      });

      updateLegend(min, max);

      map.fitBounds(UK_BOUNDS, { padding: 40, animate: false });
      baseZoomLevel = map.getZoom();
      map.setMinZoom(baseZoomLevel);
    });

    intervalId = window.setInterval(updateMapData, POLL_INTERVAL_MS);
  });

  onCleanup(() => {
    map?.remove();
    clearInterval(intervalId);
  });

  createEffect(() => {
    const id = highlightedFeatureId();
    if (!map || !map.isStyleLoaded() || !map.getLayer("highlight-border")) return;

    // Clear popup if no highlighted feature
    if (!id) {
      map.setFilter("highlight-border", ["==", ["get", "id"], ""]);
      if (popup) {
        popup.remove();
        popup = null;
      }

      map.flyTo({
        essential: true,
        center: MAP_CENTRE,
        zoom: baseZoomLevel,
        screenSpeed: 0.15,
        maxDuration: 10_000,
      });
      return;
    }

    // Highlight border
    map.setFilter("highlight-border", ["==", ["get", "id"], id]);

    // Show popup at centroid
    const coords = getFeatureCentroid(map, "constituency-fills", id);
    if (!coords) return;

    if (!popup) popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
    popup
      .setLngLat(coords)
      .setHTML(`<strong>${geoData.features.find((f: any) => f.id === id)?.properties.PCON24NM}</strong>`)
      .addTo(map);

    // Fly to feature
    map.once("idle", () => {
      requestAnimationFrame(() => {
        map.flyTo({
          essential: true,
          center: coords,
          zoom: 8.5,
          screenSpeed: 0.15,
          maxDuration: 10_000,
        });
      });
    });
  });

  return (
    <div class={styles["map-container"]}>
      <div id="map" class={styles.map} />

      <article class={" " + styles.legend}>
        <ul class="list no-space">
          {legendSteps().map((step) => (
            <li>
              <button
                class={'chip border ' + styles["legend-color"]}
                style={{ "background-color": step.color }}
              />
              <div class="max"></div>
              <label>{step.value.toLocaleString()}</label>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
