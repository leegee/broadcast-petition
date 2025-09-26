import styles from "./PetitionMap.module.scss";
import { onMount, onCleanup } from "solid-js";
import maplibregl from "maplibre-gl";
import { updateCounts } from "../petitionStore";

const PETITION_ID = 730194;
const POLL_INTERVAL = 60000; // 1 minute

function getSignatureRange(petitionData: any) {
  const counts = petitionData.data.attributes.signatures_by_constituency.map(
    (c: any) => c.signature_count
  );
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  return { min, max };
}

export default function PetitionMap() {
  let map: maplibregl.Map;
  let popup: maplibregl.Popup;
  let intervalId: number;

  async function fetchData() {
    const geoData = await fetch(
      "Westminster_Parliamentary_Constituencies_July_2024_Boundaries_UK_BGC_-8097874740651686118.geojson"
    ).then((r) => r.json());

    const petition = await fetch(
      `https://petition.parliament.uk/petitions/${PETITION_ID}.json`
    ).then((r) => r.json());

    const newCounts: Record<string, { name: string; count: number }> = {};
    petition.data.attributes.signatures_by_constituency.forEach((c: any) => {
      newCounts[c.ons_code.toUpperCase()] = {
        name: c.name, // ✅ constituency English name comes from API
        count: c.signature_count,
      };
    });

    updateCounts(newCounts);

    geoData.features.forEach((f: any) => {
      const code = f.properties.PCON24CD.toUpperCase();
      f.properties.signatures = newCounts[code]?.count || 0;
    });

    return { geoData, petition };
  }

  async function updateMapData() {
    const { geoData } = await fetchData();
    const source = map.getSource("constituencies") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geoData);
    }
  }

  onMount(async () => {
    const { geoData, petition } = await fetchData();
    const { min, max } = getSignatureRange(petition);

    map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: [-1.5, 54],
      attributionControl: false,
      zoom: 5,
    });

    popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on("load", () => {
      map.addSource("constituencies", {
        type: "geojson",
        data: geoData,
      });

      map.addLayer({
        id: "constituency-fills",
        type: "fill",
        source: "constituencies",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "signatures"],
            min,
            "#14532d",
            (min + max) / 2,
            "#22c55e",
            max,
            "#bbf7d0",
          ],
          "fill-opacity": 0.9,
        },
      });

      map.on("mousemove", "constituency-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features && e.features.length > 0) {
          const f = e.features[0];
          const name = f.properties?.PCON24NM;
          const sigs = f.properties?.signatures;
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<strong>${name}</strong><br/>${sigs.toLocaleString()} signatures`
            )
            .addTo(map);
        }
      });

      map.on("mouseleave", "constituency-fills", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    intervalId = window.setInterval(updateMapData, POLL_INTERVAL);
  });

  onCleanup(() => {
    map && map.remove();
    intervalId && clearInterval(intervalId);
  });

  return <div id="map" class={styles.map} />;
}
