import styles from "./PetitionMap.module.scss";
import { onMount, onCleanup, createSignal, createEffect } from "solid-js";
import maplibregl from "maplibre-gl";
import { fetchPetitionData, countsStore } from "../petitionStore";
import { highlightedFeatureId, setHighlightedFeatureId } from "./highlight.store";
import { getFeatureCentroid } from "../lib/getFeatureCentroid";

const POLL_INTERVAL_MS = 60_000;
const CLRS = ["#4229", "#ccd", "#11f"];
const INITIAL_ZOOM = 5;

export default function PetitionMap() {
  let map: maplibregl.Map;
  let popup: maplibregl.Popup;
  let intervalId: number;
  let highlightTimeout: number;
  let geoData: any;

  const [legendSteps, setLegendSteps] = createSignal<{ value: number; color: string }[]>([]);

  function getSignatureRange() {
    const values = Object.values(countsStore).map(c => c.count);
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  function updateLegend(min: number, max: number) {
    const steps = [min, Math.round((min + max) / 2), max].map((value, i) => ({
      value,
      color: CLRS[i],
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
      style: { version: 8, sources: {}, layers: [] },
      center: [-5.2, 55.3],
      zoom: INITIAL_ZOOM,
      attributionControl: false,
    });

    popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });

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

      // Highlight border overlay
      map.addLayer({
        id: "highlight-border",
        type: "line",
        source: "constituencies",
        paint: {
          "line-color": "white",
          "line-width": 5,
          "line-dasharray": ["literal", [1, 2, 2]],
        },
        filter: ["==", ["get", "id"], ""],
      });

      updateLegend(min, max);

      // Popup hover
      map.on("mousemove", "constituency-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features?.length) {
          const f = e.features[0];
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<strong>${f.properties.PCON24NM}</strong><br/>${f.properties.signatures.toLocaleString()} signatures`
            )
            .addTo(map);
        }
      });

      map.on("mouseleave", "constituency-fills", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    intervalId = window.setInterval(updateMapData, POLL_INTERVAL_MS);
  });

  onCleanup(() => {
    map?.remove();
    clearInterval(intervalId);
  });

  // React to highlightedFeatureId changes
  createEffect(() => {
    const id = highlightedFeatureId();
    if (!map) return;
    if (!map.isStyleLoaded()) return;
    if (!map.getLayer("highlight-border")) return;

    // Update highlight border
    map.setFilter("highlight-border", ["==", ["get", "id"], id || ""]);

    if (id === null) {
      map.setZoom(INITIAL_ZOOM);
    }

    if (!id) return;

    const coords = getFeatureCentroid(map, "constituency-fills", id);
    if (!coords) return;

    // Use requestAnimationFrame to ensure smooth animation
    map.once("idle", () => {
      requestAnimationFrame(() => {
        map.flyTo({
          center: coords,
          zoom: 9.5,
          screenSpeed: 0.5,
          maxDuration: 2_000,
          // curve: 1.2,
        });
      });
    });
  });

  return (
    <div class={styles["map-container"]}>
      <div id="map" class={styles.map} />

      <article class={"transparent " + styles.legend}>
        {legendSteps().map((step) => (
          <div>
            <div
              class={styles["legend-color"]}
              style={{ "background-color": step.color }}
            />
            <span>{step.value.toLocaleString()}</span>
          </div>
        ))}
      </article>
    </div>
  );
}
