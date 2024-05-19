window.addEventListener("scroll", (e) => {
  let topBtn = document.querySelector(".floating");
  let topBox = document.querySelector(".topBox");
  topBtn.classList.toggle("show", window.scrollY > 100);
  topBox.classList.toggle("sticky", window.scrollY > 100);
});

// chartLine
const pieExample = document.querySelector('#eventChart').getContext('2d');
const pieExampleChart = new Chart(pieExample, {
    type: 'pie',
    data: {
        labels: ['미수령', '수령'],
        datasets: [{
            data: [30, 10],
            backgroundColor: [
                'rgba(255, 0, 0, 0.5)', 
                'rgba(0, 0, 255, 0.5)', 
                'rgba(48, 255, 93, 0.5)'
                ],
            borderColor: [
                'rgba(255, 0, 0, 1)', 
                'rgba(0, 0, 255, 1)', 
                'rgba(48, 255, 93, 1)'
                ],
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: '수령 상황'
            },
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
});

// chartLine
