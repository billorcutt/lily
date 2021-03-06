
size(50, 50);
background(200,200,200);
float angle = 0;
float px = 0, py = 0;
float amplitude = 30;
float frequency = 0;
float fillGap = 2.5;
color c;

for (int i =- 75; i < height+75; i++){
  // reset angle to 0, so waves stack properly
  angle = 0;
  // increasing frequency causes more gaps
  frequency+=.006;
  for (float j=0; j<width+75; j++){
    py = i+sin(radians(angle))*amplitude;
    angle+=frequency;
    c =  color(abs(py-i)*255/amplitude, 255-abs(py-i)*255/amplitude, j*(255.0/(width+50)));
    // hack to fill gaps. Raise value of fillGap
    // if you increase frequency
    for (int filler = 0; filler<fillGap; filler++){
      set(int(j-filler), int(py)-filler, c);
      set(int(j), int(py), c);
      set(int(j+filler), int(py)+filler, c);
    }
  }
}
