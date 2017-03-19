$(window).on("load", function () {
  sendRequest('https://randomuser.me/api/?results=7&seed=foobar', viewDefaultList, 'GET');
  $('#searchInput').keyup(function (event) {
    event.preventDefault();
    sendRequest('https://randomuser.me/api/?results=50&seed=foobar', viewSearchResponse, 'GET');
  });
  $('#accordion').on('click', 'ul.accordion-item', useAccordion);
  $('#popup').on('click', function (event) {
    event.preventDefault();
    showPopup();
    sendRequest('https://randomuser.me/api/?results=5000&seed=foobar', viewShowChart, 'GET');
  });
  $('#modal_close, #overlay').on('click', hidePopup);
  function sendRequest(url, callback, HttpMethod) {
    HttpMethod = HttpMethod || "GET";
    $.ajax({
      url: url,
      type: HttpMethod,
      dataType: 'json',
      complete: callback
    });
  }

  function viewDefaultList(xhr) {
    var source = $("#entry-template").html();
    var template = Handlebars.compile(source);
    $('#accordion').append(template(xhr.responseJSON));
  }

  function viewSearchResponse(xhr) {
    var value = $('#searchInput').val();
    var arrPersons = xhr.responseJSON;
    var source = $("#entry-template").html();
    var template = Handlebars.compile(source);
    arrPersons.results = filterArr(arrPersons.results, value);
    $('#accordion')
      .empty()
      .append(template(arrPersons));
    function filterArr(arrPersons, searchValue) {
      return arrPersons.filter(function (el) {
        return el.name.first.search(searchValue) > -1;
      });
    }
  }

  function viewShowChart(xhr) {
    var male = 0;
    var female = 0;
    var result = xhr.responseJSON.results;
    var myData = [];
    $.each(result, function (index, value) {
      if (value.gender == 'male') {
        male++;
      } else {
        female++;
      }
    });
    myData = [male, female];
    plotData(myData);
    function getTotal(myData) {
      var myTotal = 0;
      for (var j = 0; j < 2; j++) {
        myTotal += (typeof myData[j] == 'number') ? myData[j] : 0;
      }
      return myTotal;
    }

    function plotData(myData) {
      var canvas;
      var ctx;
      var lastend = 0;
      var myTotal = getTotal(myData);
      var doc;
      canvas = document.getElementById("canvas");
      var x = (canvas.width) / 2;
      var y = (canvas.height) / 2;
      var r = 150;
      var myColor = ["#3498db", "#7f8c8d"];
      var myLabel = ["Male", "Female"];
      ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < myData.length; i++) {
        ctx.fillStyle = myColor[i];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, lastend, lastend + (Math.PI * 2 * (myData[i] / myTotal)), false);
        ctx.lineTo(x, y);
        ctx.fill();
        // Now the pointers
        ctx.beginPath();
        var start = [];
        var end = [];
        var last = 0;
        var flip = 0;
        var textOffset = 0;
        var precentage = (myData[i] / myTotal) * 100;
        start = getPoint(x, y, r - 20, (lastend + (Math.PI * 2 * (myData[i] / myTotal)) / 2));
        end = getPoint(x, y, r + 20, (lastend + (Math.PI * 2 * (myData[i] / myTotal)) / 2));
        if (start[0] <= x) {
          flip = -1;
          textOffset = -110;
        }
        else {
          flip = 1;
          textOffset = 10;
        }
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.lineTo(end[0] + 120 * flip, end[1]);
        ctx.strokeStyle = "#bdc3c7";
        ctx.lineWidth = 2;
        ctx.stroke();
        // The labels
        ctx.font = "17px Arial";
        ctx.fillText(myLabel[i] + " " + precentage.toFixed(2) + "%", end[0] + textOffset, end[1] - 4);
        // Increment Loop
        lastend += Math.PI * 2 * (myData[i] / myTotal);
      }
    }

    function getPoint(c1, c2, radius, angle) {
      return [c1 + Math.cos(angle) * radius, c2 + Math.sin(angle) * radius];
    }
  }

  function showPopup() {
    $('#overlay').fadeIn(400, function () {
      $('#modal_form')
        .css('display', 'block')
        .animate({opacity: 1, top: '50%'}, 200);
    });
  }

  function hidePopup() {
    $('#modal_form')
      .animate({opacity: 0, top: '45%'}, 200,
        function () {
          $(this).css('display', 'none');
          $('#overlay').fadeOut(400);
        }
      );
  }

  function useAccordion() {
    var allAccordions = $('#accordion ul.accordion-data');
    var allAccordionItems = $('#accordion .accordion-item');
    if ($(this).hasClass('open')) {
      $(this).children().children().removeClass('fa-minus');
      $(this).removeClass('open');
      $(this).next().slideUp("slow");
    } else {
      allAccordions.slideUp("slow");
      allAccordionItems.removeClass('open');
      allAccordionItems.children().children().removeClass('fa-minus');
      $(this).children().children('.fa').addClass('fa-minus');
      $(this).addClass('open');
      $(this).next().slideDown("slow");
      return false;
    }
  }
});
