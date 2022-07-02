let circuits, circuit;

fetch('./json/circuits.json')
    .then(response => response.json())
    .then(data => circuits = data)
    .catch((error) => Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error
    }));

const dropMenu = document.getElementById("dropMenu"),
    circuitInfo = document.getElementById("circuitInfo"),
    tableTitle = document.getElementById("tableTitle"),
    tableHead = document.getElementById("tableHead"),
    tableBody = document.getElementById("tableBody"),
    btnCalc = document.getElementById("btnCalc"),
    btnClear = document.getElementById("btnClear");

const toMinutes = (time) =>{
    let minutes = Math.floor(time);
    let seconds = Math.floor(time % 1 * 100) * 60 / 100;
    return {min: minutes, sec: seconds}
};

const createDropMenuItem = () =>{
    let html = "";
    circuits.forEach(element => {
        html += `<li><input type="button" class="dropdown-item selectors" id="${element.id}" value="${element.circuit} / Gran Premio de ${element.grandPrix}"></li>`
    });
    dropMenu.innerHTML = html;
};

const userSelection = () =>{
    const selectors = document.querySelectorAll(".selectors");
    selectors.forEach(selector => {
        selector.addEventListener("click", (event)=>{
            circuit = circuits.find(element => element.id === event.target?.id);
            createCircuitInfo();
            createTable();
            createTimeInputs();
        });
    });
};

const createCircuitInfo = () =>{
    let raceHtml = ""
    raceHtml = `
    <p class="text">${circuit.circuit} | Gran Premio de ${circuit.grandPrix}</p>
    <p class="text">Vueltas: ${circuit.laps}</p>
    <p class="text">Longitud: ${circuit.length}km</p>
    <p class="text">Mejor tiempo en vuelta: ${circuit.bestLapTime} min</p>
    <p class="text">Piloto: ${circuit.pilot}</p>`;

    circuitInfo.innerHTML = raceHtml;
}

const createTable = () =>{
    let headHtml = "", titleHtml = "";
    titleHtml = `
    <h3 class="text text-subtitle">Ingresa los tiempos en cada vuelta (En minutos)</h3>`
    headHtml = `
        <tr>
            <th scope="col"></th>
            <th scope="col">Tiempo</th>
            <th scope="col">+/-</th>
            <th scope="col">Tiempo</th>
            <th scope="col">+/-</th>
            <th scope="col">Tiempo</th>
            <th scope="col">+/-</th>
            <th scope="col">Tiempo</th>
            <th scope="col">+/-</th>
            <th scope="col">Tiempo</th>
            <th scope="col">+/-</th>
        </tr>`

    tableTitle.innerHTML = titleHtml;
    tableHead.innerHTML = headHtml;
}

const createTimeInputs = () =>{
    let bodyHtml = "";

    for (let i = 0, j = 0; i < circuit.laps; i++, j++) {
        let aux = i+1 < 10 ? `0${i+1}` : i+1;
        if (j == 5 || j == 0) {
            j = 0;
            bodyHtml += `
            <tr>
                <th>Vuelta</th>
                <td><span>#${aux} </span><input type="number" class="inputTimes" id="in${i+1}"></td>
                <td id="ti${i+1}">+00:00</td>`
        }
        else{
            bodyHtml += `
            <td><span>#${aux} </span><input type="number" class="inputTimes" id="in${i+1}"></td>
            <td id="ti${i+1}">+00:00</td>`
        }
    }
    tableBody.innerHTML = bodyHtml;
};

const calc = () =>{
    btnCalc.addEventListener("click", () =>{
        if (circuit) {
            let array = [];
            for (let i = 0; i < circuit.laps; i++) {
            let inputUser = document.getElementById(`in${i+1}`);
            array.push(inputUser.value);
        };
        checkTimeInputs(array);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Debes seleccionar un circuito"
            });
        }
    });
};

