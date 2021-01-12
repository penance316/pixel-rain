// Import image
const { myImage } = imageLoader;

// Wrap it incase the image hasnt finished loading yet.
myImage.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.height = 633;
  canvas.width = 640;
  // canvas.height = 633;
  // canvas.width = 640;

  // Draw the image and read its pixel data before removing the image again.
  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let particlesArray = [];
  const numberOfParticles = 5000;

  let mappedImage = [];
  // Map the image to our array.
  for (let y = 0; y < canvas.height; y++) {
    let row = [];
    for (let x = 0; x < canvas.width; x++) {
      // Pixels.data array contains all RGBA pixels as 4 seperate array items.
      const red = pixels.data[y * 4 * pixels.width + x * 4];
      const green = pixels.data[y * 4 * pixels.width + x * 4 + 1];
      const blue = pixels.data[y * 4 * pixels.width + x * 4 + 2];
      const brightness = calculateRelativeBrightness(red, green, blue);
      // Custom cell obj to hold the details for later. Could maybe add colour values here just incase i want to use them.
      const cell = { cellBrightness: brightness };
      row.push(cell);
    }
    mappedImage.push(row);
  }

  /**
   * Calculate the brightness but adjusted to the human eye
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {number}
   */
  function calculateRelativeBrightness(r, g, b) {
    return Math.sqrt(r * r * 0.299 + g * g + 0.587 + b * b * 0.144) / 100;
  }

  /**
   * The animation cycle.
   */
  function animate() {
    // ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height); //temp

    // Draw a transparent rectangle on top to make all previous particles fade out and look like trails.
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.2;

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      ctx.globalAlpha = particlesArray[i].speed * 0.5;
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
  }

  /**
   * Create all the particles and start animating.
   */
  function init() {
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
    animate();
  }

  /**
   * Particle class
   */
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = 0;
      this.speed = 0;
      this.velocity = Math.random() * 0.5; // a bit of randomness for the speed
      this.size = Math.random() * 1.5 + 1;

      // To hold a rounded version of the position.
      this.pos1 = Math.floor(this.y);
      this.pos2 = Math.floor(this.x);
    }

    /**
     * Move and update the position of the particle.
     */
    update() {
      this.pos1 = Math.floor(this.y);
      this.pos2 = Math.floor(this.x);
      this.speed = mappedImage[this.pos1][this.pos2].cellBrightness;
      let movement = 2.5 - this.speed + this.velocity;
      // console.log(this.speed);
      this.y += movement;

      // Give it a random position and check if it has reached the end of the canvas.
      this.y += this.velocity;
      if (this.y >= canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }
    }

    /**
     * Draw the particle to the screen.
     */
    draw() {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  init();
});
