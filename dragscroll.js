/**
 * @fileoverview dragscroll - scroll area by dragging and touching
 * @version 1.0.0
 *
 * @license MIT, see http://github.com/gvozdb/dragscroll
 * @copyright 2018 asvd <heliosframework@gmail.com>, gvozdb <pavelgvozdb@yandex.ru>
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.dragscroll = {}));
    }
}(this, function (exports) {
    var _window = window;
    var _document = document;
    var selector = '.js-dragscroll';
    var mousemove = ['mousemove', 'touchmove'];
    var mouseup = ['mouseup', 'touchend'];
    var mousedown = ['mousedown', 'touchstart'];
    var EventListener = 'EventListener';
    var addEventListener = 'add' + EventListener;
    var removeEventListener = 'remove' + EventListener;
    var newScrollX, newScrollY;

    var dragged = [];
    var reset = function (i, n, el) {
        for (i = 0; i < dragged.length;) {
            el = dragged[i++];
            el = el.container || el;
            // console.log('el', el);

            for (n = 0; n < mousedown['length']; ++n) {
                el[removeEventListener](mousedown[n], el.md, 0);
            }
            for (n = 0; n < mouseup['length']; ++n) {
                _window[removeEventListener](mouseup[n], el.mu, 0);
            }
            for (n = 0; n < mousemove['length']; ++n) {
                _window[removeEventListener](mousemove[n], el.mm, 0);
            }
        }

        // cloning into array since HTMLCollection is updated dynamically
        dragged = _document.querySelectorAll(selector);
        for (i = 0; i < dragged.length;) {
            (function (el, lastClientX, lastClientY, pushed, scroller, cont) {
                console.log('cont', cont);

                for (n = 0; n < mousedown['length']; ++n) {
                    (cont = el.container || el)[addEventListener](mousedown[n],
                        cont.md = function (e) {
                            console.log('e', e);
                            console.log('el', el);

                            var isTouch = (e['type'].indexOf('touch') !== -1);
                            var pageX = isTouch ? e.touches[0]['pageX'] : e['pageX'];
                            var pageY = isTouch ? e.touches[0]['pageY'] : e['pageY'];

                            if (!el.hasAttribute('nochilddrag') ||
                                _document.elementFromPoint(
                                    pageX, pageY
                                ) == cont
                            ) {
                                var clientX = isTouch ? e.touches[0]['clientX'] : e['clientX'];
                                var clientY = isTouch ? e.touches[0]['clientY'] : e['clientY'];

                                pushed = 1;
                                lastClientX = clientX;
                                lastClientY = clientY;

                                e.preventDefault();
                            }
                        }, 0
                    );
                }

                for (n = 0; n < mouseup['length']; ++n) {
                    _window[addEventListener](mouseup[n],
                        cont.mu = function () {
                            pushed = 0;
                        }, 0
                    );
                }

                for (n = 0; n < mousemove['length']; ++n) {
                    _window[addEventListener](mousemove[n],
                        cont.mm = function (e) {
                            if (pushed) {
                                console.log('e', e);

                                var isTouch = (e['type'].indexOf('touch') !== -1);
                                var clientX = isTouch ? e.touches[0]['clientX'] : e['clientX'];
                                var clientY = isTouch ? e.touches[0]['clientY'] : e['clientY'];

                                (scroller = el.scroller || el).scrollLeft -=
                                    newScrollX = (-lastClientX + (lastClientX = clientX));
                                scroller.scrollTop -=
                                    newScrollY = (-lastClientY + (lastClientY = clientY));
                                if (el == _document.body) {
                                    (scroller = _document.documentElement).scrollLeft -= newScrollX;
                                    scroller.scrollTop -= newScrollY;
                                }
                            }
                        }, 0
                    );
                }
            })(dragged[i++]);
        }
    }


    if (_document.readyState == 'complete') {
        reset();
    } else {
        _window[addEventListener]('load', reset, 0);
    }

    exports.reset = reset;
}));
