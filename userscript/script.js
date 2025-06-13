// ==UserScript==
// @name         HD Terrain for GeoFS
// @namespace    http://tampermonkey.net/
// @version      2024-06-15
// @description  HD terrain working after page refresh. I made a few changes from the code of daflamingo89 to fix after u refresh it still works
// @author       Tokke_1111
// @match        https://www.geo-fs.com/geofs.php?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const provider = "google"; // Options: "google", "apple", "bing", or "cache"

    function applyFix() {
        if (!window.geofs || !window.geofs.api || !window.Cesium) return;

        try {
            // Remove analytics if present
            delete window.geofs.api.analytics;
            document.body.classList.add("geofs-hd");

            // Set imagery provider
            switch (provider) {
                case "cache":
                    window.geofs.api.imageryProvider = new window.Cesium.UrlTemplateImageryProvider({
                        maximumLevel: 21,
                        hasAlphaChannel: false,
                        subdomains: "abcdefghijklmnopqrstuvwxyz".split(""),
                        url: "http://localhost/map/{z}/{x}/{y}"
                    });
                    break;
                case "google":
                    window.geofs.api.imageryProvider = new window.Cesium.UrlTemplateImageryProvider({
                        maximumLevel: 21,
                        hasAlphaChannel: false,
                        subdomains: ["mt0", "mt1", "mt2", "mt3"],
                        url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    });
                    break;
                case "apple":
                    window.geofs.api.imageryProvider = new window.Cesium.UrlTemplateImageryProvider({
                        maximumLevel: 21,
                        hasAlphaChannel: false,
                        subdomains: ["sat-cdn1", "sat-cdn2", "sat-cdn3", "sat-cdn4"],
                        url: "https://{s}.apple-mapkit.com/tile?style=7&size=1&scale=1&z={z}&x={x}&y={y}&v=9651&accessKey=..."
                    });
                    break;
                case "bing":
                    window.geofs.api.imageryProvider = new window.Cesium.BingMapsImageryProvider({
                        url: "https://dev.virtualearth.net",
                        key: "AjrgR5TNicgFReuFwvNH71v4YeQNkXIB20l63ZMm86mVuBGZPhTHMkdiVq2_9L7x",
                        mapStyle: window.Cesium.BingMapsStyle.AERIAL
                    });
                    break;
            }

            // Set terrain provider
            window.geofs.api.viewer.terrainProvider = window.geofs.api.flatRunwayTerrainProviderInstance = new window.geofs.api.FlatRunwayTerrainProvider({
                baseProvider: new window.Cesium.CesiumTerrainProvider({
                    url: "https://data.geo-fs.com/srtm/",
                    requestWaterMask: false,
                    requestVertexNormals: true
                }),
                bypass: false,
                maximumLevel: 12
            });

            // Update rendering settings
            window.geofs.api.setImageryProvider(window.geofs.api.imageryProvider, false);
            window.geofs.api.hdOn = true;
            window.geofs.api.renderingQuality();

            // Add XYZ map support
            window.geofs.mapXYZ = "https://data.geo-fs.com/osm/{z}/{x}/{y}.png";

            console.log("✅ HD Fix successfully applied!");
        } catch (e) {
            console.error("❌ Error applying HD fix:", e);
        }
    }

    // Wait for geofs.aircraft.instance as indicator that GeoFS is loaded
    const waitForGeoFS = setInterval(() => {
        if (typeof geofs !== "undefined" && geofs.aircraft && geofs.aircraft.instance) {
            clearInterval(waitForGeoFS);

            // Small delay to ensure Cesium and all modules are ready
            setTimeout(() => {
                applyFix();
            }, 2000); // Adjust this value if needed based on load speed
        }
    }, 100);
})();
