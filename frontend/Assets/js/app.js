const menuToggle = document.querySelector('.menu-toggle');
const links = document.querySelector('.links');

menuToggle.addEventListener('click', () => {
  links.classList.toggle('active');
  console.log("hello")
});
