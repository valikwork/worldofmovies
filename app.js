'use strict';

window.onload = function() {
    if (location.hash === '#list') {
        showMoviesList();
    };
    if (location.hash === '#search') {
        
    };
};

const $mainContent = document.querySelector('#content');

document.querySelector('#add-new').addEventListener('click', () => postModal());

function installTemplate(tpl) {
    const template = _.template(tpl);
    const compile = template(tpl);
    $mainContent.innerHTML = compile;
};

function getTemplate(tpl) {
    const template = _.template(tpl);
    const compile = template(tpl);
    return compile;
    // const wrap = document.createElement('div')
    // wrap.innerHTML = compile
    // $mainContent.appendChild(wrap);
}

let movieCollection = [];

function MOVIE(movieName, originalMovieName, movieYear, movieCountry, movieTagline, movieDirector, movieActors, movieIMDB, movieDescription, additionalPositions, moviePosterBase64) {
    this.id = Date.now()
    this.movieName = movieName,
    this.originalMovieName = originalMovieName,
    this.movieYear = movieYear, 
    this.movieCountry = movieCountry, 
    this.movieTagline = movieTagline, 
    this.movieDirector = movieDirector, 
    this.movieActors = movieActors,
    this.movieIMDB = movieIMDB, 
    this.movieDescription = movieDescription,
    this.additionalPositions = additionalPositions,
    this.moviePosterBase64 = moviePosterBase64
};

function getBase64Pic(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        if(file) {
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = error => reject(error);
        };
    });
};

function hashChanging() {

    // if (location.hash === '#add-new') {
    //     postModal();
    // };
    if (location.hash === '#list') {
        showMoviesList();
    };
    if (location.hash === ''){
        $mainContent.innerHTML = '<h1 class="mt-5 text-center text-uppercase">Добро пожаловать<br> на портал Мир Кино!</h1>';
    };
};

async function showMoviesList() {
    const response = await fetch('card.html');
    const data = await response.text();
    movieCollection = parseLocal();
    installTemplate(data);

    await document.querySelectorAll('.card').forEach(function(card) {
        card.addEventListener('click', async function (e) {
            const el = e.target
            const currentID = this.querySelector('.more').hash.slice(6);
            if (el.id === 'editMovie') {
                editMovie(currentID);
            };
            if (el.className === 'more'){
                showMovie(currentID);
            };
            if (el.id === 'deleteMovie'){
                deleteMovie(currentID)
                this.remove();
            };
        });
    });
};

document.querySelector('#search').addEventListener('submit', function(e) {
    e.preventDefault();
    location.hash = 'search';
    showMoviesSearch();
});

async function showMoviesSearch() {
    let searchQuery = document.querySelector('#search').elements['search'];
    movieCollection = parseLocal()
    movieCollection = Array.of(movieCollection.find(function(item) {
        if(!item.movieName.indexOf(searchQuery.value)) {
            return item;
        };
    }));
    searchQuery.value = '';
    const response = await fetch('card.html');
    const data = await response.text();
    installTemplate(data);
};

