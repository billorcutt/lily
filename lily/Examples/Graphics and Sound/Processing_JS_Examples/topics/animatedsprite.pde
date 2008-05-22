
AniSprite animation1, animation2;
float xpos, ypos;
float drag = 30.0;

void setup() {
  size(200, 200);
  background(255, 204, 0);
  frameRate(24);
  animation1 = new AniSprite("topics/data/PT_Shifty_00", 38);
  animation2 = new AniSprite("topics/data/PT_Teddy_00", 60);
}

void draw() { 
  float difx = mouseX - xpos;
  if (abs(difx) > 1.0) {
    xpos = xpos + difx/drag;
    xpos = constrain(xpos, 0, width);
  }

  // Display the sprite at the position xpos, ypos
  if (mousePressed) {
    background(153, 153, 0);
    animation1.display(xpos-animation1.getWidth()/2, ypos);
  } else {
    background(255, 204, 0);
    animation2.display(xpos-animation1.getWidth()/2, ypos);
  }
}
