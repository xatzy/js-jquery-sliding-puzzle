# js-jquery-sliding-puzzle

A sliding puzzle, made in javascript / jquery by using canvas. Could be used for instance as as a 404 or 500 error page.
Tested on chrome/chromium, firefox and edge. IE not supported as it doesn't support canvas.

# Examples


Live demo: https://maruki.eu/sliderpuzzle

What it looks like:

![description](examples/example_play2.gif)

Featuring unlimited choices of column / rows:

3x3:

![description](examples/ex_3x3.PNG)

6x6:

![description](examples/ex_6x6.PNG)


Upon win, the completed image is shown:

![description](examples/win.PNG)

# Setting-up

Import jquery and the js file. Then, you could do something like (SlidingPuzzle requires a loaded image, thus the need to wait for image to be loaded) :

```
// Assuming you have an image with id "image", and a div with id "drawTo"
$(document).ready(function(){
    var img = document.querySelector('#image');
    function loaded() {
        // img: the image, drawTo:the div, 4: number of columns/rows, 15: animation speed multiplier
        var puzzle = new SlidingPuzzle(img, "drawTo", 4, 15);
        puzzle.drawBoard();
    };
    if (img.complete) {
      loaded();
  } else {
      img.addEventListener('load', loaded);
  }
});

```

Assuming you have an img with src setup within your html or a dynamically created image in img, and a div with id "drawTo" within your html.
