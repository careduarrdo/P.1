"use strict";

// Chave usada para armazenar os agendamentos no navegador.
const STORAGE_KEY = "barbeariaBlackAppointments";

// IMPORTANTE: substitua pelo número real da barbearia.
// Use código do país + DDD + número, apenas dígitos. Ex.: 5511999999999.
const WHATSAPP_NUMBER = "5511999999999";

const form = document.querySelector("#bookingForm");
const formMessage = document.querySelector("#formMessage");
const confirmation = document.querySelector("#confirmation");
const confirmationData = document.querySelector("#confirmationData");
const whatsappButton = document.querySelector("#whatsappButton");
const appointmentsList = document.querySelector("#appointmentsList");
const menuButton = document.querySelector("#menuButton");
const navLinks = document.querySelector("#navLinks");
const header = document.querySelector(".header");

const fields = {
  clientName: document.querySelector("#clientName"),
  phone: document.querySelector("#phone"),
  service: document.querySelector("#service"),
  barber: document.querySelector("#barber"),
  date: document.querySelector("#date"),
  time: document.querySelector("#time"),
  fade: document.querySelector("#fade"),
  sides: document.querySelector("#sides"),
  top: document.querySelector("#top"),
  beard: document.querySelector("#beard"),
  eyebrow: document.querySelector("#eyebrow"),
  specifications: document.querySelector("#specifications"),
  notes: document.querySelector("#notes")
};

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function formatDate(value) {
  if (!value || !value.includes("-")) return value || "Não informado";
  const [year, month, day] = value.split("-");
  return day + "/" + month + "/" + year;
}

function getAppointments() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Erro ao ler os agendamentos:", error);
    return [];
  }
}

function saveAppointments(appointments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    return true;
  } catch (error) {
    console.error("Erro ao salvar os agendamentos:", error);
    return false;
  }
}

function showMessage(text, type = "error") {
  formMessage.textContent = text;
  formMessage.className = "form-message show " + (type === "success" ? "success-message" : "error-message");
}

function clearMessage() {
  formMessage.textContent = "";
  formMessage.className = "form-message";
}

function errorElement(field) {
  return field.closest(".field")?.querySelector(".error");
}

function setError(field, message) {
  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
  const element = errorElement(field);
  if (element) element.textContent = message;
}

function clearError(field) {
  field.classList.remove("invalid");
  field.removeAttribute("aria-invalid");
  const element = errorElement(field);
  if (element) element.textContent = "";
}

function phoneDigits(value) {
  return value.replace(/\D/g, "");
}

function formatPhone(event) {
  let value = phoneDigits(event.target.value).slice(0, 11);
  if (value.length > 10) value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  else if (value.length > 6) value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  else if (value.length > 2) value = value.replace(/(\d{2})(\d+)/, "($1) $2");
  else if (value.length) value = value.replace(/(\d{0,2})/, "($1");
  event.target.value = value;
}

function validateForm() {
  Object.values(fields).forEach(clearError);
  clearMessage();
  let valid = true;
  let firstInvalid = null;
  const required = {
    clientName: "Informe nome e sobrenome.", phone: "Informe seu telefone.", service: "Selecione um serviço.", barber: "Selecione um barbeiro.", date: "Selecione uma data.", time: "Selecione um horário.", fade: "Selecione o tipo de degradê.", sides: "Selecione a opção das laterais.", top: "Selecione a parte de cima.", beard: "Selecione uma opção para a barba.", eyebrow: "Selecione uma opção para a sobrancelha.", specifications: "Descreva como deseja o corte."
  };
  Object.entries(required).forEach(([name, message]) => {
    if (!fields[name].value.trim()) {
      setError(fields[name], message); valid = false; firstInvalid ??= fields[name];
    }
  });
  if (fields.clientName.value.trim() && fields.clientName.value.trim().split(/\s+/).length < 2) {
    setError(fields.clientName, "Informe nome e sobrenome."); valid = false; firstInvalid ??= fields.clientName;
  }
  const digits = phoneDigits(fields.phone.value);
  if (fields.phone.value && ![10, 11].includes(digits.length)) {
    setError(fields.phone, "Use DDD e um telefone com 10 ou 11 dígitos."); valid = false; firstInvalid ??= fields.phone;
  }
  if (fields.date.value && fields.date.value < todayString()) {
    setError(fields.date, "A data não pode estar no passado."); valid = false; firstInvalid ??= fields.date;
  }
  if (fields.specifications.value.trim() && fields.specifications.value.trim().length < 10) {
    setError(fields.specifications, "Use pelo menos 10 caracteres."); valid = false; firstInvalid ??= fields.specifications;
  }
  if (!valid) {
    showMessage("Revise os campos destacados antes de continuar.");
    firstInvalid?.focus();
  }
  return valid;
}

function collectData() {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2),
    createdAt: new Date().toISOString(),
    clientName: fields.clientName.value.trim(), phone: fields.phone.value.trim(), service: fields.service.value,
    barber: fields.barber.value, date: fields.date.value, time: fields.time.value, fade: fields.fade.value,
    sides: fields.sides.value, top: fields.top.value, beard: fields.beard.value, eyebrow: fields.eyebrow.value,
    specifications: fields.specifications.value.trim(), notes: fields.notes.value.trim() || "Nenhuma observação."
  };
}

function hasConflict(appointment, appointments) {
  return appointments.some(item => item.barber === appointment.barber && item.date === appointment.date && item.time === appointment.time);
}