async function editMovie(currentID) {
    let thisMovieIndex = findIndexById(currentID);
    const thisMovie = movieCollection[thisMovieIndex];
    await postEditModal(currentID)
    const modalForm = document.querySelector('#modalForm');

    modalForm.elements['movie-name'].value = thisMovie.movieName;
    modalForm.elements['original-movie-name'].value = thisMovie.originalMovieName;
    modalForm.elements['year'].value = thisMovie.movieYear;
    modalForm.elements['country'].value = thisMovie.movieCountry;
    modalForm.elements['tagline'].value = thisMovie.movieTagline;
    modalForm.elements['director'].value = thisMovie.movieDirector;
    modalForm.elements['actors'].value = thisMovie.movieActors;
    modalForm.elements['imdb'].value = thisMovie.movieIMDB;
    modalForm.elements['description'].value = thisMovie.movieDescription;

    document.querySelector('#modalForm').addEventListener('submit', async function(e) {
        e.stopImmediatePropagation();
        e.preventDefault()

        thisMovie.id = thisMovie.id
        thisMovie.movieName = modalForm.elements['movie-name'].value;
        thisMovie.originalMovieName = modalForm.elements['original-movie-name'].value;
        thisMovie.movieYear = modalForm.elements['year'].value;
        thisMovie.movieCountry = modalForm.elements['country'].value;
        thisMovie.movieTagline = modalForm.elements['tagline'].value;
        thisMovie.movieDirector = modalForm.elements['director'].value;
        thisMovie.movieActors = modalForm.elements['actors'].value.split(',');
        thisMovie.movieIMDB = modalForm.elements['imdb'].value;
        thisMovie.movieDescription = modalForm.elements['description'].value;
        thisMovie.moviePosterBase64 = await getBase64Pic(modalForm.elements['poster'].files[0]);
        let additionalPositions = [];

        if (modalForm.elements['add-position'] && modalForm.elements['add-name']) {
            modalForm.querySelectorAll('.add-field').forEach(function(field) {
                let pos = field.querySelector('.add-position').value;
                let name = field.querySelector('.add-name').value;
                let keys = new Object();
                keys[pos] = name
                additionalPositions.push(keys);
            });
        };
        thisMovie.additionalPositions = additionalPositions; 

        saveToLocal(movieCollection);
        $('#Modal').modal('hide');
        location.hash = 'list';
        showMoviesList();
    });
};

async function processModal() {
    movieCollection = parseLocal() || [];
    const modalForm = document.querySelector('#modalForm');

    let movieName = modalForm.elements['movie-name'].value;
    let originalMovieName = modalForm.elements['original-movie-name'].value;
    let movieYear = modalForm.elements['year'].value;
    let movieCountry = modalForm.elements['country'].value;
    let movieTagline = modalForm.elements['tagline'].value;
    let movieDirector = modalForm.elements['director'].value;
    let movieActors = modalForm.elements['actors'].value.split(',');
    let movieIMDB = modalForm.elements['imdb'].value;
    let movieDescription = modalForm.elements['description'].value;
    let moviePoster = modalForm.elements['poster'];
    
    let converted = getBase64Pic(moviePoster.files[0]);
    let moviePosterBase64 = await converted;

    let additionalPositions = [];

    if (modalForm.elements['add-position'] && modalForm.elements['add-name']) {
        modalForm.querySelectorAll('.add-field').forEach(function(field) {
            let pos = field.querySelector('.add-position').value;
            let name = field.querySelector('.add-name').value;
            let keys = new Object();
            keys[pos] = name
            additionalPositions.push(keys)
        });
    };
    
    let newMovie = new MOVIE(movieName, originalMovieName, movieYear, movieCountry, 
                            movieTagline, movieDirector, movieActors, movieIMDB, 
                            movieDescription, additionalPositions, moviePosterBase64);

    movieCollection.push(newMovie);
    saveToLocal(movieCollection);
    $('#Modal').modal('hide');
    location.hash = 'list';
    showMoviesList();
};

