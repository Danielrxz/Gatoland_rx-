function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatNumber(num) {
  return new Intl.NumberFormat("es-MX").format(num);
}

function shorten(text, max = 200) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

module.exports = { formatDuration, formatNumber, shorten };