const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";        //Variables exposed to the client should start with "VITE_" in env files in Vite.

async function postJson(url, body) {
  //Sending POST request to the backend
  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",                                               //HTTP method (POST/GET/PUT/DELETE...) 
    headers: { "Content-Type" : "application/json" },             //Tells backend we're sending JSON
    body: JSON.stringify(body)                                    //Data being sent in the request
  });

  //Parse JSON safely. Text is extracted first instead of parsing JSON directly to handle the backend response if its not JSON. (Best practice)
  const text = await res.text();
  try {
    return JSON.parse(text);
  }
  catch {
    return { ok: res.ok, status: res.status, text };
  }
}

export async function login({ email, password }) {
  return await postJson("/auth/login", { email, password });             //Return is only used since its wrapping another function
}

export async function signup({ email, password }) {
  return await postJson("/auth/signup", { email, password });            //Return is only used since its wrapping another function
}

export async function refreshAccessToken(refreshToken, logout) {
  const result = await postJson("/auth/refresh", { token: refreshToken });

  //Detect if refresh token has expired or is invalid. (Necessary to avoid silent broken 403 loops)
  if (result?.error?.toLowerCase().includes("expired") || result?.error?.toLowerCase().includes("invalid")) {
    console.warn("Refresh token expired or invalid. Logging out...");
    logout();
    return null;
  }

  return result;
}