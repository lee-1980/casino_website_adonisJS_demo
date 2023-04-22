"user strict";

$(document).ready(function () {
  //menu header bar
  $(".header-bar").on("click", function (e) {
    $(".main-menu, .header-bar").toggleClass("active");
  });
  $(".main-menu li a").on("click", function (e) {
    $(".main-menu, .header-bar").removeClass("active")
    var element = $(this).parent("li");
    if (element.hasClass("open")) {
      element.removeClass("open");
      element.find("li").removeClass("open");
      element.find("ul").slideUp(300, "swing");
    } else {
      element.addClass("open");
      element.children("ul").slideDown(300, "swing");
      element.siblings("li").children("ul").slideUp(300, "swing");
      element.siblings("li").removeClass("open");
      element.siblings("li").find("li").removeClass("open");
      element.siblings("li").find("ul").slideUp(300, "swing");
    }
  });
  //menu header bar

  //owl carousel
  $(".player__wrap").owlCarousel({
    loop: true,
    margin: 20,
    smartSpeed: 2500,
    autoplayTimeout: 3000,
    autoplay: false,
    nav: false,
    dots: false,
    responsiveClass: true,
    navText: [
      '<i class="fas fa-chevron-left"></i>',
      '<i class="fas fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      500: {
        items: 1,
      },
      767: {
        items: 2,
      },
      991: {
        items: 2,
      },
      1199: {
        items: 3,
      },
      1399: {
        items: 3,
      },
    },
  });

  //Magnifiq pupup
  $('.picture-btn').magnificPopup({
    type: 'image',
    gallery: {
      enabled: true
    }
  });

  $('.play-btn').magnificPopup({
    type: 'iframe',
    callbacks: {}
  });
  //Magnifiq pupup

  // password hide
  $(".toggle-password, .toggle-password2, .toggle-password3, .toggle-password4, .toggle-password5").click(function () {
    $(this).toggleClass("fa-eye fa-eye-slash");
    var input = $($(this).attr("id"));
    if (input.attr("type") == "password") {
      input.attr("type", "text");
    } else {
      input.attr("type", "password");
    }
  });

  //menu top fixed bar
  var fixed_top = $(".header-section");
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 220) {
      fixed_top.addClass("menu-fixed animated fadeInDown");
      fixed_top.removeClass("slideInUp");
      $("body").addClass("body-padding");
    } else {
      fixed_top.removeClass("menu-fixed fadeInDown");
      fixed_top.addClass("slideInUp");
      $("body").removeClass("body-padding");
    }
  });
  //menu top fixed bar

  // wow animation
  new WOW().init();
  // wow animation

  //preloader
  setTimeout(function () {
    $('.preloader').fadeToggle();
  }, 1600);
  //preloader

  //--Nice Select--//
  $('select').niceSelect();


  const form = document.getElementById("form");
  const Name = document.getElementById("Name");
// const company = document.getElementById("subject");
  const email = document.getElementById("email");
// const phone = document.getElementById("phone");
  const message = document.getElementById("message");
  const error = document.getElementsByClassName('error')
  const thank = document.querySelector('.thank_you p')

//Error Message
  function errorMessage(input, message) {
    const inputElement = input.parentElement;
    inputElement.className = "form-control error";
    const small = inputElement.querySelector("small");
    small.innerText = message;
  }

//Success message

  function successMessage(input) {
    const inputElement = input.parentElement;
    inputElement.className = "form-control success";
  }

//Check Input Elements
  function checkInputElement(inputArr) {
    inputArr.forEach(function (input) {
      if (input.value.trim() == "") {
        errorMessage(input, `${inputFieldName(input)} is requerd`);
      } else {
        successMessage(input);
      }
    });
  }

//Check Input inputElementNone
  function inputElementValueEmpty(inputArr) {
    inputArr.forEach(function (input) {
      input.value = "";

      const inputElement = input.parentElement;
      inputElement.classList.remove("success");
    });
  }

//Check length
  function checkLength(input, min, max) {
    if (input.value.length < min) {
      errorMessage(
        input,
        `${inputFieldName(input)}`
      );
    } else if (input.value.length > max) {
      errorMessage(
        input,
        `${inputFieldName(input)}`
      );
    } else {
      successMessage(input);
    }
  }

  function checkNumber(input, min, max) {
    if (input.value.length < min) {
      errorMessage(
        input,
        `${inputFieldName(input)}`
      );
    } else if (input.value.length > max) {
      errorMessage(
        input,
        `${inputFieldName(input)}`
      );
    } else {
      successMessage(input);
    }
  }

//Check email
  function checkEmail(email) {
    const regx =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regx.test(email.value.trim())) {
      successMessage(email);
    } else {
      errorMessage(email, "Email is not valid");
    }
  }


//Input fields name
  function inputFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1);
  }


//add event listener
  if(form){
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    checkInputElement([Name, message, email]);
    checkLength(Name, 3, 25);
    // checkLength(company, 3, 25);
    checkLength(message, 10, 10000000);
    checkEmail(email);
    // checkNumber(phone,2,1000000);
    if (error.length === 0) {
      inputElementValueEmpty([Name, message, email]);
      thank.style.display = "block";
      const myTimeout = setTimeout(() => {
        thank.style.display = "none";
      }, 2000);
    }
  });
  }
});



