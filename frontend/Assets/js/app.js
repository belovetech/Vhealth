const menuToggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');

menuToggle.addEventListener('click', () => {
  links.classList.toggle('active');
  console.log("hello")
});


// swipperOne
    var swiperOne = new Swiper(".swiperOne", {
      spaceBetween: 30,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
    });





const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const search = 'breast+cancer'; // Replace with your search query
const url = `https://clinicaltrials.gov/api/query/full_studies?expr=${search}&min_rnk=1&max_rnk=100&fmt=json`;

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
