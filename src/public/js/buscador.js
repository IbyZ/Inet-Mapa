// Buscador por mapa
// Espera 500ms despues de que el usuario deja de escribir antes de realizar la busqueda
var debouncedSearch = debounce(function(busqueda) {
    var resultados = filtrarEscuelas(escuelas, busqueda);
    mostrarResultados(resultados, busqueda);
}, 500); 

document.getElementById('buscar').addEventListener('input', function(event) {
    var busqueda = event.target.value.toLowerCase();
    debouncedSearch(busqueda); // Llama a la funcion de busqueda despues de un retraso
});

// Esta funcion toma dos argumentos: una funcion a la que se le aplicará el debounce y un tiempo de espera en milisegundos
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this;
        var args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funcion para filtrar
function filtrarEscuelas(escuelas, busqueda) {

    // Normalizamos las palabras con acento
    return escuelas.filter(function(escuela) {
        // Eliminar caracteres especiales y convertir la búsqueda en minúsculas
        const busquedaSinEspeciales = busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        // Dividir la búsqueda en palabras
        const palabrasBusqueda = busquedaSinEspeciales.split(/\s+/);

        // Verificar si alguna de las palabras de la búsqueda está presente en el nombre de la escuela
        const nombreSinAcentos = escuela.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        // Verificar si alguna de las palabras de la búsqueda está presente en el nombre o el cue de la escuela
        return palabrasBusqueda.every(palabra => nombreSinAcentos.includes(palabra) || escuela.cue.includes(palabra));
    });
}

// Agrega un event listener para hacer clic en cualquier parte de la página
document.addEventListener('click', function(event) {
    var resultadosDiv = document.getElementById('resultados');
    var buscarInput = document.getElementById('buscar');
    var noRes = document.getElementsByClassName('mensaje-no-resultados');

    // Si el clic no está en el campo de busqueda ni en el contenedor de resultados, oculta los resultados
    if (event.target !== buscarInput && event.target !== resultadosDiv || event.target === noRes ) {
        resultadosDiv.style.display = 'none';
    }
});

// Muestra los Resultados
function mostrarResultados(resultados, busqueda) {

    //Obtiene el ID del div donde se insertaran los resultados del index.html 
    var resultadosDiv = document.getElementById('resultados');
    resultadosDiv.innerHTML = '';

    // Si no hay resultados el div se oculta
    if (resultados.length === 0) {
        resultadosDiv.style.display = '';

        var sinResultados = document.createElement('p');
        sinResultados.textContent = 'No se encontraron resultados de la búsqueda';
        // Añade clases de estilo
        sinResultados.classList.add('mensaje-no-resultados');
        // Añade el mensaje de no resultados al div de resultados
        resultadosDiv.appendChild(sinResultados);

    } else {
        resultadosDiv.style.display = 'block';
        resultadosDiv.style.maxHeight = '70vh'; 

        var select = document.createElement('select');
        var div = document.createElement('div');
        select.appendChild(div);

        // Añadimos estilos de Boostrap al <div> y hacemos que sea deslizable
        div.classList.add('list-group');
        div.style.overflowY = 'auto';
        resultados.forEach(function(escuela) {

            var coords = escuela.coords;
            var cueesc = escuela.cue;
            var sec_inet = escuela.sec_inet;
            var snu_inet = escuela.snu_inet;
            var fp_inet = escuela.fp_inet;

            if (coords !== '-') {    
                [lat, lng] = coords.split(',').map(parseFloat);
            }else{
                return;
            }

            // Crea una etiqueda <a> con las siguientes clases y atributos para cuando se hagan click en
            // estos den informacion de la escuela para su posterior localizacion y mostrar sus ofertas educativas
            var a = document.createElement('a');
            a.classList.add('escuela-link');
            a.setAttribute('data-cueid', cueesc);
            a.setAttribute('lat', lat);
            a.setAttribute('lng', lng);
            a.setAttribute('secinet', sec_inet);
            a.setAttribute('snuinet', snu_inet);
            a.setAttribute('fpinet', fp_inet);

            // Agrega el atributo tabindex para hacer la etiqueta <a> tabulable
            a.setAttribute('tabindex', '0');

            a.addEventListener('keydown', function(event) {
                // Si la tecla presionada es Enter (código de tecla 13), ejecuta la acción de clic
                if (event.keyCode === 13) {
                    a.click(); // Simula un clic en el enlace
                    event.preventDefault(); // Previene el comportamiento predeterminado de la tecla Enter (por ejemplo, enviar un formulario)
                }
            });

            // El contenido de la etiqueta <a> es el nombre de la escuela y se añade la etiqueta <a> como hija de la etiqueda <div>
            a.textContent = escuela.nombre;
            a.classList.add('list-group-item');
            a.classList.add('list-group-item-action');
            div.appendChild(a);
        });

        // Se agrega la etiqueta <div> como hija de el <div> donde se mostraran los resultados
        resultadosDiv.appendChild(div);

        // Si no esta escrito nada en el buscador el <div> de los resultados no se mostrara
        if (busqueda === ''){
            resultadosDiv.style.display = 'none';
        }
    }
}



