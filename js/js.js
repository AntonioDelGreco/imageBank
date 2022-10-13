//VARIABLES GLOBALES
const form = document.querySelector('#form');
const allPics = document.querySelector('#allPics');
const paginacion = document.querySelector('#paginacion');
const dayNight = document.querySelector('#dayNight');
const microfono = document.querySelector('#microfono');

const cantEnPag = 30;
let totalPaginas;
let iterandoPags;
let paginaActual = 1;

/////////////////////////////////////////////////////////////////////////////////////////////////////////
window.onload = () => ['click', 'keypress'].forEach(cadaEvt => {
  form.addEventListener(cadaEvt, e => {
    if (cadaEvt === 'click') {
      //console.log(e.target)
      if (e.target.id === 'buscar') validarForm(e);  
      if (e.target.id === 'resetear') resetBusqueda(e); 
      if (e.target.id === 'microfono') speech(e); 
    }
    else if(cadaEvt === 'keypress'){
      if (e.key === 'Enter') {
        if (e.target.id === 'termino') validarForm(e);
      }
    }
  })
})

//speech API
function speech(e){
  e.preventDefault();
  const escucha = document.createElement('p');
  const SpeechRecognition = webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.start();

  recognition.onstart = function(){
    const existe = document.querySelector('#escuchador');
    if (!existe) { 
      escucha.id = 'escuchador';
      escucha.textContent = 'Escuchando...';
      escucha.classList.add('escucha');
      form.appendChild(escucha);
      setTimeout(() => escucha.remove(),2000);
    }
  }

  recognition.onspeechend = function(){
    escucha.textContent = 'Se dejo de grabar...';
    escucha.classList.add('escucha');
    form.appendChild(escucha);
    recognition.stop();
    setTimeout(() => escucha.remove(),2000);
  }

  recognition.onresult = function(e){
    voz = e.results[0][0].transcript;
    console.log(voz)
    buscando(voz)
  }
}

/////////////////////////
function resetBusqueda(e){
  e.preventDefault();
  form.reset();
  removerFotos();
  while (paginacion.firstChild) {
    paginacion.removeChild(paginacion.firstChild)
  }
}

/////////////////////////
function validarForm(e){
  e.preventDefault();
  const termino = document.querySelector('#termino').value.toLowerCase();
  if(termino === '') {
    alerta('Es necesario un término de búsqueda.') 
    return;
  }
  const spinner = document.createElement('div');
  spinner.classList.add('loader');
  allPics.appendChild(spinner);
  setTimeout(() => {
    spinner.remove();
    buscando(termino);
  },1000);
}

/////////////////////////////
async function buscando(termino){
  const imgTipo = document.querySelector('#imgTipo').value;
  const orientacion = document.querySelector('#orientacion').value;

  const API_KEY = '25288001-22e3c800f50f0b02cf90fb193';
  const URL = `https://pixabay.com/api/?key=${API_KEY}&q=${termino}&per_page=${cantEnPag}&page=${paginaActual}&image_type=${imgTipo}&orientation=${orientacion}`;

  try {
    const respuesta = await fetch(URL);
    const data = await respuesta.json();
    totalPaginas = paginador(data.totalHits);
    imagenesHTML(data.hits);
  } catch (error) {
    console.log(`%c Error: ${error}`, 'background:red; color:white;')
  }
}

///////////////////////
function imagenesHTML(data){
  removerFotos();

  data.forEach( imagen => {
    const { previewURL, downloads, likes, user, views, pageURL } = imagen;
    allPics.innerHTML += ` 
    <div class="cards">
      <img loading="lazy" src="${previewURL}"> 
      <p>Imagen de: ${user}</p>
      <p>Likes: ${likes}</p>
      <p>Vistas: ${views}</p>
      <p>Descargas: ${downloads}</p>
      <a class="boton-imagen" href="${pageURL}" target="_blank" rel="noopener noreferrer">Ver en página original</a>
    </div>
    `
  })

  while (paginacion.firstChild) {
    paginacion.removeChild(paginacion.firstChild)
  }

  mostrarPags();
}

////////////////////
function mostrarPags(){
  iterandoPags = crearPaginador(totalPaginas);
  while(true){
    const { value, done } = iterandoPags.next();
    if (done) return;
    
    const boton = document.createElement('a');
    boton.href = '#';
    boton.textContent = value;

    boton.onclick = () => {
      paginaActual = value;
      const termino = document.querySelector('#termino').value.toLowerCase();
      buscando(termino);
    }
    paginacion.appendChild(boton);
  }
}

////////////////////
function* crearPaginador(total) {
  for(let i = 1; i <= total; i++){
    yield i;
  }
}

///////////////////////////
function paginador(total){
  return parseInt(Math.ceil(total / cantEnPag));
}

////////////////////////////
function alerta(msg){
  const exist = document.querySelector('#alerta-roja');
  if (!exist) {
    const mostrarAlerta = document.createElement('p');
    mostrarAlerta.id = 'alerta-roja';
    mostrarAlerta.classList.add('error')
    mostrarAlerta.textContent = msg;
    form.appendChild(mostrarAlerta);
    setTimeout(() => mostrarAlerta.remove(), 2000);
  }
}

function removerFotos(){
  while(allPics.firstChild){
    allPics.removeChild(allPics.firstChild);
   }
}