async function deleteMovie(currentID) {
    let thisMovieIndex = findIndexById(currentID);
    movieCollection.splice(thisMovieIndex, 1)
    saveToLocal(movieCollection);
};
function findIndexById(currentID) {
    return movieCollection.findIndex((film) => {
        if (film.id === +currentID) {
            return film;
        };
    });
};
async function showMovie(currentID){
    const response = await fetch('movie.html');
    const data = await response.text();
    const thisMovieIndex = findIndexById(currentID)
    movieCollection = movieCollection[thisMovieIndex];
    installTemplate(data);
    await document.querySelector('.movie-details').addEventListener('click',({target: el}) => {
        movieCollection = parseLocal();
        let counter = 0;
        if(el.classList.contains('count-btns')) {
            el.setAttribute('data-count', ++counter)
            movieCollection[thisMovieIndex].rate = counter
            saveToLocal(movieCollection);
        };
    });
};
async function handleModal() {
    await document.querySelector('#closeModal').addEventListener('click', function() {
        $('#Modal').modal('hide');
    });

    await document.querySelector('#cancelModal').addEventListener('click', function() {
        $('#Modal').modal('hide');
    });

    await document.querySelector('.modal-content').addEventListener('click', async function(e) {
        const el = e.target;
        
        let addField = document.createElement('div')
        addField.setAttribute('class','add-field form-group row');
        addField.innerHTML = `<div class="col-sm-5">
               <input required type="text" name="add-position" class="form-control add-position" placeholder="Должность">
             </div>
             <div class="col-sm-5">
               <input required type="text" name="add-name" class="form-control add-name" placeholder="Имя">
             </div>
             <div class="col-sm-2">
               <button class="btn btn-danger btn-sm btn-remove-field" id='removeField' type="button"><svg class="octicon octicon-x" viewBox="0 0 14 18" version="1.1" width="14" height="18" aria-hidden="true"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z"></path></svg></button>
             </div>`
        if (el.id === 'addField') {
            document.querySelector('#fieldset').appendChild(addField);
        };
        if (el.id === 'removeField') {
            el.parentElement.parentElement.remove()
        };
        this.querySelector('#modalForm').addEventListener('submit', function(e) {
            e.preventDefault()
            e.stopImmediatePropagation();
            processModal();
        })
    });
}
let thisMovie;
async function postEditModal(currentID) {
    const response = await fetch('add-new.html');
    const data = await response.text();
    const thisMovieIndex = findIndexById(currentID)
    thisMovie = Array.of(movieCollection[thisMovieIndex]);
    // movieCollection = Array.of(thisMovie);
    // thisMovie = movieCollection
    let modalWrap = await document.createElement('div');
    modalWrap.innerHTML = getTemplate(data);
    $mainContent.appendChild(modalWrap);
    $('#Modal').modal('show');
    $('#Modal').on('hidden.bs.modal', function () {
        modalWrap.remove();
    });
    console.log(movieCollection)
    console.log(thisMovie)
    handleModal()
    saveToLocal(movieCollection);
}


async function postModal(currentID) {
    let modalWrap = await document.createElement('div');
    const response = await fetch('add-new.html');
    const data = await response.text();
    modalWrap.innerHTML = getTemplate(data);
    $mainContent.appendChild(modalWrap);
    $('#Modal').modal('show');
    // if(!currentID) {
    //     const response = await fetch('add-new.html');
    //     const data = await response.text();
    //     modalWrap.innerHTML = getTemplate(data);
    //     $mainContent.appendChild(modalWrap);
    //     $('#Modal').modal('show');
    //     console.log(movieCollection)
    // } else {
    //     const response = await fetch('add-new.html');
    //     const data = await response.text();
    //     const thisMovieIndex = findIndexById(currentID)
    //     let thisMovie = movieCollection[thisMovieIndex];
    //     movieCollection = Array.of(thisMovie);
    //     // thisMovie = movieCollection
    //     modalWrap.innerHTML = getTemplate(data);
    //     $mainContent.appendChild(modalWrap);
    //     $('#Modal').modal('show');
    //     console.log(movieCollection)
    //     console.log(thisMovie)
    //     movieCollection = parseLocal();
    // };
    $('#Modal').on('hidden.bs.modal', function () {
        modalWrap.remove();
    });
    handleModal()
    
};

function parseLocal() {
    if(localStorage.movieCollection) {
        return JSON.parse(localStorage.movieCollection)
    };
};

function saveToLocal(file) {
    localStorage.setItem('movieCollection', JSON.stringify(file));
};

window.addEventListener("hashchange", () => hashChanging());

