"use strict";

const patientTypeSelect = document.getElementById("patient-type");
const holterFieldsDiv = document.getElementById("holter-fields");
const ECGFieldsDiv = document.getElementById("ekg-fields");
const patientForm = document.getElementById("patient-form");
const tableBody = document.querySelector("#patient-table tbody");

patientTypeSelect.addEventListener("change", function () {
  const selectedValue = patientTypeSelect.value;
  if (selectedValue === "holter") {
    holterFieldsDiv.style.display = "block";
    ECGFieldsDiv.style.display = "none";
  } else if (selectedValue === "ekg") {
    holterFieldsDiv.style.display = "none";
    ECGFieldsDiv.style.display = "block";
  } else {
    holterFieldsDiv.style.display = "none";
    ECGFieldsDiv.style.display = "none";
  }
});

class Patient {
  constructor(fullName, age, diagnosis, isEmergency) {
    this._fullName = fullName;
    this._age = age;
    this._diagnosis = diagnosis;
    this._isEmergency = isEmergency;
    this._type = "Patient";
  }
  get fullName() {
    return this._fullName;
  }
  get age() {
    return this._age;
  }
  get diagnosis() {
    return this._diagnosis;
  }
  get isEmergency() {
    return this._isEmergency;
  }
  set fullName(value) {
    this._fullName = value;
  }
  set age(value) {
    this._age = value;
  }
  set diagnosis(value) {
    this._diagnosis = value;
  }
  set isEmergency(value) {
    this._isEmergency = value;
  }
  getInfo() {
    return `${this._fullName}, ${this._age} лет, ${this._diagnosis}(${this._isEmergency ? "экстренный" : "плановый"})`;
  }
  delete() {
    console.log(`Пациент ${this._fullName} удалён`);
  }
}

class holterPatient extends Patient {
  constructor(
    fullName,
    age,
    diagnosis,
    isEmergency,
    monitorDuration,
    maxHeartRate,
  ) {
    super(fullName, age, diagnosis, isEmergency);
    this._monitorDuration = monitorDuration;
    this._maxHeartRate = maxHeartRate;
    this._type = "holterPatient";
  }
  get monitorDuration() {
    return this._monitorDuration;
  }
  get maxHeartRate() {
    return this._maxHeartRate;
  }
  set monitorDuration(value) {
    this._monitorDuration = value;
  }
  set maxHeartRate(value) {
    this._maxHeartRate = value;
  }

  getInfo() {
    return `${super.getInfo()} | Холтер: ${this._monitorDuration}часов, максимальная ЧСС: ${this._maxHeartRate} `;
  }
}

class EKGPatient extends Patient {
  constructor(
    fullName,
    age,
    diagnosis,
    isEmergency,
    rhythType,
    STsegmElevation,
  ) {
    super(fullName, age, diagnosis, isEmergency);
    this._rhythType = rhythType;
    this._STsegmElevation = STsegmElevation;
    this._type = "EKGPatient";
  }
  get rhythType() {
    return this._rhythType;
  }
  get STsegmElevation() {
    return this._STsegmElevation;
  }
  set rhythType(value) {
    this._rhythType = value;
  }
  set STsegmElevation(value) {
    this._STsegmElevation = value;
  }
  getInfo() {
    return `${super.getInfo()} | Ритм: ${this.rhythType}, элевация сегмента ST: ${this._STsegmElevation ? "есть" : "нет"}`;
  }
}
function setToLS() {
  const json = JSON.stringify(patients);
  localStorage.setItem("patients", json);
}

function getFromLS() {
  const json = localStorage.getItem("patients");
  if (json) {
    const rawArray = JSON.parse(json);
    patients.length = 0;
    rawArray.forEach((obj) => {
      if (obj._type === "holterPatient") {
        patients.push(
          new holterPatient(
            obj._fullName,
            obj._age,
            obj._diagnosis,
            obj._isEmergency,
            obj._monitorDuration,
            obj._maxHeartRate,
          ),
        );
      } else if (obj._type === "EKGPatient") {
        patients.push(
          new EKGPatient(
            obj._fullName,
            obj._age,
            obj._diagnosis,
            obj._isEmergency,
            obj._rhythmType,
            obj._STsegmElevation,
          ),
        );
      } else {
        patients.push(
          new Patient(
            obj._fullName,
            obj._age,
            obj._diagnosis,
            obj._isEmergency,
          ),
        );
      }
    });
  }
}

const patients = [];

function renderTable() {
  tableBody.innerHTML = "";
  patients.forEach((patient, index) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = patient.fullName;
    row.appendChild(nameCell);

    const ageCell = document.createElement("td");
    ageCell.textContent = patient.age;
    row.appendChild(ageCell);

    const diagCell = document.createElement("td");
    diagCell.textContent = patient.diagnosis;
    row.appendChild(diagCell);

    const emerCell = document.createElement("td");
    emerCell.textContent = patient.isEmergency ? "Да" : "Нет";
    row.appendChild(emerCell);

    const typeCell = document.createElement("td");
    if (patient instanceof holterPatient) {
      typeCell.textContent = "Холтер";
    } else if (patient instanceof EKGPatient) {
      typeCell.textContent = "ЭКГ";
    } else {
      typeCell.textContent = "Базовый";
    }
    row.appendChild(typeCell);

    const infoCell = document.createElement("td");
    if (patient instanceof holterPatient) {
      infoCell.textContent = `Мониторинг: ${patient.monitorDuration} часов, максимальная ЧСС: ${patient.maxHeartRate}`;
    } else if (patient instanceof EKGPatient) {
      infoCell.textContent = `Ритм: ${patient.rhythType}, элевация ST: ${patient.STsegmElevation ? "есть" : "нет"}`;
    } else {
      infoCell.textContent = "-";
    }
    row.appendChild(infoCell);

    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.classList.add("delete-btn");
    actionCell.appendChild(deleteBtn);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
    
    deleteBtn.addEventListener("click", () => {
      patient.delete();
      patients.splice(index, 1);
      setToLS();
      renderTable();
    });
  });
}

patientForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullName = document.getElementById("full-name").value.trim();
  const age = parseInt(document.getElementById("age").value, 10);
  const diagnosis = document.getElementById("diagnosis").value.trim();
  const isEmergency = document.getElementById("is-emergency").checked;
  const patientType = document.getElementById("patient-type").value;

  let newPatient;

  if (patientType === "holter") {
    const monitorDuration =
      parseInt(document.getElementById("monitor-duration").value, 10) || 0;
    const maxHeartRate =
      parseInt(document.getElementById("max-heart-rate").value, 10) || 0;

    newPatient = new holterPatient(
      fullName,
      age,
      diagnosis,
      isEmergency,
      monitorDuration,
      maxHeartRate,
    );
  } else if (patientType === "ekg") {
    const rhythmType =
      document.getElementById("rhythm-type").value.trim() || "не указан";
    const STsegmElevation = document.getElementById(
      "st-segment-elevation",
    ).checked;
    newPatient = new EKGPatient(
      fullName,
      age,
      diagnosis,
      isEmergency,
      rhythType,
      STsegmElevation,
    );
  } else {
    return;
  }

  patients.push(newPatient);
  setToLS();
  renderTable();
  patientForm.reset();

  document.getElementById("holter-fields").style.display = "none";
  document.getElementById("ekg-fields").style.display = "none";
});

getFromLS();
renderTable();
