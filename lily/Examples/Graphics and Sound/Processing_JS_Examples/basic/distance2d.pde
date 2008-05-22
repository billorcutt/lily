
float max_distance;

void setup() {
  size(200, 200); 
  smooth();
  noStroke();
  max_distance = dist(0, 0, width, height);
}

void draw() 
{
  background(51);

  for(int i = 0; i <= width; i += 20) {
    for(int j = 0; j <= width; j += 20) {
      float size = dist(mouseX, mouseY, i, j);
      size = size/max_distance * 66;
      //opera.postError(i, j, size);
      ellipse(i, j, size, size);
    }
  }
}
