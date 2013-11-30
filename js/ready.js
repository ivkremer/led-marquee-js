$(function() {
    $('#led').on({
        mouseenter: function () {
            $(this).animate({opacity: 1}, 90);
        }, mouseleave: function() {
            if (!$(this).data('fixed'))
                $(this).animate({opacity: 0.08}, 90);
        }, click: function() {
            var $t = $(this);
            if ($t.data('fixed'))
                $t.data('fixed', false);
            else
                $t.data('fixed', true);
        }
    }, '.jqmarquee_pixel');
    $('#cp a').hover(function() {
        $(this).stop().animate({'background-color': '#3674C0'}, 150);
    }, function() {
        $(this).stop().animate({'background-color': '#4787D5'}, 150);
    }).mousedown(function() {
        $(this).stop().animate({'background-color': '#1E59A2'}, 150);
    }).mouseup(function() {
        $(this).stop().animate({'background-color': '#4787D5'}, 150);
    }).first().click(function() {
        if (marquee.playing()) {
            marquee.stop();
            $(this).html('Play');
        } else {
            marquee.start();
            $(this).html('Stop');
        }
    });
    $('#save').click(function() {
        utils.Navigation.update('text', $('#text').val());
    });
    $('#text').keyup(function(e) {
        var val = $.trim(this.value);
        if (e.keyCode == 13) {
            e.preventDefault();
            $('#save').click();
            return;
        }
        if (val == $(this).data('value'))
            return;
        $('.jqmarquee_pixel').css('opacity', '');
        marquee.text(val);
        if (marquee.playing()) {
            $('#playstop').text('Stop');
        } else {
            $('#playstop').text('Play');
        }
        $(this).data('value', val);
    });
    $('#capture').click(function() {
        var code = JSON.stringify(marquee.capture());
        $('#code textarea').val(code);
        $('#code').slideDown(200);
    });
    $('#code textarea').focus(function() {
        $(this).select();
    }).mouseup(function(e) { e.preventDefault() });

    $('body').keyup(function(e) {
        if (e.ctrlKey && [38, 40].indexOf(e.which) > -1) {
            marquee.speed(e.which == 38 ? 'up' : 'down');
            var $notifications = $('#notifications').text('Animation duration changed to ' + marquee.speed() + ' ms');
            $notifications.slideDown();
            clearTimeout($notifications.data('timeout'));
            $notifications.data('timeout', setTimeout(function() {
                $notifications.slideUp();
            }, 3000));
        }
    });

    $(window).resize(function() {
       // marquee.init();
    });

    var marquee = new Marquee('led', {text: utils.Navigation.get()['text']});
    document.title = 'Marquee | ' + marquee.text();
    $('#text').val(marquee.text());
    $("#playstop").click();
});