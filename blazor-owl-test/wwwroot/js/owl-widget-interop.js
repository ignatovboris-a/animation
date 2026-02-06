window.blazorOwl = {
  mountOwlWidget: (containerId, options) => {
    if (typeof window.mountOwlWidget !== 'function') {
      console.error('OwlWidget: mountOwlWidget is not available yet.');
      return;
    }

    window.mountOwlWidget(containerId);

    if (options) {
      console.info('OwlWidget: options received from Blazor.', options);
    }
  }
};
