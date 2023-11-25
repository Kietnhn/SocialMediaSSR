const handleRezise = () => {
    // if ($(window).width() >= 992) {
    //     const withSearchAside = $("#search-aside").width();
    //     $("#sidebar").width(withSearchAside);
    // } else {
    // }
    const withAside = $("#aside").width();
    $("#sidebar").width(withAside);
};
handleRezise();
$(window).resize(handleRezise);
