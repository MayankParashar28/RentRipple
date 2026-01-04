document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const suggestionsBox = document.getElementById("search-suggestions");
    const mobileSearchToggle = document.getElementById("mobile-search-toggle");
    const searchContainer = document.getElementById("search-container");
    let debounceTimer;

    // Mobile Search Toggle
    if (mobileSearchToggle) {
        mobileSearchToggle.addEventListener("click", () => {
            searchContainer.classList.toggle("hidden");
            searchContainer.classList.toggle("block");
            if (searchContainer.classList.contains("block")) {
                searchInput.focus();
            }
        });
    }

    // Autocomplete Logic
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length < 2) {
                suggestionsBox.innerHTML = "";
                suggestionsBox.classList.add("hidden");
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const response = await fetch(`/listings/search/suggestions?q=${encodeURIComponent(query)}`);
                    const suggestions = await response.json();

                    if (suggestions.length > 0) {
                        suggestionsBox.innerHTML = suggestions
                            .map(item => `
                                <div class="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors suggestion-item">
                                    <i class="fas fa-map-marker-alt text-gray-400 text-xs"></i>
                                    <span class="text-sm text-gray-700">${item}</span>
                                </div>
                            `).join("");
                        suggestionsBox.classList.remove("hidden");

                        // Item click handler
                        document.querySelectorAll(".suggestion-item").forEach(item => {
                            item.addEventListener("click", () => {
                                const text = item.querySelector("span").innerText;
                                searchInput.value = text;
                                suggestionsBox.classList.add("hidden");
                                searchInput.closest("form").submit();
                            });
                        });
                    } else {
                        suggestionsBox.innerHTML = "";
                        suggestionsBox.classList.add("hidden");
                    }
                } catch (err) {
                    console.error("Autocomplete error:", err);
                }
            }, 300);
        });

        // Hide suggestions on click outside
        document.addEventListener("click", (e) => {
            if (!searchContainer.contains(e.target)) {
                suggestionsBox.classList.add("hidden");
            }
        });

        // Handle focus
        searchInput.addEventListener("focus", () => {
            if (suggestionsBox.children.length > 0) {
                suggestionsBox.classList.remove("hidden");
            }
        });
    }
});
