var utils = {
    Navigation: new function() {
        /**
         * var $_GET = getQueryParams(location.search);
         * $_GET['arg1']
         */
        this.get = function(qs) {
            qs = qs || location.hash.substr(1);
            var params = {},
                tokens,
                re = /[?&]?([^=]+)=([^&]*)/g;

            while ((tokens = re.exec(qs))) {
                params[decodeURIComponent(tokens[1])]
                    = decodeURIComponent(tokens[2]);
            }

            return params;
        }
        /**
         * Updates the url query.
         * If two arguments supplied then it is (false, key, value, location.hash)
         * If only one argument supplied then it is (false, key, '', location.hash)
         * @param {Boolean} r flag. Function returns the value if true, changes the location.hash else.
         * @param {String} key argument name
         * @param {String} value argument value
         * @param {String} uri query, by default is location.hash
         */
        this.update = function(r, key, value, uri) {
            if (arguments.length == 0) {
                location.hash = '';
                return '';
            }
            if (typeof r != 'boolean') {
                value = key;
                key = r;
                r = false;
            }
            uri = uri || location.hash;
            value = value == undefined ? '' : value;

            if (uri.indexOf('#') == 0) {
                uri = uri.substr(1);
            }

            console.log(key, value, uri, r);

            // http://stackoverflow.com/questions/5999118/
            var re = new RegExp('([?|&])' + key + '=.*?(&|$)', 'i');
            var separator = uri.indexOf('?') !== -1 ? '&' : '?';
            if (uri.match(re)) {
                if (r) {
                    return uri.replace(re, '$1' + key + '=' + value + '$2');
                }
                location.hash = uri.replace(re, '$1' + key + '=' + value + '$2');
            } else {
                if (r) {
                    return location.hash = uri + separator + key + '=' + value;
                }
                location.hash = uri + separator + key + '=' + value;
            }
        }
    }
}