## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Build the embeddable widget bundle

1. Install dependencies:
   `npm install`
2. Build the widget bundle:
   `npm run build`
3. Use the generated bundle at:
   `dist/owl-widget-bundle.js`

### Usage (Blazor / external embed)

1. Add a container element on your page:
   `<div id="owl-widget-root"></div>`
2. Include the bundle script:
   `<script src="/path/to/owl-widget-bundle.js"></script>`
3. Mount the widget:
   `<script>window.mountOwlWidget('owl-widget-root');</script>`
