document.addEventListener("DOMContentLoaded", () => {
  const pages = document.querySelectorAll(".quiz-page");
  const progressBar = document.getElementById("progress-bar");
  const backBtn = document.getElementById("btn-voltar");
  const loadingBar = document.getElementById("loading-bar");
  let currentPage = 1;
  const totalPages = 17;
  const userAnswers = {};

  function updateProgress(pageNum) {
    const percent = ((pageNum - 1) / totalPages) * 100;
    progressBar.style.width = percent + "%";
    progressBar.parentElement.setAttribute("aria-valuenow", percent.toFixed(0));
  }

  function showPage(pageNum) {
    pages.forEach(p => {
      p.style.display = (p.dataset.page === String(pageNum)) ? "block" : "none";
    });
    currentPage = pageNum;
    updateProgress(pageNum);

    backBtn.style.display = (pageNum > 1 && pageNum !== 16 && pageNum !== 17) ? "inline-block" : "none";
  }

  function calcularIMC(pesoKg, alturaCm) {
    if (!pesoKg || !alturaCm) return null;
    const alturaM = alturaCm / 100;
    return pesoKg / (alturaM * alturaM);
  }

  function showIMCBar(imc) {
    const bar = document.getElementById("imc-progress-bar");
    const desc = document.getElementById("imc-description");
    const imcValue = document.getElementById("imc-value");

    imcValue.textContent = `IMC: ${imc.toFixed(1)}`;

    const maxIMC = 40;
    const percent = Math.min((imc / maxIMC) * 100, 100);
    bar.style.width = percent + "%";

    if (imc < 18.5) {
      bar.style.backgroundColor = "#2196F3";
      desc.textContent = "Abaixo do peso";
    } else if (imc < 25) {
      bar.style.backgroundColor = "#4CAF50";
      desc.textContent = "Peso normal";
    } else if (imc < 30) {
      bar.style.backgroundColor = "#FFC107";
      desc.textContent = "Sobrepeso";
    } else {
      bar.style.backgroundColor = "#F44336";
      desc.textContent = "Obesidade";
    }
  }

  function startLoadingBar() {
    loadingBar.style.width = "0%";
    loadingBar.style.display = "block";

    return new Promise(resolve => {
      let width = 0;
      const duration = 2000;
      const intervalTime = 50;
      const increment = 100 / (duration / intervalTime);

      const interval = setInterval(() => {
        width += increment;
        if (width >= 100) {
          width = 100;
          clearInterval(interval);
          resolve();
        }
        loadingBar.style.width = width + "%";
        loadingBar.textContent = Math.floor(width) + "%";
      }, intervalTime);
    });
  }

  pages.forEach(page => {
    const form = page.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();

      let answer = null;

      // Tratar tipos de input
      const inputs = form.querySelectorAll('input[name="answer"]');

      if (inputs.length === 1) {
        const input = inputs[0];
        if (input.type === "range") {
          answer = Number(input.value);
        } else if (input.type === "text") {
          answer = input.value.trim();
          if (page.dataset.page === "4" && answer === "") {
            alert("Por favor, digite seu nome.");
            return;
          }
        } else {
          answer = input.value;
        }
      } else if (inputs.length > 1) {
        // Pode ser checkbox ou radio
        const checked = form.querySelectorAll('input[name="answer"]:checked');
        if (checked.length === 0) {
          alert("Por favor, selecione uma opção.");
          return;
        }
        // Se checkbox, guarda array, se radio, só valor
        if (inputs[0].type === "checkbox") {
          answer = Array.from(checked).map(c => c.value);
        } else {
          answer = checked[0].value;
        }
      }

      userAnswers[page.dataset.page] = answer;

      if (page.dataset.page === "15") {
        showPage(16);
        startLoadingBar().then(() => {
          showPage(17);
          // calcular IMC com peso da página 9 e altura da 10
          const peso = Number(userAnswers["9"]);
          const altura = Number(userAnswers["10"]);
          const imc = calcularIMC(peso, altura);
          if (imc) {
            showIMCBar(imc);
          } else {
            document.getElementById("form-17").innerHTML = "<p>Dados insuficientes para calcular o IMC.</p>";
          }
        });
        return;
      }

      if (page.dataset.page === "17") {
        // Redirecionar para a página de checkout
        window.location.href = "https://go.plataformafortpay.com.br/l2s9u";
        return;
      }

      const nextPage = Number(page.dataset.page) + 1;
      showPage(nextPage);
    });
  });

  // Atualiza displays dos sliders
  const weightRange9 = document.getElementById("weightRange");
  const weightValue9 = document.getElementById("weightValue");
  if (weightRange9 && weightValue9) {
    weightValue9.textContent = weightRange9.value;
    weightRange9.addEventListener("input", () => {
      weightValue9.textContent = weightRange9.value;
    });
  }

  const heightRange10 = document.getElementById("heightRange");
  const heightValue10 = document.getElementById("heightValue");
  if (heightRange10 && heightValue10) {
    heightValue10.textContent = heightRange10.value;
    heightRange10.addEventListener("input", () => {
      heightValue10.textContent = heightRange10.value;
    });
  }

  const weightRange11 = document.getElementById("weightRange11");
  const weightValue11 = document.getElementById("weightValue11");
  if (weightRange11 && weightValue11) {
    weightValue11.textContent = weightRange11.value;
    weightRange11.addEventListener("input", () => {
      weightValue11.textContent = weightRange11.value;
    });
  }

  // Botão voltar
  backBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      showPage(currentPage - 1);
    }
  });

  // Inicializa no início
  showPage(1);
});
