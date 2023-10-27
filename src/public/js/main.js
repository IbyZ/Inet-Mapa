// Iniciando el mapa
var map = L.map('map').setView([-41.31,-65.30], 4);

//const socket = io();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Geolocalizacion
map.locate({enableHighAccuracy: true});
map.on('locationfound', e => {
    const coords = [e.latlng.lat, e.latlng.lng];
    const marker = L.marker(coords).bindPopup("Tu Ubicacion");
    marker.addTo(map).openPopup();
    map.setView(coords, 10);
});

// Obteniendo datos del archivo "inet.json" y "oferta.json"
const getData = async () => {

    const resEscuelas = await fetch('js/data/coordenadas.json');
    const dataEscuelas = await resEscuelas.json();
    escuelas = dataEscuelas;

    const resOfertas = await fetch('js/data/ofertasescuelas.json');
    const dataOfertas = await resOfertas.json();
    datosOfertas = dataOfertas;

    const resAcrEjc = await fetch('js/data/ESCUELAS.json');
    const dataAcrEjc = await resAcrEjc.json();
    datosAcrEjc = dataAcrEjc;

    // Array de Marcadores para el Filtrado
    const secMarcador = L.markerClusterGroup();
    const snuMarcador = L.markerClusterGroup();
    const fpMarcador = L.markerClusterGroup();

    // Array de Nombres de las Escuelas
    const nombre_escuelas = [];

    //Contador de escuelas
    var contSec = 0;
    var contSnu = 0;
    var contFp = 0;
    
    escuelas.forEach((esc) => {
        // Guarda en variables del mismo nombre los datos de la escuela
        var { coords, ambito, cue, nombre, jurisdiccion, localidad, domicilio, telefono, mail, sec_inet, snu_inet, fp_inet } = esc;

        nombre_escuelas.push({cue, nombre});
        // Verifica si tiene telefono y mail
        if (typeof telefono == 'undefined') {
            telefono = "Sin definir";
        };

        if(typeof mail == 'undefined'){
            mail = "Sin definir";
        };

        let lat = '';
        let lng = '';

        // Verifica si la escuela tiene coordenadas
        if (coords !== '-') {    
            [lat, lng] = coords.split(',').map(parseFloat);
        }else{
            return;
        }

        // Lat y Long para diferenciar tipo de escuelas
        var aLat = lat + 0.0001;
        var aLng = lng + 0.0001;

        // Marcador Rojo - Sec Inet
        var rojoIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var marker = L.marker([lat, lng], {icon: rojoIcon})
            .bindPopup(`
                <strong>${nombre}</strong><br>
                Provincia: ${jurisdiccion}<br>
                Localidad: ${localidad}<br>
                Domicilio: ${domicilio}<br>
                Teléfono: ${telefono}<br>
                Mas Informacion: <a href="#labeltablaofertas" id="linkOfertas" class="escuela-link" data-cueid="${cue}" lat="${lat}" lng="${lng}" secinet="${sec_inet}" snuinet="${snu_inet}" fpinet="${fp_inet}">Informacion de la Escuela</a><br>`
                //Pagina web: <a href="${tuURL}" class="popup-link" onclick="abrirPagina('${tuURL}')" target="_blank">Pagina</a>
            );

        // Marcador Dorado - SNU Inet
        var oroIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        var marker2 = L.marker([aLat, lng], {icon: oroIcon})
            .bindPopup(`
                <strong>${nombre}</strong><br>
                Provincia: ${jurisdiccion}<br>
                Localidad: ${localidad}<br>
                Domicilio: ${domicilio}<br>
                Teléfono: ${telefono}<br>
                Mas Informacion: <a href="#labeltablaofertas" id="linkOfertas" class="escuela-link" data-cueid="${cue}" lat="${lat}" lng="${lng}" secinet="${sec_inet}" snuinet="${snu_inet}" fpinet="${fp_inet}">Informacion de la Escuela</a><br>`);
        
        // Marcador Azul por defecto - FP Inet
        var marker3 = L.marker([lat, aLng])
            .bindPopup(`
                <strong>${nombre}</strong><br>
                Provincia: ${jurisdiccion}<br>
                Localidad: ${localidad}<br>
                Domicilio: ${domicilio}<br>
                Teléfono: ${telefono}<br>
                Mas Informacion: <a href="#labeltablaofertas" id="linkOfertas" class="escuela-link" data-cueid="${cue}" id="linkOfertas" lat="${lat}" lng="${lng}" secinet="${sec_inet}" snuinet="${snu_inet}" fpinet="${fp_inet}">Informacion de la Escuela</a><br>`);
        
        // Filtrar marcadores por escuela
        if (sec_inet === '1') {
            contSec = contSec + 1;
            marker.getPopup().setContent(`
                    ${marker.getPopup().getContent()}
                    <strong>Secundario inet</strong><br>`);
            if (snu_inet === '1') {
            marker.getPopup().setContent(`
                    ${marker.getPopup().getContent()}
                    <strong>SNU inet</strong><br>`);
            }
            if (fp_inet === '1') {
            marker.getPopup().setContent(`
                    ${marker.getPopup().getContent()}
                    <strong>Formacion Profesional inet</strong><br>`);
            }
            secMarcador.addLayer(marker);
        }
      
        if (snu_inet === '1') {
            contSnu = contSnu + 1;
            marker2.getPopup().setContent(`
                    ${marker2.getPopup().getContent()}
                    <strong>SNU inet</strong><br>`);
            if (sec_inet === '1') {
            marker2.getPopup().setContent(`
                    ${marker2.getPopup().getContent()}
                    <strong>Secundario inet</strong><br>`);
            }
            if (fp_inet === '1') {
            marker2.getPopup().setContent(`
                    ${marker2.getPopup().getContent()}
                    <strong>Formacion Profesional inet</strong><br>`);
            }
            snuMarcador.addLayer(marker2);
        }
      
        if (fp_inet === '1') {
            contFp = contFp + 1;
            marker3.getPopup().setContent(`
                    ${marker3.getPopup().getContent()}
                    <strong>Formacion Profesional inet</strong><br>`);
            if (sec_inet === '1') {
            marker3.getPopup().setContent(`
                    ${marker3.getPopup().getContent()}
                    <strong>Secundario inet</strong><br>`);
            }
            if (snu_inet === '1') {
            marker3.getPopup().setContent(`
                    ${marker3.getPopup().getContent()}
                    <strong>SNU inet</strong><br>`);
            }
            fpMarcador.addLayer(marker3);
        }
    });

    // Inserta la cantidad de escuelas de cada tipo
    const secInetLabel = document.getElementById('labsec');
    const snuInetLabel = document.getElementById('labsnu');
    const fpInetLabel = document.getElementById('labfp');

    secInetLabel.innerHTML += ` - ${contSec}`;
    snuInetLabel.innerHTML += ` - ${contSnu}`;
    fpInetLabel.innerHTML += ` - ${contFp}`;

    // Mostrar / Ocultar Marcadores
    var checkbox_sec = document.getElementById('sec_inet');
    checkbox_sec.addEventListener('change', () => {
        if (checkbox_sec.checked) {
            secMarcador.addTo(map);
        } else {
            secMarcador.removeFrom(map);
        }
    });
    var checkbox_snu = document.getElementById('snu_inet');
    checkbox_snu.addEventListener('change', () => {
        if (checkbox_snu.checked) {
            snuMarcador.addTo(map);
        } else {
            snuMarcador.removeFrom(map);
        }
    });
    var checkbox_fp = document.getElementById('fp_inet');
    checkbox_fp.addEventListener('change', () => {
        if (checkbox_fp.checked) {
            fpMarcador.addTo(map);
        } else {
            fpMarcador.removeFrom(map);
        }
    });

    //Funcion para mostrar la tabla de los datos de la escuela con su CUE
    function mostrarTablaEscuela(cueId){

        // Filtrar los datos para la escuela seleccionada
        var datosEscuela = escuelas.filter(function (oferta) {
            return parseInt(oferta.cue) === cueId;
        });

        var { ambito, cue, nombre, jurisdiccion, localidad, domicilio, telefono, mail } = datosEscuela[0];

        // Verifica si tiene telefono y mail
        if (telefono == '') {
            telefono = "Sin definir";
        };
        if(mail == ''){
            mail = "Sin definir";
        };

        // Tabla
        var tablaHTML = '<table class="table table-dark table-bordered">';
        tablaHTML += '<thead><tr><th>CUE ID</th><th>Ambito</th><th>Jurisdiccion</th><th>Localidad</th><th>Domicilio</th><th>Telefono</th><th>Mail</th></tr></thead>';
        tablaHTML += '<tbody>';

        tablaHTML += '<tr>';
        tablaHTML += '<td>' + cue + '</td>';
        tablaHTML += '<td>' + ambito + '</td>';
        tablaHTML += '<td>' + jurisdiccion + '</td>';
        tablaHTML += '<td>' + localidad + '</td>';
        tablaHTML += '<td>' + domicilio + '</td>';
        tablaHTML += '<td>' + telefono + '</td>';
        tablaHTML += '<td>' + mail + '</td>';
        tablaHTML += '</tr>';

        tablaHTML+= '</tbody>'

        tablaHTML += '</table>';

        // Agrega la tabla al contenedor
        document.getElementById('labeltabladatos').innerHTML = `<h3>Datos de la Escuela</h3><br><br><h5>${nombre}</h5><br>`;
        document.getElementById('tablaContainerdatos').innerHTML = tablaHTML;
    }

    // Funcion para mostrar la tabla de las ofertas con su CUE
    function mostrarTablaOfertas(cueId) {
  
        // Filtra las ofertas para la escuela seleccionada
        var ofertasEscuela = datosOfertas.filter(function (oferta) {
            return parseInt(oferta.cue) === cueId;
        });
        
        // Verifica que hayan datos sobe la oferta de la escuela seleccionada
        if (ofertasEscuela.length == 0){

            //Tabla en caso de que no hayan datos
            var tablaHTML = '<table class="table table-dark table-bordered">';
            tablaHTML += '<thead><tr><th> No se encontraron datos de la Escuela </th></tr></thead>';
            tablaHTML += '</table>';
            document.getElementById('labeltablaofertas').innerHTML = '<h3>Ofertas Formativas</h3><br>'
            document.getElementById('tablaContainerofertas').innerHTML = tablaHTML;
            return;
        }
      
        
        // Tabla
        
        var tablaHTML = '<table class="table table-dark table-bordered">';
        tablaHTML += '<thead><tr><th>CUE ID</th><th>Localidad</th><th>Oferta</th><th>Descripción</th><th>Plan de Estudio</th><th>Año</th><th>Sector</th></tr></thead>';
        tablaHTML += '<tbody>'

        var nombre = nombre_escuelas.filter(function (nombre){ 
            return parseInt(nombre.cue) === cueId;
        });
        nombreEsc = nombre[0].nombre;

        // Construye las filas de la tabla
        ofertasEscuela.forEach(function (oferta) {
            var nombreEscuela = oferta.nombre;
            var cueID = oferta.cue;
            var localidad = oferta.localidad;
            var nombresOferta = oferta.Oferta;
            var descripciones = oferta.Descripcion;
            var familiasProfesional = oferta.plan_estudio;
            var familiasProfesional = familiasProfesional.replace(/^,/, '');
            var fechasInicio = oferta.anio;
            var fechasFin = oferta.sector;

            tablaHTML += '<tr>';
            // Muestra el nombre de la escuela y el cue_id solo en la primera fila
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
        document.getElementById('labeltablaofertas').innerHTML = `<h3>Ofertas Formativas</h3><br><br><h5>${nombreEsc}</h5><br>`;
        document.getElementById('tablaContainerofertas').innerHTML = tablaHTML;
    };


    function mostrarTablaAcrEjc(cueId){
        // Filtra las ofertas para la escuela seleccionada
        var ofertasAE = datosAcrEjc.filter(function (oferta) {
            return oferta.CUE === cueId;
        });

        var nombre = nombre_escuelas.filter(function (nombre){ 
            return parseInt(nombre.cue) === cueId;
        });
        nombreEsc = nombre[0].nombre;

        // Verifica que hayan datos sobe la oferta de la escuela seleccionada
        if (ofertasAE.length == 0){

            //Tabla en caso de que no hayan datos
            var tablaHTML = '<table class="table table-dark table-bordered">';
            tablaHTML += `<thead><tr><th> No se encontraron datos de la Escuela ${nombreEsc}</th></tr></thead>`;
            tablaHTML += '</table>';
            document.getElementById('labeltablaAcrEjc').innerHTML = '<h3>Acreditado y Ejecutado</h3><br>'
            document.getElementById('tablaContainerAcrEjc').innerHTML = tablaHTML;
            return;
        }

        // Tabla
        var tablaHTML = '<table class="table table-dark table-bordered">';
        tablaHTML += '<thead><tr><th>CUE ID</th><th>Linea</th><th>Resolucion</th><th>Acreditado</th><th>Ejecutado</th><th>Localidad</th><th>Provincia</th></tr></thead>';
        tablaHTML += '<tbody>'

        // Construye las filas de la tabla
        ofertasAE.forEach(function (oferta) {
            var cue = oferta.CUE;
            var linea = oferta.Linea;
            var resolucion = oferta.Resolucion;
            var acreditado = oferta.Acreditado;
            var ejecutado = oferta.Ejecutado;
            var localidad = oferta.Localidad;
            var provincia = oferta.Provincia;

            tablaHTML += '<tr>';
            // Muestra el nombre de la escuela y el cue_id solo en la primera fila
        
            tablaHTML += '<td>' + cue + '</td>';

            tablaHTML += '<td>' + linea + '</td>';
            tablaHTML += '<td>' + resolucion + '</td>';
            tablaHTML += '<td>' + '$' + acreditado + '</td>';
            tablaHTML += '<td>' + '$' + ejecutado + '</td>';
            tablaHTML += '<td>' + localidad + '</td>';
            tablaHTML += '<td>' + provincia + '</td>';
            tablaHTML += '</tr>';
            
        });
        tablaHTML+= '</tbody>'

        tablaHTML += '</table>';

        // Agrega la tabla al contenedor
        document.getElementById('labeltablaAcrEjc').innerHTML = `<h3>Acreditado y Ejecutado</h3><br><h5>${nombreEsc}</h5><br>`;
        document.getElementById('tablaContainerAcrEjc').innerHTML = tablaHTML;
    }




    // Agrega eventos a las etiquetas <a> con la clase 'escuela-link' para mostrar la tabla correspondiente
    document.addEventListener('click', function (event){
        if (event.target.classList.contains('escuela-link')){
            
            if (event.target.getAttribute('secinet') === '1'){
                checkbox_sec.checked = true;
                if (checkbox_sec.checked) {
                    secMarcador.addTo(map);
                } else {
                    secMarcador.removeFrom(map);
                }
            }
            if (event.target.getAttribute('snuinet') === '1'){
                checkbox_snu.checked = true;
                if (checkbox_snu.checked) {
                    snuMarcador.addTo(map);
                } else {
                    snuMarcador.removeFrom(map);
                }
            }
            if (event.target.getAttribute('fpinet') === '1'){
                checkbox_fp.checked = true;
                if (checkbox_fp.checked) {
                    fpMarcador.addTo(map);
                } else {
                    fpMarcador.removeFrom(map);
                }
            }

            // Establece la vista en el marcador encontrado
            map.setView([(parseFloat(event.target.getAttribute('lat'))), (parseFloat(event.target.getAttribute('lng')))], 16);

            // Extrae el cue y lo pasa a entero para mostrar sus tablas correspondientes
            var cueId = parseInt(event.target.getAttribute('data-cueid'));

            //Muestra todos los datos de la escuela y todos los datos de ofertas con 1.
            mostrarTablaOfertas(cueId);
            mostrarTablaEscuela(cueId);
            //mostrarTablaAcrEjc(cueId);
        }
    });

};

// Select Provincias
var selectprov = document.getElementById('provincias');

// Al seleccionar guarda el valor de value en 3 variables que son la latitud, longitud y el zoom
selectprov.addEventListener('change', function (e) {
    let coordzoom = e.target.value.split(",");
    let lat = coordzoom[0];
    let long = coordzoom[1];
    let zoom = coordzoom[2];
    
    // Establece la vista del mapa en las coordenadas y el zoom que estaban en el value
    map.setView([lat, long], zoom);
    
});

// Si se hace doble click o se arrastra el mapa se cambia la opcion del select a 'Seleccione'
map.on('drag', function (e) {
    selectprov.value = 'Seleccione';
});
map.on('dblclick', function (e) {
    selectprov.value = 'Seleccione';
});


document.addEventListener('DOMContentLoaded', function() {
    getData();
});