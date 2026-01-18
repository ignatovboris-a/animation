window.mcp = window.mcp || {};

const logAssetStatus = () => {
    const widgetScript = document.querySelector('script[src="js/owl-widget-bundle.js"]');
    const widgetStyles = document.querySelector('link[href="css/owl-widget-bundle.css"]');

    if (!widgetScript) {
        console.warn("OwlWidget: bundle script tag not found in DOM.");
    } else {
        widgetScript.addEventListener("load", () => {
            console.info("OwlWidget: bundle script loaded successfully.");
        });
        widgetScript.addEventListener("error", () => {
            console.error("OwlWidget: bundle script failed to load.");
        });
    }

    if (!widgetStyles) {
        console.warn("OwlWidget: bundle stylesheet tag not found in DOM.");
    } else {
        widgetStyles.addEventListener("load", () => {
            console.info("OwlWidget: bundle stylesheet loaded successfully.");
        });
        widgetStyles.addEventListener("error", () => {
            console.error("OwlWidget: bundle stylesheet failed to load.");
        });
    }

    if (typeof window.mountOwlWidget !== "function") {
        console.warn("OwlWidget: mount function is not available on initial load.");
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", logAssetStatus);
} else {
    logAssetStatus();
}

window.mcp.mountOwlWidget = (containerId, options) => {
    const config = {
        scale: typeof options?.scale === "number" ? options.scale : 0.8,
        startXPercent: typeof options?.startXPercent === "number" ? options.startXPercent : 90,
        startYPercent: typeof options?.startYPercent === "number" ? options.startYPercent : 90,
        autoSpawn: typeof options?.autoSpawn === "boolean" ? options.autoSpawn : false,
        minSpawnSeconds: typeof options?.minSpawnSeconds === "number" ? options.minSpawnSeconds : 60,
        maxSpawnSeconds: typeof options?.maxSpawnSeconds === "number" ? options.maxSpawnSeconds : 300
    };

    console.info("OwlWidget: requested mount", { containerId, config });

    const startTime = performance.now();
    const timeoutMs = 10000;

    const waitForMount = () => {
        if (typeof window.mountOwlWidget === "function") {
            const container = document.getElementById(containerId);
            console.info("OwlWidget: mount function available", { containerFound: Boolean(container) });
            window.mountOwlWidget(containerId);
            applyOwlWidgetConfig(containerId, config);
            return;
        }

        if (performance.now() - startTime < timeoutMs) {
            setTimeout(waitForMount, 100);
            return;
        }

        console.warn("OwlWidget: mountOwlWidget is not available after waiting.", { containerId });
    };

    waitForMount();
};

const applyOwlWidgetConfig = (containerId, config) => {
    const startTime = performance.now();
    const timeoutMs = 10000;

    const setInputValue = (input, value) => {
        if (!input) return;
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const tryApply = () => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn("OwlWidget: container not found for config.", { containerId });
            return false;
        }

        const rangeInputs = container.querySelectorAll('input[type="range"]');
        const numberInputs = container.querySelectorAll('input[type="number"]');
        const autoSpawnInput = container.querySelector('input[type="checkbox"]');

        if (rangeInputs.length < 3 || numberInputs.length < 2) {
            console.info("OwlWidget: config inputs not ready yet.", {
                rangeInputs: rangeInputs.length,
                numberInputs: numberInputs.length
            });
            return false;
        }

        setInputValue(rangeInputs[0], String(config.scale));
        setInputValue(rangeInputs[1], String(config.startXPercent));
        setInputValue(rangeInputs[2], String(config.startYPercent));
        setInputValue(numberInputs[0], String(config.minSpawnSeconds));
        setInputValue(numberInputs[1], String(config.maxSpawnSeconds));

        if (autoSpawnInput) {
            autoSpawnInput.checked = config.autoSpawn;
            autoSpawnInput.dispatchEvent(new Event("change", { bubbles: true }));
        }

        console.info("OwlWidget: config applied.");
        return true;
    };

    const waitForInputs = () => {
        if (tryApply()) {
            return;
        }

        if (performance.now() - startTime < timeoutMs) {
            requestAnimationFrame(waitForInputs);
            return;
        }

        console.warn("OwlWidget: failed to apply config before timeout.", { containerId });
    };

    waitForInputs();
};
