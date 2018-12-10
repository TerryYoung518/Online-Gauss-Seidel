(function () {
    var main = {
        matrixEl: null,
        formulaEl: null,
        errorEl: null,
        resultEl: null,
        ivEl: null,
        tableHeadEl: null,
        tableBodyEl: null,
        iv: null,
        augmentedMatrix: null,
        isSort: false,
        letter: 'x',
        dimension: 0,
        deviation: 1e-6,
        upper: 100,
        init: function () {
            var me = this;
            this.matrixEl = window.document.getElementById("matrix");
            this.formulaEl = window.document.getElementById("formula");
            this.errorEl = window.document.getElementById("error");
            this.resultEl = window.document.getElementById("result");
            this.ivEl = window.document.getElementById("iv");
            this.tableHeadEl = window.document.getElementsByTagName("thead")[0];
            this.tableBodyEl = window.document.getElementsByTagName("tbody")[0];
            this.matrixEl.onchange = this.textOnChange;
            window.document.getElementById("letter").onchange = this.textOnChange;
            window.document.getElementById("sort").onchange = this.textOnChange;
            window.document.getElementById("start").onclick = this.startOnClick;
        },
        textOnChange: function () {
            var me = main;
            var letter = window.document.getElementById("letter").value;
            if (letter !== '') me.letter = letter;
            var matrixText = me.matrixEl.value;
            var matrix = matrixText.split('\n').notempty();
            var cols = 0,
                rows = matrix.length;
            matrix.eachdo(function (k) {
                matrix[k] = this.split(' ').notempty();
                cols = Math.max(cols, matrix[k].length - 1);
            });
            if (cols != rows) {
                me.reportError('参数个数与方程个数不匹配');
            } else {
                me.errorEl.hidden = true;
                me.augmentedMatrix = matrix;
            }
            me.resultEl.hidden = true;
            me.formulaEl.innerHTML = '';
            me.dimension = cols;
            matrix.eachdo(function (k) {
                while (matrix[k].length < cols + 1) matrix[k].push('0');
                me.createEquation(matrix[k]);
            });
            me.createIv();
        },
        startOnClick: function () {
            var me = main;
            var deviation = window.document.getElementById("deviation").value,
                upper = window.document.getElementById("upper").value;
            if (deviation !== '') {
                me.deviation = parseFloat(deviation);
            }else{
                me.deviation = 1e-6;
            }
            if (upper !== '') {
                me.upper = parseInt(upper);
            }else{
                me.upper = 100;
            }
            me.augmentedMatrix.eachdo(function (k) {
                me.augmentedMatrix[k].eachdo(function (j) {
                    me.augmentedMatrix[k][j] = parseFloat(me.augmentedMatrix[k][j]);
                });
            });
            //console.log(me.augmentedMatrix);
            me.getIv();
            me.initTable();
            me.isSort = window.document.getElementById("sort").checked;
            me.calculate();
        },
        reportError: function (text) {
            this.errorEl.innerHTML = text;
            this.errorEl.hidden = false;
        },
        reportResult: function (clas,text) {
            this.resultEl.innerHTML = text;
            this.resultEl.classList.remove('pass');
            this.resultEl.classList.remove('error');
            this.resultEl.classList.add(clas);
            this.resultEl.hidden = false;
        },
        createEquation: function (coefficient) {
            var eauation = window.document.createElement("div");
            var str = '';
            eauation.style = "margin: .2em";
            if (coefficient[0] === '1') {
                str = str + this.createSub(this.letter, 1);
            } else if (coefficient[0] === '0') {} else {
                str = str + coefficient[0] + this.createSub(this.letter, 1);
            }
            for (var i = 1; i < coefficient.length - 1; i++) {
                if (coefficient[i] === '1') {
                    str = str + '&nbsp;+&nbsp;' + this.createSub(this.letter, i + 1);
                } else if (coefficient[i] === '0') {} else {
                    str = str + '&nbsp;+&nbsp;' + coefficient[i] + this.createSub(this.letter, i + 1);
                }
            }
            str = str + '&nbsp;=&nbsp;' + coefficient[coefficient.length - 1];
            eauation.innerHTML = str;
            this.formulaEl.appendChild(eauation);
        },
        createSub: function (letter, number) {
            return '<i>' + letter + '<sub><i>' + number + '</i></sub></i>';
        },
        createIv: function () {
            this.ivEl.innerHTML = '';
            var str = '';
            for (var i = 0; i < this.dimension; i++) {
                str = str + '<label for="iv' + String(i + 1) + '" class="math">' + this.createSub(this.letter, i + 1) + '&nbsp;=&nbsp;</label><input id="iv' + String(i + 1) + '" style="width: 3.5em;" type="text" placeholder="0">\n';
            }
            this.ivEl.innerHTML = str;
        },
        getIv: function () {
            this.iv = new Array();
            for (var i = 0; i < this.dimension; i++) {
                var v = window.document.getElementById('iv' + String(i + 1)).value;
                if (v === '') v = 0;
                else v = parseFloat(v);
                this.iv.push(v);
            }
        },
        calculate: function () {
            var abs = Math.abs;
            if (this.isSort) {
                for (var i = 0; i < this.dimension; i++) {
                    var max = abs(this.augmentedMatrix[i][i]);
                    var mark = i;
                    for (var k = i + 1; k < this.dimension; k++) {
                        if (abs(this.augmentedMatrix[k][i]) > max) {
                            max = abs(this.augmentedMatrix[k][i]);
                            mark = k;
                        }
                    }
                    if (mark !== i) {
                        var swap = this.augmentedMatrix[i];
                        this.augmentedMatrix[i] = this.augmentedMatrix[mark];
                        this.augmentedMatrix[mark] = swap;
                    }
                }
            } /*sort over*/
            var k = 0,
                d = 0,
                x = this.iv,
                x1 = new Array;
            x.eachdo(function(){x1.push(this)});
            this.tableBodyEl.innerHTML = '';
            while (true) {
                d = 0;
                for (var i = 0; i < this.dimension; i++) {
                    x[i] = this.augmentedMatrix[i][this.dimension]
                    for (var j = 0; j < this.dimension; j++) {
                        if (j !== i)
                            x[i] -= this.augmentedMatrix[i][j] * x[j];
                    }
                    x[i] /= this.augmentedMatrix[i][i];
                    d = Math.max(abs(x[i] - x1[i]), d);
                }
                if (d < this.deviation) {
                    this.reportResult('pass','计算通过Accepted');
                    break;
                }else if(k>=this.upper){
                    this.reportResult('error','计算结果未达到精度要求Failed');
                    break;
                }
                k++;
                x1 = new Array;
                x.eachdo(function(){x1.push(this)});
                this.putResult(k,x1);
            }
        },
        initTable: function () {
            var tr  = window.document.createElement("tr"),
                str = '<th>#</th>';
            for(var i=0;i<this.dimension;i++){
                str = str + '<th><i>'+this.letter+'</i><sub><i>'+String(i+1)+'</i></sub></th>\n';
            }
            tr.innerHTML = str;
            this.tableHeadEl.innerHTML = '';
            this.tableBodyEl.innerHTML = '';
            this.tableHeadEl.appendChild(tr);
        },
        putResult: function (k, x) {
            var tr = window.document.createElement("tr"),
                str = '<td>'+String(k)+'</td>\n';
            x.eachdo(function(i){
                str = str +'<td>'+String(x[i])+'</td>\n';
            });
            tr.innerHTML = str;
            this.tableBodyEl.appendChild(tr);
        }
    };
    window.onload = function () {
        main.init();
    };
})();


if (!Array.prototype.eachdo) {
    Array.prototype.eachdo = function (fn) {
        for (var i = 0; i < this.length; i++) {
            fn.call(this[i], i);
        }
    };
}

Array.prototype.notempty = function () {
    return this.filter(t => t != undefined && t !== null && t != "");
}
