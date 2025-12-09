// App: Aconchego do Rei - Reserva simples (local)
const OWNER_WHATSAPP = "5511999999999"; // alterar para o número do proprietário com DDI+DDD+numero (ex: 5511999999999)
const DAILY_PRICE = 450.00; // valor da diária em R$
const MAX_PEOPLE = 10;
const YEAR = 2025;

let currentUser = null;
let selectedDate = null;
let reservations = JSON.parse(localStorage.getItem('acre_reservations') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('daily-price').innerText = formatCurrency(DAILY_PRICE);
  document.getElementById('price').innerText = formatCurrency(DAILY_PRICE);
  loadAuth();
  renderCalendar();
  bindEvents();
  renderMyReservations();
});

function formatCurrency(v){ return 'R$ ' + v.toFixed(2).replace('.',','); }

function loadAuth(){
  const stored = JSON.parse(localStorage.getItem('acre_user') || 'null');
  if(stored){ currentUser = stored; showLoggedIn(); }
}

function bindEvents(){
  document.getElementById('btn-login').addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if(!name || !phone){ alert('Preencha nome e telefone'); return; }
    currentUser = { name, phone };
    localStorage.setItem('acre_user', JSON.stringify(currentUser));
    showLoggedIn();
    renderMyReservations();
  });

  document.getElementById('btn-pay').addEventListener('click', () => {
    if(!selectedDate){ alert('Selecione uma data antes de gerar PIX'); return; }
    // aqui apenas mostramos instruções e o pix já exibido na página
    alert('Para garantir a reserva, envie o sinal via PIX para a chave exibida na página. Depois confirme a reserva.');
  });

  document.getElementById('btn-confirm').addEventListener('click', () => {
    if(!currentUser){ alert('Faça login antes de reservar'); return; }
    if(!selectedDate){ alert('Selecione uma data'); return; }
    const people = Number(document.getElementById('people').value) || 1;
    if(people < 1 || people > MAX_PEOPLE){ alert('Número de pessoas inválido'); return; }

    // checar se já reservado
    if(reservations.some(r => r.date === selectedDate)){ alert('Data já reservada'); return; }

    const total = DAILY_PRICE;

    const reservation = {
      id: Date.now(),
      date: selectedDate,
      name: currentUser.name,
      phone: currentUser.phone,
      people,
      total
    };

    reservations.push(reservation);
    localStorage.setItem('acre_reservations', JSON.stringify(reservations));
    renderCalendar();
    renderMyReservations();
    sendWhatsAppNotification(reservation);
    alert('Reserva confirmada! Uma mensagem será aberta para enviar ao proprietário via WhatsApp.');
  });
}

function showLoggedIn(){
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('calendar-section').classList.remove('hidden');
  document.getElementById('my-reservations').classList.remove('hidden');
}

function renderCalendar(){
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  // Mostrar todo o ano como lista de dias (simplificado): dia/mês
  for(let m=0;m<12;m++){
    const days = new Date(YEAR, m+1, 0).getDate();
    for(let d=1; d<=days; d++){
      const fullDate = `${String(d).padStart(2,'0')}/${String(m+1).padStart(2,'0')}/${YEAR}`;
      const div = document.createElement('div');
      div.className = 'day';
      div.dataset.date = fullDate;
      div.innerHTML = `<div>${d}</div><small>${getWeekdayName(new Date(YEAR,m,d))}</small><div style="font-size:12px">${formatCurrency(DAILY_PRICE)}</div>`;
      if(reservations.some(r => r.date === fullDate)){
        div.classList.add('reserved');
      } else {
        div.addEventListener('click', () => selectDate(fullDate, div));
      }
      if(selectedDate === fullDate) div.classList.add('selected');
      calendar.appendChild(div);
    }
  }
}

function getWeekdayName(date){
  const names = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  return names[date.getDay()];
}

function selectDate(date, element){
  // desmarcar anterior
  document.querySelectorAll('.day.selected').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');
  selectedDate = date;
  document.getElementById('selected-date').innerText = date;
  document.getElementById('reservation-panel').classList.remove('hidden');
  document.getElementById('total-price').innerText = formatCurrency(DAILY_PRICE);
}

function renderMyReservations(){
  const list = document.getElementById('reservations-list');
  list.innerHTML = '';
  const userRes = reservations.filter(r => currentUser && r.phone === currentUser.phone);
  if(userRes.length===0){ list.innerHTML = '<li>Nenhuma reserva encontrada</li>'; return; }
  userRes.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${r.date}</strong> — ${r.name} (${r.people} pessoa(s)) — ${formatCurrency(r.total)} <button data-id="${r.id}">Cancelar</button>`;
    list.appendChild(li);
    li.querySelector('button').addEventListener('click', () => cancelReservation(r.id));
  });
}

function cancelReservation(id){
  if(!confirm('Deseja cancelar essa reserva?')) return;
  reservations = reservations.filter(r => r.id !== id);
  localStorage.setItem('acre_reservations', JSON.stringify(reservations));
  renderCalendar();
  renderMyReservations();
  alert('Reserva cancelada.');
}

function sendWhatsAppNotification(reservation){
  const msg = `Aconchego do Rei - Nova reserva%0A%0AData: ${reservation.date}%0ACliente: ${reservation.name}%0ATelefone: ${reservation.phone}%0APessoas: ${reservation.people}%0ATotal: R$ ${reservation.total.toFixed(2).replace('.',',')}%0A%0APix: Ver na página do sistema`;
  const url = `https://wa.me/${OWNER_WHATSAPP}?text=${msg}`;
  window.open(url, '_blank');
}
