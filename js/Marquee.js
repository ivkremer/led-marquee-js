var Marquee = function(id, params) {
    if (typeof jQuery == 'undefined') {
        throw 'jQuery required';
    }
    params = params || {};
    params = $.extend(true, {
        height: 16,
        text: 'Hello, world!',
        speed: 100,
        speedDelta: 25
    }, params);
    var speed = params.speed;
    var speedDelta = params.speedDelta;

    var message = params.text.toUpperCase();
    $('body').append('<div style="display: none" class="jqmarquee_column" id="jqmarquee_test"></div>');
    var colWidth = $("#jqmarquee_test").width() + parseInt($("#jqmarquee_test").css('margin-right'));

    var width, offset, interval, amessage, $pixels;

    this.init = function() {
        width = getWidth(colWidth);
        console.log('width: ' + width + ' pixels');
        var html = '';
        for (var i = 0; i < width; i++) {
            html += '<div class="jqmarquee_column">';
            for (var j = 0; j < params.height; j++)
                html += '<div class="jqmarquee_pixel"></div>';
            html += '</div>';
        }
        var htmlWidth = width * colWidth;
        $('#' + id).html(html).width(htmlWidth);
        $("body").width(htmlWidth - 1);

        // caching jquery elements:
        $pixels = [];
        for (i = 0; i < width; i++)
            for (j = 0; j < params.height; j++)
                $pixels.push($('#led .jqmarquee_column:eq(' + i + ') .jqmarquee_pixel:eq(' + j + ')'));

        amessage = encode(message);
        console.log('encoded message (' + amessage.length + ' columns):');
        console.log(amessage);
        interval = 0;
        offset = 0;
        // offset = 0; offset++; if (offset > amessage.length) offset = -DW + 1; // don't remove cause it gives nice effect
    };

    this.init();

    /**
     * Text setter and getter.
     * @param text string new text
     * @param restart boolean flag if drop offset
     */
    this.text = function(text, restart) {
        if (text == null) {
            return message;
        } else {
            message = text.toString().toUpperCase();
            amessage = encode(message);
            this.restart(restart);
        }
    };

    /**
     * Speed setter and getter.
     * @param newSpeed int update speed in milliseconds
     * @param restart boolean flag if drop offset.
     **/
    this.speed = function(newSpeed, restart) {
        if (newSpeed == null) {
            return speed;
        } else {
            if (parseInt(newSpeed) != newSpeed) { // increase/decrease
                speed = changeSpeed(newSpeed);
            } else { // direct value given
                speed = newSpeed;
            }
            this.restart(restart);
        }
    };

    function changeSpeed(dir) {
        var SPEED_UP_LIMIT = 50; // this is animation duration in ms,
        var SPEED_DOWN_LIMIT = 500; // so the lower value means the bigger speed
        if (dir == 'up') {
            var newSpeed = speed - speedDelta;
            return newSpeed < SPEED_UP_LIMIT ? SPEED_UP_LIMIT : newSpeed;
        } else if (dir == 'down') {
            newSpeed = speed + speedDelta;
            return newSpeed > SPEED_DOWN_LIMIT ? SPEED_DOWN_LIMIT : newSpeed;
        }
    }

    /**
     * Redraws a frame.
     */
    function redraw() {
        var curr = amessage.slice(offset, offset + width);
        var k = 0;
        for (var i in curr) {
            for (var j in curr[i]) {
                $pixels[k][curr[i][j] ? 'addClass' : 'removeClass']('jqmarquee_pixel-enabled');
                k++;
            }
        }
        offset++;
        if (offset > amessage.length)
            offset = 0;
    };

    this.stop = function() {
        clearInterval(interval);
        interval = 0;
    };

    this.start = function() {
        if (!this.playing())
            interval = setInterval(redraw, speed);
    };

    this.restart = function(dropOffset) {
        if (dropOffset)
            offset = 0;
        this.stop();
        this.start();
    };

    this.playing = function() {
        return !!interval;
    };

    /**
     * Encodes string message as an array of boolean according to alphabet.js
     * @param msg string message
     */
    function encode(msg) {
        var arr = [];
        for (var i = 0; i < width; i++) {
            arr.push(Marquee.ALPHABET.empty());
        }
        var unsupported = [];
        for (i = 0; i < msg.length; i++) {
            var sym = msg.substr(i, 1);
            var translation = Marquee.ALPHABET.get(sym);
            if (translation == null) { // no such sym in dictionary
                var nosuch = true;
                for (var k in unsupported) {
                    if (unsupported[k] == sym)
                        nosuch = false;
                }
                if (nosuch)
                    unsupported.push(sym);
            }
            for (var j in translation) {
                arr.push(translation[j]);
            }
        }
        processUnsopported(unsupported);
        return arr;
    }

    function processUnsopported(unsupported) {
        var $errorsDiv = $('#errors');
        if (unsupported.length == 0) {
            $errorsDiv.slideUp(200);
            return;
        }
        $errorsDiv.slideDown(200);
        var $spans = $('span', $errorsDiv[0]);
        $spans.eq(0).html(unsupported.length > 1 ? 's' : '');
        $spans.eq(1).html("`" + unsupported[0] + "`");
        for (var syms = '', i = 1; i < unsupported.length; i++) {
            syms += ", `" + unsupported[i] + "`";
        }
        $spans[1].innerHTML += syms;
        console.log('unsupported', unsupported);
    }

    /**
     * Calculates led display width in pixels (params['width'] or maximum possible).
     * @param colWidth int single pixel width
     * @return int led width in pixels (<div class="jqmarquee_pixel></div> elements)
     **/
    function getWidth(colWidth) {
        if (params['width'])
            return params['width'];
        var parentWidth = $('#' + id).parent().width();
        if (parentWidth < 1080)
            var maxHtmlWidth = parentWidth * 0.8;
        else if (parentWidth < 1200)
            maxHtmlWidth = parentWidth * 0.75;
        else if (parentWidth < 1350)
            maxHtmlWidth = parentWidth * 0.7;
        else if (parentWidth < 1600)
            maxHtmlWidth = parentWidth * 0.65;
        else if (parentWidth < 1900)
            maxHtmlWidth = parentWidth * 0.6;
        else
            maxHtmlWidth = parentWidth * 0.55;
        return parseInt(maxHtmlWidth / colWidth);
    }

    /**
     * Captures current text fragment.
     * Be sure there is a correct threshold.
     * @return array encoded message
     */
    this.capture = function() {
        var THRESHOLD = 0.6;
        var encoded = [], column = [], h = 0;
        for (i = 0; i < $pixels.length; i++) {
            h++;
            column.push($pixels[i][0].style.opacity > THRESHOLD ? 1 : 0);
            if (h == params.height) {
                h = 0;
                encoded.push(column);
                column = [];
            }
        }

        return trimEncoded(encoded);
    };

    /**
     * Trims array represented message
     * @param encoded encoded message
     * @return trimmed encoded message
     */
    function trimEncoded(encoded) {
        if (encoded[0].length != params.height) {
            throw 'encoded[0].length: ' + encoded[0].length + ' does not match led height';
        }
        var first = null, last = 0;
        for (var i = 0; i < encoded.length; i++) {
            for (var j = 0; j < params.height; j++) {
                if (encoded[i][j]) {
                    first = i;
                    break;
                }
            }
            if (first != null)
                break;
        }
        for (i = 0; i < encoded.length; i++) {
            for (j = 0; j < params.height; j++) {
                if (encoded[i][j]) {
                    last = i;
                    break;
                }
            }
        }
        encoded = encoded.slice(first, last + 1);
        var empty = [];
        for (i = 0; i < params.height; i++)
            empty.push(0);
        encoded.push(empty);

        return encoded;
    }
};

Marquee.toString = function() {
    return 'Marquee v0.1.0' +
        (typeof jQuery == 'undefined' ? '\nit seems jQuery is missing' : '');
};