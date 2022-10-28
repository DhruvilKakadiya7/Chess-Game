var board 
var player_color = 'white' //default player color
var STACK_SIZE = 200 //maximum undo - redo stack size
var game = new Chess()
var globalSum = 0 //positive for black , negative for white
var whiteSquareGrey = '#a9a9a9' 
var blackSquareGrey = '#696969'
var positionCount
var prev
timer = null;
var count = 0
/* Piece Square Table from Sunfish.py */
var weights = { p: 100, n: 280, b: 320, r: 479, q: 929, k: 60000, k_e: 60000 };
var pst_w = {
  p: [
    [100, 100, 100, 100, 105, 100, 100, 100],
    [78, 83, 86, 73, 102, 82, 85, 90],
    [7, 29, 21, 44, 40, 31, 44, 7],
    [-17, 16, -2, 15, 14, 0, 15, -13],
    [-26, 3, 10, 9, 6, 1, 0, -23],
    [-22, 9, 5, -11, -10, -2, 3, -19],
    [-31, 8, -7, -37, -36, -14, 3, -31],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-66, -53, -75, -75, -10, -55, -58, -70],
    [-3, -6, 100, -36, 4, 62, -4, -14],
    [10, 67, 1, 74, 73, 27, 62, -2],
    [24, 24, 45, 37, 33, 41, 25, 17],
    [-1, 5, 31, 21, 22, 35, 2, 0],
    [-18, 10, 13, 22, 18, 15, 11, -14],
    [-23, -15, 2, 0, 2, 0, -23, -20],
    [-74, -23, -26, -24, -19, -35, -22, -69],
  ],
  b: [
    [-59, -78, -82, -76, -23, -107, -37, -50],
    [-11, 20, 35, -42, -39, 31, 2, -22],
    [-9, 39, -32, 41, 52, -10, 28, -14],
    [25, 17, 20, 34, 26, 25, 15, 10],
    [13, 10, 17, 23, 17, 16, 0, 7],
    [14, 25, 24, 15, 8, 25, 20, 15],
    [19, 20, 11, 6, 7, 6, 20, 16],
    [-7, 2, -15, -12, -14, -15, -10, -10],
  ],
  r: [
    [35, 29, 33, 4, 37, 33, 56, 50],
    [55, 29, 56, 67, 55, 62, 34, 60],
    [19, 35, 28, 33, 45, 27, 25, 15],
    [0, 5, 16, 13, 18, -4, -9, -6],
    [-28, -35, -16, -21, -13, -29, -46, -30],
    [-42, -28, -42, -25, -25, -35, -26, -46],
    [-53, -38, -31, -26, -29, -43, -44, -53],
    [-30, -24, -18, 5, -2, -18, -31, -32],
  ],
  q: [
    [6, 1, -8, -104, 69, 24, 88, 26],
    [14, 32, 60, -10, 20, 76, 57, 24],
    [-2, 43, 32, 60, 72, 63, 43, 2],
    [1, -16, 22, 17, 25, 20, -13, -6],
    [-14, -15, -2, -5, -1, -10, -20, -22],
    [-30, -6, -13, -11, -16, -11, -16, -27],
    [-36, -18, 0, -19, -15, -15, -21, -38],
    [-39, -30, -31, -13, -31, -36, -34, -42],
  ],
  k: [
    [4, 54, 47, -99, -99, 60, 83, -62],
    [-32, 10, 55, 56, 56, 55, 10, 3],
    [-62, 12, -57, 44, -67, 28, 37, -31],
    [-55, 50, 11, -4, -19, 13, 0, -49],
    [-55, -43, -52, -28, -51, -47, -8, -50],
    [-47, -42, -43, -79, -64, -32, -29, -32],
    [-4, 3, -14, -50, -57, -18, 13, 4],
    [17, 30, -3, -14, 6, -1, 40, 18],
  ],

  // Endgame King Table
  k_e: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};
