$(document).ready(function() {
    var img = document.getElementById("image");
    puzzle = new SlidingPuzzle(img, "drawTo", 3, 20);
    puzzle.drawBoard();
});


/**
* image: the image to use
* drawTo: Id (string) of the element where to draw
* divideBy: number of pieces (e.g. divideBy = 3 => 3*3 array)
*/
class SlidingPuzzle {
    constructor(image, drawTo, divideBy, animationSpeedMultiplier) {
        this.image = image;
        this.drawTo = drawTo;
        this.divideBy = divideBy;
        this.animationSpeedMultiplier = animationSpeedMultiplier;
        this.containerCanvas = document.createElement('canvas');
        this.pieceWidth = this.image.width / divideBy;
        this.pieceHeight = this.image.height / divideBy;
        this._constructPieces();
        this._shufflePieces();
        this.deletedImage = this._removeOnePiece(); // Removes one piece and remember which one was removed for victory screen
        this.containerCanvas.id     = "drawToCanvas";
        this.containerCanvas.width  = this.image.width;
        this.containerCanvas.height = this.image.height;
        this.containerCanvas.style.position = "absolute";
        this.containerCanvas.style.border   = "1px solid";
        $("#"+drawTo).append(this.containerCanvas);
        this._addClickEventListener();
    }    


    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    /*
    * Manages the user click
    */
    manageClick(clickPosX, clickPosY)
    {
        var i = Math.floor(clickPosX / this.pieceWidth);
        var j = Math.floor(clickPosY / this.pieceHeight);
        let emptySpotPos = this._getEmptySpotPositionIfAround(i, j);

        if (emptySpotPos.i != null && emptySpotPos.j != null)
        {
            this._swapPieces(emptySpotPos.i, emptySpotPos.j, i, j);

            let directioni = emptySpotPos.i - i;
            let directionj = emptySpotPos.j - j;
            if (directioni > 0)
                directioni = 1;
            if (directioni < 0)
                directioni = -1;
            if (directionj > 0)
                directionj = 1;
            if (directionj < 0)
                directionj = -1;


            if (this._win())
            {
                for (var i = 0; i < this.divideBy; i++)
                {
                    for (var j = 0; j < this.divideBy; j++)
                    {
                        if (this.pieces[i][j].canvas == null)
                            this.pieces[i][j].canvas = this.deletedImage;
                    }
                }
                alert("Congratulations!");
                this.drawBoard();
            }
            else
                this._drawPieceWithAnimation(emptySpotPos.i, emptySpotPos.j, {directioni:directioni, directionj:directionj});
        }
    }

    /* 
    *   Draws the current state of the canvas
    */
    drawBoard()
    {
        for (var i = 0; i < this.divideBy; i++)
        {
            for (var j = 0; j < this.divideBy; j++)
            {
                this._drawPiece(i, j);
            }
        }

    }

    /**
    * Checks if the user clicked within our div / wants to move pieces
    * Ties the click event to this.manageClick
    */
    _addClickEventListener()
    {
        var puzzleObject = this;
        $("#"+this.drawTo).click(function(e){
            var posX = $(this).position().left, posY = $(this).position().top;
            puzzleObject.manageClick(e.pageX - posX, e.pageY - posY);
        });
    }

    /**
    * Checks the whole board and returns true if it is a win (all peices are at their starting position)
    */
    _win()
    {
        for (var i = 0; i < this.divideBy; i++)
        {
            for (var j = 0; j < this.divideBy; j++)
            {
                if (this.pieces[i][j].startPosi != i ||  this.pieces[i][j].startPosj != j)
                    return false;
            }
        }
        return true;
    }

    /*
    * Finds the empty canvas image position if it is around position (i,j)
    * Returns an object with i and j set to the position of the empty canvas, or null if not found
    */
    _getEmptySpotPositionIfAround(i, j)
    {
        let emptySpot = {i:null, j:null};

        // Check we didn't click the empty spot directly
        if (this.pieces[i][j].canvas != null)
        {

            // Check all four adjacent tiles if they exist for the empty spot
            if (i > 0)
            {
                if (this.pieces[i - 1][j].canvas == null)
                {
                    emptySpot.i = i - 1;
                    emptySpot.j = j;
                }
            }
            if (j > 0)
            {
                if (this.pieces[i][j - 1].canvas == null)
                {
                    emptySpot.i = i;
                    emptySpot.j = j - 1;
                }
            }
            if (i + 1 < this.divideBy)
            {
                if (this.pieces[i + 1][j].canvas == null)
                {
                    emptySpot.i = i + 1;
                    emptySpot.j = j;
                }
            }
            if (j + 1 < this.divideBy)
            {
                if (this.pieces[i][j + 1].canvas == null)
                {
                    emptySpot.i = i;
                    emptySpot.j = j + 1;
                }
            }
        }
        return emptySpot;
    }

