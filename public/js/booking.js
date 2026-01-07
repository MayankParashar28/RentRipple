document.addEventListener('DOMContentLoaded', () => {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const totalNightsDisplay = document.getElementById('total-nights');
    const baseCostDisplay = document.getElementById('base-cost');
    const serviceFeeDisplay = document.getElementById('service-fee');
    const grandTotalDisplay = document.getElementById('grand-total');

    if (!checkinInput || !checkoutInput || !window.listingData) {
        console.error("Booking Debug: Missing elements or data", {
            checkin: !!checkinInput,
            checkout: !!checkoutInput,
            data: window.listingData
        });
        return;
    }
    console.log("Booking Debug: Elements found, data:", window.listingData);

    const { price, cleaningFee } = window.listingData;

    function calculateCost() {
        console.log("Calculating cost...");
        const checkinDate = new Date(checkinInput.value);
        const checkoutDate = new Date(checkoutInput.value);

        // Validate dates
        if (checkinDate && checkoutDate && checkoutDate > checkinDate && !isNaN(checkinDate.getTime()) && !isNaN(checkoutDate.getTime())) {
            const timeDiff = Math.abs(checkoutDate - checkinDate);
            const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            const baseCost = price * days;
            const serviceFee = Math.round(baseCost * 0.14); // 14% Service fee restored
            const total = baseCost + cleaningFee + serviceFee;

            // Update DOM
            if (totalNightsDisplay) totalNightsDisplay.textContent = days;
            if (baseCostDisplay) baseCostDisplay.textContent = baseCost.toLocaleString("en-IN");
            if (serviceFeeDisplay) serviceFeeDisplay.textContent = serviceFee.toLocaleString("en-IN");
            if (grandTotalDisplay) grandTotalDisplay.textContent = total.toLocaleString("en-IN");
        } else {
            if (totalNightsDisplay) totalNightsDisplay.textContent = '0';
            if (baseCostDisplay) baseCostDisplay.textContent = '0';
            if (grandTotalDisplay) grandTotalDisplay.textContent = '0';
        }
    }

    checkinInput.addEventListener('change', calculateCost);
    checkoutInput.addEventListener('change', calculateCost);
    checkinInput.addEventListener('input', calculateCost);
    checkoutInput.addEventListener('input', calculateCost);
});
