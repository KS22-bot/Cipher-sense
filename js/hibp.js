export async function checkPwnedPassword(password) {
  if (!password) {
    return { status: "empty", count: 0, message: "Enter a password before checking breaches." };
  }

  const sha1 = await sha1Hex(password);
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { Add-Padding: "true" },
  });

  if (!response.ok) throw new Error("Have I Been Pwned range request failed.");

  const text = await response.text();
  const match = text
    .split("\n")
    .map((line) => line.trim().split(":"))
    .find(([returnedSuffix]) => returnedSuffix === suffix);

  const count = match ? Number(match[1]) : 0;
  return {
    status: count > 0 ? "found" : "safe",
    count,
    message:
      count > 0
        ? `Found in ${count.toLocaleString()} known breaches. Do not reuse this password.`
        : "Not found in known breaches. This does not guarantee it is safe, but it is a good sign.",
  };
}

async function sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}
