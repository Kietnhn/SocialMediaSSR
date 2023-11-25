$(document).ready(function () {
    // Function to add or remove blur based on scroll direction
    let lastScrollTop = 0;
    const $menu = $("#mobile-menu");
    const $head = $("#mobile-head");

    function toggleMenuBlur() {
        if ($(window).width() > 768) return;

        const st = $(this).scrollTop();
        // Determine scroll direction
        if (st > lastScrollTop) {
            $menu.addClass("menu-blur");
            $head.addClass("menu-blur");
        } else {
            $menu.removeClass("menu-blur");
            $head.removeClass("menu-blur");
        }

        lastScrollTop = st;
    }

    // Attach the scroll event listener
    $(window).scroll(toggleMenuBlur);
});
