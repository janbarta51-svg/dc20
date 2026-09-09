(() => {
  // Pages CMS stores Gangy and Kronika in wrapper objects:
  // { gangs: [...] } and { sessions: [...] }.
  // The existing app renderer expects plain arrays with the older field names.
  // Normalize the CMS response here so Pages CMS can keep its clean editing schema.
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);
    try {
      const input = args[0];
      const url = typeof input === 'string' ? input : input?.url || '';
      const pathname = new URL(url, window.location.href).pathname;

      const isGangs = pathname.endsWith('/content/gangcyklopedie.json');
      const isChronicle = pathname.endsWith('/content/kronika.json');
      if (!isGangs && !isChronicle) return response;

      const data = await response.clone().json();
      let normalized = data;

      if (isGangs) {
        const items = Array.isArray(data) ? data : (Array.isArray(data?.gangs) ? data.gangs : []);
        normalized = items.map(g => ({
          ...g,
          title: g.title || g.name || 'Bez názvu',
          icon: g.icon || g.logo || '',
          information: g.information || g.description || ''
        }));
      }

      if (isChronicle) {
        const items = Array.isArray(data) ? data : (Array.isArray(data?.sessions) ? data.sessions : []);
        normalized = items.map(s => ({
          ...s,
          title: s.title || s.name || 'Session',
          date: s.date || s.day || '',
          body: s.body || s.chronicle || s.description || ''
        }));
      }

      return new Response(JSON.stringify(normalized), {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    } catch (err) {
      console.warn('CMS normalization failed; using original response.', err);
      return response;
    }
  };
})();
