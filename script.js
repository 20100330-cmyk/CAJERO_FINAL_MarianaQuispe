
let cuentas = [
    { nombre: "Mali", saldo: 200, password: "1234", dni: 44788834 },
    { nombre: "Gera", saldo: 150, password: "5678", dni: 10247439 },
    { nombre: "Sabi", saldo: 60,  password: "9102", dni: 98005362 }
];

let cuentaActual = null;
let montoDepositoAcumulado = 0;
let montoRetiroAcumulado = 0;


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'beep') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'error') {
        osc.frequency.setValueAtTime(250, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === 'cash') {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const subOsc = audioCtx.createOscillator();
                const subGain = audioCtx.createGain();
                subOsc.connect(subGain);
                subGain.connect(audioCtx.destination);
                subOsc.frequency.setValueAtTime(400 + i * 100, audioCtx.currentTime);
                subGain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                subOsc.start();
                subOsc.stop(audioCtx.currentTime + 0.08);
            }, i * 90);
        }
    }
}


function ocultarTodasLasPantallas() {
    const pantallas = ['logeo', 'menu', 'depositar', 'saldo', 'retirar', 'gracias'];
    pantallas.forEach(clase => {
        const el = document.querySelector('.' + clase);
        if (el) el.classList.add('hidden');
    });
    limpiarAlertas();
}

function limpiarAlertas() {
    ['logeo-error', 'deposito-msg', 'retiro-msg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            el.innerText = '';
        }
    });
}

// ---------------- JUEGO DE PANTALLAS ----------------

function resetLogeo() {
    ocultarTodasLasPantallas();
    document.querySelector('.logeo').classList.remove('hidden');
    document.getElementById('login-options').classList.remove('hidden');
    document.getElementById('dni-form').classList.add('hidden');
    document.getElementById('accounts-form').classList.add('hidden');
    document.getElementById('pin-form').classList.add('hidden');
    
    document.getElementById('bank-card').classList.remove('card-inserted');
    cuentaActual = null;
}

function showDniForm() {
    playSound('beep');
    document.getElementById('login-options').classList.add('hidden');
    document.getElementById('dni-form').classList.remove('hidden');
    document.getElementById('input-dni').value = '';
}

function showAccountList() {
    playSound('beep');
    document.getElementById('login-options').classList.add('hidden');
    const container = document.getElementById('accounts-buttons');
    container.innerHTML = '';
    
    cuentas.forEach(acc => {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.innerText = acc.nombre;
        btn.onclick = () => seleccionarCuenta(acc);
        container.appendChild(btn);
    });
    
    document.getElementById('accounts-form').classList.remove('hidden');
}

function seleccionarCuenta(acc) {
    playSound('beep');
    cuentaActual = acc;
    pedirPIN();
}

function validarDNI() {
    const dniVal = parseInt(document.getElementById('input-dni').value);
    const encontrado = cuentas.find(c => c.dni === dniVal);
    
    if (encontrado) {
        playSound('beep');
        cuentaActual = encontrado;
        pedirPIN();
    } else {
        playSound('error');
        mostrarError('logeo-error', 'DNI no registrado. Intente nuevamente.');
    }
}

function pedirPIN() {
    document.getElementById('dni-form').classList.add('hidden');
    document.getElementById('accounts-form').classList.add('hidden');
    document.getElementById('pin-form').classList.remove('hidden');
    document.getElementById('welcome-user').innerText = `Hola, ${cuentaActual.nombre}`;
    document.getElementById('input-pin').value = '';
    document.getElementById('bank-card').classList.add('card-inserted');
}

function validarPIN() {
    const pinVal = document.getElementById('input-pin').value;
    if (pinVal === cuentaActual.password) {
        playSound('beep');
        irAMenu();
    } else {
        playSound('error');
        mostrarError('logeo-error', 'Clave incorrecta. Intente nuevamente.');
    }
}


