// Vesper Cafe — 予約フォーム（モック）

const STORAGE_KEY = "vesper_reservations";

async function loadMockData() {
  const response = await fetch("data/menu-mock.json");
  if (!response.ok) {
    throw new Error(`Failed to load mock data: ${response.status}`);
  }
  return response.json();
}

function generateReservationId() {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `VSP-${stamp}-${random}`;
}

function getMinDate(advanceDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getMaxDate(advanceDays) {
  const max = new Date();
  max.setDate(max.getDate() + advanceDays);
  return max;
}

function formatDateInput(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function populateTimeSlots(slots) {
  const select = document.getElementById("time");
  slots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    select.appendChild(option);
  });
}

function populatePartyOptions(maxParty) {
  const select = document.getElementById("party");
  for (let i = 1; i <= maxParty; i++) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `${i}名`;
    select.appendChild(option);
  }
}

function populateSeatOptions(seatTypes) {
  const formSelect = document.getElementById("seat");
  const infoContainer = document.getElementById("seat-types-info");

  seatTypes.forEach((seat) => {
    const option = document.createElement("option");
    option.value = seat.id;
    option.textContent = seat.label;
    formSelect.appendChild(option);

    const item = document.createElement("div");
    item.className = "seat-type-item";
    item.innerHTML = `
      <p class="seat-type-label">${seat.label}</p>
      <p class="seat-type-desc">${seat.description}</p>
    `;
    infoContainer.appendChild(item);
  });
}

function setupDateInput(advanceDays) {
  const input = document.getElementById("date");
  const min = getMinDate();
  const max = getMaxDate(advanceDays);
  input.min = formatDateInput(min);
  input.max = formatDateInput(max);
}

function renderPageInfo(data) {
  document.getElementById("reservation-notes").textContent =
    data.reservation.notes;
  document.getElementById("reservation-phone").textContent =
    data.location.phone;
  document.getElementById("reservation-phone").href =
    `tel:${data.location.phone.replace(/-/g, "")}`;
  document.getElementById("footer-year").textContent =
    new Date().getFullYear();
}

function getSeatLabel(seatTypes, seatId) {
  const seat = seatTypes.find((s) => s.id === seatId);
  return seat ? seat.label : seatId;
}

function validateForm(formData, seatTypes) {
  const errors = [];

  if (!formData.name.trim()) errors.push("お名前を入力してください。");
  if (!formData.phone.trim()) errors.push("電話番号を入力してください。");
  if (!formData.email.trim()) errors.push("メールアドレスを入力してください。");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.push("メールアドレスの形式が正しくありません。");
  }
  if (!formData.date) errors.push("ご来店日を選択してください。");
  if (!formData.time) errors.push("ご来店時間を選択してください。");
  if (!formData.party) errors.push("人数を選択してください。");
  if (!formData.seat) errors.push("席の種類を選択してください。");

  const selectedDate = new Date(formData.date + "T00:00:00");
  const day = selectedDate.getDay();
  if (day === 2) {
    errors.push("火曜日は定休日のためご予約いただけません。");
  }

  return errors;
}

function showError(message) {
  const el = document.getElementById("form-error");
  el.textContent = message;
  el.hidden = !message;
}

function saveReservation(reservation) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  existing.push(reservation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

function showConfirmation(reservation, seatTypes) {
  const formSection = document.querySelector(".reservation-layout");
  const panel = document.getElementById("confirmation-panel");
  const details = document.getElementById("confirmation-details");

  details.innerHTML = `
    <div class="confirmation-item">
      <dt>お名前</dt>
      <dd>${reservation.name}</dd>
    </div>
    <div class="confirmation-item">
      <dt>電話番号</dt>
      <dd>${reservation.phone}</dd>
    </div>
    <div class="confirmation-item">
      <dt>メール</dt>
      <dd>${reservation.email}</dd>
    </div>
    <div class="confirmation-item">
      <dt>ご来店日時</dt>
      <dd>${formatDateDisplay(reservation.date)} ${reservation.time}</dd>
    </div>
    <div class="confirmation-item">
      <dt>人数</dt>
      <dd>${reservation.party}名</dd>
    </div>
    <div class="confirmation-item">
      <dt>席</dt>
      <dd>${getSeatLabel(seatTypes, reservation.seat)}</dd>
    </div>
    ${reservation.requests ? `
    <div class="confirmation-item">
      <dt>ご要望</dt>
      <dd>${reservation.requests}</dd>
    </div>` : ""}
  `;

  document.getElementById("confirmation-id").textContent = reservation.id;
  formSection.hidden = true;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth" });
}

function resetToForm() {
  const formSection = document.querySelector(".reservation-layout");
  const panel = document.getElementById("confirmation-panel");
  const form = document.getElementById("reservation-form");

  form.reset();
  showError("");
  formSection.hidden = false;
  panel.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupForm(data) {
  const form = document.getElementById("reservation-form");
  const seatTypes = data.reservation.seatTypes;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showError("");

    const formData = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      date: form.date.value,
      time: form.time.value,
      party: form.party.value,
      seat: form.seat.value,
      requests: form.requests.value.trim(),
    };

    const errors = validateForm(formData, seatTypes);
    if (errors.length > 0) {
      showError(errors[0]);
      return;
    }

    const reservation = {
      id: generateReservationId(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    saveReservation(reservation);
    showConfirmation(reservation, seatTypes);
  });

  document.getElementById("new-reservation-btn").addEventListener("click", resetToForm);
}

async function init() {
  try {
    const data = await loadMockData();
    renderPageInfo(data);
    populateTimeSlots(data.reservation.timeSlots);
    populatePartyOptions(data.reservation.maxParty);
    populateSeatOptions(data.reservation.seatTypes);
    setupDateInput(data.reservation.advanceDays);
    setupForm(data);
  } catch (err) {
    console.error("Vesper Cafe:", err);
    showError("データの読み込みに失敗しました。ローカルサーバーで開いてください。");
  }
}

document.addEventListener("DOMContentLoaded", init);
