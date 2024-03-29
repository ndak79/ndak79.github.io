$(document).ready(function () {
    function loadScript(scriptName) {
        var script = document.createElement('script');
        script.src = scriptName;
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }

    MathJax = {
        loader: {load: ['[tex]/tagformat']},
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            tags: 'ams',
            packages: {'[+]': ['tagformat', 'sections']},
            tagformat: {
                number: (n) => MathJax.config.section + '.' + n,
                id: (tag) => 'eqn-id:' + tag
            }
        },
        CommonHTML: {linebreaks: {automatic: true}},
        startup: {
            ready() {
                const Configuration = MathJax._.input.tex.Configuration.Configuration;
                const CommandMap = MathJax._.input.tex.SymbolMap.CommandMap;
                new CommandMap('sections', {
                    nextSection: 'NextSection',
                    setSection: 'SetSection',
                    setCounter: 'SetCounter'
                }, {
                    NextSection(parser, name) {
                        MathJax.config.section++;
                        parser.tags.counter = parser.tags.allCounter = 0;
                    },
                    SetSection(parser, name) {
                        const n = parser.GetArgument(name);
                        MathJax.config.section = parseInt(n);
                    },
                    SetCounter(parser, name) {
                        const m = parser.GetArgument(name);
                        parser.tags.counter = parseInt(m) - 1;
                    }
                });
                Configuration.create(
                    'sections', {handler: {macro: ['sections']}}
                );
                MathJax.startup.defaultReady();
            }
        }
    };

    /*$(document, window).on('contextmenu', function (event) {
        event.preventDefault();
        alert('Click chuột phải không được cho phép.');
    });*/

    (function () {
        let script = document.createElement('script');
        script.src = 'mathJax/tex-chtml-full.js';
        script.async = true;
        document.head.appendChild(script);
    })();
});