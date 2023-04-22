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
    'X-RapidAPI-Key': '4be9eb381cmsh95230f305c0e104p122e69jsn426127a34fd0',
    'X-RapidAPI-Host': 'community-healthcaregov.p.rapidapi.com'
  }
};

fetch('https://community-healthcaregov.p.rapidapi.com/api/glossary.json', options)
  .then(response => response.json())
  .then(response => {
    // Store response in local storage
    localStorage.setItem('healthData', JSON.stringify(response));
    console.log(response)
  })
  .catch(err => console.error(err));
