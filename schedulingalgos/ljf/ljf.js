let add_button = document.querySelector(".add-btn");
let table = document.querySelector(".table>table");
let play_button = document.querySelector(
  ".container>div:first-child>.buttons>.play"
);
let reset_button = document.querySelector(
  ".container>div:first-child>.buttons>.reset"
);
document.getElementById("burst-time").addEventListener("keypress", my_func);
document.getElementById("arrival-time").addEventListener("keypress", my_func);

add_button.addEventListener("click", add_process);
table.addEventListener("click", delete_process);
play_button.addEventListener("click", run_algorithm);
reset_button.addEventListener("click", reset_table);

function add_process(e) {
  let arrivalTime = parseInt(document.getElementById("arrival-time").value, 10);
  let burstTime = parseInt(document.getElementById("burst-time").value, 10);
  let tableBody = document.querySelector(".table>table>tbody");

  if (
    Number.isInteger(arrivalTime) &&
    Number.isInteger(burstTime) &&
    burstTime > 0 &&
    arrivalTime >= 0
  ) {
    document.querySelector(".error").style.display = "none";
    tableBody.innerHTML += `<tr>
        <td></td>
        <td>${arrivalTime}</td>
        <td>${burstTime}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="del"><i class="fa-solid fa-trash-can"></i></td>
      </tr>`;

    document.getElementById("arrival-time").value = "";
    document.getElementById("burst-time").value = "";

    for (let i = 0; i < table.rows.length - 1; i++) {
      document.querySelector(
        `.table>table>tbody>tr:nth-child(${i + 1})>td:nth-child(1)`
      ).innerHTML = "P" + (i + 1);
    }
  } else {
    document.querySelector(".error").style.display = "block";
    setTimeout(function () {
      document.querySelector(".error").style.display = "none";
    }, 1300);
  }
}

function delete_process(e) {
  if (!e.target.classList.contains("del")) {
    return;
  }
  let deleteButton = e.target;
  deleteButton.closest("tr").remove();

  for (let i = 0; i < table.rows.length - 1; i++) {
    document.querySelector(
      `.table>table>tbody>tr:nth-child(${i + 1})>td:nth-child(1)`
    ).innerHTML = "P" + (i + 1);
  }
}

function reset_table(e) {
  location.reload();
}

function my_func(e) {
  if (e.key === "Enter") {
    add_process();
  }
}

function after_run(e) {
  document.querySelector(".error").style.display = "block";
  document.querySelector(".error").innerHTML =
    "Reset the simulator before using again";
  setTimeout(function () {
    document.querySelector(".error").style.display = "none";
    document.querySelector(".error").innerHTML = "Invalid Input";
  }, 1300);
}

var processArr = [];
var rowLength;
var pid;
var data = {
  header: ["processId", "TAT"],
  rows: [],
};

