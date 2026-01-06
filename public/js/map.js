// Map initialization logic
const mapElement = document.getElementById('map');
if (mapElement && window.showMapData) {
    const { mapToken, coordinates: rawCoordinates } = window.showMapData;
    let coordinates = rawCoordinates;

    // Validate coordinates, fallback to Delhi if invalid
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
        console.warn("Invalid coordinates detected, falling back to default.");
        coordinates = [77.209, 28.6139];
    }

    // Clear the loading text
    mapElement.innerHTML = '';

    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        center: coordinates, // starting position [lng, lat]
        zoom: 15.1, // starting zoom
        pitch: 0, // flat view
        bearing: 0, // facing north
        style: 'mapbox://styles/mapbox/streets-v12' // fallback to reliable style
    });

    // Create a custom DOM element for the marker
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerHTML = '<div style="background-color: #FF385C; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;"><i class="fas fa-home" style="font-size: 18px;"></i></div>';

    // Add marker to map
    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                    `<h4 style="font-weight: bold; margin: 0;">Exact Location</h4><p style="margin: 5px 0 0;">Will be shared after booking</p>`
                )
        )
        .addTo(map);

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const lightPresetInput = document.getElementById('lightPreset');
    if (lightPresetInput) {
        lightPresetInput.addEventListener('change', function () {
            map.setConfigProperty('basemap', 'lightPreset', this.value);
        });
    }

    document
        .querySelectorAll('.map-overlay-inner input[type="checkbox"]')
        .forEach((checkbox) => {
            checkbox.addEventListener('change', function () {
                map.setConfigProperty('basemap', this.id, this.checked);
            });
        });
} else {
    console.error("Map Debug: Initialization failed.");
    console.log("Map Debug: mapElement:", mapElement);
    console.log("Map Debug: window.showMapData:", window.showMapData);
    if (mapElement) {
        if (!window.showMapData) {
            mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-red-500 font-bold">Error: Map Data Missing</div>';
        } else if (typeof mapboxgl === 'undefined') {
            mapElement.innerHTML = '<div class="flex items-center justify-center h-full text-red-500 font-bold">Error: Mapbox GL JS Not Loaded</div>';
            console.error("Map Debug: mapboxgl is undefined");
        }
    }
}



// The rest of your code below remains the same

if (typeof reviewForm === 'undefined') {
    const reviewForm = document.querySelector('form[action$="/reviews"]');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (event) {
            const ratingChecked = document.querySelector('input[name="review[rating]"]:checked');
            if (!ratingChecked || ratingChecked.value === "") {
                alert("Please select a rating!");
                event.preventDefault();
            }
        });
    }
}


// Enhanced interactivity
document.addEventListener('DOMContentLoaded', function () {
    const lightPreset = document.getElementById('lightPreset');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    if (lightPreset) {
        // Add preset indicator to select options
        lightPreset.addEventListener('change', function () {
            const selectedValue = this.value;
            // console.log('Light preset changed to:', selectedValue);

            // Add visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    }

    // Enhanced checkbox interactions
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const label = this.closest('.checkbox-item');

            if (this.checked) {
                label.style.background = 'rgba(102, 126, 234, 0.2)';
                setTimeout(() => {
                    label.style.background = '';
                }, 300);
            }

            console.log(`${this.id} is now ${this.checked ? 'enabled' : 'disabled'}`);
        });
    });

    // Add ripple effect to checkbox items
    document.querySelectorAll('.checkbox-item').forEach(item => {
        item.addEventListener('click', function (e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                            position: absolute;
                            width: ${size}px;
                            height: ${size}px;
                            left: ${x}px;
                            top: ${y}px;
                            background: rgba(255, 255, 255, 0.3);
                            border-radius: 50%;
                            transform: scale(0);
                            animation: ripple 0.6s linear;
                            pointer-events: none;
                        `;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
                    @keyframes ripple {
                        to {
                            transform: scale(2);
                            opacity: 0;
                        }
                    }
                `;
    document.head.appendChild(style);
});

//fro comment  section in show page
