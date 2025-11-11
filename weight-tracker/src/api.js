const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(url, options = {}, requireAuth = true) {   //options: fetch settings like method, body, custom headers, etc
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})          //Merge user-provided headers; user keys overwrite defaults if there’s a conflict (Content-Type is set first, any others later)
  };

  if (requireAuth) {
    const token = localStorage.getItem("wt_token");
    if (!token) return {error: "No auth token found"};
    headers["Authorization"] = `Bearer ${token}`;       //Attaches Authorization to the headers if token is found
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,                        //Spread all user-provided fetch options (method, body, etc.)
    headers                            //Override any headers in options with the original merged headers object (so the headers are always consistent)
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  }
  catch {
    return { ok: res.ok, status: res.status, text };
  }
}