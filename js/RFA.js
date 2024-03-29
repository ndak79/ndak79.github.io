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
    var item3Height = window.innerHeight - 120;
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

    force_input('S11');
    force_input('S12');
    force_input('S21');
    force_input('S22');
    force_input('Z-line');
    force_input('frequency')

    //Tinh toan ve do thi Vonpe-Smith va hien thi cac tham so duong truyen len do thi
    var board;

    // Khi tải trang, kiểm tra và đặt giá trị từ localStorage vào các input field
    $('input[type="number"]').each(function () {
        var inputName = $(this).attr('name');
        var storedValue = localStorage.getItem('localrf' + inputName);
        if (storedValue) {
            $(this).val(storedValue);
        }
    });

    $('#smith-input-parameters').off('submit').on('submit', function (e) {
        $("#item-6, #item-7, #table-oneDir, #table-biDir").hide();
        $("#GT-error-result").empty();
        $('#oneDir-gs-result, #oneDir-gL-result, #Cs-stable-Result, #Rs-stable-Result, #CL-stable-Result, #RL-stable-Result, .gS-res, .gL-res').empty()

        $('html, body').animate({
            scrollTop: $('#smith-chart-calculate').offset().top - 10
        }, 300); // Thời gian cuộn là 1000 miliseconds (1 giây)

        //Khoi tao do thi
        e.preventDefault();
        $('input[type="number"]').each(function () {
            var inputName = $(this).attr('name');
            var inputValue = $(this).val();
            console.log('inputvalue = ', inputValue)
            localStorage.setItem('localrf' + inputName, inputValue);
        });

        board = JXG.JSXGraph.initBoard('box', {
            boundingBox: [-1.53, 1.53, 1.53, -1.53],
            title: 'Smith Chart',
            description: 'Smith Chart',
            keepaspectratio: true,
            showFullscreen: true,
            panShift: true,
            axis: true,
            showCopyright: false,
            defaultAxes: {x: {ticks: {visible: false}}, y: {visible: false}}
        });

        var objects = [];
        var Dir, Ginj, GSj, GLj;
        var gst = [], glt = [], CSt = [], RSt = [], CLt = [], RLt = [];
        var CircleSt = [], CircleLt = [], GammaStmin = [], GammaLtmin = [], Sdistmin, Ldistmin, minSum, iSmin = 1,
            iLmin = 1, imin = 1;
        var CSmin, RSmin, CLmin, RLmin, GammaSmin, GammaLmin;

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
                opacity: 0.68
            });
            interR = board.create('intersection', [OX, circleR, 1], {name: '', size: 0.3});
        }

        function X_base(center, x, color, w) {
            circleX = board.create('circle', [center, P10], {
                strokecolor: color,
                strokewidth: w,
                opacity: 0.68
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
            lambda_distance = parseFloat((0.5 * angle.Value() / (2 * Math.PI)).toFixed(3))
            lambda_text = board.create('text', [PR1.X() - 0.14, PR1.Y(), lambda_distance + ' &lambda;'], {
                fontSize: 15,
                strokeColor: 'black'
            })
            return [lambda_distance, [PR1, lambda_text], Pline]
        }

        function isPointInCircle(point, circle) {
            // Tính khoảng cách từ điểm đến tâm của vòng tròn
            var distance = circle.center.Dist(point);

            // So sánh khoảng cách với bán kính của vòng tròn
            return distance <= circle.getRadius(); // Trả về true nếu điểm nằm trong hoặc trên mép vòng tròn, false nếu nằm ngoài
        }

        function main() {
            var modS11 = parseFloat($('input[name="modS11"]').val());
            var argS11 = parseFloat($('input[name="argS11"]').val()) * Math.PI / 180;
            var modS12 = parseFloat($('input[name="modS12"]').val());
            console.log('modS12=', modS12)
            var argS12 = parseFloat($('input[name="argS12"]').val()) * Math.PI / 180;
            var modS21 = parseFloat($('input[name="modS21"]').val());
            var argS21 = parseFloat($('input[name="argS21"]').val()) * Math.PI / 180;
            var modS22 = parseFloat($('input[name="modS22"]').val());
            var argS22 = parseFloat($('input[name="argS22"]').val()) * Math.PI / 180;

            // var Z0 = parseFloat($('input[name="Z0"]').val());
            var Z0 = 50;
            var Ga = parseFloat($('input[name="gain-a"]').val());
            var Gp = parseFloat($('input[name="gain-p"]').val());
            var Gt = parseFloat($('input[name="gain-t"]').val());
            var GSdb = [], GLdb = [];
            for (var i = 1; i <= 4; i++) {
                GSdb[i] = parseFloat($('input[name="GS' + i + '"]').val());
                GLdb[i] = parseFloat($('input[name="GL' + i + '"]').val());
            }
            var f = parseFloat($('input[name="f"]').val());
            var realR = parseFloat($('input[name="realR"]').val());
            console.log(Gp)

            var S11 = Math.Complex.polar(modS11, argS11);
            var S12 = Math.Complex.polar(modS12, argS12);
            var S21 = Math.Complex.polar(modS21, argS21);
            var S22 = Math.Complex.polar(modS22, argS22);
            console.log('S11 = ', S11, '\nS12 = ', S12);
            console.log('S21 = ', S21, '\nS22 = ', S22);

            $('#table-sMatrix').css({'display': 'inline-table', 'width': '100%'});
            $('#S-matrix').html('Ma trận tán xạ S').css({'text-align': 'center'});
            $('#S11-comp').html('S11 = ' + S11.re.toFixed(4) + (S11.im > 0 ? " + " : " - ") + "j" + Math.abs(S11.im).toFixed(4));
            $('#S12-comp').html('S12 = ' + S12.re.toFixed(4) + (S12.im > 0 ? " + " : " - ") + "j" + Math.abs(S12.im).toFixed(4));
            $('#S21-comp').html('S21 = ' + S21.re.toFixed(4) + (S21.im > 0 ? " + " : " - ") + "j" + Math.abs(S21.im).toFixed(4));
            $('#S22-comp').html('S22 = ' + S22.re.toFixed(4) + (S22.im > 0 ? " + " : " - ") + "j" + Math.abs(S22.im).toFixed(4));

            let Del = (S11.mul(S22)).sub(S12.mul(S21));
            let mDel = Del.abs();
            console.log('mDel = ', mDel, '\nDel = ', Del);
            let K = (1 - (S11.abs()) ** 2 - (S22.abs()) ** 2 + mDel ** 2) / (2 * (S12.mul(S21)).abs());
            let strK = (K === Infinity) ? '&infin;' : K.toFixed(4);
            console.log('mDel = ', mDel, '\nK = ', K);

            $('#table-Rolllet').css({'display': 'inline-table', 'width': '100%'});
            $('#Rol-Del-Result').html('&#8710; = ' + Del.re.toFixed(4) + (Del.im > 0 ? " + " : " - ") + "j" + Math.abs(Del.im).toFixed(4));
            $('#Rol-mDel-Result').html('&#8739;&#8710;&#8739; = ' + mDel.toFixed(4));
            $('#Rol-K-Result').html('K = ' + strK);

            //Ket luan loai on dinh
            if (K > 1 && mDel < 1) {
                $('#type-stable').html('Do K > 1 và &#8739;&#8710;&#8739; < 1 nên &#10153; Ổn định không điều kiện').css({
                    'font-weight': 'bold',
                    'color': 'red'
                });
            } else {
                $('#type-stable').html('Do K và &#8739;&#8710;&#8739; không thoả mãn các điều kiện của tiêu chuẩn Rollet nên &#10153; Ổn định có điều kiện').css({
                    'font-weight': 'bold',
                    'color': 'red'
                });
            }

            let CL = (S22.sub(Del.mul(S11.con()))).con() // Delta * conj(S11)
                .div(Math.Complex((S22.abs()) ** 2 - mDel ** 2, 0));
            let mCL = CL.abs();
            let argCL = 180 * CL.arg() / Math.PI;
            let RL = ((S12.mul(S21)).div(Math.Complex((S22.abs()) ** 2 - mDel ** 2, 0))).abs();
            console.log('CL = ', CL, '\nmCL = ', mCL, '\nargCl = ', argCL, '\nRL = ', RL);

            let CS = (S11.sub(Del.mul(S22.con()))).con()
                .div(Math.Complex((S11.abs()) ** 2 - mDel ** 2, 0));
            let mCS = CS.abs();
            let argCS = 180 * CS.arg() / Math.PI;
            let RS = ((S12.mul(S21)).div(Math.Complex((S11.abs()) ** 2 - mDel ** 2, 0))).abs();
            console.log('CS = ', CS, '\nmCS = ', mCS, '\nargCS = ', argCS, '\nRS = ', RS);

            $('#table-CircleLS').css({'display': 'inline-table', 'width': '100%'});
            $('#Load-CL-Result').html('CL = ' + CL.re.toFixed(4) + (CL.im > 0 ? " + " : " - ") + "j" + Math.abs(CL.im).toFixed(4) + ' = ' + mCL.toFixed(4) + ' &ang; ' + argCL.toFixed(4) + '&deg; = ' + (realR * mCL).toFixed(4) + 'cm &ang; ' + argCL.toFixed(4) + '&deg;');
            $('#Load-RL-Result').html('RL = ' + RL.toFixed(4) + ' = ' + (realR * RL).toFixed(4) + 'cm');
            $('#Load-CS-Result').html('CS = ' + CS.re.toFixed(4) + (CS.im > 0 ? " + " : " - ") + "j" + Math.abs(CS.im).toFixed(4) + ' = ' + mCS.toFixed(4) + ' &ang; ' + argCS.toFixed(4) + '&deg; = ' + (realR * mCS).toFixed(4) + 'cm &ang; ' + argCS.toFixed(4) + '&deg;');
            $('#Load-RS-Result').html('RS = ' + RS.toFixed(4) + ' = ' + (realR * RS).toFixed(4) + 'cm');


            board.create('point', [CS.re, CS.im], {name: 'C_S'})
            let CircleS = board.create('circle', [[CS.re, CS.im], RS], {strokecolor: 'gray'});

            board.create('point', [CL.re, CL.im], {name: 'C_L'})
            let CircleL = board.create('circle', [[CL.re, CL.im], RL], {strokecolor: 'gray'});

            let OSline = board.create('line', [O, [CS.re, CS.im]], {
                strokecolor: 'gray',
                fixed: true,
                straightFirst: false,
                straightLast: false
            });
            let OLline = board.create('line', [O, [CL.re, CL.im]], {
                strokecolor: 'gray',
                fixed: true,
                straightFirst: true,
                straightLast: false
            });
            // $("#").html('\\$');
            let U = modS12 * modS21 * modS11 * modS22 / ((1 - modS11 ** 2) * (1 - modS22 ** 2));
            console.log('U = ', U);
            $("#Udir-result").html('U = ' + U.toFixed(4));

            // $("[id^='table-']").hide();
            let GTerror_max = (1 / (1 - U) ** 2);
            let GTerror_min = (1 / (1 + U) ** 2);
            $("#GT-error-result").html('\$\\lt \\dfrac{G_{T}}{G_{T U}}\\lt\$');
            $("#GT-error-result").prepend((10 * Math.log10(GTerror_min)).toFixed(4) + '(dB) = ' + GTerror_min.toFixed(4)).append(GTerror_max.toFixed(4) + ' = ' + (10 * Math.log10(GTerror_max)).toFixed(4) + '(dB)');
            console.log('GTerror_max = ', 10 * Math.log10(GTerror_max))
            if (10 * Math.log10(GTerror_max) < 1) {
                $("#GT-error-result").append('<br> <span style="font-weight: bold; color: red">&#10153; Kết luận: Đơn hướng</span>');
                Dir = 1;
            } else {
                $("#GT-error-result").append('<br> <span style="font-weight: bold; color: red">&#10153; Kết luận: Song hướng</span>');
                Dir = 2;
            }
            if (!isNaN(Ga)) {


            } else {
                if (Dir === 1) {
                    // $("[id^='table-']").hide();
                    $('#table-oneDir').css({'display': 'inline-table', 'width': '100%'});
                    let GSmax = 1 / (1 - modS11 ** 2);
                    let GLmax = 1 / (1 - modS22 ** 2);
                    let G0 = modS21 ** 2;
                    let GSdbmax = 10 * Math.log10(GSmax)
                    let GLdbmax = 10 * Math.log10(GLmax)
                    let G0db = 10 * Math.log10(G0)
                    let GTmax = GSdbmax + GLdbmax + G0db;
                    let Gdiff = GTmax - Gt;
                    console.log('GTmax - GT = ', Gdiff)
                    minSum = 2;
                    for (var i = 1; i <= 4; i++) {
                        if (!isNaN(GSdb[i]) && !isNaN(GLdb[i])) {
                            gst[i] = Math.pow(10, GSdb[i] / 10) / GSmax;
                            glt[i] = Math.pow(10, GLdb[i] / 10) / GLmax;
                            $('#oneDir-gs-result').append('gs' + i + ' = ' + gst[i].toFixed(4) + '<br>')
                            $('#oneDir-gL-result').append('gl' + i + ' = ' + glt[i].toFixed(4) + '<br>')

                            CSt[i] = Math.Complex(gst[i] / (1 - (1 - gst[i]) * (modS11 ** 2))).mul(S11.con());
                            RSt[i] = Math.sqrt(1 - gst[i]) * (1 - modS11 ** 2) / (1 - (1 - gst[i]) * (modS11 ** 2));
                            $('#Cs-stable-Result').append('\$CS' + i + ' = ' + CSt[i].abs().toFixed(4) + ' &ang; ' + (180 * CSt[i].arg() / Math.PI).toFixed(4) + '&deg;\$' + ' = ' + (realR * CSt[i].abs()).toFixed(4) + 'cm &ang; ' + (180 * CSt[i].arg() / Math.PI).toFixed(4) + '&deg;<br>');
                            $('#Rs-stable-Result').append('\$RS' + i + ' = ' + RSt[i].toFixed(4) + '\$' + ' = ' + (realR * RSt[i]).toFixed(4) + 'cm<br>');

                            CircleSt[i] = board.create('circle', [[CSt[i].re, CSt[i].im], RSt[i]], {
                                name: 'CS' + i,
                                strokecolor: 'gray'
                            });
                            GammaStmin[i] = board.create('intersection', [CircleSt[i], OSline, 1], {
                                name: '&Gamma;S' + i,
                                size: 0.3,
                                label: {autoPosition: true}
                            });


                            CLt[i] = Math.Complex(glt[i] / (1 - (1 - glt[i]) * (modS22 ** 2))).mul(S22.con());
                            RLt[i] = Math.sqrt(1 - glt[i]) * (1 - modS22 ** 2) / (1 - (1 - glt[i]) * (modS22 ** 2));
                            $('#CL-stable-Result').append('\$CL' + i + ' = ' + CLt[i].abs().toFixed(4) + ' &ang; ' + (180 * CLt[i].arg() / Math.PI).toFixed(4) + '&deg;\$' + ' = ' + (realR * CLt[i].abs()).toFixed(4) + 'cm &ang; ' + (180 * CLt[i].arg() / Math.PI).toFixed(4) + '&deg;<br>');
                            $('#RL-stable-Result').append('\$RL' + i + ' = ' + RLt[i].toFixed(4) + '\$' + ' = ' + (realR * RLt[i]).toFixed(4) + 'cm<br>');

                            CircleLt[i] = board.create('circle', [[CLt[i].re, CLt[i].im], RLt[i]], {
                                name: 'CL' + i,
                                strokecolor: 'gray'
                            });
                            GammaLtmin[i] = board.create('intersection', [CircleLt[i], OLline, 1], {
                                name: '&Gamma;L' + i,
                                size: 0.3,
                                label: {autoPosition: true}
                            });
                            console.log('Khoảng cách lần ' + i + ' = ', O.Dist(GammaStmin[i]) + O.Dist(GammaLtmin[i]))
                            if (O.Dist(GammaStmin[i]) + O.Dist(GammaLtmin[i]) < minSum && !isPointInCircle(O, CircleLt[i]) && !isPointInCircle(O, CircleSt[i])) {
                                minSum = O.Dist(GammaStmin[i]) + O.Dist(GammaLtmin[i]);
                                imin = i;
                            }
                        }
                    }
                    console.log('imin = ', imin)

                    GSj = Math.Complex(GammaStmin[imin].X(), GammaStmin[imin].Y());
                    $('.gS-res').append('<br>\$\\Gamma_S =\$ ' + (GSj.re).toFixed(4) + '' + (GSj.im >= 0 ? ' + j' : ' - j') + Math.abs(GSj.im).toFixed(4) + ' = ' + GSj.abs().toFixed(4) + ' &ang; ' + (GSj.arg() * 180 / Math.PI).toFixed(4) + '&deg;  = ' + (realR * GSj.abs()).toFixed(4) + 'cm &ang; ' + (180 * GSj.arg() / Math.PI).toFixed(4) + '&deg;');

                    if ((isPointInCircle(GammaStmin[imin], cR1) && !isPointInCircle(GammaStmin[imin], CircleS) && modS11 < 1) || (isPointInCircle(GammaStmin[imin], cR1) && isPointInCircle(GammaStmin[imin], CircleS) && modS11 > 1) || (K > 1 && mDel < 1)) {
                        $('.is-source-stable').html('Điểm \$\\Gamma_S \$ này thuộc vùng ổn định ')
                    } else {
                        $('.is-source-stable').html('Điểm \$\\Gamma_S \$ này KHÔNG thuộc vùng ổn định ')
                    }
                    let GScon = board.create('point', [GSj.re, -GSj.im], {name: '&Gamma;_S*'});


                    GLj = Math.Complex(GammaLtmin[imin].X(), GammaLtmin[imin].Y());
                    $('.gL-res').html('\$\\Gamma_L = \$ ' + (GLj.re).toFixed(4) + '' + (GLj.im >= 0 ? ' + j' : ' - j') + Math.abs(GLj.im).toFixed(4) + ' = ' + GLj.abs().toFixed(4) + ' &ang; ' + (GLj.arg() * 180 / Math.PI).toFixed(4) + '&deg;  = ' + (realR * GLj.abs()).toFixed(4) + 'cm &ang; ' + (180 * GLj.arg() / Math.PI).toFixed(4) + '&deg;');

                    if ((isPointInCircle(GammaLtmin[imin], cR1) && !isPointInCircle(GammaLtmin[imin], CircleS) && modS22 < 1) || (isPointInCircle(GammaLtmin[imin], cR1) && isPointInCircle(GammaLtmin[imin], CircleS) && modS22 > 1) || (K > 1 && mDel < 1)) {
                        $('.is-load-stable').html('Điểm \$\\Gamma_L \$ này thuộc vùng ổn định ')
                    } else {
                        $('.is-load-stable').html('Điểm \$\\Gamma_L \$ này KHÔNG thuộc vùng ổn định ')
                    }
                    let GLcon = board.create('point', [GLj.re, -GLj.im], {name: '&Gamma;_L*'});

                    $('.GSdb').html('\$GS = \$' + GSdb[imin] + ' dB')
                    $('.GLdb').html('\$GL = \$' + GLdb[imin] + ' dB')

                    MathJax.typeset();
                    PHTK(GScon, 'S');
                    PHTK(GLcon, 'L');
                }
                if (Dir === 2) {
                    let gp = Math.pow(10, (Gp / 10)) / ((S21.abs()) ** 2);
                    let Cp = Math.Complex(gp, 0).mul((S22.con()).sub((Del.con()).mul(S11))).div(Math.Complex(1 + gp * ((S22.abs()) ** 2 - mDel ** 2), 0));
                    let mCp = Cp.abs();
                    let argCp = 180 * Cp.arg() / Math.PI;
                    let Rp = Math.sqrt((1 - 2 * K * (S12.mul(S21)).abs() * gp + ((S12.mul(S21)).abs()) ** 2 * gp ** 2)) / (1 + gp * ((S22.abs()) ** 2 - mDel ** 2));

                    console.log('gp = ', gp, '\nCp = ', Cp, '\nmCp = ', mCp, '\nargCp = ', argCp, '\nRp = ', Rp);

                    // $("[id^='table-']").hide();
                    $('#table-biDir').css({'display': 'inline-table', 'width': '100%'});

                    $('#gp-unit-Result').html('gp = ' + gp.toFixed(4));
                    $('#Cp-stable-Result').html('Cp = ' + Cp.re.toFixed(4) + (Cp.im > 0 ? " + " : " - ") + "j" + Math.abs(Cp.im).toFixed(4) + ' = ' + mCp.toFixed(4) + ' &ang; ' + argCp.toFixed(4) + '&deg; = ' + (realR * mCp).toFixed(4) + 'cm &ang; ' + argCp.toFixed(4) + '&deg;');
                    $('#Rp-stable-Result').html('Rp = ' + Rp.toFixed(4) + ' = ' + (realR * Rp).toFixed(4) + 'cm');

                    board.create('point', [Cp.re, Cp.im], {name: 'C_P'})
                    let CircleP = board.create('circle', [[Cp.re, Cp.im], Rp], {strokecolor: 'gray'});
                    let GL = board.create('intersection', [CircleP, OLline, 1], {
                        name: '&Gamma;_L',
                        size: 1,
                        label: {autoPosition: true}
                    });

                    GLj = Math.Complex(GL.X(), GL.Y());
                    $('.gL-res').html('\$\\Gamma_L = \$ ' + (GL.X()).toFixed(4) + '' + (GL.Y() >= 0 ? ' + j' : ' - j') + Math.abs(GL.Y()).toFixed(4) + ' = ' + GLj.abs().toFixed(4) + ' &ang; ' + (GLj.arg() * 180 / Math.PI).toFixed(4) + '&deg;  = ' + (realR * GLj.abs()).toFixed(4) + 'cm &ang; ' + (180 * GLj.arg() / Math.PI).toFixed(4) + '&deg;');

                    if ((isPointInCircle(GL, cR1) && !isPointInCircle(GL, CircleL) && modS22 < 1) || (isPointInCircle(GL, cR1) && isPointInCircle(GL, CircleS) && modS22 > 1) || (K > 1 && mDel < 1)) {
                        $('.is-load-stable').html('Điểm \$\\Gamma_L \$ này thuộc vùng ổn định ')
                    } else {
                        $('.is-load-stable').html('Điểm \$\\Gamma_L \$ này KHÔNG thuộc vùng ổn định ')
                    }
                    let GLcon = board.create('point', [GLj.con().re, GLj.con().im], {name: '&Gamma;_L*'});

                    let minDistance = O.Dist(GL);
                    console.log('Minimum distance from center: ', minDistance)

                    Ginj = S11.add(((S12.mul(S21)).mul(GLj)).div(Math.Complex(1, 0).sub(S22.mul(GLj))));
                    let GSj = Ginj.con();
                    let GS = board.create('point', [GSj.re, GSj.im], {name: '&Gamma;_S'})

                    $('.gS-res').append('<br>\$\\Gamma_S =\$ ' + (GSj.re).toFixed(4) + '' + (GSj.im >= 0 ? ' + j' : ' - j') + Math.abs(GSj.im).toFixed(4) + ' = ' + GSj.abs().toFixed(4) + ' &ang; ' + (GSj.arg() * 180 / Math.PI).toFixed(4) + '&deg;  = ' + (realR * GSj.abs()).toFixed(4) + 'cm &ang; ' + (180 * GSj.arg() / Math.PI).toFixed(4) + '&deg;');
                    if ((isPointInCircle(GS, cR1) && !isPointInCircle(GS, CircleS) && modS11 < 1) || (isPointInCircle(GS, cR1) && isPointInCircle(GS, CircleS) && modS11 > 1) || (K > 1 && mDel < 1)) {
                        $('.is-source-stable').html('Điểm \$\\Gamma_S \$ này thuộc vùng ổn định ')
                    } else {
                        $('.is-source-stable').html('Điểm \$\\Gamma_S \$ này KHÔNG thuộc vùng ổn định ')
                    }

                    let GScon = board.create('point', [Ginj.re, Ginj.im], {name: '&Gamma;_S*'});
                    $('.GSdb').html('\$GS = ' + GSdb[imin] + ' dB')
                    $('.GLdb').html('\$GL = ' + GLdb[imin] + ' dB')


                    MathJax.typeset();
                    PHTK(GScon, 'S');
                    PHTK(GLcon, 'L');
                }
            }


            if (Ginj && GLj) {
                console.log('Ginj=', Ginj, '\n', GLj)
                $('#PHTK-RF').css({'display': 'block'});
                $('#PHTK-Source').click(function () {
                    var params = new URLSearchParams();
                    params.append('GammaR', Ginj.re.toFixed(5));
                    params.append('GammaJ', Ginj.im.toFixed(5));
                    params.append('Z0', Z0.toString());
                    params.append('f', f.toString());

                    // Mở file b.html trong tab mới với các tham số g và f
                    window.open('phtk.html?' + params.toString());
                });

                $('#PHTK-Load').click(function () {
                    var params = new URLSearchParams();
                    params.append('GammaR', GLj.re.toFixed(5));
                    params.append('GammaJ', GLj.im.toFixed(5));
                    params.append('Z0', Z0.toString());
                    params.append('f', f.toString());

                    // Mở file b.html trong tab mới với các tham số g và f
                    window.open('phtk.html?' + params.toString());
                });
            }


            function PHTK(Gamma, type) {
                objects = [];
                //Duong tron SWR di qua diem ZL
                var SWR = board.create('circle', [O, Gamma], {strokecolor: 'gray'});
                objects.push(SWR);
                //Xac dinh diem YL doi xung voi ZL qua tam O tren duong tron SWR
                var [Yp, Yline] = Z_Y_convert(Gamma, SWR, 'gray', 'Y_L');
                objects.push([Yline, Yp]);
                //Tim lambda cua YL\
                var [YL_lambda, YL_lambda_text, YL_lambda_line] = find_lambda_distance(Yp, 'gray')
                objects.push(YL_lambda_line);
                objects.push(YL_lambda_text);

                var one_jx_circle = board.create('circle', [[0.5, 0], 0.5], {strokecolor: 'gray'});
                objects.push(one_jx_circle);
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
                objects.push([Y1, Y2]);

                //Tim lambda cua Y1, Y2
                var [Y1_lambda, Y1_lambda_text, Y1_lambda_line] = find_lambda_distance(Y1, 'gray')
                let d1_single_shunt = (Y1_lambda - YL_lambda >= 0) ? (Y1_lambda - YL_lambda) : (Y1_lambda - YL_lambda + 0.5)
                console.log('d1_single_shunt: ', d1_single_shunt)
                objects.push(Y1_lambda_line);
                objects.push(Y1_lambda_text);

                let Y1_center_X = find_circle_center(P10, Y1, X_1)
                var [iXY1, X_Y1, xNorm_Y1] = draw_circle_X(Y1_center_X, Y1.Y(), 'gray', 1)
                objects.push([X_Y1, iXY1]);

                let Y2_center_X = find_circle_center(P10, Y2, X_1)
                var [iXY2, X_Y2, xNorm_Y2] = draw_circle_X(Y2_center_X, Y2.Y(), 'gray', 1)
                objects.push([X_Y2, iXY2]);

                var [X_Y2_lambda, X_Y2_lambda_text, X_Y2_lambda_line] = find_lambda_distance(iXY2, 'gray')
                let l1_single_shunt = (X_Y2_lambda >= 0.25) ? (X_Y2_lambda - 0.25) : (X_Y2_lambda + 0.25)   //short circuit
                console.log('\nl1_single_shunt: ', l1_single_shunt)
                objects.push(X_Y2_lambda_line);
                objects.push(X_Y2_lambda_text);

                var [Y2_lambda, Y2_lambda_text, Y2_lambda_line] = find_lambda_distance(Y2, 'gray')
                let d2_single_shunt = (Y2_lambda - YL_lambda >= 0) ? (Y2_lambda - YL_lambda) : (Y2_lambda - YL_lambda + 0.5)
                console.log('\nd2_single_shunt: ', d2_single_shunt)
                objects.push(Y2_lambda_line);
                objects.push(Y2_lambda_text);

                var [X_Y1_lambda, X_Y1_lambda_text, X_Y1_lambda_line] = find_lambda_distance(iXY1, 'gray')
                let l2_single_shunt = (X_Y1_lambda >= 0.25) ? (X_Y1_lambda - 0.25) : (X_Y1_lambda + 0.25)   //short circuit
                console.log('\nl2_single_shunt: ', l2_single_shunt)
                objects.push(X_Y1_lambda_line);
                objects.push(X_Y1_lambda_text);

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

                $('#item-5, #item-6, #item-7').show()
                $("#Z01-sol1, #Z01-sol2, #Z02-sol1, #Z02-sol2, #Z03-sol1, #Z03-sol2").html(`${Z0} &#8486;`);
                /*                    let ZLstring = (XL > 0) ? `ZL = ${RL} + j${XL} &#8486;` : `ZL = ${RL} - j${-XL} &#8486;`;
                                    $("#ZLss-sol1, #ZLss-sol2").html(ZLstring);*/
                var ddd = [], xxx = [];
                if (d1_single_shunt > d2_single_shunt) {
                    ddd[0] = d1_single_shunt;
                    xxx[0] = X_Y2_lambda;
                    ddd[1] = d2_single_shunt;
                    xxx[1] = X_Y1_lambda;
                } else {
                    ddd[0] = d2_single_shunt;
                    xxx[0] = X_Y1_lambda;
                    ddd[1] = d1_single_shunt;
                    xxx[1] = X_Y2_lambda;
                }

                if (type === 'S') {
                    $("#d-sol1").html('d1 = ' + `${ddd[0].toFixed(4)} &#955;&hArr;${(ddd[0] * 360).toFixed(4)}&deg;<br>` + 'd2 = ' + `${ddd[1].toFixed(4)} &#955;&hArr;${(ddd[1] * 360).toFixed(4)}&deg;`);
                    $("#l-sol1").html('l1 = ' + `${xxx[0].toFixed(4)}&#955; (hở mạch)&hArr;${(xxx[0] * 360).toFixed(4)}&deg;<br>` + 'l2 = ' + `${xxx[1].toFixed(4)}&#955; (hở mạch)&hArr;${(xxx[1] * 360).toFixed(4)}&deg;`);
                }
                if (type === 'L') {
                    $('#d-sol2').html('d1 = ' + `${ddd[0].toFixed(4)} &#955;&hArr;${(ddd[0] * 360).toFixed(4)}&deg;<br>` + 'd2 = ' + `${ddd[1].toFixed(4)} &#955;&hArr;${(ddd[1] * 360).toFixed(4)}&deg;`);
                    $('#l-sol2').html('l1 = ' + `${xxx[0].toFixed(4)}&#955; (hở mạch)&hArr;${(xxx[0] * 360).toFixed(4)}&deg;<br>` + 'l2 = ' + `${xxx[1].toFixed(4)}&#955; (hở mạch)&hArr;${(xxx[1] * 360).toFixed(4)}&deg;`);
                }
            }


        }

        main();
    });

    $('#smith-chart-clear').click(function () {
        location.reload();
    });
});