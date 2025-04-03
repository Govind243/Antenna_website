function calculateAntenna() {
    // Get input values
    const length = parseFloat(document.getElementById("length").value) / 1000; // m
    const width = parseFloat(document.getElementById("width").value) / 1000; // m
    const dielectric = parseFloat(document.getElementById("dielectric").value);
    const height = parseFloat(document.getElementById("height").value) / 1000; // m
    const impedance = parseFloat(document.getElementById("impedance").value);
    const material = document.getElementById("material").value;

    const c = 3e8; // speed of light in m/s

    // 1. Calculate effective dielectric constant (ε_eff)
    const epsilonEff = (dielectric + 1) / 2 + (dielectric - 1) / 2 * Math.sqrt(1 + 12 * height / width);

    // 2. Calculate resonant frequency f0 (in Hz)
    const resonantFrequency = c / (2 * Math.sqrt(epsilonEff) * length);
    const resonantFrequencyGHz = resonantFrequency / 1e9; // Convert to GHz

    // 3. Calculate input impedance (Z_in) using the formula for microstrip patch antennas
    const Zin = (60 / Math.sqrt(epsilonEff)) * Math.log(8 * height / width + 0.25 * width / height);

    // 4. Calculate S11 (reflection coefficient)
    const Z0 = 50; // Feed line impedance (assumed 50Ω)
    const reflectionCoefficient = Math.abs((Zin - Z0) / (Zin + Z0));
    const S11 = 20 * Math.log10(reflectionCoefficient);

    // 5. Calculate Directivity (D) using a more realistic approach
    const wavelength = c / resonantFrequency; // in meters
    const area = length * width; // patch area in m²
    const directivity = (4 * Math.PI * area) / Math.pow(wavelength, 2);
    const directivityDb = 10 * Math.log10(directivity); // Convert directivity to dBi

    // 6. Calculate Gain with material loss factor
    const lossFactor = material === 'copper' ? 0.3 : 0.1; // Loss factor for copper and gold
    const Q = 10 * (length / width); // Approximate quality factor based on length-to-width ratio
    const gain = directivityDb - 10 * Math.log10(Q) - lossFactor; // Adjust gain based on Q and material loss

    // 7. Bandwidth Calculation (simplified for demonstration)
    const bandwidth = resonantFrequency / Q;

    // 8. Display Results
    document.getElementById("results").innerHTML = `
        <p>Resonant Frequency: ${resonantFrequencyGHz.toFixed(2)} GHz</p>
        <p>Input Impedance (Zin): ${Zin.toFixed(2)} Ω</p>
        <p>S11 Parameter: ${S11.toFixed(2)} dB</p>
        <p>Directivity: ${directivityDb.toFixed(2)} dBi</p>
        <p>Gain: ${gain.toFixed(2)} dBi</p>
        <p>Bandwidth: ${(bandwidth / 1e6).toFixed(2)} MHz</p>
    `;

    // Create S11 Graph (simulate a realistic S11 curve)
    const frequencies = Array.from({ length: 50 }, (_, i) => resonantFrequency + (i * 0.02e9)); // Simulate frequency range
    const s11Values = frequencies.map(f => {
        return S11 + (Math.random() * 2 - 1); // Add small fluctuation for visual representation
    });

    // Create S11 Graph using Chart.js
    const ctx = document.getElementById("s11Chart").getContext("2d");
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: frequencies.map(f => (f / 1e9).toFixed(2) + " GHz"),
            datasets: [{
                label: 'S11 (dB)',
                data: s11Values,
                borderColor: material === 'copper' ? 'orange' : 'gold',
                backgroundColor: material === 'copper' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 215, 0, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: "Frequency (GHz)", color: "#ffffff" } },
                y: { title: { display: true, text: "S11 (dB)", color: "#ffffff" } },
            },
            plugins: {
                legend: { labels: { color: "#ffffff" } },
            },
        }
    });
}
