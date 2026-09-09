(() => {
  // Pages CMS stores campaign content in wrapper objects:
  // { gangs: [...] }, { characters: [...] }, { sessions: [...] }.
  // app.js expects plain arrays with its existing field names, so normalize
  // only these three JSON responses before app.js reads them.
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (...args) => {
    const response = await nativeFetch(...args);

    try {
      if (!response.ok) return response;

      const input = args[0];
      const url = typeof input === 'string' ? input : input?.url || '';
      const pathname = new URL(url, window.location.href).pathname;

      const isGangs = pathname.endsWith('/content/gangcyklopedie.json');
      const isCharacters = pathname.endsWith('/content/postavy.json');
      const isChronicle = pathname.endsWith('/content/kronika.json');
      if (!isGangs && !isCharacters && !isChronicle) return response;

      const data = await response.clone().json();
      let normalized;

      if (isGangs) {
        const items = Array.isArray(data) ? data : (Array.isArray(data?.gangs) ? data.gangs : []);
        normalized = items.map(g => ({
          ...g,
          title: g.title || g.name || 'Bez názvu',
          icon: g.icon || g.logo || '',
          information: g.information || g.description || ''
        }));
      } else if (isCharacters) {
        const items = Array.isArray(data) ? data : (Array.isArray(data?.characters) ? data.characters : []);
        normalized = items.map(c => ({
          ...c,
          name: c.name || c.title || 'Bez jména',
          image: c.image || c.icon || c.logo || '',
          description: c.description || c.body || ''
        }));
      } else {
        const items = Array.isArray(data) ? data : (Array.isArray(data?.sessions) ? data.sessions : []);
        normalized = items.map(s => ({
          ...s,
          title: s.title || s.name || 'Session',
          date: s.date || s.day || '',
          body: s.body || s.chronicle || s.description || ''
        }));
      }

      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'application/json; charset=utf-8');

      return new Response(JSON.stringify(normalized), {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (err) {
      console.warn('CMS normalization failed; using original response.', err);
      return response;
    }
  };
})();
