function registerEventListener(mainElement = "", event = "click", subelement = "li", listener = function(event){}) {
  mainElement.on(event, subelement, listener);
}

class Activity {
  constructor(name = "Start", imgURL = "./img/start.png", form = "circle") {
    this.imgURL = imgURL;
    this.form = form;
    this.name = name;
  }

  get img() {
    let imgElement = document.createElement('img');
    imgElement.src = this.imgURL;
    return imgElement;
  }

  get position() { return this.currentPosition }

  draw(ctx, posX = 0, posY = 50, width = 48, height = 48){
    let img = this.img;
    img.addEventListener("load", () => {
      ctx.drawImage(img, posX, posY, width, height)
    });
    this.currentPosition = { x: posX, y: posY, width: width, height: height };
  }

  onCollide(pos = {x: null, y: null}, type = "click", event = null){
    if(this.form == "circle" && !this._circleCollide(pos) || this.form !== "circle" && !this._rectangleCollide(pos)){
      if(type == "click"){
        console.log(`Click on the activity: ${this.name}`);
      }
      console.log(`Ha colisionado!`);
    }
  }

  _rectangleCollide(pos){
    return !pos || !pos.x  || !pos.y || pos.x < this.currentPosition.x || pos.x > (this.currentPosition.x + this.currentPosition.width) ||
      pos.y < this.currentPosition.y || pos.y > (this.currentPosition.y + this.currentPosition.height);
  }

  _circleCollide(pos){
    let radius = this.currentPosition.width / 2;
    let circleCenter = { x: this.currentPosition.x + radius, y: this.currentPosition.y + radius};
    let distX = pos.x - circleCenter.x;
    let distY = pos.y - circleCenter.y;
    let distance = Math.sqrt( distX * distX + distY * distY );

    return distance > radius;
  }
}

class Menu {
  constructor(ctx){
    this.buttons = [{ url: "./img/menu/icons8-ajustes-480.png", label: "Settings", onClick: function(){
      console.log(this.label);
      }}, { url: "./img/menu/icons8-idea-480.png", label: "Idea"}, { url: "./img/menu/icons8-menos-96.png", label: "Stop"}];
    this.ctx = ctx;
    this.buttonSize = 25;
    this.menuPosition = {x: 0, y: 0, width: this.ctx.canvas.width, height: 35, lastX: 5, lastY: 5};
    this.initUI();
    this.loadButtons();
  }

  get bounds () {
    return this.menuPosition;
  }

  initUI() {
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillRect(this.menuPosition.x, this.menuPosition.y, this.menuPosition.width, this.menuPosition.height);
    this.ctx.fillStyle = "#ececec";
    this.ctx.lineWidth = 0.3;
    this.ctx.strokeRect(this.menuPosition.x, this.menuPosition.y, this.menuPosition.width, this.menuPosition.height);

  }

  loadButtons () {
    this.buttons.forEach(function (b) {
      b.x = this.menuPosition.lastX;
      b.y = this.menuPosition.lastY;
      b.width = this.buttonSize;
      b.height = this.buttonSize;
      this.menuPosition.lastX += this.buttonSize; // Horizontal menu

      b.html = document.createElement('img');
      b.html.src = b.url;
      b.html.addEventListener("load", () => {
        this.drawButton(b);
      });
    }.bind(this))
  }

  drawButton(button) {
    this.ctx.drawImage(button.html, button.x, button.y, this.buttonSize, this.buttonSize);
  }

  onClick(e, pos){
    let button = this.buttons.find(b => this._circleCollide(pos, b)); // If the button's shape is circular
    if(button && typeof button.onClick == 'function') button.onClick.bind(button)(e);
  }

  _circleCollide(ePos, pos = {x, y, width, height}){
    let radius = pos.width / 2;
    let circleCenter = { x: pos.x + radius, y: pos.y + radius};
    let distX = ePos.x - circleCenter.x;
    let distY = ePos.y - circleCenter.y;
    let distance = Math.sqrt( distX * distX + distY * distY );
    return distance <= radius;
  }
}

class WorkflowCanvas {
  constructor (canvasElementId = "workflowCanvas") {
    this.canvas = $("#" + canvasElementId);
    this.htmlCanvasElement = this.canvas[0];
    this._ctx = this.htmlCanvasElement.getContext("2d");
    this.collideListeners = [];

    this.loadSizes();
    this.init();
    this.loadListeners();
    this.loadActivities();

    this.menu = new Menu(this._ctx);
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
  }

  loadActivities() {
    let startAct = new Activity();
    startAct.draw(this._ctx);
    this.addColliderListener(startAct.onCollide, startAct);
  }

  addListener(event = "click", callback) {
    this.canvas.on(event, callback.bind(this));
  }

  /**
   * Add a function which catch the position where is the main action an then.
   * @param f Function function( { x, y}, type, event)
   * @param activity Instance of the activity
   */
  addColliderListener(f, activity) {
    this.collideListeners.push(f.bind(activity))
  }

  onClick(e) {
    let pos = { x : e.pageX - this.canvas.offset().left, y: e.pageY - this.canvas.offset().top };
    console.log(pos);

    if(this._rectangleCollide(pos, this.menu.bounds))
      this.menu.onClick.bind(this.menu)(e, pos);
    else this.collideListeners.forEach( collLis => {
      collLis(pos, "click", e);
    });
  }

  onMousedown(e) {
    this.canvas.on('mouseup mousemove', function handler(e) {
      if (e.type === 'mouseup') {
        // click
        console.log('click!!');
      } else {
        // drag
        console.log('drag on!!!');
      }

      console.log('drag off!!');
      this.canvas.off('mouseup mousemove', handler);
    }.bind(this));
  }

  _rectangleCollide(ePos, pos = {x, y, width, height}){
    return !(!ePos || !ePos.x  || !ePos.y || ePos.x < pos.x || ePos.x > (pos.x + pos.width) ||
      ePos.y < pos.y || ePos.y > (pos.y + pos.height));
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


});
