module.exports = function(eleventyConfig) {
  // Passthrough copy for static assets
  // This will copy these files and folders directly to the output folder (_site)
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("lager");
  eleventyConfig.addPassthroughCopy("logo.jpg");
  eleventyConfig.addPassthroughCopy("logo_favicon-32x32.ico");
  eleventyConfig.addPassthroughCopy("logo_favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("apple-touch-icon.png");

  // Dev Server Options
  eleventyConfig.setServerOptions({
    // The default CSP is very strict, this relaxes it for local development
    csp: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline and eval
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:"],
    }
  });

  return {
    // When a passthrough file is modified, rebuild the site
    passthroughFileCopy: true,
    // Define input and output directories
    dir: {
      input: ".",
      output: "_site",
    },
  };
};
