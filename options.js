const body = document.querySelector("body");

async function db() {
  const data = await chrome.storage.local.get(null);

  body.innerHTML = JSON.stringify(data);

  console.log(data);
}
db();