function irAMenu() {
    ocultarTodasLasPantallas();
    document.querySelector('.menu').classList.remove('hidden');
    document.getElementById('menu-user-name').innerText = `Usuario: ${cuentaActual.nombre}`;
}


function irADepositar() {
    playSound('beep');
    ocultarTodasLasPantallas();
    document.querySelector('.depositar').classList.remove('hidden');
    limpiarMontoDeposito();
    document.getElementById('cash-animation').classList.add('hidden');
}

function agregarMontoDeposito(monto) {
    playSound('beep');
    montoDepositoAcumulado += monto;
    document.getElementById('input-deposito').value = montoDepositoAcumulado;
}

function limpiarMontoDeposito() {
    montoDepositoAcumulado = 0;
    document.getElementById('input-deposito').value = '';
}

function procesarDeposito() {
    if (montoDepositoAcumulado <= 0) {
        playSound('error');
        mostrarError('deposito-msg', 'Seleccione al menos un billete.');
        return;
    }

    cuentaActual.saldo += montoDepositoAcumulado;
    playSound('cash');
    document.getElementById('cash-animation').classList.remove('hidden');
    
    mostrarExito('deposito-msg', `Ingreso exitoso: +S/ ${montoDepositoAcumulado}. Nuevo saldo: S/ ${cuentaActual.saldo.toFixed(2)}`);
    montoDepositoAcumulado = 0;
    document.getElementById('input-deposito').value = '';
}


function irASaldo() {
    playSound('beep');
    ocultarTodasLasPantallas();
    document.querySelector('.saldo').classList.remove('hidden');
    document.getElementById('saldo-monto').innerText = `S/ ${cuentaActual.saldo.toFixed(2)}`;
}


function irARetirar() {
    playSound('beep');
    ocultarTodasLasPantallas();
    document.querySelector('.retirar').classList.remove('hidden');
    limpiarMontoRetiro();
    document.getElementById('retiro-cash-animation').classList.add('hidden');
}

function agregarMontoRetiro(monto) {
    playSound('beep');
    montoRetiroAcumulado += monto;
    document.getElementById('input-retiro').value = montoRetiroAcumulado;
}

function limpiarMontoRetiro() {
    montoRetiroAcumulado = 0;
    document.getElementById('input-retiro').value = '';
}

function procesarRetiro() {
    if (montoRetiroAcumulado <= 0) {
        playSound('error');
        mostrarError('retiro-msg', 'Seleccione al menos un billete.');
        return;
    }

    if (cuentaActual.saldo - montoRetiroAcumulado < 0) {
        playSound('error');
        mostrarError('retiro-msg', `Fondos insuficientes. Saldo actual: S/ ${cuentaActual.saldo.toFixed(2)}`);
        return;
    }

    cuentaActual.saldo -= montoRetiroAcumulado;
    playSound('cash');
    document.getElementById('retiro-cash-animation').classList.remove('hidden');
    
    mostrarExito('retiro-msg', `Retiro exitoso: -S/ ${montoRetiroAcumulado}. Nuevo saldo: S/ ${cuentaActual.saldo.toFixed(2)}`);
    montoRetiroAcumulado = 0;
    document.getElementById('input-retiro').value = '';
}


function irAGracias() {
    playSound('beep');
    ocultarTodasLasPantallas();
    document.querySelector('.gracias').classList.remove('hidden');
    document.getElementById('bank-card').classList.remove('card-inserted');
}

function reiniciarCajero() {
    playSound('beep');
    resetLogeo();
}

function mostrarError(id, msg) {
    const el = document.getElementById(id);
    el.innerText = msg;
    el.className = 'alert-msg alert-error';
    el.classList.remove('hidden');
}

function mostrarExito(id, msg) {
    const el = document.getElementById(id);
    el.innerText = msg;
    el.className = 'alert-msg alert-success';
    el.classList.remove('hidden');
}

window.onload = resetLogeo;