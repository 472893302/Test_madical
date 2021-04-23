/*
 * jQuery.appear
 * https://github.com/bas2k/jquery.appear/
 * http://code.google.com/p/jquery-appear/
 * http://bas2k.ru/
 *
 * Copyright (c) 2009 Michael Hixson
 * Copyright (c) 2012-2014 Alexander Brovikov
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 */
(function($) {
    $.fn.appear = function(fn, options) {

        var settings = $.extend({

            //传递给fn的任意数据
            data: undefined,

            //只在第一次出现时调用fn?
            one: true,

            // X & Y accuracy
            accX: 0,
            accY: 0

        }, options);

        return this.each(function() {

            var t = $(this);

            //元素当前是否可见
            t.appeared = false;

            if (!fn) {

                //触发自定义事件
                t.trigger('appear', settings.data);
                return;
            }

            var w = $(window);

            //在适当的时候触发appear事件
            var check = function() {

                //元素是否隐藏?
                if (!t.is(':visible')) {

                    //它变成了隐藏
                    t.appeared = false;
                    return;
                }

                //元素是否在可见窗口内?
                var a = w.scrollLeft();
                var b = w.scrollTop();
                var o = t.offset();
                var x = o.left;
                var y = o.top;

                var ax = settings.accX;
                var ay = settings.accY;
                var th = t.height();
                var wh = w.height();
                var tw = t.width();
                var ww = w.width();

                if (y + th + ay >= b &&
                    y <= b + wh + ay &&
                    x + tw + ax >= a &&
                    x <= a + ww + ax) {

                    //触发自定义事件
                    if (!t.appeared) t.trigger('appear', settings.data);

                } else {

                    //它滚动着看不见了
                    t.appeared = false;
                }
            };

            //使用一些附加逻辑创建一个修改过的fn
            var modifiedFn = function() {

                //将元素标记为可见的
                t.appeared = true;

                //这只会发生一次吗?
                if (settings.one) {

                    //去掉这个勾选点
                    w.unbind('scroll', check);
                    var i = $.inArray(check, $.fn.appear.checks);
                    if (i >= 0) $.fn.appear.checks.splice(i, 1);
                }

                //触发原始fn
                fn.apply(this, arguments);
            };

            //将修改后的fn绑定到元素
            if (settings.one) t.one('appear', settings.data, modifiedFn);
            else t.bind('appear', settings.data, modifiedFn);

            //检查窗口何时滚动
            w.scroll(check);

            //每当dom改变时检查
            $.fn.appear.checks.push(check);

            //check now
            (check)();
        });
    };

    //keep a queue of appearance checks
    $.extend($.fn.appear, {

        checks: [],
        timeout: null,

        //process the queue
        checkAll: function() {
            var length = $.fn.appear.checks.length;
            if (length > 0) while (length--) ($.fn.appear.checks[length])();
        },

        //check the queue asynchronously
        run: function() {
            if ($.fn.appear.timeout) clearTimeout($.fn.appear.timeout);
            $.fn.appear.timeout = setTimeout($.fn.appear.checkAll, 20);
        }
    });

    //调用这些方法时运行检查
    $.each(['append', 'prepend', 'after', 'before', 'attr',
        'removeAttr', 'addClass', 'removeClass', 'toggleClass',
        'remove', 'css', 'show', 'hide'], function(i, n) {
        var old = $.fn[n];
        if (old) {
            $.fn[n] = function() {
                var r = old.apply(this, arguments);
                $.fn.appear.run();
                return r;
            }
        }
    });

})(jQuery);
