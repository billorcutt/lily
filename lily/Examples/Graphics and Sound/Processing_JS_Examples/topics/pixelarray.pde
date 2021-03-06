
PImage a;
int[] aPixels;
int direction = 1;
boolean onetime = true;
float signal;

void setup() 
{
  size(200, 200);
  aPixels = new int[width*height];
  noFill();
  stroke(255);
  frameRate(30);
  a = loadImage("topics/data/ystone08.jpg");
  for(int i=0; i<width*height; i++) {
    aPixels[i] = a.pixels[i];
  }
}

void draw() 
{
  if (signal > width*height-1 || signal < 0) { 
    direction = direction * -1; 
  }

  if(mousePressed) {
    if(mouseY > height-1) { mouseY = height-1; }
    if(mouseY < 0) { mouseY = 0; }
    signal = mouseY*width+mouseX;
  } else {
    signal += (0.33*direction);  
  }
  
  if(keyPressed) {
    image(a, 0, 0);
    /*
    loadPixels();
    for (int i=0; i<width*height; i++) { 
      pixels[i] = aPixels[i];  
    }
    updatePixels();
    */
    rect(signal%width-5, int(signal/width)-5, 10, 10);
    point(signal%width, int(signal/width));
  } else {
    background( aPixels[int(signal)] );
    /*
    loadPixels();
    for (int i=0; i<width*height; i++) { 
      pixels[i] = aPixels[int(signal)];
    }
    updatePixels();
    */
  }
}
