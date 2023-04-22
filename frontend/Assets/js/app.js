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



    // health condition swipperTwo
    var illnesses = [
    "Heart disease",
    "Stroke",
    "Lung cancer",
    "Alzheimer's disease",
    "Diabetes",
    "Kidney disease",
    "Liver disease",
    "Depression",
    "Schizophrenia",
    "Bipolar disorder",
    "Eating disorders",
    "Autism spectrum disorders",
    "Multiple sclerosis",
    "Parkinson's disease",
    "Huntington's disease",
    "Amyotrophic lateral sclerosis (ALS)",
    "HIV/AIDS",
    "Tuberculosis",
    "COVID-19"
  ];

  var swiperTwoWrapper = document.querySelector(".swiperTwo .swiper-wrapper");

  for (var i = 1; i < illnesses.length; i++) {
    var slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.textContent = illnesses[i];
    swiperTwoWrapper.appendChild(slide);
  }

  var swiperTwo = new Swiper(".swiperTwo", {
    slidesPerView: 6,
    grid: {
      rows: 3,
    },
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });