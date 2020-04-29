'use strict';

const Even = {};

Even.backToTop = function () {
    const $backToTop = $('#back-to-top');

    $(window).scroll(function () {
        if ($(window).scrollTop() > 100) {
            $backToTop.fadeIn(1000);
        } else {
            $backToTop.fadeOut(1000);
        }
    });

    $backToTop.click(function () {
        $('body,html').animate({scrollTop: 0});
    });
};

Even.mobileNavbar = function () {
    const $mobileNav = $('#mobile-navbar');
    const $mobileNavIcon = $('.mobile-navbar-icon');
    const slideout = new Slideout({
        'panel': document.getElementById('mobile-panel'),
        'menu': document.getElementById('mobile-menu'),
        'padding': 180,
        'tolerance': 70,
    });
    slideout.disableTouch();

    $mobileNavIcon.click(function () {
        slideout.toggle();
    });

    slideout.on('beforeopen', function () {
        $mobileNav.addClass('fixed-open');
        $mobileNavIcon.addClass('icon-click').removeClass('icon-out');
    });

    slideout.on('beforeclose', function () {
        $mobileNav.removeClass('fixed-open');
        $mobileNavIcon.addClass('icon-out').removeClass('icon-click');
    });

    $('#mobile-panel').on('touchend', function () {
        slideout.isOpen() && $mobileNavIcon.click();
    });
};

Even._initToc = function () {
    const SPACING = 20;
    const $toc = $('.post-toc');
    const $footer = $('.post-footer');

    if ($toc.length) {
        const minScrollTop = $toc.offset().top - SPACING;
        const maxScrollTop = $footer.offset().top - $toc.height() - SPACING;

        const tocState = {
            start: {
                'position': 'absolute',
                'top': minScrollTop,
            },
            process: {
                'position': 'fixed',
                'top': SPACING,
            },
            end: {
                'position': 'absolute',
                'top': maxScrollTop,
            },
        };

        $(window).scroll(function () {
            const scrollTop = $(window).scrollTop();

            if (scrollTop < minScrollTop) {
                $toc.css(tocState.start);
            } else if (scrollTop > maxScrollTop) {
                $toc.css(tocState.end);
            } else {
                $toc.css(tocState.process);
            }
        });
    }

    const HEADERFIX = 30;
    const $toclink = $('.toc-link');
    const $headerlink = $('.headerlink');
    const $tocLinkLis = $('.post-toc-content li');

    const headerlinkTop = $.map($headerlink, function (link) {
        return $(link).offset().top;
    });

    const headerLinksOffsetForSearch = $.map(headerlinkTop, function (offset) {
        return offset - HEADERFIX;
    });

    const searchActiveTocIndex = function (array, target) {
        for (let i = 0; i < array.length - 1; i++) {
            if (target > array[i] && target <= array[i + 1]) return i;
        }
        if (target > array[array.length - 1]) return array.length - 1;
        return -1;
    };

    $(window).scroll(function () {
        const scrollTop = $(window).scrollTop();
        const activeTocIndex = searchActiveTocIndex(headerLinksOffsetForSearch, scrollTop);

        $($toclink).removeClass('active');
        $($tocLinkLis).removeClass('has-active');

        if (activeTocIndex !== -1) {
            $($toclink[activeTocIndex]).addClass('active');
            let ancestor = $toclink[activeTocIndex].parentNode;
            while (ancestor.tagName !== 'NAV') {
                $(ancestor).addClass('has-active');
                ancestor = ancestor.parentNode.parentNode;
            }
        }
    });
};

Even.fancybox = function () {
    if ($.fancybox) {
        $('.post-content').each(function () {
            $(this).find('img').each(function () {
                $(this).wrap(`<a class="fancybox" href="${this.src}" data-fancybox="gallery" data-caption="${this.title}"></a>`);
            });
        });

        $('.fancybox').fancybox({
            selector: '.fancybox',
            protect: true,
        });
    }
};

Even.highlight = function () {
    const blocks = document.querySelectorAll('pre code');
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const rootElement = block.parentElement;
        const lineCodes = block.innerHTML.split(/\n/);
        if (lineCodes[lineCodes.length - 1] === '') lineCodes.pop();
        const lineLength = lineCodes.length;

        let codeLineHtml = '';
        for (let i = 0; i < lineLength; i++) {
            codeLineHtml += `<div class="line">${i + 1}</div>`;
        }

        let codeHtml = '';
        for (let i = 0; i < lineLength; i++) {
            codeHtml += `<div class="line">${lineCodes[i]}</div>`;
        }

        block.className += ' highlight';
        const figure = document.createElement('figure');
        figure.className = block.className;
        figure.innerHTML = `<table><tbody><tr><td class="gutter"><pre>${codeLineHtml}</pre></td><td class="code"><pre>${codeHtml}</pre></td></tr></tbody></table>`;

        rootElement.parentElement.replaceChild(figure, rootElement);
    }
};

Even.chroma = function () {
    const blocks = document.querySelectorAll('.highlight > .chroma');
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const afterHighLight = block.querySelector('pre.chroma > code');
        const lang = afterHighLight ? afterHighLight.className : '';
        block.className += ' ' + lang;
    }
};

Even.toc = function () {
    const tocContainer = document.getElementById('post-toc');
    if (tocContainer !== null) {
        const toc = document.getElementById('TableOfContents');
        if (toc === null) {
            // toc = true, but there are no headings
            tocContainer.parentNode.removeChild(tocContainer);
        } else {
            this._refactorToc(toc);
            this._linkToc();
            this._initToc();
        }
    }
};

Even._refactorToc = function (toc) {
    // when headings do not start with `h1`
    const oldTocList = toc.children[0];
    let newTocList = oldTocList;
    let temp;
    while (newTocList.children.length === 1
    && (temp = newTocList.children[0].children[0]).tagName === 'UL') {
        newTocList = temp;
    }

    if (newTocList !== oldTocList) toc.replaceChild(newTocList, oldTocList);
};

Even._linkToc = function () {
    const links = document.querySelectorAll('#TableOfContents a:first-child');
    for (let i = 0; i < links.length; i++) links[i].className += ' toc-link';

    for (let num = 1; num <= 6; num++) {
        const headers = document.querySelectorAll('.post-content>h' + num);
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            header.innerHTML = `<a href="#${header.id}" class="headerlink anchor"><i class="iconfont icon-link"></i></a>${header.innerHTML}`;
        }
    }
};

Even.flowchart = function () {
    if (!window.flowchart) return;

    const blocks = document.querySelectorAll('pre code.language-flowchart');
    for (let i = 0; i < blocks.length; i++) {
        if (!window.hljs && i % 2 === 0) continue;

        const block = blocks[i];
        const rootElement = window.hljs
            ? block.parentElement
            : block.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

        const container = document.createElement('div');
        const id = `js-flowchart-diagrams-${i}`;
        container.id = id;
        container.className = 'align-center';
        rootElement.parentElement.replaceChild(container, rootElement);

        const diagram = flowchart.parse(block.childNodes[0].nodeValue);
        diagram.drawSVG(id, window.flowchartDiagramsOptions ? window.flowchartDiagramsOptions : {});
    }
};

Even.sequence = function () {
    if (!window.Diagram) return;

    const blocks = document.querySelectorAll('pre code.language-sequence');
    for (let i = 0; i < blocks.length; i++) {
        if (!window.hljs && i % 2 === 0) continue;

        const block = blocks[i];
        const rootElement = window.hljs
            ? block.parentElement
            : block.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;

        const container = document.createElement('div');
        const id = `js-sequence-diagrams-${i}`;
        container.id = id;
        container.className = 'align-center';
        rootElement.parentElement.replaceChild(container, rootElement);

        const diagram = Diagram.parse(block.childNodes[0].nodeValue);
        diagram.drawSVG(id, window.sequenceDiagramsOptions
            ? window.sequenceDiagramsOptions
            : {theme: 'simple'});
    }
};

Even.responsiveTable = function () {
    const tables = document.querySelectorAll('.post-content > table');
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';
        table.parentElement.replaceChild(wrapper, table);
        wrapper.appendChild(table);
    }
};

let languages = {
    "language-bash": "Bash",
    "language-c": "C",
    "language-cs": "C#",
    "language-cpp": "C++",
    "language-css": "CSS",
    "language-coffeescript": "CoffeeScript",
    "language-html": "HTML",
    "language-xml": "XML",
    "language-http": "HTTP",
    "language-json": "JSON",
    "language-java": "Java",
    "language-js": "JavaScript",
    "language-javascript": "JavaScript",
    "language-makefile": "Makefile",
    "language-markdown": "Markdown",
    "language-objectivec": "Objective-C",
    "language-php": "PHP",
    "language-perl": "Perl",
    "language-python": "Python",
    "language-ruby": "Ruby",
    "language-sql": "SQL",
    "language-shell": "Shell",
    "language-erlang": "Erlang",
    "language-go": "Go",
    "language-go-html-template": "Go HTML Template",
    "language-groovy": "Groovy",
    "language-haskell": "Haskell",
    "language-kotlin": "Kotlin",
    "language-clojure": "Clojure",
    "language-less": "Less",
    "language-lisp": "Lisp",
    "language-lua": "Lua",
    "language-matlab": "Matlab",
    "language-rust": "Rust",
    "language-scss": "Scss",
    "language-scala": "Scala",
    "language-swift": "Swift",
    "language-typescript": "TypeScript",
    "language-yml": "YAML",
    "language-yaml": "YAML",
    "language-toml": "TOML",
    "language-python3":"Python3",
    "language-ini": "Conf",
    "language-conf": "Conf",
    "language-terminfo": "terminfo",
}
//https://gohugo.io/content-management/syntax-highlighting/

Even.addAppleButton = function () {
    $(".highlight").prepend('<div class="termible-widget-toolbar">\n' +
        '                <div class="termible-widget-button termible-widget-close"></div>\n' +
        '                <div class="termible-widget-button termible-widget-min"></div>\n' +
        '                <div class="termible-widget-button termible-widget-max"></div><span id="code" style="float: right;cursor: pointer">Code</span>' +
        '\n' +
        '            </div>')
    $(".highlight > .chroma").each(function () {
        let chroma = this;
        let names = this.className.split(" ")
        let language
        if (names.length >= 2) {
            language = names.slice(1)
        }

        if (language !== undefined) {
            // console.log($(this).parent().find("span#code"))
            let code = languages[language] === undefined ? " Code" : languages[language]
            $(this).parent().find("span#code").html("Copy " + code).click(function () {
                let codeTxt = $(chroma).find("pre:last").text()
                // console.log(codeTxt);
                copyTextToClipboard(codeTxt)
            })
        }
    })
    //复制
    function copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            return;
        }
        navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
            alert("successful")
        }, function(err) {
            alert("err")
            console.error('Async: Could not copy text: ', err);
        });
        document.execCommand('copy')
    }
    // var highlightBlocks = document.getElementsByClassName('highlight');
    // for (var i = 0; i < highlightBlocks.length; i++) {
    //     let copyBtn = addCopyButton(highlightBlocks[i]);
    //     let high = highlightBlocks[i];
    //     copyBtn.addEventListener("click",function () {
    //         let codeBody ;
    //         let pre = $(high).find("pre")
    //
    //         if (pre !== undefined){
    //             codeBody = pre.length === 2 ? pre[1].innerText : ""
    //         }
    //
    //         let code = $(high).find("pre>code")
    //         if (code !== undefined){
    //             codeBody = code.innerText
    //         }
    //         console.log(codeBody)
    //     })
    // }
    // function addCopyButton(containerEl) {
    //     var copyBtn = document.createElement("button");
    //     copyBtn.className = "highlight-copy-btn";
    //     copyBtn.textContent = "Copy";
    //
    //     containerEl.appendChild(copyBtn);
    //     return copyBtn
    // }
}
export {Even}