// Filtro - Localidades
function actualizarSelect() {
    var provinciaSeleccionada = document.getElementById('formprov').value;
    var tipoSeleccionado = document.getElementById('formtipoesc').value;

    // Filtrar datos basados en las opciones seleccionadas
    var localidadesFiltradas = escuelas.filter(function(escuela) {
        // Normalizamos las palabras con acento
        const jurisdiccion = escuela.jurisdiccion.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Verificar provincia y tipo
        return jurisdiccion === provinciaSeleccionada && 
                (
                    escuela.sec_inet === '1' && tipoSeleccionado === '1' ||
                    escuela.snu_inet === '1' && tipoSeleccionado === '2' ||
                    escuela.fp_inet === '1' && tipoSeleccionado === '3' ||
                    tipoSeleccionado === '0'
                )
        });

    // Utilizar un conjunto para almacenar las localidades únicas
    var localidadesUnicas = new Set();

    // Llenar el conjunto con las localidades filtradas
    localidadesFiltradas.forEach(function(escuela) {
        localidadesUnicas.add(escuela.localidad);
    });
    
    // Limpiar el tercer select
    var selectLocalidad = document.getElementById('formlocalidad');
    selectLocalidad.innerHTML = '';
    optionTodas = document.createElement('option');
    optionTodas.value = '0';
    if (localidadesFiltradas.length == 0){
        optionTodas.textContent = 'No se hallaron localidades con ese tipo de escuelas.';
        selectLocalidad.style.color = 'red';
        selectLocalidad.appendChild(optionTodas);
        return;
    }else{
    selectLocalidad.style.color = 'black';
    optionTodas.textContent = 'Todas las Localidades';
    selectLocalidad.appendChild(optionTodas);
    }
    // Llenar el tercer select con las localidades filtradas
    localidadesUnicas.forEach(function(localidad) {
        var option = document.createElement('option');
        option.value = localidad; // El valor es el nombre de la localidad
        option.textContent = localidad; // El texto visible es también el nombre de la localidad
        selectLocalidad.appendChild(option);
    });
}

// Agregar event listeners a los dos primeros selects para actualizar el tercer select
document.getElementById('formprov').addEventListener('change', actualizarSelect);
document.getElementById('formtipoesc').addEventListener('change', actualizarSelect);



