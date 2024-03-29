$(function () {
    $(window).bind('beforeunload', function () {
        document.getElementById('smith-input-parameters').reset();
    });

    let updateBoxSize = function () {
        let wheight = window.innerHeight - 50;
        let wwidth = window.innerWidth;
        let wsize;
        if (wwidth > wheight) {
            wsize = wheight;
        } else {
            wsize = wwidth;
        }
        $('#box').css({"width": wsize, "height": wsize});
    };

    updateBoxSize();

    $(window).resize(function () {
        updateBoxSize();
    });

    // Get the height of #item-3
    var item3Height = window.innerHeight - 120
    // Set the height of #item-4 to match #item-3
    $('#item-3, #item-4').height(item3Height);

    //Bat buoc nhap cac tham so de thoa man dieu kien tren Smith-Chart
    function force_input(id) {
        var el1 = $('#' + id + ' input:nth-of-type(1)');
        var el2 = $('#' + id + ' input:nth-of-type(2)');

        el1.change(function () {
            if (el1.val() !== '') {
                el2.attr('required', true);
                if (id === 'Z-load' || id === 'Z-in-l') {
                    $('input[name="Z0"]').attr('required', true);
                }
            }
        });

        el2.change(function () {
            if (el2.val() !== '') {
                el1.attr('required', true);
                if (id === 'Z-load' || id === 'Z-in-l') {
                    $('input[name="Z0"]').attr('required', true);
                }
            }
        });
    }

    force_input('Z-load');
    force_input('frequency')

    //Tinh toan ve do thi Vonpe-Smith va hien thi cac tham so duong truyen len do thi
    var board;

    $("#item-6, #item-7").hide();


        $('html, body').animate({
            scrollTop: $('#buttons').offset().top - 15
        }, 300); // Thời gian cuộn là 1000 miliseconds (1 giây)

    //Khoi tao do thi
    board = JXG.JSXGraph.initBoard('box', {
        boundingBox: [-1.06, 1.06, 1.06, -1.06],
        title: 'Smith Chart',
        description: 'Smith Chart',
        keepaspectratio: true,
        showFullscreen: true,
        panShift: true,
        axis: true,
        showCopyright: false,
        defaultAxes: {x: {ticks: {visible: false}}, y: {visible: false}}
    });

    var Zcenter_OR, Zcenter_OX;
    var rl, xl;

    var O = board.create('point', [0, 0], {
        name: '',
        fixed: true,
        size: 1,
        label: {autoPosition: true, offset: [3, 3]}
    });
    var P10 = board.create('point', [1, 0], {
        name: 'A',
        fixed: true,
        size: 1,
        label: {autoPosition: true, offset: [3, 3]}
    });

    var Pm10 = board.create('point', [-1, 0], {
        name: 'B',
        fixed: true,
        size: 1,
        label: {autoPosition: true, offset: [3, 3]}
    });
    //Duong thang Rr = 1 & Ri=0
    var X_1 = board.create('line', [[1, -100], [1, 100]], {strokecolor: 'purple', fixed: true, visible: false});
    var OX = board.create('line', [[-0.99, 0], [0.99, 0]], {
        visible: false,
        straightFirst: false,
        straightLast: false,
        fixed: true
    });

    //Duong tron R = 1
    var cR1 = board.create('circle', [O, 1], {strokecolor: 'black'});
    let coor = [10, 4, 2, 1, 0.5, 0.2]
    coor.forEach(e => {
        let [c_OR, cp_OX, cm_OX] = get_center_givenZ(e, e);
        R_base(c_OR, e, '#F3B664', 1);
        X_base(cp_OX, e, '#F3B664', 1);
        X_base(cm_OX, -e, '#F3B664', 1);
    });

    function R_base(center, r, color, w) {
        circleR = board.create('circle', [center, P10], {
            strokecolor: color,
            strokewidth: w,
            opacity: 0.38
        });
        interR = board.create('intersection', [OX, circleR, 1], {name: '', size: 0.3});
    }

    function X_base(center, x, color, w) {
        circleX = board.create('circle', [center, P10], {
            strokecolor: color,
            strokewidth: w,
            opacity: 0.38
        });
        interX = board.create('intersection', [cR1, circleX, x > 0 ? 1 : 0], {name: '', size: 0.3});
    }

    function Z_Y_convert(G, SWR, color, str_name) {
        Gamma_line = board.create('line', [G, O], {visible: false});
        Yp = board.create('otherintersection', [SWR, Gamma_line, G], {
            name: str_name,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });

        Yline = board.create('line', [G, Yp], {
            straightFirst: false,
            straightLast: false,
            strokecolor: color
        });
        return [Yp, Yline];
    }

    function find_circle_center(P1, P2, line) {
        var P1P2 = board.create('line', [P1, P2], {namme: '', visible: false});
        var midperpend_P1P2 = board.create('midpoint', [P1, P2], {name: '', visible: false});
        var perp_P1P2 = board.create('perpendicular', [P1P2, midperpend_P1P2], {visible: false});
        center = board.create('intersection', [line, perp_P1P2], {
            name: '',
            visible: false,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });  //Xac dinh tam duong tron R
        return center;
    }

    function getX_of_point(Point) {
        center = find_circle_center(Point, P10, X_1);
        radius = center.Y()
        x = 1 / radius
        return x
    }

    function create_center_givenG(G) {
        var mid_Z_P10 = board.create('midpoint', [P10, G], {name: '', visible: false});
        var perp_ZP10 = board.create('perpendicular', [board.create('line', [G, P10], {visible: false}), mid_Z_P10], {visible: false});
        OR_G = board.create('intersection', [OX, perp_ZP10], {
            name: '',
            visible: false,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });  //Xac dinh tam duong tron R
        OX_G = board.create('intersection', [X_1, perp_ZP10], {
            name: '',
            visible: false,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });  //Xac dinh tam duong tron X
        return [OR_G, OX_G];
    }

    function create_center_givenZ(r, x) {
        OR_Z = board.create('point', [r / (1 + r), 0], {
            name: '',
            visible: false,
            fixed: true,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        OX_Z = board.create('point', [1, 1 / x], {
            name: '',
            visible: false,
            fixed: true,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        return [OR_Z, OX_Z];
    }

    function get_center_givenZ(r, x) {
        OR_Z = board.create('point', [r / (1 + r), 0], {
            name: '',
            visible: false,
            fixed: true,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        OpX_Z = board.create('point', [1, 1 / x], {
            name: '',
            visible: false,
            fixed: true,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        OmX_Z = board.create('point', [1, 1 / -x], {
            name: '',
            visible: false,
            fixed: true,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        return [OR_Z, OpX_Z, OmX_Z];
    }

    function draw_circle_R(center, color, w) {
        circleR = board.create('circle', [center, P10], {
            strokecolor: color,
            strokewidth: w
        });
        interR = board.create('intersection', [OX, circleR, 1], {
            name: (-1 + 1 / circleR.Radius()).toFixed(2),
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        return [interR, circleR];
    }

    function draw_circle_X(center, y, color, w) {
        circleX = board.create('circle', [center, P10], {
            strokecolor: color,
            strokewidth: w
        });
        xNorm = (1 / circleX.Radius()).toFixed(2);
        interX = board.create('intersection', [cR1, circleX, y > 0 ? 1 : 0], {
            name: (y > 0 ? 'j' : '-j') + xNorm,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        return [interX, circleX, xNorm];
    }

    function find_Gamma_Point(cR, cX, x, name) {
        var G = board.create('intersection', [cR, cX, x > 0 ? 1 : 0], {
            name: name,
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        return G;
    }

    function find_lambda_distance(P, color) {
        Pline = board.create('line', [O, P], {straightFirst: false, straightLast: true, strokeColor: color})
        PR1 = board.create('intersection', [cR1, Pline], {
            name: '',
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        })
        angle = board.create('angle', [PR1, O, [-1, 0]], {visible: false})
        lambda_distance = parseFloat((0.5 * angle.Value() / (2 * Math.PI)).toFixed(4))
        lambda_text = board.create('text', [PR1.X() - 0.14, PR1.Y(), lambda_distance + ' &lambda;'], {
            fontSize: 15,
            strokeColor: 'black'
        })
        return [lambda_distance, [PR1, lambda_text], Pline]
    }

    function main() {
        var params = new URLSearchParams(window.location.search);
        var GammaR = parseFloat(params.get('GammaR'));
        var GammaJ = parseFloat(params.get('GammaJ'));
        var Z0 = parseFloat(params.get('Z0'));
        var f = parseFloat(params.get('f'));


        console.log('GammaR:', GammaR);
        console.log('GammaJ:', GammaJ);
        console.log('Z0:', Z0);
        console.log('f:', f);


        let Gamma = board.create('point', [GammaR, GammaJ], {name: '&Gamma;*'});

        //Duong tron SWR di qua diem ZL
        var SWR = board.create('circle', [O, Gamma], {strokecolor: 'gray'});
        //Xac dinh diem YL doi xung voi ZL qua tam O tren duong tron SWR
        var [Yp, Yline] = Z_Y_convert(Gamma, SWR, 'gray', 'Y_L');
        //Tim lambda cua YL
        var [YL_lambda, YL_lambda_text, YL_lambda_line] = find_lambda_distance(Yp, 'gray')
        var one_jx_circle = board.create('circle', [[0.5, 0], 0.5], {strokecolor: 'gray'});

        //Giao diem cua duong tron SWR chua ZL va duong tron 1+jx
        var Y1 = board.create('intersection', [SWR, one_jx_circle, 0], {
            name: 'Y1',
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        var Y2 = board.create('intersection', [SWR, one_jx_circle, 1], {
            name: 'Y2',
            size: 1,
            label: {autoPosition: true, offset: [3, 3]}
        });
        //Tim lambda cua Y1, Y2
        var [Y1_lambda, Y1_lambda_text, Y1_lambda_line] = find_lambda_distance(Y1, 'gray')
        let Y1_center_X = find_circle_center(P10, Y1, X_1)
        var [iXY1, X_Y1, xNorm_Y1] = draw_circle_X(Y1_center_X, Y1.Y(), 'gray', 1)

        let Y2_center_X = find_circle_center(P10, Y2, X_1)
        var [iXY2, X_Y2, xNorm_Y2] = draw_circle_X(Y2_center_X, Y2.Y(), 'gray', 1)

        var [X_Y2_lambda, X_Y2_lambda_text, X_Y2_lambda_line] = find_lambda_distance(iXY2, 'gray')


        var [Y2_lambda, Y2_lambda_text, Y2_lambda_line] = find_lambda_distance(Y2, 'gray')
        var [X_Y1_lambda, X_Y1_lambda_text, X_Y1_lambda_line] = find_lambda_distance(iXY1, 'gray')

        let d1_single_shunt = (Y1_lambda - YL_lambda >= 0) ? (Y1_lambda - YL_lambda) : (Y1_lambda - YL_lambda + 0.5)
        console.log('d1_single_shunt: ', d1_single_shunt)
        let l1_single_shunt = (X_Y2_lambda >= 0.25) ? (X_Y2_lambda - 0.25) : (X_Y2_lambda + 0.25)   //short circuit
        console.log('\nl1_single_shunt: ', l1_single_shunt)
        let d2_single_shunt = (Y2_lambda - YL_lambda >= 0) ? (Y2_lambda - YL_lambda) : (Y2_lambda - YL_lambda + 0.5)
        console.log('\nd2_single_shunt: ', d2_single_shunt)
        let l2_single_shunt = (X_Y1_lambda >= 0.25) ? (X_Y1_lambda - 0.25) : (X_Y1_lambda + 0.25)   //short circuit
        console.log('\nl2_single_shunt: ', l2_single_shunt)

        var objects = [Gamma, SWR, [Yline, Yp], YL_lambda_line, YL_lambda_text, one_jx_circle, [Y1, Y2], Y1_lambda_line, Y1_lambda_text, [X_Y1, iXY1], [X_Y2, iXY2], X_Y2_lambda_line, X_Y2_lambda_text, Y2_lambda_line, Y2_lambda_text, X_Y1_lambda_line, X_Y1_lambda_text];
        var content = ["Điểm biểu diễn Z*", "Vẽ đường tròn SWR (tâm O đi qua Z*)", "Lấy đối xứng Z* qua tâm O ta được dẫn nạp YL, lúc này vòng tròn trở kháng trở thành vòng tròn dẫn nạp", "Nối dài tâm O với YL để xác định wavelength", "Đọc giá trị trên đường tròn Wavelength Toward Generator ta được l_YL=" + YL_lambda.toFixed(4) + "&lambda;", "Vẽ đường tròn g chuẩn hoá = 1", "Ta thấy, dây chêm mắc cách tải một khoảng là d. Khoảng d này có tác dụng làm cho g chuẩn hoá của mạch =1. </br>Do đó, dẫn nạp của mạch tại vị trí dây chêm (cách tải khoảng d) phải nằm trên đường tròn g chuẩn hoá =1. Để tìm dẫn nạp tại vị trí dây chêm, ta chỉ cần xác định giao điểm của đường tròn g chuẩn hoá =1 với đường tròn SWR. Hai giao điểm này tương ứng với 2 nghiệm của bài toán", "Lời giải 1: </br>Nối dài tâm O với Y1 để xác định wavelength", "Đọc giá trị trên đường tròn Wavelength Toward Generator ta được l_Y1=" + Y1_lambda.toFixed(4) + "&lambda;</br>Từ đây tính được d1=l_Y1-l_YL= " + d1_single_shunt.toFixed(4) + "&lambda;", "Vẽ đường tròn kháng qua điểm Y1 để xác định thành phần kháng b_Y1", "Phần dây chêm mắc tại vị trí cách tải một khoảng d có tác dụng khử thành phần kháng của  mạch. Do đó, để mạch PHTK thì phần dây chêm phải có dẫn nạp = -jb_Y1, do đó trên vòng tròn đơn vị xác định điểm có dẫn nạp = -jb_Y1 = j" + xNorm_Y2 + ", dễ thấy vòng tròn kháng của điểm này cũng đi qua Y2", "Nối dài tâm O với giao điểm này để xác định wavelength", "Đọc giá trị trên đường tròn Wavelength Toward Generator ta được " + X_Y2_lambda.toFixed(4) + "&lambda;</br>Nếu dây chêm là ngắn mạch. Di chuyển từ điểm A tới điểm có dẫn nạp = j" + xNorm_Y2 + " theo hướng về phía máy phát. Từ đây tính được l1_short=" + l1_single_shunt.toFixed(4) + "&lambda;</br>Nếu dây chêm là hở mạch. Di chuyển từ điểm B tới điểm có dẫn nạp = j" + xNorm_Y2 + " theo hướng về phía máy phát. Từ đây tính được l1_open=" + X_Y2_lambda.toFixed(4) + "&lambda;", "Lời giải 2: </br>Nối dài tâm O với Y2 và xác định wavelength trên đường tròn Wavelength Toward Generator", "Đọc giá trị trên đường tròn Wavelength Toward Generator ta được l_Y2=" + Y2_lambda.toFixed(4) + "&lambda;</br>Từ đây tính được d2=l_Y2-l_YL= " + d2_single_shunt.toFixed(4) + "&lambda;", "Phần dây chêm mắc tại vị trí cách tải một khoảng d có tác dụng khử thành phần kháng của  mạch. Do đó, để mạch PHTK thì phần dây chêm phải có dẫn nạp = -jb_Y2, do đó trên vòng tròn đơn vị xác định điểm có dẫn nạp = -jb_Y2 = -j" + xNorm_Y1 + ", dễ thấy vòng tròn kháng của điểm này đi qua Y1, <br>Nối dài tâm O với giao điểm này để xác định wavelength", "Đọc giá trị trên đường tròn Wavelength Toward Generator ta được l_BS2=" + X_Y1_lambda.toFixed(4) + "&lambda;</br>Nếu dây chêm là ngắn mạch. Di chuyển từ điểm A tới điểm có dẫn nạp = -j" + xNorm_Y1 + " theo hướng về phía máy phát. Từ đây tính được l2_short=" + l2_single_shunt.toFixed(4) + "&lambda;</br>Nếu dây chêm là hở mạch. Di chuyển từ điểm B tới điểm có dẫn nạp = -j" + xNorm_Y1 + " theo hướng về phía máy phát. Từ đây tính được l2_open=" + X_Y1_lambda.toFixed(4) + "&lambda;"]

        for (var i = 0; i < objects.length; i++) {
            if (Array.isArray(objects[i])) {
                for (var obj of objects[i]) {
                    obj.hideElement();
                }
            } else {
                objects[i].hideElement();
            }
        }

        function changeColor(object, color, w) {
            if (Array.isArray(object)) {
                for (var obj of object) {
                    obj.setAttribute({strokecolor: color, strokewidth: w});
                }
            } else {
                object.setAttribute({strokecolor: color, strokewidth: w});
            }
            board.update(); // Cập nhật bảng để hiển thị thay đổi màu.
        }

        var index = -1;
        // Sử dụng biến global để lưu trạng thái phần đã được tô đậm.
        var highlightedIndex = null;
        var missContent = 0

        // Sử dụng hàm để kiểm tra và thay đổi trạng thái tô đậm dựa trên nội dung.
        function highlightContent(index) {
            var currentContent = $("#item-4 p").eq(index).text().trim();
            console.log('highlightedIndex: ', highlightedIndex, '\ncurrentContent: ', currentContent)
            if (highlightedIndex !== null && currentContent !== "") {
                // Nếu có phần trước đó đang tô đậm, thì xoá tô đậm nó.
                $("#item-4 p").eq(highlightedIndex).css("font-weight", "normal");
                changeColor(objects[highlightedIndex], 'gray', 1);
            }

            if (currentContent !== "") {
                // Nếu nội dung có, tô đậm nó và cập nhật trạng thái highlightedIndex.
                $("#item-4 p").eq(index).css("font-weight", "bold");
                changeColor(objects[index], 'red', 3);
                highlightedIndex = index;
            }
        }

        function highlightPrevious(index) {
            var currentContent = $("#item-4 p").eq(index).text().trim();

            if (currentContent !== "") {
                // Nếu nội dung có, tô đậm nó và cập nhật trạng thái highlightedIndex.
                $("#item-4 p").eq(index).css("font-weight", "bold");
                changeColor(objects[index], 'red', 3);
                highlightedIndex = index;
            } else {
                $("#item-4 p").eq(index - 1).css("font-weight", "bold");
                changeColor(objects[index - 1], 'red', 3);
            }
        }

        $('#next').off('click').on('click', nextButtonClickHandler);

        function nextButtonClickHandler() {
            if (index < objects.length - 1) {
                index++;
                if (Array.isArray(objects[index])) {
                    for (var obj of objects[index]) {
                        obj.showElement();
                    }
                } else {
                    objects[index].showElement();
                }
                console.log('index: ', index, '\nobjects: ', objects[index])
                board.update()

                if (content[index] !== "") {
                    $("#item-4").append("<p>" + (index + 1 - missContent) + ". " + content[index] + "</p>").fadeIn();
                } else {
                    $("#item-4").append("<p>" + content[index] + "</p>").fadeIn();
                    missContent++;
                }
                $('#item-4').animate({
                    scrollTop: $('#item-4')[0].scrollHeight
                }, 500);
                highlightContent(index);

            } else {
                $('#item-5, #item-6, #item-7').show()
                $("#Z01-sol1, #Z01-sol2, #Z02-sol1, #Z02-sol2, #Z03-sol1, #Z03-sol2").html(`${Z0} &#8486;`);
                $("#d-sol1").html(`${d1_single_shunt.toFixed(4)} &#955;`);
                $("#l-sol1").html(`${X_Y2_lambda.toFixed(4)}&#955; (with open circuit)</br>${l1_single_shunt.toFixed(4)}&#955; (with short circuit)`);
                $('#d-sol2').html(`${d2_single_shunt.toFixed(4)} &#955;`);
                $('#l-sol2').html(`${X_Y1_lambda.toFixed(4)}&#955; (with open circuit)</br>${l2_single_shunt.toFixed(4)}&#955; (with short circuit)`);
            }
        }

        $('#previous').off('click').on('click', previousButtonClickHandler);

        function previousButtonClickHandler() {
            if (index >= 0) {
                $('#item-5, #item-6, #item-7').hide();
                if (Array.isArray(objects[index])) {
                    for (var obj of objects[index]) {
                        obj.hideElement();
                    }
                } else {
                    objects[index].hideElement();
                }
                index--;
                console.log('index: ', index, '\nobjects: ', objects[index])
                board.update()
                $("#item-4").children().last().not("h4").remove();
                highlightPrevious(index)
            }
        }


    }

    main();

});