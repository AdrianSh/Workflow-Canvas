function registerEventListener(mainElement = "", event = "click", subelement = "li", listener = function(event){}) {
  mainElement.on(event, subelement, listener);
}

class Activity {
  constructor(name = "Start", imgURL = "./img/start.png", form = "circle") {
    this.imgURL = imgURL;
    this.form = form;
  }

  get img() {
    let imgElement = document.createElement('img');
    imgElement.src = this.imgURL;
    return imgElement;
  }

  get position() { return this.currentPosition }

  draw(ctx, posX = 0, posY = 0, width = 48, height = 48){
    let img = this.img;
    img.addEventListener("load", () => {
      ctx.drawImage(img, posX, posY, width, height)
    });
    this.currentPosition = { x: posX, y: posY, width: width, height: height };
  }

  onCollide(pos = {x: null, y: null}, instance){
    if(instance.form == "circle" && !instance._circleCollide(pos, instance) || instance.form !== "circle" && !instance._rectangleCollide(pos, instance)){
      console.log(`Ha colisionado!`);
    }
  }

  _rectangleCollide(pos, instance){
    return !pos || !pos.x  || !pos.y || pos.x < instance.currentPosition.x || pos.x > (instance.currentPosition.x + instance.currentPosition.width) ||
      pos.y < instance.currentPosition.y || pos.y > (instance.currentPosition.y + instance.currentPosition.height);
  }

  _circleCollide(pos, instance){
    let radius = instance.currentPosition.width / 2;
    let circleCenter = { x: instance.currentPosition.x + radius, y: instance.currentPosition.y + radius};
    let distX = pos.x - circleCenter.x;
    let distY = pos.y - circleCenter.y;
    let distance = Math.sqrt( distX * distX + distY * distY );

    return distance > radius;
  }
}

class WorkflowCanvas {
  constructor (canvasElementId = "workflowCanvas") {
    this.canvas = $("#" + canvasElementId);
    this.htmlCanvasElement = this.canvas[0];
    this._ctx = this.htmlCanvasElement.getContext("2d");
    this.collideListeners = [];

    this.loadSizes();
    this.loadListeners();
    this.loadActivities();
  }

  get ctx() {
    return this._ctx;
  }

  loadSizes() {
    this.htmlCanvasElement.height = this.canvas.height();
    this.htmlCanvasElement.width = this.canvas.width();
    this.size = {width: this.canvas.width(), height: this.canvas.height()};
    // console.log(`ClientWidth: ${this.htmlCanvasElement.clientWidth}, ClientHeight: ${this.htmlCanvasElement.clientHeight}  Canvas height: ${this.htmlCanvasElement.height}, width: Canvas height: ${this.htmlCanvasElement.width}  jQuery width: ${this.canvas.width()}, height: ${this.canvas.height()}`)
    // To keep ratio at other sizes: this.htmlCanvasElement.width = this.htmlCanvasElement.height * (this.htmlCanvasElement.clientWidth / this.htmlCanvasElement.clientHeight);
  }

  loadListeners() {
    this.addListener("click", this.onClick);
    this.addListener("mousedown", this.onMousedown);
  }

  loadActivities() {
    let startAct = new Activity();
    startAct.draw(this._ctx);
    this.addColliderListener(startAct.onCollide, startAct);
  }

  addListener(event = "click", callback) {
    let instance = this;
    let proxy = function(e) {
      callback(e, instance);
    };
    this.canvas.on(event, proxy);
  }

  /**
   * Add a function which catch the position where is the main action an then.
   * @param f Function function( { x, y}, activityInstance )
   * @param activity Instance of the activity
   */
  addColliderListener(f, activity) {
    this.collideListeners.push(function(p){ f(p, activity); })
  }

  onClick(e, instance) {
    let canvas = $(e.target);
    let pos = { x : e.pageX - canvas.offset().left, y: e.pageY - canvas.offset().top };
    console.log(pos);

    instance.collideListeners.forEach( e => {
      e(pos);
    });
  }

  onMousedown(e, instance) {
    instance.canvas.on('mouseup mousemove', function handler(e) {
      if (e.type === 'mouseup') {
        // click
        console.log('click!!');
      } else {
        // drag
        console.log('drag on!!!');
      }

      console.log('drag off!!');
      instance.canvas.off('mouseup mousemove', handler);
    });
  }

  init() {
    // Fill background
    this._ctx.fillStyle = "#f3f3f3";
    this._ctx.fillRect(0, 0, this.size.width, this.size.height);
    console.log("init")
  }


}

$(() => {
  window.w = new WorkflowCanvas();
  w.init();

});