// Filtro - Ofertas Educativas
function actualizarSelectOfertas() {
    var provinciaSeleccionada = document.getElementById('formprov').value;
    var tipoSeleccionado = document.getElementById('formtipoesc').value;
    var localidadSeleccionada = document.getElementById('formlocalidad').value;

    // Filtrar datos basados en las opciones seleccionadas
    var ofertasFiltradas = datosOfertas.filter(function(escuela) {
        // Normalizamos las palabras con acentos
        const jurisdiccion = escuela.jurisdiccion.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Verificar provincia y tipo
        return jurisdiccion === provinciaSeleccionada &&
                (
                    escuela.localidad === localidadSeleccionada ||
                    localidadSeleccionada === '0'
                ) &&
                (   
                    escuela.sec_inet === '1' && tipoSeleccionado === '1' ||
                    escuela.snu_inet === '1' && tipoSeleccionado === '2' ||
                    escuela.fp_inet === '1' && tipoSeleccionado === '3' ||
                    tipoSeleccionado === '0'
                )
    });

    var ofertasUnicas = new Set();

    // Llenar el conjunto con las localidades filtradas
    ofertasFiltradas.forEach(function(escuela) {
        ofertasUnicas.add(escuela.Descripcion);
    });    

    // Limpiar el tercer select
    var selectOferta = document.getElementById('formofertas');
    selectOferta.innerHTML = '';
    optionTodasOfertas = document.createElement('option');
    optionTodasOfertas.value = '0';

    if (ofertasFiltradas.length == 0){
        optionTodasOfertas.textContent = 'No se hallaron ofertas.';
        selectOferta.style.color = 'red';
        selectOferta.appendChild(optionTodasOfertas);
        return;
    }else{
    optionTodasOfertas.textContent = 'Todas las Ofertas';
    selectOferta.style.color = 'black';
    selectOferta.appendChild(optionTodasOfertas);
    }
    // Llenar el tercer select con las localidades filtradas
    ofertasUnicas.forEach(function(Descripcion) {
        var option = document.createElement('option');
        option.value = Descripcion; // El valor es el nombre de la localidad
        option.textContent = Descripcion; // El texto visible es también el nombre de la localidad
        selectOferta.appendChild(option);
    });
    
    var enviarBtn = document.getElementById("btnoferta");

    // Agrega un event listener para detectar el clic en el botón
    enviarBtn.addEventListener("click", function() {
        event.preventDefault(); // Previene la recarga de la pagina por defecto al enviar el formulario

        // Filtra las ofertas para la escuela seleccionada
        var ofertasEscuela = ofertasFiltradas.filter(function (escuela) {
            
            // Normalizamos las palabras con acentos
            const jurisdiccion = escuela.jurisdiccion.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            // Verificar provincia y tipo
            return jurisdiccion === provinciaSeleccionada &&
                (
                    escuela.localidad === localidadSeleccionada ||
                    localidadSeleccionada === '0'
                ) &&
                (   
                    escuela.sec_inet === '1' && tipoSeleccionado === '1' ||
                    escuela.snu_inet === '1' && tipoSeleccionado === '2' ||
                    escuela.fp_inet === '1' && tipoSeleccionado === '3' ||
                    tipoSeleccionado === '0'
                ) && 
                (
                    escuela.Descripcion === selectOferta.value ||
                    selectOferta.value === '0'
                )
        });

        if (ofertasEscuela.length == 0){

            //Tabla en caso de que no hayan datos
            var tablaHTML = '<table class="table table-dark table-bordered">';
            tablaHTML += '<thead><tr><th> No se encontraron Ofertas </th></tr></thead>';
            tablaHTML += '</table>';
            document.getElementById('labeltablaofertas').innerHTML = '<h3>Ofertas Formativas</h3><br>'
            document.getElementById('tablaContainerofertas').innerHTML = tablaHTML;
            return;
        }
        
        // Tabla
        var tablaHTML = '<table class="table table-dark table-bordered">';
        tablaHTML += '<thead><tr><th>Nombre de la Escuela</th><th>CUE ID</th><th>Localidad</th><th>Oferta</th><th>Descripción</th><th>Plan de Estudio</th><th>Año</th><th>Sector</th></tr></thead>';
        tablaHTML += '<tbody>'

        // Construye las filas de la tabla
        ofertasEscuela.forEach(function (oferta) {
            var nombreEscuela = oferta.nombre;
            var cueID = oferta.cue;
            var localidad = oferta.localidad;
            var nombresOferta = oferta.Oferta;
            var descripciones = oferta.Descripcion;
            var familiasProfesional = oferta.plan_estudio;
            var fechasInicio = oferta.anio;
            var fechasFin = oferta.sector;

            tablaHTML += '<tr>';
            // Muestra el nombre de la escuela y el cue_id solo en la primera fila
            tablaHTML += '<td>' + nombreEscuela + '</td>';
            tablaHTML += '<td rowspan="' + nombresOferta + '">' + cueID + '</td>';
            
            tablaHTML += '<td>' + localidad + '</td>';
            tablaHTML += '<td>' + nombresOferta + '</td>';
            tablaHTML += '<td>' + descripciones + '</td>';
            tablaHTML += '<td>' + familiasProfesional + '</td>';
            tablaHTML += '<td>' + fechasInicio + '</td>';
            tablaHTML += '<td>' + fechasFin + '</td>';
            tablaHTML += '</tr>';
            
        });
        tablaHTML+= '</tbody>'

        tablaHTML += '</table>';

        // Agrega la tabla al contenedor
        document.getElementById('labeltablaofertas').innerHTML = `<h3>Ofertas Formativas</h3><br>`;
        document.getElementById('tablaContainerofertas').innerHTML = tablaHTML;
        
        document.getElementById('labeltabladatos').innerHTML = `<br>`;
        document.getElementById('tablaContainerdatos').innerHTML = '<br>';

        // Para desplazarse hacia la tabla ofertas
        var destino = document.getElementById("labeltablaofertas");
        destino.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    //var grupoOfertas = {};

    //ofertasFiltradas.forEach(function(item) {
    //    var cue = item.cue;
    //    if (!grupoOfertas[cue]) {
    //        grupoOfertas[cue] = [];
    //    }
    //    grupoOfertas[cue].push(item);
    //});

    //var longi = Object.keys(grupoOfertas);
    
};

// Agregar event listeners a los tres primeros selects para actualizar el tercer select
document.getElementById('formtipoesc').addEventListener('change', actualizarSelectOfertas);
document.getElementById('formprov').addEventListener('change', actualizarSelectOfertas);
document.getElementById('formlocalidad').addEventListener('change', actualizarSelectOfertas);