function whatsappLink(appointment) {
  const message = [
    "Olá! Gostaria de confirmar meu agendamento na Barbearia Black.", "",
    "Cliente: " + appointment.clientName, "Telefone: " + appointment.phone, "Serviço: " + appointment.service,
    "Barbeiro: " + appointment.barber, "Data: " + formatDate(appointment.date), "Horário: " + appointment.time, "",
    "Detalhes do corte:", "Degradê: " + appointment.fade, "Laterais: " + appointment.sides,
    "Parte de cima: " + appointment.top, "Barba: " + appointment.beard, "Sobrancelha: " + appointment.eyebrow, "",
    "Especificações:", appointment.specifications, "", "Observações:", appointment.notes
  ].join("\n");
  return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
}

function confirmationItem(label, value, full = false) {
  return '<div class="confirmation-item' + (full ? ' full' : '') + '"><span>' + escapeHTML(label) + '</span><p>' + escapeHTML(value) + '</p></div>';
}

function showConfirmation(appointment) {
  confirmationData.innerHTML = [
    confirmationItem("Cliente", appointment.clientName), confirmationItem("Serviço", appointment.service),
    confirmationItem("Barbeiro", appointment.barber), confirmationItem("Data", formatDate(appointment.date)),
    confirmationItem("Horário", appointment.time), confirmationItem("Tipo de degradê", appointment.fade),
    confirmationItem("Laterais", appointment.sides), confirmationItem("Parte de cima", appointment.top),
    confirmationItem("Barba", appointment.beard), confirmationItem("Sobrancelha", appointment.eyebrow),
    confirmationItem("Especificações", appointment.specifications, true), confirmationItem("Observações", appointment.notes, true)
  ].join("");
  whatsappButton.href = whatsappLink(appointment);
  confirmation.hidden = false;
}

function renderAppointments() {
  const appointments = getAppointments().sort((a, b) => (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time));
  if (!appointments.length) {
    appointmentsList.innerHTML = '<div class="empty"><span>✂</span><h3>Nenhum agendamento salvo</h3><p>Seus próximos horários aparecerão aqui.</p><a class="button secondary" href="#agendamento">Agendar agora</a></div>';
    return;
  }
  appointmentsList.innerHTML = appointments.map(item =>
    '<article class="appointment-card">' +
      '<header><div><h3>' + escapeHTML(item.service) + '</h3><p>' + escapeHTML(formatDate(item.date)) + ' às ' + escapeHTML(item.time) + '</p></div><span class="status">Confirmado</span></header>' +
      '<div class="appointment-row"><span>Cliente</span><strong>' + escapeHTML(item.clientName) + '</strong></div>' +
      '<div class="appointment-row"><span>Barbeiro</span><strong>' + escapeHTML(item.barber) + '</strong></div>' +
      '<details class="appointment-details"><summary>Detalhes do corte</summary><p><strong>Degradê:</strong> ' + escapeHTML(item.fade) + '</p><p><strong>Laterais:</strong> ' + escapeHTML(item.sides) + '</p><p><strong>Parte de cima:</strong> ' + escapeHTML(item.top) + '</p><p><strong>Barba:</strong> ' + escapeHTML(item.beard) + '</p><p><strong>Sobrancelha:</strong> ' + escapeHTML(item.eyebrow) + '</p><p><strong>Especificações:</strong> ' + escapeHTML(item.specifications) + '</p><p><strong>Observações:</strong> ' + escapeHTML(item.notes) + '</p></details>' +
      '<button class="cancel" type="button" data-id="' + escapeHTML(item.id) + '">Cancelar agendamento</button>' +
    '</article>'
  ).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validateForm()) return;
  const appointment = collectData();
  const appointments = getAppointments();
  if (hasConflict(appointment, appointments)) {
    showMessage("Esse barbeiro já possui um agendamento nessa data e horário. Escolha outro horário ou profissional.");
    fields.time.focus(); return;
  }
  appointments.push(appointment);
  if (!saveAppointments(appointments)) {
    showMessage("Não foi possível salvar. Verifique se o navegador permite armazenamento local."); return;
  }
  showConfirmation(appointment);
  renderAppointments();
  showMessage("Agendamento salvo com sucesso!", "success");
  form.reset();
  fields.date.min = todayString();
  confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
});

appointmentsList.addEventListener("click", event => {
  const button = event.target.closest(".cancel");
  if (!button) return;
  if (!window.confirm("Deseja realmente cancelar este agendamento?")) return;
  const updated = getAppointments().filter(item => item.id !== button.dataset.id);
  if (saveAppointments(updated)) {
    renderAppointments();
    if (!updated.length) confirmation.hidden = true;
  }
});

fields.phone.addEventListener("input", formatPhone);
Object.values(fields).forEach(field => field.addEventListener("input", () => clearError(field)));
document.querySelectorAll(".choose-service").forEach(button => button.addEventListener("click", () => {
  fields.service.value = button.dataset.service;
  clearError(fields.service);
  document.querySelector("#agendamento").scrollIntoView({ behavior: "smooth" });
}));

function closeMenu() {
  navLinks.classList.remove("active"); menuButton.classList.remove("active"); menuButton.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-open");
}
menuButton.addEventListener("click", () => {
  const open = navLinks.classList.toggle("active"); menuButton.classList.toggle("active", open); menuButton.setAttribute("aria-expanded", String(open)); document.body.classList.toggle("menu-open", open);
});
navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 30));

const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: .12 }) : null;
document.querySelectorAll(".reveal").forEach(element => observer ? observer.observe(element) : element.classList.add("visible"));

fields.date.min = todayString();
document.querySelector("#year").textContent = new Date().getFullYear();
renderAppointments();