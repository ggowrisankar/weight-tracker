const API_BASE = import.meta.env.VITE_API_BASE || "";             //Variables exposed to the client should start with "VITE_" in env files in Vite.

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

export function login({ email, password }) {
  return postJson("/auth/login", { email, password });             //Return is only used since its wrapping another function
}

export function signup({ email, password }) {
  return postJson("/auth/signup", { email, password });            //Return is only used since its wrapping another function
}