var pst_b = {
  p: pst_w['p'].slice().reverse(),
  n: pst_w['n'].slice().reverse(),
  b: pst_w['b'].slice().reverse(),
  r: pst_w['r'].slice().reverse(),
  q: pst_w['q'].slice().reverse(),
  k: pst_w['k'].slice().reverse(),
  k_e: pst_w['k_e'].slice().reverse(),
};

var opponent = { w: pst_b, b: pst_w };
var self = { w: pst_w, b: pst_b };


/////////////////////////////////////////////////////
///////////////////////////////////////////////////
//Evalute Chess board in numbers
function evaluteSum(game, move, previous, color){
    if(game.in_checkmate()){
        if(move.color === color){
            return (10**6);
        }
        else{
            return -(10**6);
        }
    }

    if(game.in_draw() || game.in_threefold_repetition() || game.in_stalemate()){
        return 0
    }

    if(game.in_check()){
        if(move.color === color){
            previous += 100;
        }
        else {
            previous -= 100;
        }
    }

    if(previous < -1600){
        if(move.piece === 'k'){
            move.piece = 'k_e';
        }
    }
    if(move.to==null) return previous
    var dest = [
        move.to.charCodeAt(0) - 'a'.charCodeAt(0),
        8 - parseInt(move.to[1])
    ];

    if('captured' in move){
        if(move.color === color){
            previous += weights[move.captured] + opponent[move.color][move.captured][dest[1]][dest[0]]
        }
        else{
            previous -= weights[move.captured] + self[move.color][move.captured][dest[1]][dest[0]];
        }
    }
    if(move.from==null) return previous
    var from = [
        move.from.charCodeAt(0) - 'a'.charCodeAt(0),
        8 - parseInt(move.from[1])
    ]
    if(move.flags.includes('p')){
        move.promotion = 'q'
        if(move.color === color){
            previous -= (weights[move.piece] + self[move.color][move.piece][from[1]][from[0]] -( weights[move.promotion] + self[move.color][move.promotion][dest[1]][dest[0]]))
        
        }
        else{
            previous += (weights[move.piece] + self[move.color][move.piece][from[1]][from[0]] -( weights[move.promotion] + self[move.color][move.promotion][dest[1]][dest[0]]))
        
        }
        return previous
    }
    if(move.color === color){
        previous += (self[move.color][move.piece][from[1]][from[0]] - self[move.color][move.piece][dest[1]][dest[0]])

    }
    else{
        previous -= (self[move.color][move.piece][from[1]][from[0]] - self[move.color][move.piece][dest[1]][dest[0]])
        
    }
    return previous
}

////////Most Important Section
////////Run MINIMAX Algorithm
///minimax algorithm is useful in most of 2 player game like chess, tic-tac-toe, etc...
///it will return best move for current player from every possible move of 2nd player for 2nd player every possible move of 1st player....
/// so it is a recursion 
//one player wants to maximize score and second wants to minimize the score
//that's why this algorithm called minimax algorithm
//https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-1-introduction/
// I used Alpha-beta prunning method to optimize the algorithm
// Alpha-Beta prunning will not optimize the move but it will reduce time to find best move
//So Alpha-Beta prunning will optimize my programm dramatically 
//https://www.geeksforgeeks.org/minimax-algorithm-in-game-theory-set-4-alpha-beta-pruning/

function minimax(game,hardNess,alpha,beta,curr,color,Player1){
    // console.log(Player1)
    var Childs = game.ugly_moves({verbose:true})
    Childs.sort(function(a,b){
            return 0.5 - Math.random()
        }
    );
    // console.log(Childs.length)
    for(var i=0;i<Childs.length;i++){
        // console.log(Childs[i])
    }
    positionCount++;
    if(hardNess==0 || Childs.length==0){
        // console.log(positionCount)
        return [null,curr];
    }

    var maxi = -1000000
    var mini = 1000000
    var best

    for(var i=0;i<Childs.length;i++){
        var Move = Childs[i]
        var goodMove = game.ugly_move(Move)
        var nextSum = evaluteSum(game,goodMove,curr,color)
        var [BestMove,Value] = minimax(game,hardNess-1,alpha,beta,nextSum,color,!Player1)
        game.undo()
        if(Player1){
            if(Value > maxi){
                maxi = Value
                best = goodMove
            }
            if(Value > alpha){
                alpha = Value
            }
        }
        else{
            if(Value < mini){
                mini = Value
                best = goodMove
            }
            if(Value < beta){
                beta = Value
            }
        }

        if(alpha >= beta){
            break;
        }
    }

    if(Player1){
        return [best,maxi]
    }
    else {
        return [best,mini]
    }

}