function run_algorithm(e) {
  let times = ["st", "ct", "rt", "wt", "tat"];
  rowLength = table.rows.length;
  if (rowLength === 1) {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".error").innerHTML =
      "Enter some values before running";
    setTimeout(function () {
      document.querySelector(".error").style.display = "none";
      document.querySelector(".error").innerHTML = "Invalid Input";
    }, 1300);
    return;
  }
  add_button.removeEventListener("click", add_process, false);
  add_button.addEventListener("click", after_run);
  document
    .getElementById("burst-time")
    .removeEventListener("keypress", my_func, false);
  document
    .getElementById("arrival-time")
    .removeEventListener("keypress", my_func, false);

  for (let i = 1; i < rowLength; i++) {
    processArr.push({
      at: parseInt(table.rows.item(i).cells.item(1).innerHTML, 10),
      bt: parseInt(table.rows.item(i).cells.item(2).innerHTML, 10),
      pid: "P" + i,
    });
  }

  processArr = calculateAllTimes(processArr);
  let avgTAT = 0,
    avgWT = 0,
    avgRT = 0;

  for (let i = 0; i < processArr.length; i++) {
    avgTAT += processArr[i].tat;
    avgWT += processArr[i].wt;
    avgRT += processArr[i].rt;
    for (let j = 0; j < 5; j++) {
      document.querySelector(
        `.table>table>tbody>tr:nth-child(${i + 1})>td:nth-child(${j + 4})`
      ).innerHTML = processArr[i][times[j]];
    }
  }

  document.querySelector(".container>div:first-child>.avg-tat>span").innerHTML =
    (avgTAT / processArr.length).toFixed(2) == "NaN"
      ? 0
      : (avgTAT / processArr.length).toFixed(2);
  document.querySelector(".container>div:first-child>.avg-wt>span").innerHTML =
    (avgWT / processArr.length).toFixed(2) == "NaN"
      ? 0
      : (avgWT / processArr.length).toFixed(2);
  document.querySelector(".container>div:first-child>.avg-rt>span").innerHTML =
    (avgRT / processArr.length).toFixed(2) == "NaN"
      ? 0
      : (avgRT / processArr.length).toFixed(2);

  processArr.sort(function (a, b) {
    var keyA = a.ct,
      keyB = b.ct;
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
  tableCreate();
  // console.log(processArr);
  processArr.forEach((a, index) => {
    data.rows[index] = [a.pid, a.tat];
  });

  anychart.onDocumentReady(function () {
    // anychart.theme(anychart.themes.darkEarth);

    // set a data from process array for tat chart

    // console.log(data);
    // create the chart
    var chart = anychart.bar();

    // add data
    chart.data(data);

    // set the chart title
    chart.title("process TAT comparison");

    // draw
    chart.container("container");
    chart.draw();
  });

  document.querySelector(".error").style.display = "block";
  document.querySelector(".error").innerHTML =
    "Gantt chart and TAT comparison graph is shown below";
  setTimeout(function () {
    document.querySelector(".error").style.display = "none";
    document.querySelector(".error").innerHTML = "Invalid Input";
  }, 1300);

  play_button.removeEventListener("click", run_algorithm, false);
  play_button.addEventListener("click", after_run);
}

function calculateAllTimes(arr) {
  let time = Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].at < time) {
      time = arr[i].at;
    }
  }

  while (arr.find((el) => el.finish == undefined)) {
    let maxBT = 0;
    let process = {};
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].at <= time && arr[i].finish != true && arr[i].bt > maxBT) {
        maxBT = arr[i].bt;
        process = arr[i];
      }
    }

    if (maxBT === 0) {
      time++;
      continue;
    }

    process.st = time;
    process.finish = true;
    time += process.bt;
    process.ct = time;
    process.rt = process.st - process.at;
    process.tat = process.ct - process.at;
    process.wt = process.tat - process.bt;
  }
  return arr;
}

var row1 = document.getElementById("row1");
var row = document.getElementById("row");

function tableCreate() {
  document.querySelector(".gantt").style.display = "block";
  var z = row1.insertCell(0);
  var w = row2.insertCell(0);
  z.id = "cell1";
  w.id = "cell2";
  document.getElementById("cell1").style.width = "80px";
  document.getElementById("cell2").style.width = "80px";
  z.innerHTML = "Start Time";
  w.innerHTML = processArr[0].st;

  document.getElementById("cell1").style.border = "1px solid white";
  document.getElementById("cell2").style.border = "1px solid white";
  document.getElementById("cell1").style.textAlign = "center";
  document.getElementById("cell2").style.textAlign = "center";

  for (let i = 0; i < rowLength - 1; i++) {
    var f = i % 9;
    var x = row1.insertCell(i + 1);
    var y = row2.insertCell(i + 1);
    x.id = "c" + i;
    y.id = "cc" + i;
    x.innerHTML = processArr[i].pid;
    y.innerHTML = processArr[i].ct;

    document.getElementById("c" + i).style.width = "50px";
    document.getElementById("cc" + i).style.width = "50px";
    document.getElementById("c" + i).style.height = "35px";
    document.getElementById("cc" + i).style.height = "35px";
    document.getElementById("am").style.marginTop = "5px";
    document.getElementById("am").style.padding = "20px";
    document.getElementById("c" + i).style.border = "1px solid white";
    document.getElementById("cc" + i).style.border = "1px solid white";
    document.getElementById("c" + i).style.textAlign = "center";
    document.getElementById("cc" + i).style.textAlign = "center";
  }
}
