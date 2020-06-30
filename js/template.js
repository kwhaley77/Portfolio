(function($) {

    "use strict";

    $(document).ready(function() {

        //
        // Portfolio
        //

        var filters    = $('.filters'),
            worksgrid = $('.row-portfolio');

        $('a', filters).on('click', function() {
            var selector = $(this).attr('data-filter');
            $('.current', filters).removeClass('current');
            $(this).addClass('current');
            worksgrid.isotope({
                filter: selector
            });
            return false;
        });

        $(window).on('resize', function() {
            worksgrid.imagesLoaded(function() {
                worksgrid.isotope({
                    layoutMode: 'masonry',
                    itemSelector: '.portfolio-item',
                    transitionDuration: '0.4s',
                    masonry: {
                        columnWidth: '.grid-sizer',
                    },
                });
            });
        }).resize();

        //
        // Parallax
        //

        var isIE = /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || /MSIE 10/i.test(navigator.userAgent) || /Edge\/\d+/.test(navigator.userAgent);

        if (isIE == true) {
            var speed = 1;
        } else {
            var speed = 0.4;
        }

        var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || window.opera);

        if (!isMobile) {
            $('.parallax').jarallax({
                speed: speed,
            });
        }

        //
        // SVG inject
        //

        SVGInjector(document.querySelectorAll('img[data-inject-svg]'));

    });

})(jQuery);