function okMove(game, color, currSum) {
    positionCount = 0;
  
    if (color === 'b') {
      var hard = 2
      var ok = ($('#search-depth').find(':selected').text());
      //console.log(ok);
      if(ok == 'Easy') hard=1;
      else if(ok == 'Medium') hard=2
      else hard=3
      console.log(hard)
    } else {
      var hard = 3
    }
    var [bestMove, bestMoveValue] = minimax(game,hard,Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,currSum,color,true);
    return [bestMove, bestMoveValue];
  }


/////Run most Optimal move of Black piece
function runBest(color){
    var move
    var best
    if(color === 'w'){
       move = okMove(game,color,-globalSum)[0]
    }
    else{
        move = okMove(game,color,globalSum)[0]
    }
    globalSum = evaluteSum(game,move,globalSum,'b')
    BenefitUpdate()
    game.move(move)
    RewriteHistory(game.history())
    board.position(game.fen())
    if(color == 'w'){
        checkCurr('white')
    }
    else{
        checkCurr('black')
    }
}
var RewriteHistory = function (moves) {
  var element = $('#move-history').empty();
  element.empty();
  for (var i = (moves.length > 20 ? moves.length-20 : 0); i < moves.length; i = i + 2) {
      element.append('<span>' + ' White ---> ' + moves[i] + '</span><br> ' + '<span>' + 'Black ---> ' + ( moves[i + 1] ? moves[i + 1] : ' ') + '</span><br>')
      prev = 'black'
  }
  element.scrollTop(element[0].scrollHeight);

};

/////FOr checking status of current game mode
////if game is in checkmate mode opposite player won
//// if material is insufficient or in stalemate mode or in Draw mode game will declared Draw
//// if someone's king is in check mode he will get notification about check
//// else it will shows nothing
function checkCurr(color) {
    if (game.in_checkmate()) {
      $('#status').html(`<b>Checkmate!</b> Oops, <b>${prev}</b> lost.`);
      window.setTimeout(function(){
        alert(prev + ' win !!!!');
      }, 2000)
      //(,500)
      window.setTimeout(function(){
        resetGame();
      }, 2000)
      //resetGame()
    } else if (game.insufficient_material()) {
      $('#status').html(`It's a <b>draw!</b> (Insufficient Material)`);
    } else if (game.in_threefold_repetition()) {
      $('#status').html(`It's a <b>draw!</b> (Threefold Repetition)`);
    } else if (game.in_stalemate()) {
      $('#status').html(`It's a <b>draw!</b> (Stalemate)`);
    } else if (game.in_draw()) {
      $('#status').html(`It's a <b>draw!</b> (50-move Rule)`);
    } else if (game.in_check()) {
      $('#status').html(`Oops, <b>${prev}</b> is in <b>check!</b>`);
      return false;
    } else {
      $('#status').html(`No check, checkmate, or draw.`);
      return false;
    }
    return true;
  }

var HistoryAdd = function (moves) {
    var element = $('#move-history');
    if(count >= 22){
      element.empty();
      count=0
    }
    if(moves.color === 'b'){
        element.append('<span>' + 'black '+ moves.piece +' ---> ' + moves.from + ' to ' + moves.to + '</span><br>')
        prev='white'
    }
    else{
        element.append('<span>' + 'white '+ moves.piece +' ---> '+ moves.from + ' to ' + moves.to + '</span><br>')
        prev='black'
    }
};

