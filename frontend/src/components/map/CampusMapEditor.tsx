import { useEffect, useRef, useState } from "react";
import {
    FeatureGroup,
    MapContainer,
    Marker,
    Polygon,
    TileLayer,
    Tooltip,
    useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

import { hammondFeatures } from "../../data/hammond/features";

type DrawControlCtor = new (options: {
    draw: false;
    edit: {
        featureGroup: L.FeatureGroup;
        remove: boolean;
    };
}) => L.Control;

type LeafletControlWithDraw = typeof L.Control & { Draw?: DrawControlCtor };
type LeafletWithDraw = typeof L & { Draw?: { Event: { EDITED: string } } };

type DrawLayerWithFeatureId = L.Layer & {
    options: L.PathOptions & { featureId?: string };
};

type DrawEditedEvent = L.LeafletEvent & {
    layers: L.LayerGroup;
};

function DrawControls({
                          featureGroupRef,
                          updatePolygon,
                      }: {
    featureGroupRef: React.RefObject<L.FeatureGroup | null>;
    updatePolygon: (id: string, coordinates: [number, number][]) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!featureGroupRef.current) return;

        const drawControlCtor = (L.Control as LeafletControlWithDraw).Draw;
        const drawNamespace = (L as LeafletWithDraw).Draw;
        if (!drawControlCtor || !drawNamespace?.Event?.EDITED) return;

        const drawControl = new drawControlCtor({
            draw: false,
            edit: {
                featureGroup: featureGroupRef.current,
                remove: false,
            },
        });

        map.addControl(drawControl);

        const handleEdited = (event: DrawEditedEvent) => {
            event.layers.eachLayer((layer: L.Layer) => {
                const editableLayer = layer as DrawLayerWithFeatureId;
                const featureId = editableLayer.options.featureId;
                if (!featureId) return;

                if (layer instanceof L.Polygon) {
                    const latLngs = layer.getLatLngs()[0] as L.LatLng[];

                    const coordinates = latLngs.map((latLng) => [
                        latLng.lat,
                        latLng.lng,
                    ]) as [number, number][];

                    updatePolygon(featureId, coordinates);
                }
            });
        };

        const editedEventName = drawNamespace.Event.EDITED;
        map.on(editedEventName, handleEdited as L.LeafletEventHandlerFn);

        return () => {
            map.off(editedEventName, handleEdited as L.LeafletEventHandlerFn);
            map.removeControl(drawControl);
        };
    }, [map, featureGroupRef, updatePolygon]);

    return null;
}

export default function CampusMapEditor() {
    const [features, setFeatures] = useState(hammondFeatures);
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);

    function updatePoint(id: string, lat: number, lng: number) {
        setFeatures((prev) =>
            prev.map((feature) =>
                feature.id === id
                    ? { ...feature, coordinates: [lat, lng] }
                    : feature
            )
        );
    }

    function updatePolygon(id: string, coordinates: [number, number][]) {
        setFeatures((prev) =>
            prev.map((feature) =>
                feature.id === id ? { ...feature, coordinates } : feature
            )
        );
    }

    function exportFeatures() {
        console.log(JSON.stringify(features, null, 2));
    }

    return (
        <div className="relative h-full min-h-[600px] w-full overflow-hidden rounded-panel">
            <MapContainer
                center={[41.5845, -87.4732]}
                zoom={17}
                className="h-full w-full"
                scrollWheelZoom
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FeatureGroup
                    ref={(fg) => {
                        if (fg) {
                            featureGroupRef.current = fg;
                        }
                    }}
                >
                    <DrawControls
                        featureGroupRef={featureGroupRef}
                        updatePolygon={updatePolygon}
                    />

                    {features.map((feature) => {
                        if (feature.type !== "polygon") return null;

                        return (
                            <Polygon
                                key={feature.id}
                                positions={feature.coordinates as [number, number][]}
                                pathOptions={{
                                    weight: 2,
                                    fillOpacity: 0.35,
                                }}
                                ref={(layer) => {
                                    if (layer) {
                                        const editableLayer = layer as DrawLayerWithFeatureId;
                                        editableLayer.options.featureId = feature.id;
                                    }
                                }}
                            >
                                <Tooltip permanent>{feature.name}</Tooltip>
                            </Polygon>
                        );
                    })}
                </FeatureGroup>

                {features.map((feature) => {
                    if (feature.type !== "point") return null;

                    const [lat, lng] = feature.coordinates as [number, number];

                    return (
                        <Marker
                            key={feature.id}
                            position={[lat, lng]}
                            draggable
                            eventHandlers={{
                                dragend: (e) => {
                                    const marker = e.target as L.Marker;
                                    const next = marker.getLatLng();
                                    updatePoint(feature.id, next.lat, next.lng);
                                },
                            }}
                        >
                            <Tooltip permanent>{feature.name}</Tooltip>
                        </Marker>
                    );
                })}
            </MapContainer>

            <button
                type="button"
                onClick={exportFeatures}
                className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-lg"
            >
                Export updated coordinates
            </button>
        </div>
    );
}
