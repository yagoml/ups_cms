$(".formBox input").change(function () {
    if ($(this)[0].textLength > 0) {
        $(this).next('span').addClass('activeLabel');
    }
});

$(".formBox input").focusout(function () {
    if ($(this)[0].textLength == 0) {
        $(this).next('span').removeClass('activeLabel');
    } else {
        $(this).next('span').addClass('activeLabel');
    }
});