import { onMount, onCleanup } from "solid-js";
import maplibregl from "maplibre-gl";

const PETITION_ID = 730194;
const POLL_INTERVAL = 60000; // 1 minute

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

    console.log(petition);

    const counts: Record<string, number> = {};
    petition.data.attributes.signatures_by_constituency.forEach((c: any) => {
      counts[c.ons_code] = c.signature_count;
    });

    geoData.features.forEach((f: any) => {
      const code = f.properties.PCON24CD;
      f.properties.signatures = counts[code] || 0;
    });

    console.log(geoData)

    return geoData;
  }

  async function updateMapData() {
    const geoData = await fetchData();
    const source = map.getSource("constituencies") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geoData);
    }
  }

  onMount(async () => {
    const geoData = await fetchData();

    map = new maplibregl.Map({
      container: "map",
      style: "https://demotiles.maplibre.org/style.json",
      center: [-1.5, 54],
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
            0,
            "#bbf7d0",
            5000,
            "#22c55e",
            20000,
            "#14532d",
          ],
          "fill-opacity": 0.9,
        },
      });

      // map.addLayer({
      //   id: "constituency-borders",
      //   type: "line",
      //   source: "constituencies",
      //   paint: {
      //     "line-color": "#333",
      //     "line-width": 0.1,
      //   },
      // });

      // Hover popup
      map.on("mousemove", "constituency-fills", (e) => {
        map.getCanvas().style.cursor = "pointer";
        if (e.features && e.features.length > 0) {
          const f = e.features[0];
          const name = f.properties?.pcon24nm;
          const sigs = f.properties?.signatures;
          popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${name}</strong><br/>${sigs.toLocaleString()} signatures`)
            .addTo(map);
        }
      });

      map.on("mouseleave", "constituency-fills", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
    });

    // Poll petition data every minute
    intervalId = window.setInterval(updateMapData, POLL_INTERVAL);
  });

  onCleanup(() => {
    map && map.remove();
    intervalId && clearInterval(intervalId);
  });

  return <div id="map" style={{ width: "100%", height: "600px" }} />;
}
