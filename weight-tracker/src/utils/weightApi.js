const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function getWeightJson(url) {
  const token = localStorage.getItem("wt_token");
  if (!token) {
    return {error: "No auth token found"};      //When we pass this fn to a "res", all token errors can be accessed via "res.error" in the frontend.
  }

  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  }
  catch {
    return { ok: res.ok, status: res.status, text };
  }
}

async function postWeightJson(url, body) {
  const token = localStorage.getItem("wt_token");
  if (!token) {
    return {error: "No auth token found"};
  }

  const res = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  }
  catch {
    return { ok: res.ok, status: res.status, text };
  }
}

export async function fetchAllWeightData() {
  return await getWeightJson("/weights");
}

export async function fetchWeightData(year, month) {
  return await getWeightJson(`/weights/${year}/${month}`);
}
//Note: Colons are not used in the url because its just a placeholder for values in the API endpoint. Not like a query URL.
export async function saveWeightData(year, month, data) {
  return await postWeightJson(`/weights/${year}/${month}`, data);
}

export async function migrateWeightToServer(data, overwrite = false) {
  return await postWeightJson("/weights/migrate", { data, overwrite });
}

export async function clearServerWeightData() {
  return await postWeightJson("/weights/reset", {});
}