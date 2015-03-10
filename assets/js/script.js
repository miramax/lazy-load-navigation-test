// work fine in chrome 40+
(function(){

    Element.prototype.getOffsetTop = function() {
        var obj = this,
            currentTop = 0;

        if (obj.offsetParent) {
            do {
                currentTop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return currentTop;
    };


    function DocumentLoader(options) {
        // private fields
        var scripts = options.scripts,
            templates = options.templates,
            libs = options.libs,
            timeoutId;

        function getElementsClasses() {
            var pages = [];
            for(var i = 0; i < templates.length; i++) {
                var tpl = templates[i];
                for(var el in tpl) {
                    pages.push(el);
                }
            }
            return pages;
        }

        function renderTemplateByClassName(className) {
            for(var i = 0; i < templates.length; i++) {
                var tpl = templates[i];
                if(className in tpl) {
                    var needRender = templates.splice(i, 1)[0];
                    createFromTemplate(needRender, false);
                }
            }
        }

        // private
        function loadScripts(loadNext) {

            if(typeof loadNext === 'undefined') {
                loadNext = true;
            }
            if(scripts.length) {
                var pathToScript = scripts.shift();
                loadScriptAsync(pathToScript, loadNext);
            }
        }

        function loadScriptAsync(pathToScript, loadNext) {
            var head = document.querySelector('head');

            var scriptDOMElement = document.createElement('script');

            scriptDOMElement.async = 'async';
            scriptDOMElement.type = 'text/javascript';
            scriptDOMElement.src = pathToScript;

            scriptDOMElement.onload = function() {
                if(loadNext) loadScripts();
            };

            head.appendChild(scriptDOMElement);
        }

        // private
        function parseTemplates() {
            var tpl;
            if(templates.length) {
                tpl = templates.shift();
                createFromTemplate(tpl);
            }
        };

        function createFromTemplate(tpl, loadNext) {
            if(typeof loadNext === 'undefined') {
                loadNext = true;
            }

            var el, id, className;
            for(el in tpl) {
                id = tpl[el];
                className = el;
            }

            var html = document.getElementById(id).innerHTML,
                destination = document.getElementsByClassName(className)[0];

            destination.innerHTML = html;

            if(className === 'app__fifth') {
                loadScriptAsync(libs.fb);
            }

            if(!loadNext) return;

            var images = destination.getElementsByTagName('img'),
                i,
                counter = 0,
                length = images.length;
            if(images.length) {
                for(i = 0; i < length; i = i + 1) {
                    images[i].addEventListener('load', function() {
                        counter++;
                        if(counter === length) {
                            parseTemplates();
                        }
                    });
                }
            } else {
                parseTemplates();
            }
        }

        function menuListener() {
            var menu = document.querySelector('.menu');
            menu.onclick = function(event) {
                if(event.target.tagName === 'A') {
                    event.preventDefault();
                    clearTimeout(timeoutId);
                    var page = event.target.dataset.page;
                    var pageElement = document.getElementsByClassName(page)[0];
                    window.scroll(0, pageElement.getOffsetTop());
                }
            }
        }

        function onScroll() {
            var classes = getElementsClasses();
            clearTimeout(timeoutId);

            if(classes.length) {
                for(var i = 0; i < classes.length; i++) {
                    var el = document.getElementsByClassName(classes[i])[0];
                    //visible[classes[i]] = isVisible(el);
                    if(isVisible(el)) {
                        renderTemplateByClassName(classes[i]);
                    }
                }
            }
        }

        function onLoad() {
            // first page
            createFromTemplate(templates.shift(), false);

            // load metrika
            loadScriptAsync(libs.ya, false);

            // menu
            menuListener();

            // wait user actions...
            // если действий нет, то по очереди
            timeoutId = setTimeout(function(){
                parseTemplates(templates);
                loadScripts();
            }, 2000);
        }

        function isVisible(el) {
            var viewPortHeight = window.innerHeight,
                top = el.getBoundingClientRect().top,
                bottom = el.getBoundingClientRect().bottom;

            return (top >= 0 && top < viewPortHeight) || (bottom >= 0 && bottom < viewPortHeight);
        }

        //public
        this.initialize = function() {
            window.onload = onLoad;
            window.onscroll = onScroll;

            return 0;
        };
    }

    var loader = new DocumentLoader({
            libs: {
                ya: 'assets/js/metrika.js',
                fb: 'assets/js/fb_test.js'
            },
            // paths async load
            scripts: [
                //'assets/js/jquery.js'...
                //'assets/js/jquery.validate.js'...
            ],
            // elementClassName: templateId
            templates: [
                {app__first: 'first_page'},
                {app__second: 'second_page'},
                {app__third: 'third_page'},
                {app__fourth: 'fourth_page'},
                {app__fifth: 'fifth_page'}
            ]
    });

    return loader.initialize();
})();