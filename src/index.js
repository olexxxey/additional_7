const Sudoku = function(in_val) {
    let solved = [];
    let steps = 0;

    initSolved(in_val);
    solve();

    function initSolved(in_val) {
        steps = 0;
        let suggest = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for ( let i=0; i<9; i++) {
            solved[i] = [];
            for ( let j=0; j<9; j++ ) {
                if ( in_val[i][j] ) {
                    solved[i][j] = [in_val[i][j], 'in', []];
                }
                else {
                    solved[i][j] = [0, 'unknown', suggest];
                }
            }
        }
    };


    function solve() {
        let changed = 0;
        do {
            changed = updateSuggests();
            steps++;
            if ( 81 < steps ) {
                break;
            }
        } while (changed);

        if ( !isSolved() && !isFailed() ) {
            backtracking();
        }
    };


    function updateSuggests() {
        let changed = 0;
        for ( let i=0; i<9; i++) {
            for ( let j=0; j<9; j++) {
                if ( 'unknown' != solved[i][j][1] ) {
                    continue;
                }

                changed += solveSingle(i, j);

                changed += solveHiddenSingle(i, j);
            }
        }
        return changed;
    };

    function solveSingle(i, j) {
        solved[i][j][2] = arrayDiff(solved[i][j][2], rowContent(i));
        solved[i][j][2] = arrayDiff(solved[i][j][2], colContent(j));
        solved[i][j][2] = arrayDiff(solved[i][j][2], sectContent(i, j));
        if ( 1 == solved[i][j][2].length ) {
            markSolved(i, j, solved[i][j][2][0]);
            return 1;
        }
        return 0;
    };

    function solveHiddenSingle(i, j) {
        var less_suggest = lessRowSuggest(i, j);
        let changed = 0;
        if ( 1 == less_suggest.length ) {
            markSolved(i, j, less_suggest[0]);
            changed++;
        }
        var less_suggest = lessColSuggest(i, j);
        if ( 1 == less_suggest.length ) {
            markSolved(i, j, less_suggest[0]);
            changed++;
        }
        var less_suggest = lessSectSuggest(i, j);
        if ( 1 == less_suggest.length ) {
            markSolved(i, j, less_suggest[0]);
            changed++;
        }
        return changed;
    };

    function markSolved(i, j, solve) {
        solved[i][j][0] = solve;
        solved[i][j][1] = 'solved';
    };

    function rowContent(i) {
        let content = [];
        for ( let j=0; j<9; j++ ) {
            if ( 'unknown' != solved[i][j][1] ) {
                content[content.length] = solved[i][j][0];
            }
        }
        return content;
    };

    function colContent(j) {
        let content = [];
        for ( let i=0; i<9; i++ ) {
            if ( 'unknown' != solved[i][j][1] ) {
                content[content.length] = solved[i][j][0];
            }
        }
        return content;
    };

    function sectContent(i, j) {
        let content = [];
        let offset = sectOffset(i, j);
        for ( let k=0; k<3; k++ ) {
            for ( let l=0; l<3; l++ ) {
                if ( 'unknown' != solved[offset.i+k][offset.j+l][1] ) {
                    content[content.length] = solved[offset.i+k][offset.j+l][0];
                }
            }
        }
        return content;
    };

    function lessRowSuggest(i, j) {
        let less_suggest = solved[i][j][2];
        for ( let k=0; k<9; k++ ) {
            if ( k == j || 'unknown' != solved[i][k][1] ) {
                continue;
            }
            less_suggest = arrayDiff(less_suggest, solved[i][k][2]);
        }
        return less_suggest;
    };

    function lessColSuggest(i, j) {
        let less_suggest = solved[i][j][2];
        for ( let k=0; k<9; k++ ) {
            if ( k == i || 'unknown' != solved[k][j][1] ) {
                continue;
            }
            less_suggest = arrayDiff(less_suggest, solved[k][j][2]);
        }
        return less_suggest;
    };

    function lessSectSuggest(i, j) {
        let less_suggest = solved[i][j][2];
        let offset = sectOffset(i, j);
        for ( let k=0; k<3; k++ ) {
            for ( let l=0; l<3; l++ ) {
                if ( ((offset.i+k) == i  && (offset.j+l) == j)|| 'unknown' != solved[offset.i+k][offset.j+l][1] ) {
                    continue;
                }
                less_suggest = arrayDiff(less_suggest, solved[offset.i+k][offset.j+l][2]);
            }
        }
        return less_suggest;
    };

    function arrayDiff (ar1, ar2) {
        let arr_diff = [];
        for ( let i=0; i<ar1.length; i++ ) {
            let is_found = false;
            for ( let j=0; j<ar2.length; j++ ) {
                if ( ar1[i] == ar2[j] ) {
                    is_found = true;
                    break;
                }
            }
            if ( !is_found ) {
                arr_diff[arr_diff.length] = ar1[i];
            }
        }
        return arr_diff;
    };

    function sectOffset(i, j) {
        return {
            j: Math.floor(j/3)*3,
            i: Math.floor(i/3)*3
        };
    };

    function isSolved() {
        let is_solved = true;
        for ( let i=0; i<9; i++) {
            for ( let j=0; j<9; j++ ) {
                if ( 'unknown' == solved[i][j][1] ) {
                    is_solved = false;
                }
            }
        }
        return is_solved;
    };

    this.isSolved = function() {
        return isSolved();
    };

    function isFailed() {
        let is_failed = false;
        for ( let i=0; i<9; i++) {
            for ( let j=0; j<9; j++ ) {
                if ( 'unknown' == solved[i][j][1] && !solved[i][j][2].length ) {
                    is_failed = true;
                }
            }
        }
        return is_failed;
    };

    function backtracking() {
        let in_val = [[], [], [], [], [], [], [], [], []];
        let i_min=-1, j_min=-1, suggests_cnt=0;
        for ( let i=0; i<9; i++ ) {
            in_val[i].length = 9;
            for ( let j=0; j<9; j++ ) {
                in_val[i][j] = solved[i][j][0];
                if ( 'unknown' == solved[i][j][1] && (solved[i][j][2].length < suggests_cnt || !suggests_cnt) ) {
                    suggests_cnt = solved[i][j][2].length;
                    i_min = i;
                    j_min = j;
                }
            }
        }

        for ( let k=0; k<suggests_cnt; k++ ) {
            in_val[i_min][j_min] = solved[i_min][j_min][2][k];
            let sudoku = new Sudoku(in_val);
            if ( sudoku.isSolved() ) {
                out_val = sudoku.solved();
                for ( let i=0; i<9; i++ ) {
                    for ( let j=0; j<9; j++ ) {
                        if ( 'unknown' == solved[i][j][1] ) {
                            markSolved(i, j, out_val[i][j][0])
                        }
                    }
                }
                return;
            }
        }
    };

    this.solved = function() {
        return solved;
    };

    this.getSolved = function () {
        let solvedArray = solved.map(row => row.map(item => item[0]));
        return solvedArray;
    }
};

module.exports = function solveSudoku(matrix) {
    const sudoku = new Sudoku(matrix);
    return sudoku.getSolved();
};
