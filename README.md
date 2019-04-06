# js-jquery-sliding-puzzle

A sliding puzzle, made in javascript / jquery by using canvas. Could be used for instance as as a 404 or 500 error page.

# Examples

What it looks like:

![description](examples/example_play2.gif)

Featuring unlimited choices of column / rows:

![description](examples/ex_3x6.PNG)
![description](examples/ex_6x6.PNG)


Upon win, the completed image is shown:

![description](examples/win.PNG)

# Setting-up

Import jquery and the js file. Then, you could do something like :

```
$(document).ready(function() {
    var img = document.getElementById("image"); // The image to use as sliding puzzle image
    puzzle = new SlidingPuzzle(img, "drawTo", 3, 20); // Arguments: the image, the div to draw to, the number of rows/columns, the animation speed multiplier
    puzzle.drawBoard(); // draws the board for the first time
});
```

Assuming you have an img with src setup within your html or a dynamically created image in img, and a div with id "drawTo" within your html.