const checkTimeInputs = (array) => {
    if (array.includes('')) {
        Swal.fire({
            icon: 'error',
            title: 'Ingreso Incorrecto',
            text: "Por favor, rellena todos los campos"
        });
    }else if(array.find(element => element <= 0)){
        Swal.fire({
            icon: 'error',
            title: 'Ingreso Incorrecto',
            text: "Por favor, utiliza numeros positivos"
        });
    } else{
        readTimeInputs(array);
        timeVariation(array);
    }
};

class Race {
    constructor(circuit, total, best, worst, mean){
        this.circuitName = circuit;
        this.totalTime = total;
        this.bestTime = best;
        this.worstTime = worst;
        this.meanTime = mean;
    };
};

const readTimeInputs = (array) => {
    const circuitName = `${circuit.circuit} | Gran Premio de ${circuit.grandPrix}`;
    const totalTime = array.reduce((acc, curr) => (+acc) + (+curr));
    const bestTime = Math.min(...array);
    const worstTime = Math.max(...array);
    const meanTime = totalTime / circuit.laps;

    const race = new Race(circuitName, totalTime, bestTime, worstTime, meanTime);
    writeCircuitInfo(race);
    saveLS(race);
};

const timeVariation = (array) =>{
    for (let i = 0; i < array.length; i++) {
        const ti = document.getElementById(`ti${i+1}`);
        let variation = array[i-1] - array[i];
        if (i == 0) {
            ti.innerHTML = `${toMinutes(array[i]).min}:${toMinutes(array[i]).sec}`
        } else {
            if (variation > 0) {
                ti.innerHTML = `<span class="green">-${toMinutes(variation).min}:${toMinutes(variation).sec}</span>`
            }
            if (variation == 0) {
                ti.innerHTML = `<span>${toMinutes(variation).min}:${toMinutes(variation).sec}</span>`
            }
            if (variation < 0) {
                ti.innerHTML = `<span class="red">+${toMinutes(Math.abs(variation)).min}:${toMinutes(Math.abs(variation)).sec}</span>`
            }
        }
    }
}

const writeCircuitInfo = (race) =>{
    let raceHtml = `
    <p class="text">${race.circuitName}</p>
    <p class="text">Tiempo total: ${toMinutes(race.totalTime).min}:${toMinutes(race.totalTime).sec} min</p>
    <p class="text">Mejor vuelta: ${toMinutes(race.bestTime).min}:${toMinutes(race.bestTime).sec} min</p>
    <p class="text">Peor vuelta: ${toMinutes(race.worstTime).min}:${toMinutes(race.worstTime).sec} min</p>
    <p class="text">Tiempo promedio por vuelta: ${toMinutes(race.meanTime).min}:${toMinutes(race.meanTime).sec} min</p>
    `;
    circuitInfo.innerHTML = raceHtml;
};

const saveLS = (race) => {
    localStorage.setItem("race", JSON.stringify(race));
    localStorage.setItem("circuit", JSON.stringify(circuit));
}

const loadLS = () =>{
    const lsRace = JSON.parse(localStorage.getItem("race"));
    circuit = JSON.parse(localStorage.getItem("circuit"));
    if(lsRace && circuit){
        writeCircuitInfo(lsRace);
        createTable();
        createTimeInputs();
    }
};

const reset = () =>{
    btnClear.addEventListener("click", ()=>{
        circuit = null;
        circuitInfo.innerHTML = `<p class="text" id="text">Elige un circuito</p>
        <img src="img/F1-logo-2.png" class="f1-img" alt="formula 1">`
        tableTitle.innerHTML = "";
        tableHead.innerHTML = "";
        tableBody.innerHTML = "";
        localStorage.removeItem("race");
        localStorage.removeItem("circuit");
    });
}

const main = () =>{
    setTimeout(() => {
        createDropMenuItem();
        userSelection();
    }, 500);
    loadLS();
    calc();
    reset();
}

main();