//// Update HTML view of Benefit 
//// if Evalution > 0 Black in benefit
//// if Evalution < 0 White in Benefit
//// if Evalution == 0 No one in benefit
function BenefitUpdate() {
    var per = ((-globalSum+2000)/4000)*100
    if(per > 100 || per < -100 ) per = 100
    else if(per > 50) per = per-50
    else if(per < 50) per = 50 - per
    
    if (globalSum > 0) {
      $('#benefitColor').text('Black');
      $('#benefitNumber').text(Math.ceil(per) + ' %');
    } 
    else if (globalSum < 0) {
      $('#benefitColor').text('White');
      $('#benefitNumber').text(Math.ceil(per) + ' %');
    } 
    else {
      $('#benefitColor').text('No one');
      $('#benefitNumber').text(0 + ' %');
    }
    $('#benefitBar').attr({
      'aria-valuenow': `${-globalSum}`,
      style: `width: ${((-globalSum + 2000) / 4000) * 100}%`,
    });
  }


///////////////////////////////////
//////////////////////////////////
/////////////////////////////////
////////////////////////////////
//Using Chess.js and ChessBoardjs.js
var cofing = {
    draggable : true,
    position: 'start',
    onDragStart : onDragStart,
    onDrop: onDrop,
    onMouseoverSquare: onMouseoverSquare,
    onMouseoutSquare: onMouseoutSquare,
    onSnapEnd: onSnapEnd
}
function resetGame(){
  var element = $('#move-history').empty();
    globalSum = 0
    BenefitUpdate(globalSum)
    game.reset()
    checkCurr('black')
    board.position(game.fen())
    element.empty();
    count=0
    board.start()
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
}


document.getElementById("mainStartBtn").onclick = function() {
    // console.log(player_color)
    globalSum = 0
    BenefitUpdate(globalSum)
    board =  Chessboard('myBoard', cofing)
    game.reset()
    count=0
    checkCurr('black')
    var element = $('#move-history').empty();
    element.empty();
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
};
document.getElementById("clearBoard").onclick = function() {
    resetGame()
};


function removeGreySquares() {
    $('#myBoard .square-55d63').css('background', '');
  }
  
  function greySquare(square) {
    var $square = $('#myBoard .square-' + square);
  
    var background = "radial-gradient(circle, #b5e48c 5%, transparent 150%)";
    if ($square.hasClass('black-3c85d')) {
      background = "radial-gradient(circle, #b5e48c 5%, transparent 150%)"
    }
  
    $square.css('background', background);
  }

function onDragStart(source, piece){
    if(game.game_over()){
        checkCurr('black')
        window.setTimeout(function(){
          alert(prev + ' win !!!!');
        }, 2000)
        //resetGame()
        window.setTimeout(function(){
          resetGame();
        }, 2000)
        return false
    }
    if((game.turn() === 'w' && piece.search(/^b/) !==-1) || (game.turn() === 'b' && piece.search(/^w/) !==-1)){
        return false
    }
    return true
}

function makeRandomMove () {
    var possibleMoves = game.moves()
  
    // game over
    if (possibleMoves.length === 0) return
  
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    game.move(possibleMoves[randomIdx])
    board.position(game.fen())
}


function onDrop(source, target){
    removeGreySquares()
    var move = game.move({
        from:source,
        to: target,
        promotion: 'q' 
    })

    if(move === null) return 'snapback'
    globalSum = evaluteSum(game,move,globalSum,'b')
    console.log(globalSum)
    BenefitUpdate()
    RewriteHistory(game.history())
    prev='white'
    if(!checkCurr('black')){
        window.setTimeout(function(){
            runBest('b');
        }, 200)
        
    }
}

function onMouseoverSquare(square, piece) {
    // get list of possible moves for this square
    var moves = game.moves({
      square: square,
      verbose: true,
    });
  
    // exit if there are no moves available for this square
    if (moves.length === 0) return;
  
    // highlight the square they moused over
    greySquare(square);
  
    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      greySquare(moves[i].to);
    }
  }
  
  function onMouseoutSquare(square, piece) {
    removeGreySquares();
  }

  function onSnapEnd() {
    board.position(game.fen());
  }