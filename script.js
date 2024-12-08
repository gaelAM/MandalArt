// Referencias al canvas y herramientas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const zoomRange = document.getElementById('zoomRange');
const canvasContainer = document.getElementById('canvasContainer');
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

const undoStack = [];
const redoStack = [];

// Cargar mandala seleccionado desde localStorage
const mandalaName = localStorage.getItem('selectedMandala');
if (!mandalaName) {
  alert("No se seleccionó ningún mandala. Volviendo a la pantalla principal.");
  goHome();
}

const mandalaImage = new Image();
mandalaImage.src = mandalaName;

// Ajustar el tamaño del canvas al tamaño de la imagen y dibujarla
mandalaImage.onload = () => {
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  drawImageScaled(mandalaImage);
  saveState();
};

// Función para regresar a la pantalla principal
function goHome() {
  window.location.href = 'index.html';
}

// Función para iniciar el dibujo
function startDrawing(event) {
  isDrawing = true;
  [lastX, lastY] = getCoordinates(event);
}

// Función para detener el dibujo
function stopDrawing() {
  if (isDrawing) {
    saveState();
  }
  isDrawing = false;
  ctx.beginPath();
}

// Función para obtener coordenadas del mouse o toque
function getCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (event.touches) {
    x = (event.touches[0].clientX - rect.left) / scale;
    y = (event.touches[0].clientY - rect.top) / scale;
  } else {
    x = (event.clientX - rect.left) / scale;
    y = (event.clientY - rect.top) / scale;
  }
  return [x, y];
}

// Función para dibujar en el canvas
function draw(event) {
  if (!isDrawing) return;

  const [x, y] = getCoordinates(event);

  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value / scale;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  [lastX, lastY] = [x, y];
}

// Función para guardar el estado actual del canvas
function saveState() {
  redoStack.length = 0;
  undoStack.push(canvas.toDataURL());
}

// Función para deshacer la última acción
function undo() {
  if (undoStack.length > 0) {
    redoStack.push(undoStack.pop());
    restoreState();
  }
}

// Función para rehacer la última acción deshecha
function redo() {
  if (redoStack.length > 0) {
    undoStack.push(redoStack.pop());
    restoreState();
  }
}

// Función para restaurar el estado del canvas
function restoreState() {
  const img = new Image();
  img.src = undoStack[undoStack.length - 1];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

// Función para borrar todo lo pintado
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawImageScaled(mandalaImage);
  saveState();
}

// Función para mostrar notificaciones en la página
function showNotification(message) {
  // Crear el contenedor de notificación
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  // Añadir la notificación al cuerpo del documento
  document.body.appendChild(notification);

  // Eliminar la notificación después de 3 segundos
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Función para guardar el mandala pintado en localStorage
function saveMandala() {
  const dataURL = canvas.toDataURL();
  const savedMandalas = JSON.parse(localStorage.getItem('savedMandalas')) || [];
  savedMandalas.push(dataURL);
  localStorage.setItem('savedMandalas', JSON.stringify(savedMandalas));

  // Mostrar notificación personalizada
  showNotification("Mandala guardado exitosamente.");
}


// Función para dibujar la imagen escalada
function drawImageScaled(img) {
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.min(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

// Función para aplicar zoom
zoomRange.addEventListener('input', (event) => {
  scale = event.target.value;
  canvas.style.transform = `scale(${scale})`;
});

// Eventos de dibujo
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault();
  startDrawing(event);
});
canvas.addEventListener('touchmove', (event) => {
  event.preventDefault();
  draw(event);
});
canvas.addEventListener('touchend', (event) => {
  event.preventDefault();
  stopDrawing();
});
