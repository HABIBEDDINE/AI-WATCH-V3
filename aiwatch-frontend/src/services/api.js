const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const {
    retries = 2,
    retryDelayMs = 700,
    timeoutMs = 25000,
    method = "GET",
    body = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    let timeoutId;
    let isTimeoutAbort = false;

    try {
      const fetchOptions = {
        method,
        signal: controller.signal,
      };

      if (body) {
        fetchOptions.headers = { "Content-Type": "application/json" };
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      timeoutId = setTimeout(() => {
        isTimeoutAbort = true;
        controller.abort();
      }, timeoutMs);

      const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      // If it's an abort error and NOT a timeout, don't retry (likely component unmount)
      if (error.name === "AbortError" && !isTimeoutAbort) {
        throw error;
      }

      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Unknown API error");
}

export async function getFeed(persona = "cto", maxArticles = 5) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/feed?${params.toString()}`);
}

export async function getRadar(persona = "cto", maxArticles = 8) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/radar?${params.toString()}`);
}

export async function getTrends(persona = "cto", maxArticles = 12) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/trends?${params.toString()}`);
}

export async function getJourney(persona = "cto", maxArticles = 6) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/journey?${params.toString()}`);
}

export async function getArticles(options = {}) {
  const {
    topic,
    signal,
    industry,
    search,
    page = 1,
    pageSize = 10,
    dateFrom,
    dateTo,
  } = options;

  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (signal) params.append("signal", signal);
  if (industry) params.append("industry", industry);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("page_size", String(pageSize));
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  return request(`/api/articles?${params.toString()}`);
}

export async function getArticle(articleId) {
  return request(`/api/articles/${articleId}`);
}

export async function getLiveSignals() {
  return request("/api/signals/live");
}

export async function getTopSectors() {
  return request("/api/sectors/top");
}

export async function getReports(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return request(`/api/reports?${params.toString()}`);
}

export async function getReport(reportId) {
  return request(`/api/reports/${reportId}`);
}

export async function triggerIngest(topic) {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);

  return request(`/api/ingest?${params.toString()}`, { method: "POST" });
}

export async function exportArticlesCSV(topic, signal) {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (signal) params.append("signal", signal);

  const url = `${API_BASE_URL}/api/export/csv?${params.toString()}`;
  window.open(url, "_blank");
}

export async function getHealth() {
  return request("/health", { retries: 0, timeoutMs: 5000 });
}

export { API_BASE_URL };