    /**
    * Cuts the image in region and builds an array so that each piece has a region
    */
    _constructPieces()
    {
        this.pieces = [];
        for (var i = 0; i < this.divideBy; i++)
            this.pieces[i] = [];

        for (var i = 0; i < this.divideBy; i++)
        {
            for (var j = 0; j < this.divideBy; j++)
            {
                let pieceCanvas = this._getClippedRegion(this.image, i * this.pieceWidth, j * this.pieceHeight,
                    this.pieceWidth, this.pieceHeight);
                this.pieces[i][j] =  {canvas:pieceCanvas, startPosi:i, startPosj:j};
            }
        }

    }

    // Shuffles the pieces to get a random puzzle
    _shufflePieces()
    {
        for (var i = 0; i < 100; i++)
        {
            let randomi = this.getRandomInt(this.divideBy);
            let randomj = this.getRandomInt(this.divideBy);
            let randomNewi = this.getRandomInt(this.divideBy);
            let randomNewj = this.getRandomInt(this.divideBy);
            this._swapPieces(randomi, randomj, randomNewi, randomNewj);
        }
    }

    /**
    * Randomly sets one piece to null so we can play
     Returns the removed piece for safekeeping until victory
     */
     _removeOnePiece()
     {
        let randomi = this.getRandomInt(this.divideBy);
        let randomj = this.getRandomInt(this.divideBy);
        let toRet = this.pieces[randomi][randomj].canvas;
        this.pieces[randomi][randomj].canvas = null;
        return toRet;
    }

    /**
    * Swaps two pieces
    */
    _swapPieces(i, j, newi, newj)
    {
        var save = this.pieces[i][j];
        this.pieces[i][j] = this.pieces[newi][newj];
        this.pieces[newi][newj] = save;
    }

    /**
    * i,j = position of the empty cell
    */
    _drawPieceWithAnimation(i, j, animation)
    {
        let directioni = animation.directioni;
        let directionj = animation.directionj;

        var anim = {
            // i,j : the position in the array of pieces
            // iPos, jPos: the actual pixel position in the canvas
            // thisObject: references this class
            // directioni,j: direction of the animation (the pixel to add, either -1, +1 or 0)
            drawAnimation: function(i, j, iPos, jPos, directioni, directionj, thisObject) {

                let clearAndDraw = function()
                {
                    // We clear the part that previously held our object
                    let context = thisObject.containerCanvas.getContext('2d');
                    context.clearRect((i - directioni) * thisObject.pieceWidth, 
                        (j - directionj) * thisObject.pieceHeight, 
                        thisObject.pieceWidth, thisObject.pieceHeight);
                    if (thisObject.pieces[i][j].canvas != null)
                        context.drawImage(thisObject.pieces[i][j].canvas, iPos, jPos, thisObject.pieceWidth, thisObject.pieceHeight);

                };

                let overlap = Math.abs((jPos / thisObject.pieceHeight + iPos / thisObject.pieceWidth + 
                    (directioni * thisObject.animationSpeedMultiplier) / thisObject.pieceWidth
                    + (directionj * thisObject.animationSpeedMultiplier) / thisObject.pieceHeight) - (i + j + directioni + directionj));
                clearAndDraw();

                // If we are on our final position, stop calling itself and redraw overlapping image
                // also clears the empty rectangle in case we overlapped because of speed
                if (directioni == 0 && directionj == 0)
                {
                    let temp = thisObject._getEmptySpotPositionIfAround(i, j);
                    i = temp.i;
                    j = temp.j;
                    clearAndDraw();
                    return;
                }

                // We stop drawing if we have finished moving the object one piece
                if (overlap > 1) {
                    window.requestAnimationFrame(function() {
                        anim.drawAnimation(i, j, iPos + directioni * thisObject.animationSpeedMultiplier, jPos + directionj * thisObject.animationSpeedMultiplier, directioni, directionj, thisObject);
                    });

                }
                // We clean the borders if we went too fast because of animation speed
                else {
                    // Draws the image on its final position, and calls next iteration with direction set to 0,
                    // which will stop requesting new animation frames
                    window.requestAnimationFrame(function() {
                        anim.drawAnimation(i, j, (i) * thisObject.pieceWidth, (j) * thisObject.pieceHeight, 0, 0, thisObject);
                    });
                }

            }
        };
        anim.drawAnimation(i, j, (i - directioni) * this.pieceWidth, (j - directionj) * this.pieceHeight, directioni, directionj, this);
    }

    /**
    * Draws the piece[i,j]
    */
    _drawPiece(i, j)
    {
        let context = this.containerCanvas.getContext('2d');
        context.clearRect(i * this.pieceWidth, j * this.pieceHeight, this.pieceWidth, this.pieceHeight);

        if (this.pieces[i][j].canvas != null)
        {
            context.drawImage(this.pieces[i][j].canvas, i * this.pieceWidth, j * this.pieceHeight, this.pieceWidth, this.pieceHeight);
        }
    }

    _getClippedRegion(image, x, y, width, height) {
        var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        //                   source region         dest. region
        ctx.drawImage(image, x, y, width, height,  0, 0, width, height);

        return canvas;
    }

}



