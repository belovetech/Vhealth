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