window.initMap = function (mapToken, listings) {
    if (!mapToken) {
        console.error("Map Token provided to initMap is missing or empty.");
        return;
    }
    console.log("initMap called with token present.");

    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [77.209, 28.6139],
        zoom: 1.5,
        projection: 'mercator'
    });

    map.on('load', () => { console.log("Map loaded successfully"); });
    map.on('error', (e) => { console.error("Map error:", e); });

    // Expose map to window so it can be resized (renamed to listingMap to avoid DOM ID conflict)
    window.listingMap = map;

    map.addControl(new mapboxgl.NavigationControl());

    map.on('style.load', () => {
        map.setFog({
            'color': 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
        });
    });

    map.on('load', () => {
        // Construct GeoJSON on the client side
        const listingsGeoJSON = {
            type: "FeatureCollection",
            features: listings.map(l => ({
                type: "Feature",
                geometry: l.geometry,
                properties: {
                    popUpMarkup: l.popUpMarkup,
                    formattedPrice: l.price ? '₹ ' + l.price.toLocaleString("en-IN") : '₹ 0'
                }
            }))
        };

        map.addSource('listings', {
            type: 'geojson',
            data: listingsGeoJSON,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'listings',
            filter: ['has', 'point_count'],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#51bbd6',
                    100,
                    '#f1f075',
                    750,
                    '#f28cb1'
                ],
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'listings',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        map.addLayer({
            id: 'unclustered-point',
            type: 'symbol',
            source: 'listings',
            filter: ['!', ['has', 'point_count']],
            layout: {
                'icon-image': 'monument-15',
                'icon-size': 2,
                'icon-allow-overlap': true,
                'text-field': '{formattedPrice}',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-offset': [0, 1.2],
                'text-anchor': 'top',
                'text-size': 14
            },
            paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1,
                'icon-color': '#ff385c',
                'icon-halo-color': '#ffffff',
                'icon-halo-width': 1
            }
        });

        map.on('click', 'clusters', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('listings').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        });

        map.on('click', 'unclustered-point', (e) => {
            const { popUpMarkup } = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popUpMarkup)
                .addTo(map);
        });

        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
        map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
        });
    });
};
