//= require ../lib/_jquery
//= require ../lib/_imagesloaded.min

function _trace(msg) {
  // console.log(msg)
}

var doTrace = true;

_trace("* Loading " + window.location);
;(function () {
  'use strict';

  var loaded = false;

  var debounce = function(func, waitTime) {
    var timeout = false;
    return function() {
      if (timeout === false) {
        setTimeout(function() {
          func();
          timeout = false;
        }, waitTime);
        timeout = true;
      }
    };
  };

  var closeToc = function() {
    $(".toc-wrapper").removeClass('open');
    $("#nav-button").removeClass('open');
  };

  function loadToc($toc, tocLinkSelector, tocListSelector, scrollOffset) {
    _trace("In loadTOC");
    var headerHeights = {};
    var pageHeight = 0;
    var windowHeight = 0;
    var originalTitle = document.title;

    var recacheHeights = function() {
      _trace("In recacheHeights");
      headerHeights = {};
      pageHeight = $(".content_body").height();
      windowHeight = $(window).height();

      $toc.find(tocLinkSelector).each(function() {
        var targetId = $(this).attr('href');
        if (targetId[0] === "#") {
          headerHeights[targetId] = $(targetId).position().top;
        }
      });
    };

    var refreshToc = function() {
      _trace("In refreshToc");
      var currentTop = $(".content_body").scrollTop() + scrollOffset;

      var best = null;

      for (var name in headerHeights) {
        if ((headerHeights[name] < currentTop && headerHeights[name] > headerHeights[best]) || best === null) {
          best = name;
        }
      }
      _trace("Found best = " + best);

      // Catch the initial load case
      if (currentTop == scrollOffset && !loaded) {
        best = window.location.hash;
        _trace("Reset best = " + best + " " + currentTop + " " + scrollOffset);
      }

      var $best = $toc.find("[href='" + best + "']").first();
      if (!$best.hasClass("active")) {
        // .active is applied to the ToC link we're currently on, and its parent <ul>s selected by tocListSelector
        // .active-expanded is applied to the ToC links that are parents of this one
        $toc.find(".active").removeClass("active");
        $toc.find(".active-parent").removeClass("active-parent");
        $best.addClass("active");
        $best.parents(tocListSelector).addClass("active").siblings(tocLinkSelector).addClass('active-parent');
        $best.siblings(tocListSelector).addClass("active");
        $toc.find(tocListSelector).filter(":not(.active)").slideUp(150);
        $toc.find(tocListSelector).filter(".active").slideDown(150);

        // TODO remove classnames
        document.title = $best.data("title") + " – " + originalTitle;
      }
      loaded = true;
    };

    var makeToc = function() {
      recacheHeights();
      refreshToc();

      $("#nav-button").click(function() {
        $(".toc-wrapper").toggleClass('open');
        $("#nav-button").toggleClass('open');
        return false;
      });
      $(".page-wrapper").click(closeToc);
      $(".toc-link").click(closeToc);

      // reload immediately after scrolling on toc click
      $toc.find(tocLinkSelector).click(function() {
        _trace("* Following TOC link " + $(this)[0].hash);
        setTimeout(function() {
           refreshToc();
        }, 0);
      });

      $(".content_body").scroll(debounce(refreshToc, 150));
      $(window).resize(debounce(recacheHeights, 150));
    };

    makeToc();

    window.recacheHeights = recacheHeights;
    window.refreshToc = refreshToc;
  }

  window.loadToc = loadToc;
})();
