let contadorFijos = 0;
let contadorVariables = 0;

function agregarGastoFijo(nombre = '', monto = '') {
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" placeholder="Nombre del gasto fijo" id="fijoNombre${contadorFijos}" value="${nombre}" />
    <input type="number" placeholder="Monto" id="fijoMonto${contadorFijos}" value="${monto}" oninput="actualizarSaldoDisponible()" />
  `;
  document.getElementById('gastosFijos').appendChild(div);
  contadorFijos++;
  actualizarSaldoDisponible();
}

function agregarGastoVariable(nombre = '', porcentaje = '') {
  const div = document.createElement('div');
  div.innerHTML = `
    <input type="text" placeholder="Nombre del gasto variable" id="variableNombre${contadorVariables}" value="${nombre}" />
    <input type="number" placeholder="% del saldo disponible" id="variablePorcentaje${contadorVariables}" value="${porcentaje}" oninput="actualizarPorcentajeDisponible()" />
  `;
  document.getElementById('gastosVariables').appendChild(div);
  contadorVariables++;
  actualizarPorcentajeDisponible();
}

function actualizarSaldoDisponible() {
  const ingreso = parseFloat(document.getElementById('ingreso').value) || 0;
  let total = 0;
  for (let i = 0; i < contadorFijos; i++) {
    const monto = parseFloat(document.getElementById(`fijoMonto${i}`)?.value) || 0;
    total += monto;
  }
  document.getElementById('saldoDisponible').innerText = `Dinero disponible después de gastos fijos: $${(ingreso - total).toFixed(2)}`;
}

function actualizarPorcentajeDisponible() {
  let total = 0;
  for (let i = 0; i < contadorVariables; i++) {
    const val = parseFloat(document.getElementById(`variablePorcentaje${i}`)?.value) || 0;
    total += val;
  }
  document.getElementById('porcentajeDisponible').innerText = `Porcentaje disponible para variables: ${(100 - total).toFixed(2)}%`;
}

function guardarConfiguracion() {
  let fijos = [], variables = [];
  for (let i = 0; i < contadorFijos; i++) {
    const n = document.getElementById(`fijoNombre${i}`)?.value;
    const m = document.getElementById(`fijoMonto${i}`)?.value;
    if (n && m) fijos.push({ nombre: n, monto: m });
  }
  for (let i = 0; i < contadorVariables; i++) {
    const n = document.getElementById(`variableNombre${i}`)?.value;
    const p = document.getElementById(`variablePorcentaje${i}`)?.value;
    if (n && p) variables.push({ nombre: n, porcentaje: p });
  }
  localStorage.setItem('gastosFijos', JSON.stringify(fijos));
  localStorage.setItem('gastosVariables', JSON.stringify(variables));
}

function cargarConfiguracion() {
  const fijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];
  const variables = JSON.parse(localStorage.getItem('gastosVariables')) || [];
  fijos.forEach(g => agregarGastoFijo(g.nombre, g.monto));
  variables.forEach(g => agregarGastoVariable(g.nombre, g.porcentaje));
}

function mostrarModalBorrar() {
  const lista = document.getElementById('listaBorrar');
  lista.innerHTML = '';
  const fijos = JSON.parse(localStorage.getItem('gastosFijos')) || [];
  const variables = JSON.parse(localStorage.getItem('gastosVariables')) || [];

  fijos.forEach((g, i) => {
    const item = document.createElement('div');
    item.className = 'lista-item';
    item.innerText = `💸 Fijo: ${g.nombre}`;
    item.onclick = () => {
      fijos.splice(i, 1);
      localStorage.setItem('gastosFijos', JSON.stringify(fijos));
      location.reload();
    };
    lista.appendChild(item);
  });

  variables.forEach((g, i) => {
    const item = document.createElement('div');
    item.className = 'lista-item';
    item.innerText = `📊 Variable: ${g.nombre}`;
    item.onclick = () => {
      variables.splice(i, 1);
      localStorage.setItem('gastosVariables', JSON.stringify(variables));
      location.reload();
    };
    lista.appendChild(item);
  });

  document.getElementById('modalBorrar').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modalBorrar').classList.add('hidden');
}

function borrarTodo() {
  localStorage.clear();
  location.reload();
}

document.getElementById('gastoForm').addEventListener('submit', e => {
  e.preventDefault();
  const ingreso = parseFloat(document.getElementById('ingreso').value);
  if (!ingreso || ingreso <= 0) return alert("Ingrese un ingreso válido");

  let totalFijos = 0;
  let fijos = [];
  for (let i = 0; i < contadorFijos; i++) {
    const n = document.getElementById(`fijoNombre${i}`).value || `Fijo ${i+1}`;
    const m = parseFloat(document.getElementById(`fijoMonto${i}`).value) || 0;
    totalFijos += m;
    fijos.push({ nombre: n, monto: m });
  }

  const saldo = ingreso - totalFijos;
  let totalVars = 0;
  let variables = [];
  for (let i = 0; i < contadorVariables; i++) {
    const n = document.getElementById(`variableNombre${i}`).value || `Variable ${i+1}`;
    const p = parseFloat(document.getElementById(`variablePorcentaje${i}`).value) || 0;
    const m = saldo * p / 100;
    totalVars += m;
    variables.push({ nombre: n, porcentaje: p, monto: m });
  }

  const restante = ingreso - (totalFijos + totalVars);

  guardarConfiguracion();

  let html = `<h2>Resumen</h2><table class="tabla"><tr><th>Gasto</th><th>Tipo</th><th>Monto</th></tr>`;
  fijos.forEach(g => html += `<tr><td>${g.nombre}</td><td>Fijo</td><td>$${g.monto.toFixed(2)}</td></tr>`);
  variables.forEach(g => html += `<tr><td>${g.nombre} (${g.porcentaje}%)</td><td>Variable</td><td>$${g.monto.toFixed(2)}</td></tr>`);
  html += `<tr><th>Total</th><td></td><th>$${(totalFijos + totalVars).toFixed(2)}</th></tr>`;
  html += `<tr><th>Restante</th><td></td><th>$${restante.toFixed(2)}</th></tr></table>`;
  document.getElementById('resultado').innerHTML = html;
});

document.getElementById('btnBorrar').addEventListener('click', mostrarModalBorrar);

window.onload = cargarConfiguracion;