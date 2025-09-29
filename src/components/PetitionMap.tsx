import styles from "./PetitionMap.module.scss";
import { onMount, onCleanup, createSignal, createEffect, Show } from "solid-js";
import maplibregl from "maplibre-gl";
import { fetchPetitionData, countsStore } from "../petitionStore";
import { highlightedFeatureId } from "./highlight.store";
import { getFeatureCentroid } from "../lib/getFeatureCentroid";

const POLL_INTERVAL_MS = 60_000;
const MAP_CENTRE: maplibregl.LngLatLike = [-5.2, 55.3];
const BASE_COLOR = "rgba(0,0,0,0)";
const MIN_COLOR = "#555"; "#644";
const MID_COLOR = "#ccd";
const MAX_COLOR = "#11f";
const CLRS = [MIN_COLOR, MID_COLOR, MAX_COLOR];
let baseZoomLevel = 5;

const UK_BOUNDS: [number, number, number, number] = [
  -8.649357, 49.863461, // SW
  1.768960, 60.860761   // NE
];

export default function PetitionMap() {
  let map: maplibregl.Map;
  let intervalId: number;
  let geoData: any;

  const [legendSteps, setLegendSteps] = createSignal<{ value: number; color: string }[]>([]);
  const [popupTitle, setPopupTitle] = createSignal<string | null>(null);
  const [popupXY, setPopupXY] = createSignal<maplibregl.Point | null>(null);
  const [zoom, setZoom] = createSignal(baseZoomLevel);

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
    // Load geoJSON
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

    // Create map
    map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "transparent" },
          },
        ],
      },
      center: MAP_CENTRE,
      zoom: baseZoomLevel,
      attributionControl: false,
    });

    map.on("load", () => {
      // Note zoom levels
      const handler = () => {
        setZoom(Math.floor(map.getZoom()))
      };
      map.on("zoom", handler);
      onCleanup(() => map.off("zoom", handler));

      // Add GeoJSON source
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
        paint: { "line-color": "white", "line-width": 5 },
        filter: ["==", ["get", "id"], ""],
      });

      updateLegend(min, max);

      map.fitBounds(UK_BOUNDS, { padding: 40, animate: false });
      baseZoomLevel = Math.floor(map.getZoom());
      map.setMinZoom(baseZoomLevel);

      //   new maplibregl.Popup({ closeOnClick: false, anchor: "bottom" })
      //     .setLngLat([-1, 54])
      //     .setHTML('<button class="chip primary">Hello World!</button>')
      //     .addTo(map);
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

    // Clear highlight if no ID
    if (!id) {
      map.setFilter("highlight-border", ["==", ["get", "id"], ""]);
      setPopupTitle('');
      map.flyTo({ center: MAP_CENTRE, zoom: baseZoomLevel, essential: true });
      setPopupTitle(null);
      return;
    }

    map.setFilter("highlight-border", ["==", ["get", "id"], id]);

    const coords = getFeatureCentroid(map, "constituency-fills", id);
    if (!coords || !Array.isArray(coords) || coords.length !== 2) return;

    map.resize();

    setPopupTitle(null);

    map.once('idle', () => {
      setPopupTitle('');
      map.flyTo({
        center: coords,
        zoom: 8.5,
        essential: true,
        screenSpeed: 1,
        curve: 1.2,
      });
    });

    map.once('moveend', () => {
      const featureProperties = (geoData.features.find((f: any) => f.id === id)?.properties);
      const xy = map.project([featureProperties.LONG, featureProperties.LAT]);
      setPopupXY(xy);
      setPopupTitle(featureProperties.PCON24NM); // featureProperties.LAT featureProperties.LONG
    });
  });


  return (
    <div class={styles["map-container"]}>
      <div id="map" class={styles.map} />

      <Show when={popupTitle() && popupXY()}>
        <div class={styles.popup} style={`top:${popupXY()!.y}px; left:${popupXY()!.x}px`}>{popupTitle()}</div>
      </Show>

      <article class={styles.legend}>
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

      <Show when={popupTitle() === null && zoom() === baseZoomLevel}>
        <article class={styles.zoomedout + ' small padding'}>
          <h6>About This Information</h6>
          <div>
            The data visaulised here is fetched every minute
            from Parliament's public API, and is republished here
            within the terms of the data's lisence.
          </div>
        </article>
      </Show>
    </div>
  );
}
