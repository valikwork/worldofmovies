'use strict';

window.onload = function() {
    if (location.hash === '#list') {
        showMoviesList();
    };
    if (location.hash === '#search') {
        location.hash = '#list'
    };
    if (location.hash.length > 6) {
        const id = location.hash.slice(6)
        showMovie(id);
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
};

let movieCollection = parseLocal() || [];
let thisMovie;

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
            if (el.id === 'editMovie' || el.closest('#editMovie')) {
                editMovie(currentID);
            };
            if (el.className === 'more'){
                showMovie(currentID);
            };
            if (el.id === 'deleteMovie' || el.closest('#deleteMovie')){
                let res = confirm('Вы действительно хотите удалить этот фильм?');
                if (res) {
                    deleteMovie(currentID)
                    this.remove();
                };
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
    let foundMovies = []
    movieCollection.forEach(function(film) {
        let filmName = film.movieName.toLowerCase()
        if(filmName.includes(searchQuery.value.toLowerCase())) {
           foundMovies.push(film);
        };
    });
    movieCollection = foundMovies;
    searchQuery.value = '';
    const response = await fetch('card.html');
    const data = await response.text();
    installTemplate(data);
};

async function editMovie(currentID) {
    let thisMovieIndex = findIndexById(currentID);
    let currentMovie = movieCollection[thisMovieIndex];
    await postEditModal(currentID)
    const modalForm = document.querySelector('#modalForm');
    modalForm.elements['movie-name'].value = currentMovie.movieName;
    modalForm.elements['original-movie-name'].value = currentMovie.originalMovieName;
    modalForm.elements['year'].value = currentMovie.movieYear;
    modalForm.elements['country'].value = currentMovie.movieCountry;
    modalForm.elements['tagline'].value = currentMovie.movieTagline;
    modalForm.elements['director'].value = currentMovie.movieDirector;
    modalForm.elements['actors'].value = currentMovie.movieActors;
    modalForm.elements['imdb'].value = currentMovie.movieIMDB;
    modalForm.elements['description'].value = currentMovie.movieDescription;

    if(modalForm.elements['add-position'] && modalForm.elements['add-name']) {
        
        let addPos = currentMovie.additionalPositions;
        let keys = [];
        let value = [];
        addPos.forEach(function(position){
            keys.push(Object.keys(position))
            value.push(Object.values(position))
        })
        keys = keys.join().split(',');
        value = value.join().split(',');
        modalForm.querySelectorAll('.add-field').forEach(function(field, i) {
            field.querySelector('.add-position').value = keys[i]
            field.querySelector('.add-name').value = value[i]
        });
    };


    document.querySelector('#modalForm').addEventListener('submit', async function(e) {
        e.stopImmediatePropagation();
        e.preventDefault()
        console.log(thisMovie)
        console.log(currentMovie)
        currentMovie.id = currentMovie.id
        currentMovie.movieName = modalForm.elements['movie-name'].value;
        currentMovie.originalMovieName = modalForm.elements['original-movie-name'].value;
        currentMovie.movieYear = modalForm.elements['year'].value;
        currentMovie.movieCountry = modalForm.elements['country'].value;
        currentMovie.movieTagline = modalForm.elements['tagline'].value;
        currentMovie.movieDirector = modalForm.elements['director'].value;
        currentMovie.movieActors = modalForm.elements['actors'].value.split(',');
        currentMovie.movieIMDB = modalForm.elements['imdb'].value;
        currentMovie.movieDescription = modalForm.elements['description'].value;
        currentMovie.moviePosterBase64 = await getBase64Pic(modalForm.elements['poster'].files[0]);
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
        currentMovie.additionalPositions = additionalPositions; 

        saveToLocal(movieCollection);
        $('#Modal').modal('hide');
        location.hash = 'list';
        showMoviesList();
        currentMovie = '';
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
    thisMovie = Array.of(movieCollection[thisMovieIndex]);
    installTemplate(data);
    await document.querySelector('.movie-details').addEventListener('click',({target: el}) => {
        let counter = 0;
        thisMovie = Array.of(movieCollection[thisMovieIndex]);

        if(el.id === 'countUp' || el.closest('#countUp')) {
            el.setAttribute('data-count', ++counter)
            thisMovie[0].upVote = counter
            saveToLocal(movieCollection);
        };
        if(el.id === 'countDown' || el.closest('#countDown')) {
            el.setAttribute('data-count', ++counter)
            console.log(thisMovie)
            thisMovie[0].downVote = counter
            saveToLocal(movieCollection);
        };
        thisMovie = '';
    });
    thisMovie = '';
};
async function handleModal() {
    await document.querySelector('#closeModal').addEventListener('click', function() {
        $('#Modal').modal('hide');
    });

    await document.querySelector('#cancelModal').addEventListener('click', function() {
        $('#Modal').modal('hide');
    });

    await document.querySelector('.modal-content').addEventListener('click', function(e) {
        const el = e.target;
        
        let addField = document.createElement('div');
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
        if (el.id === 'addField' || el.closest('#addField')) {
            document.querySelector('#fieldset').appendChild(addField);
        };
        if (el.id === 'removeField' || el.closest('#removeField')) {
            el.closest('.add-field').remove()
        };
        this.querySelector('#modalForm').addEventListener('submit', function(e) {
            e.preventDefault()
            e.stopImmediatePropagation();
            processModal();
        });
    });
};

async function postEditModal(currentID) {
    const response = await fetch('add-new.html');
    const data = await response.text();
    const thisMovieIndex = findIndexById(currentID)
    thisMovie = Array.of(movieCollection[thisMovieIndex]);
    let modalWrap = await document.createElement('div');
    modalWrap.innerHTML = getTemplate(data);
    $mainContent.appendChild(modalWrap);
    $('#Modal').modal('show');
    $('#Modal').on('hidden.bs.modal', function () {
        modalWrap.remove();
    });
    handleModal();
    saveToLocal(movieCollection);
    thisMovie = '';
};


async function postModal() {
    let modalWrap = await document.createElement('div');
    const response = await fetch('add-new.html');
    const data = await response.text();
    modalWrap.innerHTML = getTemplate(data);
    $mainContent.appendChild(modalWrap);
    $('#Modal').modal('show');
    $('#Modal').on('hidden.bs.modal', function () {
        modalWrap.remove();
    });
    handleModal();
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

